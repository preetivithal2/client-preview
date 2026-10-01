import { Record } from "../../components/records/types";
import { WorkLogEntry } from "../types";

type WorkLogDoc = Omit<WorkLogEntry, "priority"> & {
  priority?: WorkLogEntry["priority"] | Record["priority"];
  component?: string;
  vesselName?: string;
  department?: string;
  officeInformed?: Record["officeInformed"];
  reason?: string;
  assistant?: Record["assistant"];
  requisitionNo?: string;
  spareUsed?: string;
  tested?: Record["tested"];
  condition?: Record["condition"];
  description?: string;
};

function normalizePriority(
  priority: WorkLogEntry["priority"] | Record["priority"] | undefined
): Record["priority"] {
  if (!priority) return "";
  const upper = String(priority).toUpperCase();
  if (upper === "HIGH") return "high";
  if (upper === "MEDIUM") return "medium";
  if (upper === "LOW") return "low";
  const lower = String(priority).toLowerCase();
  if (lower === "high" || lower === "medium" || lower === "low") return lower;
  return "";
}

function toOfficeInformed(
  value: WorkLogEntry["officeNotified"] | Record["officeInformed"] | undefined
): Record["officeInformed"] {
  if (!value) return "";
  const upper = String(value).toUpperCase();
  if (upper === "YES") return "yes";
  if (upper === "NO" || upper === "NOT REQUIRED") return "no";
  if (value === "yes" || value === "no") return value;
  return "";
}

function toYesNo(value: string | undefined): Record["tested"] {
  if (!value) return "";
  const lower = value.toLowerCase();
  if (lower === "yes" || lower === "no") return lower;
  return "";
}

function toCondition(value: string | undefined): Record["condition"] {
  if (!value) return "";
  const lower = value.toLowerCase();
  if (lower === "good" || lower === "fair" || lower === "poor") return lower;
  return "";
}

function isRecordShaped(doc: WorkLogDoc): boolean {
  return typeof doc.component === "string";
}

export function workLogToRecord(entry: WorkLogDoc): Record {
  if (isRecordShaped(entry)) {
    return {
      id: entry.id ?? "",
      jobId: entry.jobId ?? "",
      component: entry.component!,
      vesselName: entry.vesselName ?? "",
      department: entry.department ?? "",
      reportedDate: entry.reportedDate ?? "",
      officeInformed: toOfficeInformed(entry.officeInformed),
      priority: normalizePriority(entry.priority),
      reason: entry.reason ?? "",
      assistant: entry.assistant ?? "",
      requisitionNo: entry.requisitionNo ?? "",
      spareUsed: entry.spareUsed ?? "",
      completedBy: entry.completedBy ?? "",
      tested: toYesNo(entry.tested),
      condition: toCondition(entry.condition),
      description: entry.description ?? "",
      status: entry.status as Record['status'] || "",
    };
  }

  return {
    id: entry.id ?? "",
    jobId: entry.jobId ?? "",
    component: entry.equipmentName ?? "",
    vesselName: "",
    department: "",
    reportedDate: entry.reportedDate ?? "",
    officeInformed: toOfficeInformed(entry.officeNotified),
    priority: normalizePriority(entry.priority),
    reason: entry.reasonDelay ?? "",
    assistant: "",
    requisitionNo: entry.poReference ?? "",
    spareUsed: entry.sparesUsed ? (Array.isArray(entry.sparesUsed) ? entry.sparesUsed.join(', ') : entry.sparesUsed) : "",
    completedBy: entry.completedBy ?? "",
    tested: toYesNo(entry.postRepairTesting),
    condition: toCondition(entry.postRepairStatus),
    description: entry.jobDescription ?? "",
    status: entry.status as Record['status'] || "",
  };
}

export function recordToWorkLogUpdate(
  record: Record
): Partial<WorkLogEntry> & { [key: string]: unknown } {
  const priorityMap = { high: "HIGH", medium: "MEDIUM", low: "LOW" } as const;

  return {
    component: record.component,
    vesselName: record.vesselName,
    department: record.department,
    reportedDate: record.reportedDate,
    officeInformed: record.officeInformed,
    reason: record.reason,
    assistant: record.assistant,
    requisitionNo: record.requisitionNo,
    spareUsed: record.spareUsed,
    completedBy: record.completedBy,
    tested: record.tested,
    condition: record.condition,
    description: record.description,
    equipmentName: record.component,
    priority: priorityMap[record.priority as keyof typeof priorityMap] ?? "MEDIUM",
    officeNotified:
      record.officeInformed === "yes"
        ? "YES"
        : record.officeInformed === "no"
          ? "NO"
          : "NOT REQUIRED",
    reasonDelay: record.reason,
    poReference: record.requisitionNo,
    sparesUsed: [record.spareUsed],
    jobDescription: record.description,
    postRepairTesting: record.tested,
    postRepairStatus: record.condition,
  };
}
