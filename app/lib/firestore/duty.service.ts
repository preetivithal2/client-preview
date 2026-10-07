// lib/firestore/duty.service.ts
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  where,
  limit,
  startAfter,
  serverTimestamp,
} from "firebase/firestore";
import type { QueryDocumentSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import { DutyDefinition, DutyFrequency, DutyTask } from "../types";

const DEFS = "dutyDefinitions";
const TASKS = "dutyTasks";

/* ─────────────── helpers ─────────────── */

const parseDay = (iso: string) => {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, (m || 1) - 1, d || 1));
};
const fmtDay = (dt: Date) =>
  `${dt.getUTCFullYear()}-${String(dt.getUTCMonth() + 1).padStart(2, "0")}-${String(dt.getUTCDate()).padStart(2, "0")}`;
const addDays = (dt: Date, n: number) => { const d = new Date(dt); d.setUTCDate(d.getUTCDate() + n); return d; };
const addMonths = (dt: Date, n: number) => {
  const d = new Date(dt);
  d.setUTCMonth(d.getUTCMonth() + n);
  return d;
};

/** All due dates (inclusive) for a frequency between startISO and endISO,
 *  returning only dates at/after minISO so look-back stays bounded. */
export function enumerateDueDates(startISO: string, freq: DutyFrequency, endISO: string, minISO: string): string[] {
  const out: string[] = [];
  const start = parseDay(startISO);
  const end = parseDay(endISO);
  const min = parseDay(minISO);
  let cur = new Date(start);
  let guard = 0;
  while (cur <= end && guard++ < 5000) {
    if (cur >= min) out.push(fmtDay(cur));
    cur = freq === "WEEKLY" ? addDays(cur, 7) : freq === "MONTHLY" ? addMonths(cur, 1) : addDays(cur, 1);
  }
  return out;
}

export const todayISO = (): string => fmtDay(new Date());
const daysAgoISO = (n: number): string => fmtDay(addDays(new Date(), -n));

/* ─────────────── duty definitions ─────────────── */

export const getAllDefinitions = async (): Promise<DutyDefinition[]> => {
  const q = query(collection(db, DEFS), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as DutyDefinition));
};

export const addDefinition = async (data: Omit<DutyDefinition, "id" | "createdAt" | "updatedAt">): Promise<string> => {
  const ref = await addDoc(collection(db, DEFS), {
    ...data,
    status: data.status || "ACTIVE",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
};

export const archiveDefinition = async (id: string) => {
  await updateDoc(doc(db, DEFS, id), { status: "ARCHIVED", updatedAt: serverTimestamp() });
};

/* ─────────────── duty tasks (independent clones) ─────────────── */

export const getTasksForCrew = async (crewId: string): Promise<DutyTask[]> => {
  // Single-field equality (no composite index needed); sorted client-side.
  const q = query(collection(db, TASKS), where("crewMemberId", "==", crewId), limit(500));
  const snap = await getDocs(q);
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() } as DutyTask))
    .sort((a, b) => (a.dueDate < b.dueDate ? 1 : a.dueDate > b.dueDate ? -1 : 0));
};

export const getTasksByDefinition = async (definitionId: string): Promise<DutyTask[]> => {
  const q = query(collection(db, TASKS), where("definitionId", "==", definitionId), limit(1000));
  const snap = await getDocs(q);
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() } as DutyTask))
    .sort((a, b) => (a.dueDate < b.dueDate ? 1 : a.dueDate > b.dueDate ? -1 : 0));
};

/** Every task across all crew — powers the live ratings + duty filters on the
 *  crew-performance list, which needs all members at once rather than one.
 *
 *  Paged to the end rather than capped with a single limit(): an unordered
 *  limit() returns an arbitrary slice in document-id order, so a cap would
 *  silently drop whole crew members once the collection outgrows it, and their
 *  rating dots would read as if they had no data. */
export const getAllTasks = async (): Promise<DutyTask[]> => {
  const PAGE = 1000;
  const out: DutyTask[] = [];
  let cursor: QueryDocumentSnapshot | null = null;

  for (;;) {
    const base = collection(db, TASKS);
    const q = cursor
      ? query(base, orderBy("__name__"), startAfter(cursor), limit(PAGE))
      : query(base, orderBy("__name__"), limit(PAGE));
    const snap = await getDocs(q);
    snap.docs.forEach((d) => out.push({ id: d.id, ...d.data() } as DutyTask));
    if (snap.size < PAGE) break;
    cursor = snap.docs[snap.docs.length - 1];
  }

  return out.sort((a, b) => (a.dueDate < b.dueDate ? 1 : a.dueDate > b.dueDate ? -1 : 0));
};

