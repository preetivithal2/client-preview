/**
 * SINGLE SOURCE OF TRUTH for the AI assistant's knowledge of the portal.
 *
 * The AI's platform knowledge is rendered from this manifest, so updating the
 * portal means updating this file — not editing prose scattered through the
 * prompt. Keep each entry factual and current. Anything a marine engineer can
 * see or do in the portal should be described here; anything private
 * (credentials, secrets, personal data, chat history) must not.
 *
 * The manifest is intentionally data-only: no imports, no React, no Firestore.
 */

export type RouteStatus = "active" | "hidden" | "placeholder";

export interface PortalRoute {
  path: string;
  label: string;
  section: string;
  status: RouteStatus;
  /** One or two sentences describing what the page is for. */
  purpose: string;
  /** Firestore collections the page reads or writes. */
  collections: string[];
  /** Current user-facing controls/behaviour on the page. */
  capabilities: string[];
}

export interface CollectionSpec {
  name: string;
  purpose: string;
  /** Matching interface in app/lib/types.ts, when one exists. */
  model?: string;
  /** Top-level fields. Nested objects are written as `parent.child`. */
  fields: string[];
  /** Fields that must never be exposed by the assistant. */
  sensitiveFields?: string[];
  /** False when the assistant is not allowed to query it at all. */
  aiAccessible: boolean;
}

export interface DropdownSpec {
  key: string;
  label: string;
  status: "active" | "hidden";
}

/* ────────────────────────────── ROUTES ────────────────────────────── */

