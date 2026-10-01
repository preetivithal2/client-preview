// components/work-logs/WorkLogForm.tsx
"use client";

import { useState, useEffect } from 'react';
import { Equipment, WorkLogEntry } from '../../lib/types';
import { getStatus, calculateDaysOpen } from '../../lib/utils';
import { generateJobId } from '../../lib/idGenerator';
import { useEquipment } from '../../lib/hooks/useEquipment';
import { useAllDropdowns } from '../../lib/hooks/useAllDropdowns';
import { useRegulations } from '../../lib/hooks/useRegulations';
import WorkLogProgress from './WorkLogProgress';
import BasicInfoSection from './sections/BasicInfoSection';
import DefectDetailsSection from './sections/DefectDetailsSection';
import TroubleshootingSection from './sections/TroubleshootingSection';
import ResolutionSection from './sections/ResolutionSection';

interface WorkLogFormProps {
  onSave: (entry: Omit<WorkLogEntry, 'id'>) => Promise<string | null>;
  editingEntry: WorkLogEntry | null;
  onCancelEdit: () => void;
}

const SECTIONS = [
  { id: 0, label: 'Basic Information', icon: '📋' },
  { id: 1, label: 'Defect Details', icon: '🔍' },
  { id: 2, label: 'Troubleshooting', icon: '🔧' },
  { id: 3, label: 'Resolution & Completion', icon: '✅' },
];

