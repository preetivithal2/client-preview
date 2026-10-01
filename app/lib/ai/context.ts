import { collection, getDocs, query, limit, orderBy, Timestamp, where, getCountFromServer } from "firebase/firestore";
import { db } from "../firebase";

/**
 * READ-ONLY Firestore context fetchers.
 * Each function returns formatted data from ONE collection.
 */

async function safeGetDocs(collectionName: string, maxDocs = 30): Promise<Record<string, any>[]> {
  try {
    const q = query(collection(db, collectionName), orderBy("createdAt", "desc"), limit(maxDocs));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch {
    return [];
  }
}

function stripTimestamps(obj: Record<string, any>): Record<string, any> {
  const result: Record<string, any> = {};
  for (const [key, val] of Object.entries(obj)) {
    if (val instanceof Timestamp) {
      result[key] = val.toDate().toISOString();
    } else if (typeof val === "object" && val !== null && !Array.isArray(val)) {
      result[key] = stripTimestamps(val);
    } else {
      result[key] = val;
    }
  }
  return result;
}

function formatList(items: Record<string, any>[], fields: string[]): string {
  if (items.length === 0) return "No entries found.";
  return items
    .map((item) => {
      const parts = fields.map((f) => {
        const val = item[f];
        if (val === undefined || val === null) return "";
        const str = String(val);
        return str.length > 150 ? str.slice(0, 150) + "..." : str;
      });
      return `- ${parts.filter(Boolean).join(" | ")}`;
    })
    .join("\n");
}

// ──────────────────────────────────────────────
// COUNT HELPERS — accurate even with 100K records
// Uses getCountFromServer — transfers ZERO documents
// ──────────────────────────────────────────────

async function getCollectionCount(collectionName: string): Promise<number> {
  try {
    const snap = await getCountFromServer(query(collection(db, collectionName)));
    return snap.data().count;
  } catch {
    return 0;
  }
}

async function getFilteredCount(collectionName: string, field: string, value: string): Promise<number> {
  try {
    const q = query(collection(db, collectionName), where(field, ">=", value), where(field, "<=", value + ""));
    const snap = await getCountFromServer(q);
    return snap.data().count;
  } catch {
    return 0;
  }
}

// ──────────────────────────────────────────────
// SEARCH HELPERS — real search, works with 100K+ records
// Uses Firestore where() queries to fetch ONLY matching records
// ──────────────────────────────────────────────

/** Search work logs by exact job ID (e.g. sm-260721459) */
export async function searchWorkLogsByJobId(jobId: string): Promise<string> {
  try {
    const q = query(collection(db, "workLogs"), where("jobId", "==", jobId), limit(5));
    const snap = await getDocs(q);
    const data = snap.docs.map((d) => stripTimestamps({ id: d.id, ...d.data() }));
    if (data.length === 0) return `No work log found with job ID "${jobId}".`;
    return formatList(data, [
      "jobId", "status", "priority", "equipmentName", "jobDescription",
      "reportedDate", "department", "vesselName", "component",
      "reportedBy", "dateCompleted", "completedBy", "resolution",
      "sparesUsed", "regulation",
    ]);
  } catch {
    return `No work log found with job ID "${jobId}".`;
  }
}

/** Search work logs by equipment name (e.g. "Main Engine") */
export async function searchWorkLogsByEquipment(equipmentName: string, maxDocs = 10): Promise<string> {
  try {
    const q = query(
      collection(db, "workLogs"),
      where("equipmentName", ">=", equipmentName),
      where("equipmentName", "<=", equipmentName + ""),
      limit(maxDocs)
    );
    const snap = await getDocs(q);
    const data = snap.docs.map((d) => stripTimestamps({ id: d.id, ...d.data() }));
    if (data.length === 0) return `No work logs found for equipment "${equipmentName}".`;
    return formatList(data, [
      "jobId", "status", "priority", "equipmentName", "jobDescription",
      "reportedDate", "department", "vesselName", "component",
      "reportedBy", "dateCompleted", "completedBy", "regulation",
    ]);
  } catch {
    return `No work logs found for equipment "${equipmentName}".`;
  }
}

/** Search work logs by any field with a value (status, priority, regulation, etc.) */
export async function searchWorkLogsByField(field: string, value: string, maxDocs = 10): Promise<string> {
  try {
    const q = query(
      collection(db, "workLogs"),
      where(field, ">=", value),
      where(field, "<=", value + ""),
      limit(maxDocs)
    );
    const snap = await getDocs(q);
    const data = snap.docs.map((d) => stripTimestamps({ id: d.id, ...d.data() }));
    if (data.length === 0) return `No work logs found with ${field} "${value}".`;
    return formatList(data, [
      "jobId", "status", "priority", "equipmentName", "jobDescription",
      "reportedDate", "department", "vesselName", "reportedBy", "regulation",
    ]);
  } catch {
    return `No work logs found with ${field} "${value}".`;
  }
}

/** Detect which equipment names appear in the user's question by matching against the equipment collection */
export async function detectEquipmentMentioned(message: string): Promise<string[]> {
  try {
    const snap = await getDocs(collection(db, "equipment"));
    const names = snap.docs.map((d) => d.data().name).filter(Boolean) as string[];
    const lower = message.toLowerCase();
    const mentioned: string[] = [];
    for (const name of names) {
      if (name && lower.includes(name.toLowerCase())) {
        mentioned.push(name);
      }
    }
    return mentioned;
  } catch {
    return [];
  }
}

/** Search equipment by name, maker, model, or serial (matches across fields) */
export async function searchEquipmentByName(queryText: string, maxDocs = 10): Promise<string> {
  try {
    const all = await safeGetDocs("equipment", 100);
    const filtered = all.filter(e =>
      (e.name || "").toLowerCase().includes(queryText.toLowerCase()) ||
      (e.makerModel || "").toLowerCase().includes(queryText.toLowerCase()) ||
      (e.serialNumber || "").toLowerCase().includes(queryText.toLowerCase()) ||
      (e.specs || "").toLowerCase().includes(queryText.toLowerCase())
    ).slice(0, maxDocs);
    if (filtered.length === 0) return `No equipment found matching "${queryText}".`;
    return formatList(filtered, ["name", "makerModel", "serialNumber", "specs"]);
  } catch {
    return `No equipment found matching "${queryText}".`;
  }
}

// ──────────────────────────────────────────────
// WORK LOGS
// ──────────────────────────────────────────────

export async function getWorkLogsContext(): Promise<string> {
  // Get accurate counts first (works with any number of records)
  const totalCount = await getCollectionCount("workLogs");
  const openCount = await getFilteredCount("workLogs", "status", "open");
  const closedCount = await getFilteredCount("workLogs", "status", "closed");

  const summary = `📊 WORK LOGS SUMMARY: ${totalCount} total (${openCount} open, ${closedCount} closed)`;

  // Get recent 30 for reference
  const data = (await safeGetDocs("workLogs", 30)).map(stripTimestamps);
  if (data.length === 0) return summary + "\n\nNo recent work logs to display.";

  return summary + "\n\nRECENT ENTRIES:\n" + formatList(data, [
    "jobId", "status", "priority", "equipmentName", "jobDescription",
    "reportedDate", "department", "vesselName", "component",
    "reportedBy", "dateCompleted", "completedBy",
    "sparesUsed", "regulation",
  ]);
}

// ──────────────────────────────────────────────
// EQUIPMENT
// ──────────────────────────────────────────────

export async function getEquipmentContext(): Promise<string> {
  const totalCount = await getCollectionCount("equipment");
  const summary = `📊 EQUIPMENT SUMMARY: ${totalCount} total pieces of equipment`;

  const data = (await safeGetDocs("equipment", 30)).map(stripTimestamps);
  if (data.length === 0) return summary + "\n\nNo equipment entries to display.";

  return summary + "\n\nREGISTERED EQUIPMENT:\n" + formatList(data, ["name", "makerModel", "serialNumber", "specs"]);
}

// ──────────────────────────────────────────────
// REGULATIONS
// ──────────────────────────────────────────────

export async function getRegulationsContext(): Promise<string> {
  const totalCount = await getCollectionCount("regulations");
  const summary = `📊 REGULATIONS SUMMARY: ${totalCount} total regulations`;

  const data = (await safeGetDocs("regulations", 30)).map(stripTimestamps);
  if (data.length === 0) return summary + "\n\nNo regulations to display.";

  return summary + "\n\nREGULATIONS:\n" + formatList(data, ["code", "description"]);
}

// ──────────────────────────────────────────────
// ENVIRONMENTAL LOGS
// ──────────────────────────────────────────────

export async function getEnvironmentalContext(): Promise<string> {
  const bilgeCount = await getCollectionCount("bilgeWaterLogs");
  const incineratorCount = await getCollectionCount("incineratorLogs");
  const fuelCount = await getCollectionCount("fuelChangeoverLogs");

  const summary = `📊 ENVIRONMENTAL LOGS SUMMARY: ${bilgeCount} bilge water, ${incineratorCount} incinerator, ${fuelCount} fuel changeover`;

  const bilge = (await safeGetDocs("bilgeWaterLogs", 15)).map(stripTimestamps);
  const incinerator = (await safeGetDocs("incineratorLogs", 15)).map(stripTimestamps);
  const fuel = (await safeGetDocs("fuelChangeoverLogs", 15)).map(stripTimestamps);

  const parts: string[] = [summary];
  if (bilge.length) parts.push("--- BILGE WATER (recent) ---\n" + formatList(bilge, ["startDateTime", "endDateTime", "volumeM3", "totalRunningHrs", "pumpRate", "regulation", "alarmOk"]));
  if (incinerator.length) parts.push("--- INCINERATOR (recent) ---\n" + formatList(incinerator, ["startDateTime", "endDateTime", "wasteType", "incWasteOilTankM3", "totalRunning", "quantity", "quantityUnit", "remark", "regulation"]));
  if (fuel.length) parts.push("--- FUEL CHANGEOVER (recent) ---\n" + formatList(fuel, ["commenceDateTime", "completeDateTime", "fromFuel", "fromSulphur", "toFuel", "toSulphur", "robHsfoCommence", "robLsfoCommence", "robMgoCommence", "robHsfoComplete", "robLsfoComplete", "robMgoComplete", "totalRunningHrs", "consumptionHsfo", "consumptionLsfo", "consumptionMgo"]));
  return parts.length > 1 ? parts.join("\n\n") : summary + "\n\nNo environmental entries found.";
}

// ──────────────────────────────────────────────
// DROPDOWNS
// ──────────────────────────────────────────────

export async function getDropdownsContext(): Promise<string> {
  try {
    const snap = await getDocs(collection(db, "dropdowns"));
    const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    if (data.length === 0) return "No dropdowns configured.";
    return data
      .map((d) => {
        const entries = Object.entries(d).filter(([k]) => !["id", "createdAt", "updatedAt"].includes(k));
        return entries
          .map(([key, val]) => {
            if (Array.isArray(val)) return `${key}: ${val.join(", ")}`;
            return `${key}: ${val}`;
          })
          .join("\n");
      })
      .join("\n");
  } catch {
    return "No dropdowns configured.";
  }
}
