export interface Record {
  id: string;
  jobId: string;
  component: string;
  vesselName: string;
  department: string;
  reportedDate: string;
  officeInformed: 'yes' | 'no' | '';
  priority: 'high' | 'medium' | 'low' | '';
  reason: string;
  assistant: 'yes' | 'no' | '';
  requisitionNo: string;
  spareUsed: string;
  completedBy: string;
  tested: 'yes' | 'no' | '';
  condition: 'good' | 'fair' | 'poor' | '';
  description: string;
  status: 'OPEN' | 'CLOSED' | '';
}

export interface FilterState {
  equipment: string;
  component: string;
  vesselName: string;
  department: string;
  reportedDate: string;
  officeInformed: string;
  priority: string;
  reason: string;
  assistant: string;
  requisitionNo: string;
  spareUsed: string;
  completedBy: string;
  tested: string;
  condition: string;
  status: string;
  keyword: string;
}