export const PORTAL_ROUTES: PortalRoute[] = [
  {
    path: "/",
    label: "Dashboard",
    section: "Management",
    status: "active",
    purpose:
      "The command centre with real-time operational KPIs, workload distribution and maintenance trends.",
    collections: ["workLogs", "crewMembers", "dutyTasks"],
    capabilities: [
      "KPI cards: total open jobs, high-priority faults, in-progress worklines",
      "Status distribution across priority, compared with completed/closed jobs",
      "Department grid showing active workload per department",
      "Crew performance analytics for the selected period",
      "Monthly maintenance trend chart with H1/H2/full-year filter and month-over-month change",
      "Export the dashboard as Excel (CSV), Word (.doc) or PDF (print)",
      "Spare Parts Tracker is present in the code but currently TEMP-HIDDEN from the UI",
    ],
  },
  {
    path: "/records",
    label: "Records",
    section: "Management",
    status: "active",
    purpose:
      "Search, filter and export the complete work-log register. This is the main read-only view of all jobs.",
    collections: ["workLogs"],
    capabilities: [
      "Filters: Equipment, Vessel Name, Component, Department, Reported Date, Priority, Reason, Office Informed, Assistants Required, Requisition Status, Spares Used, Completed By, Tested, Condition, Job Status, Keyword Search",
      "Results sorted newest first",
      "Multi-select rows for PDF/CSV download or a combined print report",
    ],
  },
  {
    path: "/work-logs",
    label: "Work Log",
    section: "Management",
    status: "active",
    purpose:
      "The main data-entry point: create, view, edit, print and delete work-log entries.",
    collections: ["workLogs", "equipment", "regulations", "dropdowns"],
    capabilities: [
      "4-step form: Basic Information, Defect Details, Troubleshooting & Actions, Resolution & Completion",
      "Auto-generated Job ID (format sm-YYMMDDxxx)",
      "Media attachments via Cloudinary",
      "View/print single entries; multi-select PDF/CSV download; delete with confirmation",
    ],
  },
  {
    path: "/equipment",
    label: "Manage Equipments",
    section: "Configuration",
    status: "active",
    purpose:
      "The onboard equipment inventory used as a reference when creating work logs.",
    collections: ["equipment"],
    capabilities: [
      "Add, edit and delete equipment records",
      "Store maker/model, serial number and technical specifications",
      "Attach manuals and documents (PDF/images) via Cloudinary",
    ],
  },
  {
    path: "/crew-roster",
    label: "Manage Crew Roster",
    section: "Configuration",
    status: "active",
    purpose:
      "The engine-room crew roster that feeds order recipients and performance cards.",
    collections: ["crewMembers", "dropdowns"],
    capabilities: [
      "Add, edit and delete crew members",
      "Track name, rank, on-board flag and joined date",
      "One-click import of names already stored in the Reported-By dropdown",
      "Signed-off crew stay in the roster but are not offered as order recipients",
    ],
  },
  {
    path: "/dropdowns",
    label: "Manage Dropdowns",
    section: "Configuration",
    status: "active",
    purpose:
      "Configure the select-field options used across every form and filter in the portal.",
    collections: ["dropdowns"],
    capabilities: [
      "Edit option lists for the active dropdowns listed below",
      "Changes apply immediately across all forms",
      "Export all dropdown values to CSV",
      "Requisition Status, Tested Criteria and Order Status are currently TEMP-HIDDEN",
    ],
  },
  {
    path: "/duties",
    label: "Chief Engineer Orders",
    section: "Engine Room Duties",
    status: "active",
    purpose:
      "Dispatch daily, weekly, monthly or one-off engine-room orders to crew and manage the dispatched register.",
    collections: ["dutyDefinitions", "dutyTasks", "crewMembers"],
    capabilities: [
      "Dispatch an order with Task Title, Description/Guidelines, Recipients and Frequency (One-off/Daily/Weekly/Monthly)",
      "Dispatching creates an independent clone per crew member — one person's completion never affects another",
      "Recurring orders create each due entry automatically as the date arrives",
      "Orders are ACTIVE or ARCHIVED; edit and delete supported",
      "Filters: search by task title and filter by crew member",
      "Print the currently visible orders",
    ],
  },
  {
    path: "/duties/crew",
    label: "Crew Performance",
    section: "Engine Room Duties",
    status: "active",
    purpose:
      "One performance card per on-board crew member, tracking duty completion and an automated KPI rating.",
    collections: ["crewMembers", "dutyDefinitions", "dutyTasks"],
    capabilities: [
      "Period selector plus five AND-combined filters: name search, role/rank, performance rating, crew member and dispatched order",
      "COMPLETED dropdown (YES/NO); NO reveals a JUSTIFICATION dropdown (EXCUSED/UNEXCUSED)",
      "Chief Engineer Approval dropdown (YES/NO) accepts or rejects an excuse",
      "WARNINGS/REMARKS field unlocks only when a task is finalised UNEXCUSED",
      "Automatic KPI tier: VERY GOOD, GOOD, SATISFACTORY or POOR, with Chief Engineer manual override",
      "Rating colour dot on each crew list row",
      "Print the currently visible crew performance cards",
    ],
  },
  {
    path: "/environmental-log/bilge-water",
    label: "Bilge Water Separator",
    section: "Environmental Log",
    status: "active",
    purpose:
      "Log oily bilge-water discharges for MARPOL Annex I compliance.",
    collections: ["bilgeWaterLogs", "regulations", "dropdowns"],
    capabilities: [
      "Fields: Regulation, start/end date-time, 15ppm alarm, start/end GPS position, overboard valve, seal numbers, volume",
      "Auto-calculated total running hours and pump rate",
      "View, print and CSV export (single or multi-select)",
    ],
  },
  {
    path: "/environmental-log/incinerator",
    label: "Incinerator Management",
    section: "Environmental Log",
    status: "active",
    purpose:
      "Log sludge and solid-waste incineration for MARPOL Annex VI compliance.",
    collections: ["incineratorLogs", "regulations", "dropdowns"],
    capabilities: [
      "Fields: Regulation, waste type, start/end date-time, incinerator waste-oil tank, running hours, quantity and unit, remark, GPS",
      "View, print and CSV export (single or multi-select)",
    ],
  },
  {
    path: "/environmental-log/fuel-changeover",
    label: "Fuel Changeover System",
    section: "Environmental Log",
    status: "active",
    purpose:
      "Log fuel changeover procedures when entering or leaving an Emission Control Area (ECA), for MARPOL Annex VI compliance.",
    collections: ["fuelChangeoverLogs", "regulations", "dropdowns"],
    capabilities: [
      "19-field record covering commence/complete date-time and position, from/to fuel and sulphur, ROB HSFO/LSFO/MGO",
      "Auto-calculated running hours and consumption per fuel",
      "View, print and CSV export (single or multi-select)",
    ],
  },
  {
    path: "/ai",
    label: "AI Assistant",
    section: "Management",
    status: "active",
    purpose:
      "The Michail chat interface with persistent chat history, suggestions and streaming answers.",
    collections: ["aiChats"],
    capabilities: [
      "Chat history panel with rename, delete and clear all (max 10 conversations)",
      "Suggested questions on a new chat",
      "Server-Sent Events streaming with visible thinking steps",
      "Markdown rendering with tables, lists and code blocks",
      "Floating widget available on every page with route-aware welcome messages",
    ],
  },
  {
    path: "/regulations",
    label: "Regulations Master",
    section: "Configuration",
    status: "hidden",
    purpose:
      "Manage maritime regulations (MARPOL, SOLAS, etc.) for work-log and environmental-log tagging. The route and data still exist, but the navigation item is temporarily hidden.",
    collections: ["regulations"],
    capabilities: [
      "Add, edit and delete regulation records",
      "Attach regulation documents",
    ],
  },
  {
    path: "/regulatory-library",
    label: "Regulatory Library",
    section: "Management",
    status: "hidden",
    purpose:
      "Browse and search regulation documents. The route still exists, but the navigation item is temporarily hidden.",
    collections: ["regulations"],
    capabilities: ["Search regulations by code, description and document name"],
  },
  {
    path: "/malfunctionhistory",
    label: "Malfunction History",
    section: "Unlinked",
    status: "placeholder",
    purpose:
      "A placeholder page with no implemented functionality. It is not linked in the navigation and must not be described as a working feature.",
    collections: [],
    capabilities: [],
  },
  {
    path: "/signin",
    label: "Sign In",
    section: "Authentication",
    status: "active",
    purpose: "Sign-in screen for the portal.",
    collections: [],
    capabilities: ["Email/password sign-in"],
  },
  {
    path: "/signup",
    label: "Sign Up",
    section: "Authentication",
    status: "active",
    purpose: "Account-creation screen for the portal.",
    collections: [],
    capabilities: ["Create an account"],
  },
  {
    path: "/onboarding",
    label: "System Overview",
    section: "Authentication",
    status: "active",
    purpose:
      "A one-off welcome screen shown after setup, with a summary of configured records.",
    collections: [],
    capabilities: ["System-ready overview and a link to the dashboard"],
  },
];