export default function WorkLogForm({ onSave, editingEntry, onCancelEdit }: WorkLogFormProps) {
  // ---- Data Hooks ----
  const { data: equipmentList, loading: eqLoading, error: eqError } = useEquipment();
  const { getOptions, loading: ddLoading, error: ddError } = useAllDropdowns();
  const { data: regulationsList, loading: loadingRegs } = useRegulations();

  const priorityOptions = getOptions('priority');
  const officeNotifiedOptions = getOptions('officeNotified');
  const orderStatusOptions = getOptions('orderStatus');
  const reportedByOptions = getOptions('reportedBy');
  const reasonDelayOptions = getOptions('reasonClassifications');
  const completedByOptions = getOptions('completedBy');

  // ---- State ----
  const [currentSection, setCurrentSection] = useState(0);
  const [formData, setFormData] = useState<Partial<WorkLogEntry>>({
    jobId: '',
    reportedDate: new Date().toISOString().split('T')[0],
    equipmentId: '',
    regulation: '',
    component: '',
    vesselName: '',
    department: '',
    priority: 'MEDIUM',
    jobDescription: '',
    reportedBy: '',
    officeNotified: '',
    assistantsRequired: '',
    actionsTaken: '',
    sparesUsed: [], // ✅ array for multi-select
    reasonDelay: '',
    orderStatus: 'Not Ordered',
    poReference: '',
    requisitionStatus: '',
    mediaAttachments: '',
    testedCriteria: '',
    conditionMatrix: '',
    dateCompleted: null,
    completedBy: '',
    resolution: '',
  });
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ---- Populate form when editing ----
  useEffect(() => {
    if (editingEntry) {
      setFormData({ ...editingEntry });
      const eq = equipmentList.find((e) => e.id === editingEntry.equipmentId);
      setSelectedEquipment(eq || null);
    }
  }, [editingEntry, equipmentList]);

  // ---- Auto‑generate job ID ----
  useEffect(() => {
    if (!editingEntry && !formData.jobId) {
      setFormData((prev) => ({ ...prev, jobId: generateJobId() }));
    }
  }, [editingEntry]);

  // ---- Field change handler ----
  const handleFieldChange = (field: keyof WorkLogEntry, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleEquipmentChange = (eqId: string) => {
    const eq = equipmentList.find((item) => item.id === eqId) || null;
    setSelectedEquipment(eq);
    setFormData((prev) => ({
      ...prev,
      equipmentId: eqId,
      equipmentSpecs: eq
        ? {
            maker: eq.makerModel?.split(' ')[0] || '',
            model: eq.makerModel?.split(' ').slice(1).join(' ') || '',
            serial: eq.serialNumber || '',
            specs: eq.specs || '',
          }
        : undefined,
    }));
  };

  // ---- Validation per section ----
  const validateSection = (section: number): boolean => {
    const newErrors: Record<string, string> = {};
    switch (section) {
      case 0:
        if (!formData.equipmentId) newErrors.equipmentId = 'Please select equipment';
        if (!formData.reportedDate) newErrors.reportedDate = 'Please select reported date';
        break;
      case 1:
        if (!formData.jobDescription?.trim()) newErrors.jobDescription = 'Please describe the issue';
        if (!formData.reportedBy) newErrors.reportedBy = 'Please select reported by';
        break;
      case 2:
        // optional fields
        break;
      case 3:
        if (formData.dateCompleted) {
          if (!formData.completedBy) newErrors.completedBy = 'Please select completed by';
          if (!formData.resolution?.trim()) newErrors.resolution = 'Please describe final resolution';
        }
        break;
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ---- Navigation ----
  const goToNext = () => {
    if (validateSection(currentSection) && currentSection < SECTIONS.length - 1) {
      setCurrentSection(currentSection + 1);
    }
  };

  const goToPrevious = () => {
    if (currentSection > 0) setCurrentSection(currentSection - 1);
  };

  // ---- Reset Form ----
  const resetForm = () => {
    setFormData({
      jobId: '',
      reportedDate: new Date().toISOString().split('T')[0],
      equipmentId: '',
      regulation: '',
      component: '',
      vesselName: '',
      department: '',
      priority: 'MEDIUM',
      jobDescription: '',
      reportedBy: '',
      officeNotified: '',
      assistantsRequired: '',
      actionsTaken: '',
      sparesUsed: [],
      reasonDelay: '',
      orderStatus: 'Not Ordered',
      poReference: '',
      requisitionStatus: '',
      mediaAttachments: '',
      testedCriteria: '',
      conditionMatrix: '',
      dateCompleted: null,
      completedBy: '',
      resolution: '',
    });
    setSelectedEquipment(null);
    setCurrentSection(0);
    setErrors({});
  };

  const handleCancel = () => {
    if (editingEntry) {
      onCancelEdit();
    } else {
      resetForm();
    }
  };

  // ---- Submit ----
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // validate all sections
    let allValid = true;
    for (let i = 0; i < SECTIONS.length; i++) {
      if (!validateSection(i)) {
        allValid = false;
        setCurrentSection(i);
        break;
      }
    }
    if (!allValid) return;

    // extra check for closure if dateCompleted set
    if (formData.dateCompleted && (!formData.completedBy || !formData.resolution?.trim())) {
      setErrors({
        completedBy: !formData.completedBy ? 'Please select completed by' : '',
        resolution: !formData.resolution?.trim() ? 'Please describe final resolution' : '',
      });
      setCurrentSection(3);
      return;
    }

    setIsSubmitting(true);

    try {
      // Preserve the actual job status from dropdown (e.g. "8. Closed", "2. In Progress")
      const statusValue = formData.status || 'OPEN';
      const isClosed = statusValue.toLowerCase().includes('closed');
      const daysOpen = calculateDaysOpen(
        formData.reportedDate as string,
        isClosed ? formData.dateCompleted as string | null : null
      );

      // Build the entry object with all fields
      const newEntry: Omit<WorkLogEntry, 'id'> = {
        jobId: editingEntry?.jobId || formData.jobId || generateJobId(),
        reportedDate: formData.reportedDate as string,
        equipmentId: formData.equipmentId as string,
        equipmentName: selectedEquipment?.name || formData.equipmentName || '',
        regulation: formData.regulation || '',
        component: formData.component || '',
        vesselName: formData.vesselName || '',
        department: formData.department || '',
        priority: (formData.priority || 'MEDIUM').toUpperCase() as 'HIGH' | 'MEDIUM' | 'LOW',
        jobDescription: formData.jobDescription as string,
        reportedBy: formData.reportedBy as string,
        officeNotified: formData.officeNotified as 'YES' | 'NO' | 'NOT REQUIRED',
        assistantsRequired: formData.assistantsRequired || '',
        actionsTaken: formData.actionsTaken || '',
        sparesUsed: Array.isArray(formData.sparesUsed) ? formData.sparesUsed : [],
        reasonDelay: formData.reasonDelay || '',
        orderStatus: formData.orderStatus || 'Not Ordered',
        poReference: formData.poReference || '',
        requisitionStatus: formData.requisitionStatus || '',
        mediaAttachments: formData.mediaAttachments || '',
        files: Array.isArray(formData.files) ? formData.files : [],
        testedCriteria: formData.testedCriteria || '',
        conditionMatrix: formData.conditionMatrix || '',
        dateCompleted: formData.dateCompleted as string | null,
        completedBy: formData.completedBy || '',
        resolution: formData.resolution || '',
        equipmentSpecs: selectedEquipment
          ? {
              maker: selectedEquipment.makerModel?.split(' ')[0] || '',
              model: selectedEquipment.makerModel?.split(' ').slice(1).join(' ') || '',
              serial: selectedEquipment.serialNumber || '',
              specs: selectedEquipment.specs || '',
            }
          : undefined,
        status: statusValue,
        daysOpen,
      };

      const result = await onSave(newEntry);
      if (result) {
        if (editingEntry) {
          onCancelEdit();
        } else {
          resetForm();
        }
      } else {
        alert('Failed to save. Please try again.');
      }
    } catch (error) {
      console.error('Submit error:', error);
      alert('An error occurred while saving.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ---- Loading / Error ----
  const isLoading = eqLoading || ddLoading || loadingRegs;
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-t-[var(--clr-text-primary)] border-[var(--clr-border)] rounded-full animate-spin mx-auto" />
          <p className="mt-2 text-sm text-[var(--clr-text-secondary)]">Loading form data...</p>
        </div>
      </div>
    );
  }

  if (eqError || ddError) {
    return (
      <div className="p-6 bg-[var(--clr-bg-red)] border border-[var(--clr-bg-red-border)] rounded-xl text-sm text-[var(--clr-text-red)]">
        Failed to load form data. Please refresh the page.
      </div>
    );
  }

  // ---- Render ----
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-[var(--clr-text-primary)]">
            {editingEntry ? 'Edit Work Log Entry' : 'Add New Work Log Entry'}
          </h2>
          {editingEntry && (
            <p className="text-sm text-[var(--clr-text-secondary)]">
              Editing job: <span className="font-mono font-semibold">{editingEntry.jobId}</span>
            </p>
          )}
        </div>
        {editingEntry && (
          <button
            type="button"
            onClick={onCancelEdit}
            className="text-sm font-medium text-[var(--clr-text-secondary)] hover:text-[var(--clr-text-primary)] transition"
          >
            Cancel Edit
          </button>
        )}
      </div>

      {/* Progress Bar + Tabs */}
      <WorkLogProgress
        currentSection={currentSection}
        setCurrentSection={setCurrentSection}
        sections={SECTIONS}
      />

      {/* Section Content */}
      <div className="min-h-[320px] transition-all duration-300">
        {currentSection === 0 && (
          <BasicInfoSection
            formData={formData}
            onFieldChange={handleFieldChange}
            onEquipmentChange={handleEquipmentChange}
            equipmentList={equipmentList}
            regulationsList={regulationsList}
            selectedEquipment={selectedEquipment}
            errors={errors}
          />
        )}
        {currentSection === 1 && (
          <DefectDetailsSection
            formData={formData}
            onFieldChange={handleFieldChange}
            priorityOptions={priorityOptions}
            officeNotifiedOptions={officeNotifiedOptions}
            reportedByOptions={reportedByOptions}
            reasonDelayOptions={reasonDelayOptions}
            getDropdownOptions={getOptions}
            errors={errors}
          />
        )}
        {currentSection === 2 && (
          <TroubleshootingSection
            formData={formData}
            onFieldChange={handleFieldChange}
            orderStatusOptions={orderStatusOptions}
            getDropdownOptions={getOptions}
            errors={errors}
          />
        )}
        {currentSection === 3 && (
          <ResolutionSection
            formData={formData}
            onFieldChange={handleFieldChange}
            completedByOptions={completedByOptions}
            jobStatusOptions={getOptions('jobStatus')}
            selectedEquipment={selectedEquipment}
            errors={errors}
          />
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-[var(--clr-border)]">
        <button
          type="button"
          onClick={goToPrevious}
          disabled={currentSection === 0}
          className={`
            px-4 py-2 text-sm font-medium rounded-xl transition
            ${currentSection === 0
              ? 'text-[var(--clr-text-muted)] cursor-not-allowed opacity-50'
              : 'text-[var(--clr-text-secondary)] hover:text-[var(--clr-text-primary)] hover:bg-[var(--clr-bg-hover)]'
            }
          `}
        >
          ← Previous
        </button>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleCancel}
            className="px-4 py-2 text-sm font-medium text-[var(--clr-text-secondary)] hover:text-[var(--clr-text-primary)] transition"
          >
            {editingEntry ? 'Cancel' : 'Clear All'}
          </button>

          {currentSection < SECTIONS.length - 1 ? (
            <button
              type="button"
              onClick={goToNext}
              className="px-6 py-2 bg-[var(--clr-text-primary)] hover:bg-[var(--clr-bg-accent-hover)] text-white text-sm font-bold rounded-xl transition shadow-sm hover:shadow-md"
            >
              Next →
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className={`
                px-8 py-2 bg-[var(--clr-text-primary)] hover:bg-[var(--clr-bg-accent-hover)] text-white text-sm font-bold rounded-xl transition shadow-sm hover:shadow-md
                ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving...
                </span>
              ) : (
                editingEntry ? 'Update Entry' : 'Create Entry'
              )}
            </button>
          )}
        </div>
      </div>

      {errors.submit && (
        <div className="p-3 bg-[var(--clr-bg-red)] border border-[var(--clr-bg-red-border)] rounded-xl text-sm text-[var(--clr-text-red)]">
          {errors.submit}
        </div>
      )}
    </form>
  );
}