import { collection, getDocs, query, limit, where, orderBy, getCountFromServer, doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";

/**
 * Tool definitions + execution for the AI agent.
 * The AI can call these tools to search the ENTIRE database with real queries.
 * Each tool uses Firestore where()/count() queries — works with thousands of records.
 */

export interface ToolResult {
  name: string;
  result: string;
}

// ──────────────────────────────────────────────
// Tool schemas (for the DeepSeek function-calling API)
// ──────────────────────────────────────────────

export const TOOL_SCHEMAS = [
  {
    type: "function",
    function: {
      name: "search_work_logs",
      description: "Search work logs across the entire database with any combination of filters — same as the Records tab in the portal. Returns matching records. Use for ANY question about jobs, repairs, maintenance, or records.",
      parameters: {
        type: "object",
        properties: {
          jobId: { type: "string", description: "Exact job ID to find (e.g. sm-260721459)" },
          equipmentName: { type: "string", description: "Filter by equipment name (e.g. AUXILIARY BOILER FUEL OIL PUMP)" },
          vesselName: { type: "string", description: "Filter by vessel name" },
          component: { type: "string", description: "Filter by component" },
          department: { type: "string", description: "Filter by department" },
          priority: { type: "string", description: "Filter by priority (HIGH, MEDIUM, LOW)" },
          status: { type: "string", description: "Filter by job status (e.g. OPEN, CLOSED, IN PROGRESS)" },
          regulation: { type: "string", description: "Filter by regulation (e.g. MARPOL Annex I)" },
          reason: { type: "string", description: "Filter by reason for job performed" },
          officeNotified: { type: "string", description: "Filter by office notified (YES/NO)" },
          assistantsRequired: { type: "string", description: "Filter by assistants required" },
          requisitionStatus: { type: "string", description: "Filter by requisition status" },
          sparesUsed: { type: "string", description: "Filter by a spare part used" },
          completedBy: { type: "string", description: "Filter by who completed the job" },
          testedCriteria: { type: "string", description: "Filter by tested criteria" },
          condition: { type: "string", description: "Filter by condition matrix" },
          reportedDate: { type: "string", description: "Filter by reported date (YYYY-MM-DD)" },
          keyword: { type: "string", description: "Search text in job description or title" },
          limit: { type: "number", description: "Max results to return (default 15)" },
        },
        required: [],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "count_records",
      description: "Count records in any collection. Returns an exact number. Use for 'how many' questions.",
      parameters: {
        type: "object",
        properties: {
          collection: {
            type: "string",
            enum: ["workLogs", "equipment", "regulations", "bilgeWaterLogs", "incineratorLogs", "fuelChangeoverLogs", "crewMembers", "dutyDefinitions", "dutyTasks"],
            description: "Which collection to count",
          },
          field: { type: "string", description: "Field to filter on (e.g. status, priority, equipmentName)" },
          value: { type: "string", description: "Value to match (e.g. OPEN, HIGH)" },
        },
        required: ["collection"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "search_equipment",
      description: "Search equipment in the database by name, maker, model, or serial number.",
      parameters: {
        type: "object",
        properties: {
          query: { type: "string", description: "Search term (e.g. BOILER, PUMP, KRAL)" },
          limit: { type: "number", description: "Max results (default 15)" },
        },
        required: ["query"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "list_environmental_logs",
      description: "Search environmental log entries (bilge water, incinerator, fuel changeover) with optional filters. Returns complete records with all fields.",
      parameters: {
        type: "object",
        properties: {
          type: {
            type: "string",
            enum: ["bilge", "incinerator", "fuel", "all"],
            description: "Which environmental log type",
          },
          regulation: { type: "string", description: "Filter by regulation (e.g. MARPOL Annex I)" },
          wasteType: { type: "string", description: "Filter by waste type (for incinerator)" },
          fuelFrom: { type: "string", description: "Filter by the 'from fuel' type (for fuel changeover)" },
          fuelTo: { type: "string", description: "Filter by the 'to fuel' type (for fuel changeover)" },
          fromDate: { type: "string", description: "Only entries on/after this date (YYYY-MM-DD)" },
          toDate: { type: "string", description: "Only entries on/before this date (YYYY-MM-DD)" },
          limit: { type: "number", description: "Max results (default 15)" },
        },
        required: ["type"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "list_regulations",
      description: "List all regulations and their descriptions.",
      parameters: {
        type: "object",
        properties: {
          limit: { type: "number", description: "Max results (default 50)" },
        },
        required: [],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "list_crew",
      description: "List the engine-room crew roster (the people on board). Use for questions about crew members, who is on board, ranks, or a specific person.",
      parameters: {
        type: "object",
        properties: {
          query: { type: "string", description: "Search by name or rank (partial match)" },
          rank: { type: "string", description: "Filter by exact rank/role (e.g. 2nd Engineer, Oiler / Motorman)" },
          onBoardOnly: { type: "boolean", description: "Only crew currently on board (default false = include signed-off)" },
          limit: { type: "number", description: "Max results (default 30)" },
        },
        required: [],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "list_engine_room_duties",
      description: "Chief Engineer Orders — the duties assigned to crew. view='orders' returns dispatched orders (title, description, frequency, recipients, active/archived). view='records' returns per-crew duty entries with completion status (COMPLETED YES/NO, JUSTIFICATION EXCUSED/UNEXCUSED, C/E APPROVAL, WARNINGS/REMARKS). Use for ANY question about orders, duties, assigned tasks, or compliance with the Chief Engineer's orders.",
      parameters: {
        type: "object",
        properties: {
          view: { type: "string", enum: ["orders", "records", "all"], description: "orders = dispatched orders; records = per-crew duty entries (default); all = both" },
          crewMember: { type: "string", description: "Filter records/orders by crew member name (partial match)" },
          keyword: { type: "string", description: "Search text in the duty title or description" },
          frequency: { type: "string", enum: ["ONE_OFF", "DAILY", "WEEKLY", "MONTHLY"], description: "Filter by frequency" },
          completed: { type: "string", enum: ["YES", "NO"], description: "Filter records by completion result" },
          justification: { type: "string", enum: ["EXCUSED", "UNEXCUSED"], description: "Filter records by justification" },
          status: { type: "string", enum: ["ACTIVE", "ARCHIVED"], description: "Filter orders by status" },
          fromDate: { type: "string", description: "Only entries due on/after this date (YYYY-MM-DD)" },
          toDate: { type: "string", description: "Only entries due on/before this date (YYYY-MM-DD)" },
          limit: { type: "number", description: "Max results (default 20)" },
        },
        required: [],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_crew_performance",
      description: "Compute each crew member's KPI rating from their duty completion over a period: completion %, YES count, excused, unexcused and the rating tier (VERY GOOD / GOOD / SATISFACTORY / POOR), including any Chief Engineer manual override. Use for questions like 'how is X performing', 'who has unexcused entries', or 'what is the rating'.",
      parameters: {
        type: "object",
        properties: {
          crewMember: { type: "string", description: "Specific crew member name (partial match). Omit for all crew." },
          fromDate: { type: "string", description: "Period start (YYYY-MM-DD)" },
          toDate: { type: "string", description: "Period end (YYYY-MM-DD)" },
        },
        required: [],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_dropdown",
      description: "Get the configured options for a dropdown (vessel names, departments, priorities, etc.).",
      parameters: {
        type: "object",
        properties: {
          key: {
            type: "string",
            // TEMP-HIDDEN (client request): removed "requisitionStatus", "testedCriteria", "orderStatus" from enum.
            enum: ["vesselName", "department", "priority", "jobStatus", "wasteType", "fuelType", "componentSpec", "reportedBy", "completedBy", "sparesUsed", "reasonClassifications", "assistant", "conditionMatrix", "officeNotified"],
            description: "The dropdown key to look up",
          },
        },
        required: ["key"],
      },
    },
  },
];

// ──────────────────────────────────────────────
// Tool execution — real Firestore queries
// ──────────────────────────────────────────────

function formatWorkLog(items: Record<string, any>[]): string {
  if (items.length === 0) return "No work logs found matching the criteria.";
  return items.map((w) => {
    const spares = Array.isArray(w.sparesUsed) ? w.sparesUsed.join(", ") : (w.sparesUsed || "-");
    return `- Job ${w.jobId}
  Status: ${w.status || "?"} | Priority: ${w.priority || "?"}
  Equipment: ${w.equipmentName || "-"} | Component: ${w.component || "-"}
  Vessel: ${w.vesselName || "-"} | Department: ${w.department || "-"}
  Description: ${w.jobDescription || "-"}
  Reported: ${w.reportedDate || "-"} | By: ${w.reportedBy || "-"} | Office Notified: ${w.officeNotified || "-"} | Assistants: ${w.assistantsRequired || "-"}
  Reason: ${w.reasonDelay || "-"} | Regulation: ${w.regulation || "-"}
  Actions Taken: ${w.actionsTaken || "-"}
  Spares Used: ${spares} | Order Status: ${w.orderStatus || "-"} | PO Ref: ${w.poReference || "-"} | Requisition: ${w.requisitionStatus || "-"}
  Tested: ${w.testedCriteria || "-"} | Condition: ${w.conditionMatrix || "-"}
  Completed: ${w.dateCompleted || "-"} | Completed By: ${w.completedBy || "-"}
  Resolution: ${w.resolution || "-"}`;
  }).join("\n");
}

export async function executeTool(name: string, args: any): Promise<string> {
  try {
    switch (name) {
      case "search_work_logs": {
        // Fast path: exact job ID lookup (single-field index, no composite needed)
        if (args.jobId) {
          const q = query(collection(db, "workLogs"), where("jobId", "==", args.jobId), limit(5));
          const snap = await getDocs(q);
          return formatWorkLog(snap.docs.map((d) => d.data()));
        }

        // General path: fetch a large batch, apply ALL filters client-side.
        // This mirrors the Records tab filtering and avoids composite index requirements
        // for multi-field combinations.
        const q = query(collection(db, "workLogs"), orderBy("createdAt", "desc"), limit(300));
        const snap = await getDocs(q);
        let results = snap.docs.map((d) => d.data());

        const matchStr = (w: any, field: string, value: string | undefined) => {
          if (!value) return true;
          return (w[field] || "").toString().toLowerCase().includes(value.toLowerCase());
        };

        // Apply all filters (same fields as the Records tab)
        results = results.filter((w: any) =>
          matchStr(w, "equipmentName", args.equipmentName) &&
          matchStr(w, "vesselName", args.vesselName) &&
          matchStr(w, "component", args.component) &&
          matchStr(w, "department", args.department) &&
          matchStr(w, "priority", args.priority) &&
          matchStr(w, "status", args.status) &&
          matchStr(w, "regulation", args.regulation) &&
          matchStr(w, "reasonDelay", args.reason) &&
          matchStr(w, "officeNotified", args.officeNotified) &&
          matchStr(w, "assistantsRequired", args.assistantsRequired) &&
          matchStr(w, "requisitionStatus", args.requisitionStatus) &&
          matchStr(w, "completedBy", args.completedBy) &&
          matchStr(w, "testedCriteria", args.testedCriteria) &&
          matchStr(w, "conditionMatrix", args.condition) &&
          matchStr(w, "reportedDate", args.reportedDate) &&
          // sparesUsed is an array — check if any spare matches
          (!args.sparesUsed || (Array.isArray(w.sparesUsed) ? w.sparesUsed.some((s: any) => String(s).toLowerCase().includes(args.sparesUsed.toLowerCase())) : (w.sparesUsed || "").toString().toLowerCase().includes(args.sparesUsed.toLowerCase()))) &&
          // keyword search
          (!args.keyword ||
            (w.jobDescription || "").toLowerCase().includes(args.keyword.toLowerCase()) ||
            (w.jobId || "").toLowerCase().includes(args.keyword.toLowerCase()) ||
            (w.equipmentName || "").toLowerCase().includes(args.keyword.toLowerCase()) ||
            (w.resolution || "").toLowerCase().includes(args.keyword.toLowerCase()))
        );

        results = results.slice(0, args.limit || 15);
        return formatWorkLog(results);
      }

      case "count_records": {
        const collectionName = args.collection as string;
        if (!["workLogs", "equipment", "regulations", "bilgeWaterLogs", "incineratorLogs", "fuelChangeoverLogs", "crewMembers", "dutyDefinitions", "dutyTasks"].includes(collectionName)) {
          return "Unknown collection.";
        }
        if (args.field && args.value) {
          // Use EXACT match for accurate counts — not prefix range
          const q = query(collection(db, collectionName), where(args.field, "==", args.value));
          const snap = await getCountFromServer(q);
          return `Count of ${collectionName} where ${args.field} = "${args.value}": ${snap.data().count}`;
        }
        const snap = await getCountFromServer(query(collection(db, collectionName)));
        return `Total count of ${collectionName}: ${snap.data().count}`;
      }

      case "search_equipment": {
        // Fetch a large batch (equipment lists are typically < 500) then filter for fuzzy match
        const snap = await getDocs(query(collection(db, "equipment"), limit(500)));
        const all = snap.docs.map((d) => d.data());
        const q = (args.query || "").toLowerCase();
        const filtered = all.filter((e: any) =>
          (e.name || "").toLowerCase().includes(q) ||
          (e.makerModel || "").toLowerCase().includes(q) ||
          (e.serialNumber || "").toLowerCase().includes(q) ||
          (e.specs || "").toLowerCase().includes(q)
        ).slice(0, args.limit || 15);
        if (filtered.length === 0) return `No equipment found matching "${args.query}".`;
        return filtered.map((e: any) => `- ${e.name} | ${e.makerModel || "-"} | SN: ${e.serialNumber || "-"} | Specs: ${e.specs || "-"}`).join("\n");
      }

      case "list_environmental_logs": {
        const limitN = args.limit || 15;
        const matchDate = (dt: string | undefined) => {
          if (!dt) return true;
          const d = (dt || "").slice(0, 10); // YYYY-MM-DD
          if (args.fromDate && d < args.fromDate) return false;
          if (args.toDate && d > args.toDate) return false;
          return true;
        };
        const matchReg = (r: string | undefined) => !args.regulation || (r || "").toLowerCase().includes(args.regulation.toLowerCase());

        const result: string[] = [];
        if (args.type === "bilge" || args.type === "all") {
          const snap = await getDocs(query(collection(db, "bilgeWaterLogs"), orderBy("startDateTime", "desc"), limit(300)));
          const items = snap.docs.map((d) => d.data()).filter((b: any) => matchReg(b.regulation) && matchDate(b.startDateTime));
          result.push("--- BILGE WATER ---\n" + (items.length ? items.slice(0, limitN).map((b: any) =>
            `- Start: ${b.startDateTime || "-"} | End: ${b.endDateTime || "-"}\n  Volume: ${b.volumeM3 || "-"} m³ | Running HRS: ${b.totalRunningHrs || "-"} | Pump Rate: ${b.pumpRate || "-"} | Alarm OK: ${b.alarmOk ? "Yes" : "No"}\n  Start Pos: ${b.startLat || "-"}, ${b.startLong || "-"} | End Pos: ${b.endLat || "-"}, ${b.endLong || "-"}\n  Valve: ${b.overboardValveNo || "-"} | Seal (Unsealed): ${b.sealNoUnsealed || "-"} | Seal (Sealed): ${b.sealNoSealed || "-"} | Reg: ${b.regulation || "-"}`).join("\n") : "No matching bilge water entries"));
        }
        if (args.type === "incinerator" || args.type === "all") {
          const snap = await getDocs(query(collection(db, "incineratorLogs"), orderBy("startDateTime", "desc"), limit(300)));
          const items = snap.docs.map((d) => d.data()).filter((i: any) =>
            matchReg(i.regulation) && matchDate(i.startDateTime) &&
            (!args.wasteType || (i.wasteType || "").toLowerCase().includes(args.wasteType.toLowerCase()))
          );
          result.push("--- INCINERATOR ---\n" + (items.length ? items.slice(0, limitN).map((i: any) =>
            `- Start: ${i.startDateTime || "-"} | End: ${i.endDateTime || "-"}\n  Waste Type: ${i.wasteType || "-"} | Quantity: ${i.quantity || "-"} ${i.quantityUnit || ""} | Oil Tank: ${i.incWasteOilTankM3 || "-"} m³ | Running: ${i.totalRunning || "-"} hrs\n  Position: ${i.lat || "-"}, ${i.long || "-"} | Remark: ${i.remark || "-"} | Reg: ${i.regulation || "-"}`).join("\n") : "No matching incinerator entries"));
        }
        if (args.type === "fuel" || args.type === "all") {
          const snap = await getDocs(query(collection(db, "fuelChangeoverLogs"), orderBy("commenceDateTime", "desc"), limit(300)));
          const items = snap.docs.map((d) => d.data()).filter((f: any) =>
            matchReg(f.regulation) && matchDate(f.commenceDateTime) &&
            (!args.fuelFrom || (f.fromFuel || "").toLowerCase().includes(args.fuelFrom.toLowerCase())) &&
            (!args.fuelTo || (f.toFuel || "").toLowerCase().includes(args.fuelTo.toLowerCase()))
          );
          result.push("--- FUEL CHANGEOVER ---\n" + (items.length ? items.slice(0, limitN).map((f: any) =>
            `- Commence: ${f.commenceDateTime || "-"} | Complete: ${f.completeDateTime || "-"}\n  From: ${f.fromFuel || "-"} (S: ${f.fromSulphur || "-"}%) | To: ${f.toFuel || "-"} (S: ${f.toSulphur || "-"}%)\n  Commence Pos: ${f.commenceLat || "-"}, ${f.commenceLong || "-"} | Complete Pos: ${f.completeLat || "-"}, ${f.completeLong || "-"}\n  ROB (Commence) H:${f.robHsfoCommence || "-"} L:${f.robLsfoCommence || "-"} M:${f.robMgoCommence || "-"} | ROB (Complete) H:${f.robHsfoComplete || "-"} L:${f.robLsfoComplete || "-"} M:${f.robMgoComplete || "-"}\n  Running: ${f.totalRunningHrs || "-"} hrs | Consumption H:${f.consumptionHsfo || "-"} L:${f.consumptionLsfo || "-"} M:${f.consumptionMgo || "-"} | Reg: ${f.regulation || "-"}`).join("\n") : "No matching fuel changeover entries"));
        }
        return result.join("\n\n");
      }

      case "list_regulations": {
        const snap = await getDocs(query(collection(db, "regulations"), limit(args.limit || 50)));
        const items = snap.docs.map((d) => d.data());
        if (items.length === 0) return "No regulations found.";
        return items.map((r: any) => `- ${r.code}${r.description ? `: ${r.description}` : ""}`).join("\n");
      }

      case "get_dropdown": {
        const d = await getDoc(doc(db, "dropdowns", args.key));
        if (!d.exists()) return `No options configured for "${args.key}".`;
        const data = d.data();
        return `${data.label || args.key}: ${(data.options || []).join(", ")}`;
      }

      case "list_crew": {
        const snap = await getDocs(query(collection(db, "crewMembers"), limit(300)));
        let items = snap.docs.map((d) => d.data() as any);
        if (args.onBoardOnly) items = items.filter((c) => c.onBoard);
        if (args.rank) items = items.filter((c) => (c.rank || "").toLowerCase() === String(args.rank).toLowerCase());
        if (args.query) {
          const q = String(args.query).toLowerCase();
          items = items.filter((c) => (c.name || "").toLowerCase().includes(q) || (c.rank || "").toLowerCase().includes(q));
        }
        if (items.length === 0) return "No crew members found matching the criteria.";
        return items.slice(0, args.limit || 30).map((c) =>
          `- ${c.name} | ${c.rank || "-"} | ${c.onBoard ? "ON BOARD" : "SIGNED OFF"} | joined ${c.joinedDate || "-"}`
        ).join("\n");
      }

      case "list_engine_room_duties": {
        const limitN = args.limit || 20;
        const view = args.view || "records";
        const freqLabel = (f: string) => (f === "DAILY" ? "Daily" : f === "WEEKLY" ? "Weekly" : f === "MONTHLY" ? "Monthly" : "One-off");
        const inRange = (d: string | undefined) => {
          if (!d) return true;
          const day = d.slice(0, 10);
          if (args.fromDate && day < args.fromDate) return false;
          if (args.toDate && day > args.toDate) return false;
          return true;
        };
        const parts: string[] = [];

        if (view === "orders" || view === "all") {
          const [defSnap, crewSnap] = await Promise.all([
            getDocs(query(collection(db, "dutyDefinitions"), limit(300))),
            getDocs(query(collection(db, "crewMembers"), limit(300))),
          ]);
          const crewMap = new Map(crewSnap.docs.map((d) => [d.id, d.data() as any]));
          let defs = defSnap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
          if (args.status) defs = defs.filter((x) => x.status === args.status);
          if (args.frequency) defs = defs.filter((x) => x.frequency === args.frequency);
          if (args.keyword) {
            const k = String(args.keyword).toLowerCase();
            defs = defs.filter((x) => (x.title || "").toLowerCase().includes(k) || (x.description || "").toLowerCase().includes(k));
          }
          if (args.crewMember) {
            const k = String(args.crewMember).toLowerCase();
            defs = defs.filter((x) => (x.recipientIds || []).some((id: string) => (crewMap.get(id)?.name || "").toLowerCase().includes(k)));
          }
          const body = defs.slice(0, limitN).map((x) => {
            const names = (x.recipientIds || []).map((id: string) => crewMap.get(id)?.name).filter(Boolean);
            return `- "${x.title}" | ${freqLabel(x.frequency)} | ${x.status || "ACTIVE"} | since ${x.startDate || "-"} | recipients (${names.length}): ${names.length ? names.join(", ") : "unknown"}${x.description ? `\n  ${x.description}` : ""}`;
          }).join("\n");
          parts.push(`--- CHIEF ENGINEER ORDERS (${defs.length} found${defs.length > limitN ? `, showing ${limitN}` : ""}) ---\n${body || "No orders found."}`);
        }

        if (view === "records" || view === "all") {
          const snap = await getDocs(query(collection(db, "dutyTasks"), limit(1000)));
          let items = snap.docs.map((d) => d.data() as any);
          if (args.crewMember) { const k = String(args.crewMember).toLowerCase(); items = items.filter((t) => (t.crewMemberName || "").toLowerCase().includes(k)); }
          if (args.frequency) items = items.filter((t) => t.frequency === args.frequency);
          if (args.completed) items = items.filter((t) => (t.completed || "") === args.completed);
          if (args.justification) items = items.filter((t) => t.justification === args.justification);
          if (args.keyword) {
            const k = String(args.keyword).toLowerCase();
            items = items.filter((t) => (t.title || "").toLowerCase().includes(k) || (t.description || "").toLowerCase().includes(k));
          }
          items = items.filter((t) => inRange(t.dueDate));
          items.sort((a, b) => (a.dueDate < b.dueDate ? 1 : a.dueDate > b.dueDate ? -1 : 0));
          const body = items.slice(0, limitN).map((t) =>
            `- ${t.dueDate || "-"} | ${t.crewMemberName || "(crew)"} | ${t.title} (${freqLabel(t.frequency)})\n  COMPLETED: ${t.completed || "—"} | JUSTIFICATION: ${t.justification || "—"} | C/E APPROVAL: ${t.approval || "—"}${t.remarks ? `\n  REMARKS: ${t.remarks}` : ""}`
          ).join("\n");
          parts.push(`--- DUTY ENTRIES (${items.length} found${items.length > limitN ? `, showing ${limitN}` : ""}) ---\n${body || "No duty entries found."}`);
        }
        return parts.join("\n\n");
      }

      case "get_crew_performance": {
        const [crewSnap, taskSnap] = await Promise.all([
          getDocs(query(collection(db, "crewMembers"), limit(300))),
          getDocs(query(collection(db, "dutyTasks"), limit(1000))),
        ]);
        const crew = crewSnap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
        let tasks = taskSnap.docs.map((d) => d.data() as any);
        if (args.fromDate) tasks = tasks.filter((t) => (t.dueDate || "").slice(0, 10) >= args.fromDate);
        if (args.toDate) tasks = tasks.filter((t) => (t.dueDate || "").slice(0, 10) <= args.toDate);

        const tierOf = (pct: number, unexc: number) => {
          if (pct < 50 || unexc >= 2) return "POOR";
          if (pct >= 90 && unexc === 0) return "VERY GOOD";
          if (pct >= 75) return "GOOD";
          return "SATISFACTORY";
        };

        const targetCrew = args.crewMember
          ? crew.filter((c) => (c.name || "").toLowerCase().includes(String(args.crewMember).toLowerCase()))
          : crew;
        if (targetCrew.length === 0) return "No matching crew member found.";

        const lines = targetCrew.map((c) => {
          const own = tasks.filter((t) => t.crewMemberId === c.id);
          const answered = own.filter((t) => t.completed === "YES" || t.completed === "NO");
          const yes = own.filter((t) => t.completed === "YES").length;
          const excused = own.filter((t) => t.justification === "EXCUSED").length;
          const unexcused = own.filter((t) => t.justification === "UNEXCUSED").length;
          const pct = answered.length ? Math.round((yes / answered.length) * 100) : 0;
          const auto = answered.length ? tierOf(pct, unexcused) : "NO ENTRIES YET";
          const effective = c.kpiOverride || auto;
          return `- ${c.name} (${c.rank || "-"}): ${answered.length ? `${pct}% completion` : "no duty entries"} | YES ${yes}/${answered.length} | excused ${excused} | unexcused ${unexcused} → ${effective}${c.kpiOverride ? ` (manual override; auto was ${auto})` : ""}`;
        });

        const period = args.fromDate || args.toDate ? ` (${args.fromDate || "start"} → ${args.toDate || "today"})` : "";
        return `CREW PERFORMANCE${period}:\n${lines.join("\n")}`;
      }

      default:
        return `Unknown tool: ${name}`;
    }
  } catch (err: any) {
    console.error(`Tool ${name} error:`, err);
    return `Error running ${name}: ${err.message || "unknown error"}`;
  }
}
