/**
 * Static knowledge about the SM Engineer Portal.
 * The AI always has this context — no database fetch needed.
 */
export const PLATFORM_KNOWLEDGE = `SM ENGINEER PORTAL — PLATFORM OVERVIEW

The SM Engineer Portal is a shipboard marine engineering management platform. It helps marine engineers track maintenance work, manage equipment, comply with regulations, and log environmental operations. The platform features an AI assistant named Michail that helps users navigate and query data.

================================================================================
NOTIFICATION SYSTEM
================================================================================
All pages have a notification bell (top-right of the header). Notifications are stored in localStorage with a 24-hour auto-clear. Types include:
- Delete notifications: triggered when a work log entry is deleted
- Offline notifications: auto-detected when internet connection is lost
Each notification plays a short beep sound via Web Audio API (520Hz sine, 0.3s). The bell icon shows a red dot when unread notifications exist. Polls for cross-tab changes every 5 seconds.

================================================================================
ALERT DIALOG
================================================================================
The platform uses a custom AlertDialog component for confirmations and alerts — replaces native window.confirm/alert. Used for delete confirmations across all modules (work logs, environmental logs). Supports "alert" (single OK button) and "confirm" (Cancel/Confirm) modes. Dismisses on Escape key.

================================================================================
FILE UPLOADER
================================================================================
A drag-and-drop file uploader component used across Equipment, Regulations, Work Logs, and all media attachments. Features:
- Drag-and-drop zone with visual hover feedback
- File size validation (configurable max, default 10-20MB)
- Preview thumbnails for images
- Multi-file selection support
- Upload progress bar (percentage + animated spinner)
- Cloudinary upload with error handling
- Remove file capability

================================================================================
1. DASHBOARD (Route: /)
================================================================================
The main command center showing real-time operational KPIs and analytics.

KPI STATS (3 cards at the top):
- Total Open Jobs: Count of all work logs where status contains "open" — active maintenance tickets.
- High Priority Faults: Open jobs marked as HIGH priority — requires immediate attention.
- In-Progress Worklines: Jobs with status containing "In Progress" — engineers actively working.

STATUS DISTRIBUTION: Shows all open jobs broken down by priority (High/Medium/Low) compared to completed/closed jobs. Displayed as a segmented bar chart with percentage breakdown.

DEPARTMENT GRID: Groups active (non-closed) jobs by department (Engine Room, Electrical, Deck, etc.). Each department shows a horizontal bar indicating its workload relative to the busiest department.

SPARE PARTS TRACKER: Lists all work orders that have spare parts requisitioned. Shows PO reference, spare name, order status, priority, and days since created. Filterable by priority (default: HIGH).

CREW PERFORMANCE ANALYTICS: Tracks performance of each crew member/rank (reportedBy field). Shows:
- Total Assigned: how many jobs assigned to that person
- Completed: jobs marked as closed
- Overdue: open jobs exceeding 3 days
- Avg. Days: average time to complete jobs
- Completion Rate: percentage of jobs completed

MONTHLY MAINTENANCE TREND: Bar chart showing how many work logs were created each month of the current year. Filterable by H1 (Jan-Jun), H2 (Jul-Dec), or full year. Includes Month-over-Month change indicator.

EXPORT CONTROLS: EXCEL (CSV), WORD (.doc), and PDF (print) export options for generating offline reports with all dashboard data.

================================================================================
2. WORK LOGS (Route: /work-logs)
================================================================================
Create, view, edit, and delete work log entries. The main data entry point.

The form has 4 steps:
Step 1 - Basic Information: Job ID (auto-generated), Reported Date, Equipment, Regulation
Step 2 - Defect Details: Vessel Name, Component, Department, Priority, Description, Reported By, Office Notified, Assistants Required, Reason for Job Performed
Step 3 - Troubleshooting & Actions: Actions Taken, Spares Used (multi-select), Order Status, PO Reference, Requisition Status, Tested Criteria, Condition, Media Attachments
Step 4 - Resolution & Completion: Job Status (e.g. OPEN, 2. In Progress, 8. Closed, 3. Canceled), Date Completed, Completed By, Final Resolution

Each work log contains these fields:
- jobId (unique identifier, auto-generated)
- status (dropdown: OPEN, In Progress, Canceled, Closed — configurable)
- priority (HIGH, MEDIUM, LOW)
- equipmentName, equipmentId, equipmentSpecs
- jobDescription — description of the issue
- reportedDate — when reported
- department, vesselName, component
- reportedBy — who reported
- officeNotified — YES/NO
- assistantsRequired — number of assistants
- reasonDelay — reason for job performed
- actionsTaken — troubleshooting steps
- sparesUsed — array of spare parts used
- orderStatus — order status for spares
- poReference — PO number
- requisitionStatus — requisition status
- testedCriteria — test results
- conditionMatrix — equipment condition
- dateCompleted — completion date
- completedBy — who completed
- resolution — root cause / final resolution
- regulation — applicable regulation code
- mediaAttachments, files — file attachments

Work Logs also have a professional Print/PDF feature: generates a one-page A4 report with vessel name, Job ID, color-coded status/priority badges, sections for all job details, and a footer reading "Report By Saroukos Michail". Triggered from the View modal.

================================================================================
3. RECORDS (Route: /records)
================================================================================
Search and filter all work logs using 15 filter criteria: Equipment, Vessel Name, Component, Department, Reported Date, Priority, Reason, Office Informed, Assistants Required, Requisition Status, Spares Used, Completed By, Tested, Condition, Job Status, and Keyword Search. Results show full WorkLogTable with all fields. Sort by newest first.

================================================================================
4. EQUIPMENT (Route: /equipment)
================================================================================
Manage onboard equipment inventory. Each equipment entry has: name, maker/model, serial number, technical specs, and attached manual files (PDF, images, documents uploaded to Cloudinary). Used as a reference when creating work logs.

================================================================================
5. REGULATIONS (Route: /regulations)
================================================================================
Manage maritime regulations (MARPOL Annex I, Annex VI, etc.). Each regulation has a code, description, and attached documents. Regulations are referenced in work logs and environmental logs.

================================================================================
6. REGULATORY LIBRARY (Route: /regulatory-library)
================================================================================
Browse all regulations and their attached documents. Searchable by code, description, and file names.

================================================================================
7. DROPDOWNS (Route: /dropdowns)
================================================================================
Configure all dropdown options used across the platform. 17 managed dropdowns: Vessel Name, Components, Department, Assistants Required, Requisition Status, Spares Used, Completed By, Reported By, Tested Criteria, Condition, Reason for Job Performed, Waste Type, Fuel Type, Priority, Office Notified, Order Status, Job Status. Changes reflect immediately across all forms. Includes Export CSV to download all values.

================================================================================
8. ENVIRONMENTAL LOGS
================================================================================
Three separate logbooks for environmental compliance, each with its own Firestore collection, form, and data table with CSV export:

BILGE WATER SEPARATOR (15ppm) — /environmental-log/bilge-water
Log oily bilge water discharges. Fields: Regulation, Start/End Date/Time, 15ppm Alarm OK, Start/End GPS Position, Overboard Valve No, Seal No (Unsealed), Seal No (Sealed), Volume (m³), Total Running HRS (auto-calculated from datetime difference), Pump Rate (auto-calculated from Volume / Running HRS). Required for MARPOL Annex I compliance.

INCINERATOR MANAGEMENT — /environmental-log/incinerator
Log sludge and solid waste burning operations. Fields: Regulation, Waste Type (from Firestore dropdown), Start/End Date/Time, Inc Waste Oil Tank (m³), Total Running (hrs), Quantity, Unit (Liters/KG/m³), Remark. Required for MARPOL Annex VI compliance.

FUEL CHANGEOVER SYSTEM — /environmental-log/fuel-changeover
Log fuel changeover procedures when entering/exiting Emission Control Areas (ECA). Full 19-field form:
- Commence Change Over: Date/Time*, Latitude, Longitude, From Fuel, From Sulphur %, To Fuel, To Sulphur %, ROB HSFO/LSFO/MGO
- Completed Change Over: Date/Time*, Latitude, Longitude, ROB HSFO/LSFO/MGO
- Auto-calculated Results: Total Running HRS, Consumption HSFO, Consumption LSFO, Consumption MGO
Required for MARPOL Annex VI compliance.

================================================================================
9. AI ASSISTANT (Route: /ai)
================================================================================
AI chat interface named Michail. Can answer questions about any data in the portal. Also accessible via a floating widget (bottom-right) on all pages with route-aware welcome messages. Chat history is saved per session in Firestore. Features include:
- Chat history panel with rename, delete, and clear all
- Max 10 conversations limit
- Suggested questions on new chat
- Server-Sent Events (SSE) streaming with thinking steps
- Markdown rendering with tables, lists, and code blocks
- Intelligent query detection — only fetches relevant database collections

================================================================================
10. CREW ROSTER (Route: /crew-roster — Configuration ▸ Manage Crew Roster)
================================================================================
The engine-room crew roster — the list of people on board that powers orders and performance cards.
Each crew member has: Name, Rank (selected from the ranks already configured in the Reported-By dropdown), an "On board" flag, and a joined date. Signed-off crew remain in the list but are not offered as order recipients.
There is a one-click "Use existing crew names from the Reported-By list" action that imports the crew names already stored in the portal.
Stored in the Firestore collection "crewMembers". (Single-operator today — email/role fields exist for a future crew-login phase but are not active yet.)

================================================================================
11. ENGINE ROOM DUTIES — CHIEF ENGINEER ORDERS & CREW PERFORMANCE
================================================================================
A module for assigning daily/recurring engine-room duties to crew and scoring their completion. Sidebar section: "Engine Room Duties".

A) CHIEF ENGINEER ORDERS (Route: /duties)
The Chief Engineer dispatches an order containing: Task Title, Description / Guidelines, Recipients (multi-select checkboxes of on-board crew, with a mandatory "Select All" button) and Frequency (One-off / Daily / Weekly / Monthly).
Critical rule: dispatching creates an INDEPENDENT COPY (clone) of the task for every selected crew member. One crew member's completion status never affects or overwrites another's.
Recurring orders (Daily / Weekly / Monthly) automatically create each due entry as its date arrives — no manual work. Orders are ACTIVE or ARCHIVED.
Stored in "dutyDefinitions" (the orders) and "dutyTasks" (the per-crew clones — one document per crew member per due date).

B) CREW PERFORMANCE (Route: /duties/crew)
One performance card per crew member with these interactive columns:
- DATE and NAME (auto-populated from the roster)
- DUTIES / ORDERS (the tasks assigned by the Chief Engineer)
- COMPLETED — dropdown: YES / NO
- JUSTIFICATION — hidden by default; appears ONLY when COMPLETED = NO. Options: EXCUSED / UNEXCUSED
- CHIEF ENGINEER APPROVAL — dropdown YES / NO (accepts or rejects the crew member's excuse)
- WARNINGS / REMARKS — a locked text field, accessible only by the Chief Engineer; it unlocks ONLY when a task is finalized UNEXCUSED, to log an official verbal warning or disciplinary note
Behaviour: COMPLETED = YES archives the task. COMPLETED = NO + EXCUSED + C/E Approval YES accepts the delay. COMPLETED = NO + UNEXCUSED opens the REMARKS field for a warning.

AUTOMATED KPI RATING (colour-coded badge on each card, computed over the selected period):
- VERY GOOD (green): 90–100% completion AND zero unexcused entries
- GOOD (blue): 75–89% completion
- SATISFACTORY (yellow): 50–74% completion, OR exactly 1 unexcused entry
- POOR (red): under 50% completion, OR 2 or more unexcused entries
The Chief Engineer can apply a MANUAL OVERRIDE to the final rating (stored on the crew member) when external vessel factors apply.
Helper tools: list_crew, list_engine_room_duties, get_crew_performance. Collections: crewMembers, dutyDefinitions, dutyTasks.

================================================================================
PLATFORM CONVENTIONS
- Status values are configurable via dropdowns manager. Common values include OPEN, 2. In Progress, 3. Canceled, 8. Closed.
- Priority values are HIGH, MEDIUM, LOW (case-insensitive).
- All dates use datetime-local format.
- The platform has dark/light theme support.
- Media files are stored on Cloudinary.
- Delete operations use a custom AlertDialog with confirmation.
- Delete actions trigger notification with sound.`;
