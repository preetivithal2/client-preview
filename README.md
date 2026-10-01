# SM Engineer Portal 🚢

A comprehensive shipboard marine engineering management platform built with **Next.js 16**, **TypeScript**, **Firebase Firestore**, and **Tailwind CSS v4**. Designed for chief engineers and crew to track maintenance work, manage equipment, comply with international maritime regulations, and log environmental operations.

---

## ✨ Features

### 📊 Dashboard — Engineer Control Center
Real-time operational KPIs and analytics:
- **KPI Cards**: Total Open Jobs, High Priority Faults, In-Progress Worklines
- **Status Distribution**: Segmented bar chart of open jobs by priority vs completed
- **Department Grid**: Workload breakdown by department (Engine Room, Electrical, Deck, etc.)
- **Spare Parts Tracker**: Pending orders with priority filter (default: HIGH)
- **Crew Performance Analytics**: Track completion rates, overdue tasks, and avg resolution time per crew member
- **Monthly Trend Chart**: Workload frequency over time (6-month or full year view)
- **Export Deck**: Download reports in EXCEL (.csv), WORD (.doc), or PDF format

### 📋 Work Logs — Full Job Management
4-step wizard for creating and managing maintenance records:
- **Step 1 — Basic Information**: Job ID (auto-generated), Equipment, Regulation, Reported Date
- **Step 2 — Defect Details**: Component, Vessel, Department, Priority, Description, Reported By
- **Step 3 — Troubleshooting**: Actions Taken, Spares (multi-select), Order Status, PO Reference, Media Attachments (Cloudinary)
- **Step 4 — Resolution**: Job Status, Date Completed, Completed By, Final Resolution

Includes View modal with professional **Print/PDF report** featuring vessel name, color-coded status badges, and "Report By Saroukos Michail" footer.

### 🔍 Records — Advanced Search & Filter
Find any job record instantly with **15 filter criteria**:
Equipment, Vessel Name, Component, Department, Date, Priority, Reason, Office Notified, Assistants Required, Requisition Status, Spares Used, Completed By, Tested, Condition, Job Status, and Keyword Search.

### ⚙️ Equipment Management
Complete ship machinery inventory with:
- Name, Maker/Model, Serial Number, Technical Specs
- File attachments (manuals, diagrams — PDF, images)
- Cloudinary upload with drag-and-drop
- CSV import/export

### 📑 Regulations & Regulatory Library
Manage international maritime regulations:
- Code, Description, Attached documents
- Searchable library for quick reference during audits
- View and Download capabilities

### 🌿 Environmental Logs (MARPOL Compliance)
Three dedicated logbooks:

| Logbook | Key Fields | Auto-Calculations |
|---------|-----------|-------------------|
| **Bilge Water Separator** (15ppm) | Start/End DateTime, GPS Position, Valve/Seal Numbers, Volume | **Total Running HRS** (from datetime), **Pump Rate** (Volume ÷ HRS) |
| **Incinerator Management** | Start/End DateTime, Waste Type, Inc Waste Oil Tank, Quantity, Unit, Remark | **Total Running HRS** (from datetime) |
| **Fuel Changeover System** | Commence/Complete DateTime, From/To Fuel, Sulphur %, ROB HSFO/LSFO/MGO | **Total Running HRS**, **Consumption HSFO/LSFO/MGO** |

All environmental logs include **CSV export** and **AlertDialog** delete confirmation.

### 🤖 AI Assistant — Michail
Intelligent marine engineering assistant powered by DeepSeek AI with a **tool-calling RAG architecture** that searches the entire database dynamically:

- **Full database access**: Can search all 7 collections — workLogs, equipment, regulations, bilgeWaterLogs, incineratorLogs, fuelChangeoverLogs, and dropdowns
- **Record-level search**: Searches work logs by ANY field — job ID, equipment, vessel, component, department, priority, status, regulation, reason, office notified, spares used, completed by, tested criteria, condition, date, and keyword (same as the Records tab)
- **Complete field visibility**: Every record returned includes ALL fields (completed by, spares, PO reference, actions, resolution, etc.)
- **Environmental log search**: Bilge water, incinerator, and fuel changeover logs with all fields + filters (regulation, waste type, fuel type, date range)
- **Exact counts**: Uses Firestore `getCountFromServer()` for precise totals even with 100K+ records
- **Real security**: The AI has NO write/update/delete tools — read-only is enforced in the backend, not just the prompt. Firestore rules additionally block all writes without authentication.
- **Rate limited**: 20 requests/minute per IP to prevent token budget abuse
- **Anti-hallucination**: System prompt enforces honesty — the AI never invents records or counts, and says "I don't see that" when data isn't found
- **Full conversation memory**: Entire chat history is sent with each request (with DeepSeek prompt caching)
- **Conversation history**: Saves sessions to Firestore with rename, delete, confirmation dialogs, and 10-conversation limit
- **Server-Sent Events**: Streaming responses with thinking steps and tool-search indicators
- **Markdown rendering**: Supports tables, lists, code blocks in responses
- **Token usage display**: Shows prompt/completion tokens per response

