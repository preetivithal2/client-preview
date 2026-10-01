// export interface Equipment {
//   id: string;
//   name: string;
//   maker: string;
//   model: string;
//   serial: string;
//   specs: string; // e.g., "100kW, 1500 RPM, 10 bar"
//   attachment?: string;
// }

// export interface WorkLogEntry {
//   id: string;
//   reportedDate: string; // YYYY-MM-DD
//   equipmentId: string;
//   priority: 'HIGH' | 'MEDIUM' | 'LOW';
//   jobDescription: string;
//   reportedBy: string;
//   officeNotified: 'YES' | 'NO' | 'NOT REQUIRED' | '';
//   actionsTaken: string;
//   sparesUsed: string;
//   reasonDelay: string;
//   orderStatus: string;
//   poReference: string;
//   mediaAttachments: string; // hyperlink
//   dateCompleted: string | null; // YYYY-MM-DD or null
//   completedBy: string;
//   resolution: string;
//   // Computed (derived)
//   equipmentSpecs?: {
//     maker: string;
//     model: string;
//     serial: string;
//     specs: string;
//   };
//   status?: 'OPEN' | 'CLOSED';
//   daysOpen?: number;
// }


// lib/types.ts

export interface DropdownDoc {
  label: string;
  placeholder: string;
  options: string[];
  updatedAt?: any; // Firestore Timestamp
}

export interface Equipment {
  id?: string; // document ID (optional)
  name: string;
  makerModel: string;
  serialNumber: string;
  specs: string;
  file: {
    name: string;
    url: string;
    type?: string;
  } | null;
  files?: MediaFile[];
  createdAt?: any;
  updatedAt?: any;
}

export interface Regulation {
  id?: string;
  code: string;
  description?: string;
  attachment?: {
    name: string;
    url: string;
    type?: string;
  } | null;
  files?: MediaFile[];
}

// === MEDIA FILE ===
export interface MediaFile {
  id: string;             // unique permanent file ID (UUID) — never changes, survives provider migration
  jobId?: string;         // associated job ID (for work logs)
  equipmentId?: string;   // associated equipment ID (for equipment assets)
  regulationId?: string;  // associated regulation ID (for regulation docs)
  fileName: string;
  publicId: string;       // Cloudinary public ID (or provider-specific public ID)
  url: string;
  type: string;           // MIME type
  size: number;           // bytes
  provider: 'cloudinary' | 'aws' | 'firebase' | 'uploadthing';
  providerId: string;     // provider-specific identifier
  uploadedAt: any;        // Firestore Timestamp
}


// lib/types.ts

export interface WorkLogEntry {
  id?: string;
  jobId: string; // custom ID: sm-YYMMDDxxx
  
  // === BASIC INFORMATION ===
  reportedDate: string;
  equipmentId: string; // reference to Equipment doc ID
  regulation?: string; // regulation code
  equipmentName?: string; // denormalized for quick display
  equipmentSpecs?: {
    maker: string;
    model: string;
    serial: string;
    specs: string;
  };
  
  // === DEFECT DETAILS ===
  component?: string; // from dropdowns/componentSpec
  vesselName?: string; // from dropdowns/vesselName
  department?: string; // from dropdowns/department
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  jobDescription: string;
  reportedBy: string;
  officeNotified: 'YES' | 'NO' | 'NOT REQUIRED' | '';
  assistantsRequired?: string; // from dropdowns/assistant
  
  // === TROUBLESHOOTING ===
  actionsTaken: string;
  sparesUsed: string[]; // CHANGED: now an array for multi-select
  reasonDelay: string;
  orderStatus: string;
  poReference: string;
  requisitionStatus?: string;
  mediaAttachments: string; // URL (legacy — kept for backward compatibility)
  files?: MediaFile[];
  testedCriteria?: string; // from dropdowns/testedCriteria
  conditionMatrix?: string; // from dropdowns/conditionMatrix
  
  // === RESOLUTION ===
  dateCompleted: string | null;
  completedBy: string;
  resolution: string;
  
  // === COMPUTED FIELDS ===
  status: 'OPEN' | 'CLOSED';
  daysOpen: number;
  
  // === OPTIONAL: Safety & Compliance ===
  riskAssessmentRequired?: 'YES' | 'NO';
  riskAssessmentRef?: string;
  permitToWork?: string;
  permitRef?: string;
  postRepairTesting?: string;
  postRepairStatus?: string;
  