/* ──────────────────────────── COLLECTIONS ──────────────────────────── */

export const COLLECTIONS: CollectionSpec[] = [
  {
    name: "workLogs",
    purpose:
      "Every maintenance/defect job: the central operational record used by the dashboard, records and work-log pages.",
    model: "WorkLogEntry",
    aiAccessible: true,
    fields: [
      "jobId",
      "status",
      "priority",
      "reportedDate",
      "equipmentId",
      "equipmentName",
      "equipmentSpecs.maker",
      "equipmentSpecs.model",
      "equipmentSpecs.serial",
      "equipmentSpecs.specs",
      "component",
      "vesselName",
      "department",
      "jobDescription",
      "reportedBy",
      "officeNotified",
      "assistantsRequired",
      "actionsTaken",
      "sparesUsed",
      "reasonDelay",
      "orderStatus",
      "poReference",
      "requisitionStatus",
      "mediaAttachments",
      "files",
      "testedCriteria",
      "conditionMatrix",
      "regulation",
      "dateCompleted",
      "completedBy",
      "resolution",
      "daysOpen",
      "riskAssessmentRequired",
      "riskAssessmentRef",
      "permitToWork",
      "permitRef",
      "postRepairTesting",
      "postRepairStatus",
      "createdAt",
      "updatedAt",
    ],
  },
  {
    name: "equipment",
    purpose: "The onboard equipment inventory and attached manuals.",
    model: "Equipment",
    aiAccessible: true,
    fields: [
      "name",
      "makerModel",
      "serialNumber",
      "specs",
      "file.name",
      "file.url",
      "files",
      "createdAt",
      "updatedAt",
    ],
  },
  {
    name: "regulations",
    purpose: "Maritime regulation master data referenced by work logs and environmental logs.",
    model: "Regulation",
    aiAccessible: true,
    fields: ["code", "description", "attachment.name", "attachment.url", "files"],
  },
  {
    name: "bilgeWaterLogs",
    purpose: "Bilge-water separator discharge logbook (MARPOL Annex I).",
    model: "BilgeWaterLog",
    aiAccessible: true,
    fields: [
      "startDateTime",
      "endDateTime",
      "alarmOk",
      "startLat",
      "startLong",
      "endLat",
      "endLong",
      "overboardValveNo",
      "overboardValveNoSealed",
      "sealNoUnsealed",
      "sealNoSealed",
      "volumeM3",
      "totalRunningHrs",
      "pumpRate",
      "regulation",
      "createdAt",
      "updatedAt",
    ],
  },
  {
    name: "incineratorLogs",
    purpose: "Incinerator operation logbook (MARPOL Annex VI).",
    model: "IncineratorLog",
    aiAccessible: true,
    fields: [
      "startDateTime",
      "endDateTime",
      "wasteType",
      "quantity",
      "quantityUnit",
      "incWasteOilTankM3",
      "totalRunning",
      "remark",
      "alarmOk",
      "lat",
      "long",
      "regulation",
      "createdAt",
      "updatedAt",
    ],
  },
  {
    name: "fuelChangeoverLogs",
    purpose: "Fuel changeover logbook for ECA entry/exit (MARPOL Annex VI).",
    model: "FuelChangeoverLog",
    aiAccessible: true,
    fields: [
      "commenceDateTime",
      "commenceLat",
      "commenceLong",
      "fromFuel",
      "fromSulphur",
      "toFuel",
      "toSulphur",
      "robHsfoCommence",
      "robLsfoCommence",
      "robMgoCommence",
      "completeDateTime",
      "completeLat",
      "completeLong",
      "robHsfoComplete",
      "robLsfoComplete",
      "robMgoComplete",
      "totalRunningHrs",
      "consumptionHsfo",
      "consumptionLsfo",
      "consumptionMgo",
      "regulation",
      "createdAt",
      "updatedAt",
    ],
  },
  {
    name: "dropdowns",
    purpose: "Configuration documents holding the option lists for every form dropdown.",
    model: "DropdownDoc",
    aiAccessible: true,
    fields: ["label", "placeholder", "options", "updatedAt"],
  },
  {
    name: "crewMembers",
    purpose:
      "Engine-room crew roster. Operational fields (name, rank, on-board status, joined date, KPI override) are readable; personal/contact data is not.",
    model: "CrewMember",
    aiAccessible: true,
    fields: [
      "name",
      "rank",
      "department",
      "onBoard",
      "joinedDate",
      "kpiOverride",
      "kpiOverrideAt",
    ],
    sensitiveFields: ["email", "role"],
  },
  {
    name: "dutyDefinitions",
    purpose: "Chief Engineer's standing orders (the order templates).",
    model: "DutyDefinition",
    aiAccessible: true,
    fields: [
      "title",
      "description",
      "frequency",
      "recipientIds",
      "startDate",
      "status",
      "assignedBy",
      "createdAt",
      "updatedAt",
    ],
  },
  {
    name: "dutyTasks",
    purpose:
      "Per-crew, per-due-date clones of orders with completion, justification, approval and remarks.",
    model: "DutyTask",
    aiAccessible: true,
    fields: [
      "definitionId",
      "title",
      "description",
      "frequency",
      "dueDate",
      "crewMemberId",
      "crewMemberName",
      "crewMemberRank",
      "completed",
      "justification",
      "approval",
      "remarks",
      "status",
      "createdAt",
      "updatedAt",
    ],
  },
  {
    name: "aiChats",
    purpose:
      "Private AI chat sessions and messages stored for the user's history panel. Never queried by the assistant.",
    aiAccessible: false,
    fields: ["title", "role", "text", "createdAt", "updatedAt"],
  },
];