Accessible via floating widget (bottom-right on all pages) or full chat interface at `/ai`.

### ⚙️ Configuration — Dropdown Editor
Manage **17 configurable dropdowns** that power all forms:
- Vessel Names, Components, Departments, Priorities, Statuses, Waste Types, Fuel Types, and more
- Inline edit, two-click delete, add new options
- Changes reflect immediately across all forms
- Export CSV to download all values

### 🔔 Notifications
- Delete confirmations with sound (Web Audio API)
- Offline detection with automatic notification
- 24-hour TTL auto-cleanup
- Cross-tab sync via localStorage events

### 🌓 Theme Support
- Dark/Light mode toggle with localStorage persistence
- No flash on page load (inline theme initialization script)
- CSS custom properties for consistent theming

---

## 🛠 Tech Stack

| Technology | Purpose |
|-----------|---------|
| **Next.js 16** | React framework with App Router & Turbopack |
| **TypeScript** | Type-safe code |
| **Tailwind CSS v4** | Utility-first styling |
| **Firebase Firestore** | NoSQL database with offline persistence |
| **Firebase Auth** | Email/password authentication |
| **Cloudinary** | Media file storage (images, PDFs, videos) |
| **DeepSeek API** | AI assistant (DeepSeek V4 Flash) |
| **Firebase Admin SDK** | Server-side Firestore operations |

---

## 🔐 Security

- **Firebase Authentication**: All users must sign in with email/password
- **Security Rules**: Authenticated users only — no public access
- **Read-only AI**: Michail has read-only access to the database, can never create, edit, or delete records
- **AlertDialog confirmations**: All delete operations require explicit confirmation
- **Session management**: Auth state persisted, cookie-based session tracking

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Firebase project with Firestore, Auth, and Storage enabled
- Cloudinary account
- DeepSeek API key

### Environment Variables
Create `.env.local`:

```env
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=

# Cloudinary (for file uploads)
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# AI Provider (DeepSeek)
AI_PROVIDER=deepseek
AI_DEEPSEEK_API_KEY=
```

### Install & Run

```bash
npm install
npx next dev -p 3000
```

### Build for Production

```bash
npx next build
npx next start -p 3000
```

---

## 📁 Project Structure

```
app/
├── (auth)/signin/         # Login page
├── (auth)/signup/         # Registration page
├── (dashboard)/           # Protected pages
│   ├── page.tsx           # Dashboard
│   ├── work-logs/         # Work log management
│   ├── records/           # Search & filter records
│   ├── equipment/         # Equipment management
│   ├── regulations/       # Regulations management
│   ├── regulatory-library/# Browse regulations
│   ├── dropdowns/         # Dropdown configuration
│   ├── environmental-log/ # Environmental logs
│   │   ├── bilge-water/
│   │   ├── incinerator/
│   │   └── fuel-changeover/
│   └── ai/                # Full AI chat interface
├── api/
│   ├── ai/chat/           # AI chat API (SSE streaming)
│   └── upload/            # File upload API
├── components/
│   ├── ai/                # AI chat components
│   ├── common/            # Shared UI components
│   ├── dashboard/         # Dashboard widgets
│   ├── dropdowns/         # Dropdown editor
│   ├── environmental-log/ # Environmental log forms
│   ├── equipment/         # Equipment manager
│   ├── layout/            # Header, Sidebar
│   ├── records/           # Search filters
│   ├── regulations/       # Regulations manager
│   └── work-logs/         # Work log form, table, shared
└── lib/
    ├── ai/                # AI provider, context, system prompts
    ├── hooks/             # React hooks
    ├── services/          # Firestore services
    └── firebase.ts        # Firebase config
```

---

## 📊 Database Collections

| Collection | Purpose | AI Access |
|-----------|---------|:---------:|
| `workLogs` | Job/repair records | ✅ Read-only |
| `equipment` | Machinery inventory | ✅ Read-only |
| `regulations` | Maritime regulations | ✅ Read-only |
| `bilgeWaterLogs` | Bilge water separator logs | ✅ Read-only |
| `incineratorLogs` | Incinerator operation logs | ✅ Read-only |
| `fuelChangeoverLogs` | Fuel changeover records | ✅ Read-only |
| `dropdowns` | Form dropdown options | ✅ Read-only |
| `aiChats` | AI conversation history | ✅ Read-only |

---

## 👨‍💻 Author

**Saroukos Michail** — Chief Engineer

## Builder

**Harish Vithal Founder of Aioraa** — Built by Aioraa Team.*

---

## 📄 License

Proprietary — All rights reserved.


Everything is up to date...


crew roaster added but need to work on the Ai response, ai dont' know about the crew roaster 





latest updates in AI is not added here....!!


some fields has been hide with the tem comment to easily track please reuse if require

<<<<<<< HEAD

Just for checking the githup account in new branch...
=======
new updates added
>>>>>>> eee6f17d95cc3b60c20a663bf2484d81a0438d5f
