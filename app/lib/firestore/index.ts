// lib/firestore/index.ts
// Re-export all collection services from a single entry point

export {
  getAllEquipment,
  addEquipment,
  updateEquipment,
  deleteEquipment,
} from "./equipment.service";

export {
  getAllWorkLogs,
  getWorkLogById,
  addWorkLog,
  updateWorkLog,
  deleteWorkLog,
} from "./workLog.service";

export {
  getDropdown,
  getAllDropdownsMap,
  getDropdownOptions,
} from "./filters.service";