  // === TIMESTAMPS ===
  createdAt?: any;
  updatedAt?: any;
}








export interface BilgeWaterLog {
  id?: string;
  startDateTime: string;
  endDateTime: string;
  alarmOk: boolean;
  startLat?: string;
  startLong?: string;
  overboardValveNo?: string;
  sealNoUnsealed?: string;
  endLat?: string;
  endLong?: string;
  overboardValveNoSealed?: string;
  sealNoSealed?: string;
  volumeM3: string;
  totalRunningHrs?: string;
  pumpRate?: string;
  regulation?: string;
  createdAt?: any;
  updatedAt?: any;
}

export interface IncineratorLog {
  id?: string;
  startDateTime: string;
  endDateTime: string;
  wasteType: string;
  quantity: string;
  quantityUnit: string;
  incWasteOilTankM3?: string;
  totalRunning?: string;
  remark?: string;
  alarmOk: boolean;
  regulation?: string;
  lat?: string;
  long?: string;
  createdAt?: any;
  updatedAt?: any;
}

export interface FuelChangeoverLog {
  id?: string;
  regulation?: string;

  // Commence Change Over
  commenceDateTime: string;
  commenceLat?: string;
  commenceLong?: string;
  fromFuel?: string;
  fromSulphur?: string;
  toFuel?: string;
  toSulphur?: string;
  robHsfoCommence?: string;
  robLsfoCommence?: string;
  robMgoCommence?: string;

  // Completed Change Over
  completeDateTime?: string;
  completeLat?: string;
  completeLong?: string;
  robHsfoComplete?: string;
  robLsfoComplete?: string;
  robMgoComplete?: string;

  // Auto-calculated
  totalRunningHrs?: string;
  consumptionHsfo?: string;
  consumptionLsfo?: string;
  consumptionMgo?: string;

  // Legacy
  fuelType?: string;
  fuelROB?: string;
  alarmOk?: boolean;
  dateTime?: string;
  lat?: string;
  long?: string;
  createdAt?: any;
  updatedAt?: any;
}

// === ENGINE ROOM DUTIES ===
// New section: Chief Engineer assigns daily/recurring engine-room duties to the
// crew roster, tracks completion per crew member, and auto-scores a KPI.
//
// Single-operator today — email / role / authUid fields are reserved for the
// future multi-user phase (each crew logs in and sees only their own card).

export interface CrewMember {
  id?: string;
  name: string;         // display name (e.g. actual person or rank-as-crew-line)
  rank: string;         // from the Reported-By ranks dropdown
  department?: string;  // default "Engine Room"
  onBoard: boolean;
  joinedDate?: string;  // YYYY-MM-DD
  email?: string;       // reserved: future crew logins
  role?: 'CHIEF_ENGINEER' | 'CREW'; // reserved: future role-based access
  // Chief Engineer manual KPI override (tier label), e.g. "GOOD"
  kpiOverride?: string | null;
  kpiOverrideAt?: any;
  createdAt?: any;
  updatedAt?: any;
}

export type DutyFrequency = 'ONE_OFF' | 'DAILY' | 'WEEKLY' | 'MONTHLY';

/** The C/E's standing order (template). Recurring orders live here and are
 *  materialized into dutyTasks instances as their due dates arrive. */
export interface DutyDefinition {
  id?: string;
  title: string;
  description?: string;
  frequency: DutyFrequency;
  recipientIds: string[]; // crewMember ids
  startDate: string;      // YYYY-MM-DD
  status: 'ACTIVE' | 'ARCHIVED';
  assignedBy?: string;    // e.g. logged-in name/email (single operator)
  createdAt?: any;
  updatedAt?: any;
}

/** One independent clone — per crew member × per due date. The YES/NO progress
 *  of one crew member never affects another because each has its own doc. */
export interface DutyTask {
  id?: string;
  definitionId?: string;
  title: string;
  description?: string;
  frequency: DutyFrequency;
  dueDate: string; // YYYY-MM-DD
  crewMemberId: string;
  crewMemberName: string;
  crewMemberRank?: string;
  completed: '' | 'YES' | 'NO';
  justification: '' | 'EXCUSED' | 'UNEXCUSED';
  approval: '' | 'YES' | 'NO';
  remarks: string; // C/E warnings — locked unless task finalized UNEXCUSED
  status?: 'OPEN' | 'COMPLETED' | 'ARCHIVED';
  createdAt?: any;
  updatedAt?: any;
}