/* ───────────────────────────── DROPDOWNS ───────────────────────────── */

export const DROPDOWNS: DropdownSpec[] = [
  { key: "vesselName", label: "Vessel Name", status: "active" },
  { key: "componentSpec", label: "Components", status: "active" },
  { key: "department", label: "Department", status: "active" },
  { key: "assistant", label: "Assistants Required", status: "active" },
  { key: "sparesUsed", label: "No. of Spares Used", status: "active" },
  { key: "completedBy", label: "Completed By", status: "active" },
  { key: "reportedBy", label: "Reported By", status: "active" },
  { key: "conditionMatrix", label: "Condition", status: "active" },
  { key: "reasonClassifications", label: "Reason for Job Performed", status: "active" },
  { key: "wasteType", label: "Waste Type", status: "active" },
  { key: "fuelType", label: "Fuel Type", status: "active" },
  { key: "priority", label: "Priority", status: "active" },
  { key: "officeNotified", label: "Office Notified", status: "active" },
  { key: "jobStatus", label: "Job Status", status: "active" },
  { key: "requisitionStatus", label: "Requisition Status", status: "hidden" },
  { key: "testedCriteria", label: "Tested Criteria", status: "hidden" },
  { key: "orderStatus", label: "Order Status", status: "hidden" },
];

/* ──────────────────────────── CONVENTIONS ──────────────────────────── */

export const PLATFORM_CONVENTIONS = [
  "Status values are configurable. Typical work-log statuses are OPEN, 2. In Progress, 3. Canceled and 8. Closed.",
  "Priority values are HIGH, MEDIUM and LOW (case-insensitive).",
  "Dates use the YYYY-MM-DD format; environmental logs use datetime-local strings.",
  "The portal supports dark and light themes.",
  "Media files are stored on Cloudinary.",
  "Delete actions use a custom AlertDialog and raise a notification with a short beep.",
  "Notifications are stored in localStorage with a 24-hour auto-clear and a cross-tab poll every 5 seconds.",
  "The AI assistant is read-only: it can search and summarize, never create, edit, delete or dispatch.",
];