const addTask = async (data: Omit<DutyTask, "id" | "createdAt" | "updatedAt">): Promise<string> => {
  const ref = await addDoc(collection(db, TASKS), {
    ...data,
    status: data.completed === "YES" ? "COMPLETED" : "OPEN",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
};

export const updateTask = async (id: string, data: Partial<Omit<DutyTask, "id" | "createdAt" | "updatedAt">>) => {
  await updateDoc(doc(db, TASKS, id), {
    ...data,
    status: data.completed === "YES" ? "COMPLETED" : data.completed === "NO" ? "OPEN" : "OPEN",
    updatedAt: serverTimestamp(),
  });
};

/* ─────────────── dispatch ─────────────── */

export interface DispatchInput {
  title: string;
  description?: string;
  frequency: DutyFrequency;
  recipientIds: string[];
  crew: { id: string; name: string; rank: string }[];
  startDate?: string;
}

/** Dispatch an order: stores the definition and creates ONE independent task
 *  clone per recipient for the base due date. Recurring orders additionally
 *  create the first occurrence now (further dates materialize on page load). */
export const dispatchOrder = async (input: DispatchInput): Promise<string> => {
  const baseDate = input.startDate || todayISO();
  const defId = await addDefinition({
    title: input.title,
    description: input.description || "",
    frequency: input.frequency,
    recipientIds: input.recipientIds,
    startDate: baseDate,
    status: "ACTIVE",
  });

  await Promise.all(
    input.recipientIds.map(async (cid) => {
      const c = input.crew.find((x) => x.id === cid);
      if (!c) return;
      await addTask({
        definitionId: defId,
        title: input.title,
        description: input.description || "",
        frequency: input.frequency,
        dueDate: baseDate,
        crewMemberId: c.id,
        crewMemberName: c.name,
        crewMemberRank: c.rank,
        completed: "",
        justification: "",
        approval: "",
        remarks: "",
        status: "OPEN",
      });
    })
  );

  return defId;
};

/** For every ACTIVE recurring order, create any task clones whose due date has
 *  arrived and does not yet exist (idempotent). Look-back window is ~90 days.
 *  Call this once when a duties page loads so daily/weekly/monthly orders
 *  self-heal without a cron job. */
export const materializeRecurring = async (): Promise<number> => {
  const defs = (await getAllDefinitions()).filter((d) => d.status === "ACTIVE" && d.frequency !== "ONE_OFF");
  let created = 0;

  for (const def of defs) {
    const existing = await getTasksByDefinition(def.id!);
    const have = new Set(existing.map((t) => `${t.crewMemberId}|${t.dueDate}`));
    const dueDates = enumerateDueDates(def.startDate, def.frequency, todayISO(), daysAgoISO(90));

    for (const dueDate of dueDates) {
      for (const cid of def.recipientIds) {
        if (have.has(`${cid}|${dueDate}`)) continue;
        // denormalize crew name (best-effort from stored recipients not possible here,
        // so the crewMemberName is resolved at dispatch time only for the first date;
        // later materialization fills names by looking up crew). Guard against runaway.
        if (created > 400) return created;
        // Names resolved lazily in the read layer instead: store id, fill blank name.
        created++;
        await addTask({
          definitionId: def.id,
          title: def.title,
          description: def.description || "",
          frequency: def.frequency,
          dueDate,
          crewMemberId: cid,
          crewMemberName: "", // resolved on read
          crewMemberRank: "",
          completed: "",
          justification: "",
          approval: "",
          remarks: "",
          status: "OPEN",
        });
      }
    }
  }
  return created;
};

/* ─────────────── edit & delete orders ─────────────── */

export interface OrderEdit {
  title: string;
  description?: string;
  frequency: DutyFrequency;
  recipientIds: string[];
  status: "ACTIVE" | "ARCHIVED";
}

/** Update an order and keep its per-crew clones consistent:
 *  - existing clones receive the new title / description / frequency
 *  - newly added recipients get a clone for today (duplicates skipped) */
export const updateOrder = async (
  id: string,
  edit: OrderEdit,
  addedCrew: { id: string; name: string; rank: string }[] = []
): Promise<void> => {
  const description = edit.description || "";

  await updateDoc(doc(db, DEFS, id), {
    title: edit.title,
    description,
    frequency: edit.frequency,
    recipientIds: edit.recipientIds,
    status: edit.status,
    updatedAt: serverTimestamp(),
  });

  // 1. keep existing clones in sync with the order
  const tasks = await getTasksByDefinition(id);
  await Promise.all(
    tasks.map((t) =>
      updateDoc(doc(db, TASKS, t.id!), {
        title: edit.title,
        description,
        frequency: edit.frequency,
        updatedAt: serverTimestamp(),
      })
    )
  );

  // 2. create clones for newly added recipients
  if (addedCrew.length > 0) {
    const today = todayISO();
    const already = new Set(tasks.filter((t) => t.dueDate === today).map((t) => t.crewMemberId));
    await Promise.all(
      addedCrew
        .filter((c) => !already.has(c.id))
        .map((c) =>
          addTask({
            definitionId: id,
            title: edit.title,
            description,
            frequency: edit.frequency,
            dueDate: today,
            crewMemberId: c.id,
            crewMemberName: c.name,
            crewMemberRank: c.rank,
            completed: "",
            justification: "",
            approval: "",
            remarks: "",
            status: "OPEN",
          })
        )
    );
  }
};

/** Permanently delete an order AND all of its per-crew clones. */
export const deleteOrder = async (id: string): Promise<void> => {
  const tasks = await getTasksByDefinition(id);
  await Promise.all(tasks.map((t) => deleteDoc(doc(db, TASKS, t.id!))));
  await deleteDoc(doc(db, DEFS, id));
};
