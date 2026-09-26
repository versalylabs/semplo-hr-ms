import React, { useState } from 'react';
import {
  ClipboardList,
  CheckCircle2,
  Circle,
  Plus,
  LogOut,
  Laptop,
  Key,
  ShieldCheck,
  FileCheck,
  UserX,
  AlertTriangle,
  Clock,
  ArrowRight,
  Trash2,
  X,
  Check,
} from 'lucide-react';
import { useHR } from '../../context/HRContext';
import { OnboardingRecord, OffboardingRecord, OnboardingTaskItem } from '../../types/hr';

export const OnboardingOffboardingView: React.FC = () => {
  const {
    onboardingRecords,
    offboardingRecords,
    employees,
    toggleOnboardingTask,
    toggleOffboardingAsset,
    toggleOffboardingClearance,
    setSelectedEmployee,
    canPerformAction,
    addOnboardingRecord,
    deleteOnboardingRecord,
    addOnboardingTask,
    deleteOnboardingTask,
    initiateOffboarding,
    deleteOffboardingRecord,
    addOffboardingAsset,
    deleteOffboardingAsset,
  } = useHR();

  const [activeSegment, setActiveSegment] = useState<'onboarding' | 'offboarding'>('onboarding');
  const [selectedOnboardingId, setSelectedOnboardingId] = useState<string>(
    onboardingRecords[0]?.id || ''
  );
  const [selectedOffboardingId, setSelectedOffboardingId] = useState<string>(
    offboardingRecords[0]?.id || ''
  );

  // Modals state
  const [isOnbModalOpen, setIsOnbModalOpen] = useState(false);
  const [isOffbModalOpen, setIsOffbModalOpen] = useState(false);
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [isAddAssetModalOpen, setIsAddAssetModalOpen] = useState(false);

  // Forms state
  const [onbForm, setOnbForm] = useState({ employeeId: '', mentorName: '' });
  const [offbForm, setOffbForm] = useState({ employeeId: '', reason: 'Voluntary Resignation', lastWorkingDate: '2026-10-31' });
  const [taskForm, setTaskForm] = useState<{
    title: string;
    category: 'compliance' | 'it_setup' | 'hr_orientation' | 'team_intro';
    assignedRole: string;
  }>({
    title: '',
    category: 'compliance',
    assignedRole: 'Employee',
  });
  const [assetForm, setAssetForm] = useState({ item: '', serialNumber: '' });

  const currentOnboarding =
    onboardingRecords.find((r) => r.id === selectedOnboardingId) || onboardingRecords[0];
  const currentOffboarding =
    offboardingRecords.find((o) => o.id === selectedOffboardingId) || offboardingRecords[0];

  const currentOnboardingEmp = employees.find((e) => e.id === currentOnboarding?.employeeId);
  const currentOffboardingEmp = employees.find((e) => e.id === currentOffboarding?.employeeId);

  // Group tasks by category
  const categories = [
    { id: 'compliance', label: 'Legal & Compliance' },
    { id: 'it_setup', label: 'IT & Hardware Setup' },
    { id: 'hr_orientation', label: 'HR Orientation & Benefits' },
    { id: 'team_intro', label: 'Team Intro & 1-on-1s' },
  ] as const;

  const handleCreateOnboarding = (e: React.FormEvent) => {
    e.preventDefault();
    if (!onbForm.employeeId) return;
    addOnboardingRecord(onbForm.employeeId, onbForm.mentorName || 'People Operations');
    setIsOnbModalOpen(false);
    setOnbForm({ employeeId: '', mentorName: '' });
  };

  const handleCreateOffboarding = (e: React.FormEvent) => {
    e.preventDefault();
    if (!offbForm.employeeId) return;
    initiateOffboarding(offbForm.employeeId, offbForm.reason, offbForm.lastWorkingDate);
    setIsOffbModalOpen(false);
    setOffbForm({ employeeId: '', reason: 'Voluntary Resignation', lastWorkingDate: '2026-10-31' });
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskForm.title || !currentOnboarding) return;
    addOnboardingTask(currentOnboarding.id, {
      title: taskForm.title,
      category: taskForm.category,
      assignedRole: taskForm.assignedRole,
    });
    setIsAddTaskModalOpen(false);
    setTaskForm({ title: '', category: 'compliance', assignedRole: 'Employee' });
  };

  const handleAddAsset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assetForm.item || !currentOffboarding) return;
    addOffboardingAsset(currentOffboarding.id, assetForm.item, 'General Equipment');
    setIsAddAssetModalOpen(false);
    setAssetForm({ item: '', serialNumber: '' });
  };

  // Employees available for new onboarding (not already in active onboarding)
  const availableForOnboarding = employees.filter(
    (e) => !onboardingRecords.some((r) => r.employeeId === e.id)
  );

  // Employees available for offboarding (active employees not already in offboarding)
  const availableForOffboarding = employees.filter(
    (e) => e.status !== 'terminated' && !offboardingRecords.some((o) => o.employeeId === e.id)
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto flex flex-col gap-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2 border-b border-[#e5e5e5]">
        <div>
          <h1 className="text-2xl sm:text-[30px] font-bold text-emerald-700 tracking-tight leading-tight whitespace-normal sm:whitespace-nowrap">
            Lifecycle & Personnel Transitions
          </h1>
          <p className="text-[14px] text-[#737373] mt-1">
            Tracking new hire onboarding roadmaps and departure clearance governance.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {activeSegment === 'onboarding' && canPerformAction('hr_manager') && (
            <button
              onClick={() => setIsOnbModalOpen(true)}
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-[13px] font-medium shadow-sm transition-all whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span>New Pipeline</span>
            </button>
          )}

          {activeSegment === 'offboarding' && canPerformAction('hr_manager') && (
            <button
              onClick={() => setIsOffbModalOpen(true)}
              className="inline-flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-xl text-[13px] font-medium shadow-sm transition-all whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span>Initiate Exit</span>
            </button>
          )}

          {/* Segmented Control */}
          <div className="flex items-center bg-[#f5f5f5] p-1 rounded-[18px]">
            <button
              onClick={() => setActiveSegment('onboarding')}
              className={`px-3.5 py-1.5 rounded-[18px] text-[13px] font-medium transition-all whitespace-nowrap ${
                activeSegment === 'onboarding'
                  ? 'bg-[#ffffff] text-emerald-700 font-semibold shadow-xs'
                  : 'text-[#737373] hover:text-[#0a0a0a]'
              }`}
            >
              Onboarding ({onboardingRecords.length})
            </button>
            <button
              onClick={() => setActiveSegment('offboarding')}
              className={`px-3.5 py-1.5 rounded-[18px] text-[13px] font-medium transition-all whitespace-nowrap ${
                activeSegment === 'offboarding'
                  ? 'bg-[#ffffff] text-emerald-700 font-semibold shadow-xs'
                  : 'text-[#737373] hover:text-[#0a0a0a]'
              }`}
            >
              Offboarding ({offboardingRecords.length})
            </button>
          </div>
        </div>
      </div>

      {/* SECTION 1: ONBOARDING VIEW */}
      {activeSegment === 'onboarding' && (
        <>
          {onboardingRecords.length === 0 ? (
            <div className="liquid-glass-card rounded-[24px] border border-[#e5e5e5] p-12 text-center flex flex-col items-center justify-center">
              <ClipboardList className="w-12 h-12 text-[#a3a3a3] mb-3" />
              <h3 className="text-[16px] font-semibold text-[#171717]">No Active Onboarding Pipelines</h3>
              <p className="text-[13px] text-[#737373] max-w-sm mt-1">
                All team members have completed their integration roadmap, or no candidates have been enrolled yet.
              </p>
              {canPerformAction('hr_manager') && (
                <button
                  onClick={() => setIsOnbModalOpen(true)}
                  className="mt-4 inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-[13px] font-medium transition-colors whitespace-nowrap"
                >
                  <Plus className="w-4 h-4" />
                  <span>Start First Pipeline</span>
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left: Active Onboarding Candidates List */}
              <div className="liquid-glass-card rounded-[24px] border border-[#e5e5e5] p-5 flex flex-col gap-3">
                <div className="flex items-center justify-between px-1">
                  <span className="text-[11px] font-medium uppercase tracking-wider text-[#737373]">
                    Active Candidates ({onboardingRecords.length})
                  </span>
                </div>

                <div className="flex flex-col gap-2">
                  {onboardingRecords.map((record) => {
                    const emp = employees.find((e) => e.id === record.employeeId);
                    const isSelected = record.id === (currentOnboarding?.id || selectedOnboardingId);
                    const completed = record.tasks.filter((t) => t.isCompleted).length;
                    const pct = record.tasks.length > 0 ? Math.round((completed / record.tasks.length) * 100) : 0;

                    if (!emp) return null;

                    return (
                      <button
                        key={record.id}
                        onClick={() => setSelectedOnboardingId(record.id)}
                        className={`p-3.5 rounded-[18px] text-left transition-all flex flex-col gap-2 border ${
                          isSelected
                            ? 'bg-emerald-50/50 border-emerald-500 shadow-xs'
                            : 'bg-[#ffffff] border-[#e5e5e5] hover:border-emerald-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <img
                              src={emp.avatar}
                              alt={emp.firstName}
                              className="w-8 h-8 rounded-full object-cover border border-[#e5e5e5]"
                            />
                            <div>
                              <div className="text-[13px] font-semibold text-[#0a0a0a] leading-tight">
                                {emp.firstName} {emp.lastName}
                              </div>
                              <div className="text-[11px] text-[#737373]">
                                {emp.jobTitle}
                              </div>
                            </div>
                          </div>
                          <span className="text-[12px] font-mono font-medium text-emerald-800">
                            {pct}%
                          </span>
                        </div>

                        <div className="w-full bg-[#f5f5f5] h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-emerald-600 h-full rounded-full transition-all"
                            style={{ width: `${pct}%` }}
                          />
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-[#737373]">
                          <span>{completed}/{record.tasks.length} tasks complete</span>
                          <span className="capitalize">{record.status.replace('_', ' ')}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Right: Detailed Checklist Execution */}
              {currentOnboarding && currentOnboardingEmp ? (
                <div className="lg:col-span-2 liquid-glass-card rounded-[24px] border border-[#e5e5e5] p-6 flex flex-col gap-6">
                  {/* Header profile info */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#e5e5e5]">
                    <div className="flex items-center gap-3">
                      <img
                        src={currentOnboardingEmp.avatar}
                        alt={currentOnboardingEmp.firstName}
                        className="w-12 h-12 rounded-full object-cover border border-[#e5e5e5]"
                      />
                      <div>
                        <h2 className="text-[18px] font-semibold text-[#0a0a0a] tracking-tight leading-tight">
                          {currentOnboardingEmp.firstName} {currentOnboardingEmp.lastName}
                        </h2>
                        <div className="text-[12px] text-[#737373] mt-0.5 flex items-center gap-2">
                          <span className="font-mono">{currentOnboardingEmp.employeeCode}</span>
                          <span aria-hidden="true">·</span>
                          <span>{currentOnboardingEmp.department}</span>
                          <span aria-hidden="true">·</span>
                          <span>Mentor: {currentOnboarding.mentorName}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedEmployee(currentOnboardingEmp)}
                        className="px-3 py-1.5 rounded-[18px] bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-[12px] font-medium transition-colors whitespace-nowrap"
                      >
                        View Full Profile
                      </button>
                      {canPerformAction('super_admin') && (
                        <button
                          onClick={() => deleteOnboardingRecord(currentOnboarding.id)}
                          title="Delete Onboarding Pipeline"
                          className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Progress Summary */}
                  <div className="bg-[#fafafa] rounded-[18px] p-4 border border-[#e5e5e5] flex items-center justify-between">
                    <div>
                      <div className="text-[12px] font-medium text-[#0a0a0a]">
                        Overall Onboarding Progress
                      </div>
                      <div className="text-[11px] text-[#737373] mt-0.5">
                        Target completion: {currentOnboarding.targetDate}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[20px] font-bold font-mono text-emerald-700">
                        {currentOnboarding.tasks.length > 0
                          ? Math.round(
                              (currentOnboarding.tasks.filter((t) => t.isCompleted).length /
                                currentOnboarding.tasks.length) *
                                100
                            )
                          : 0}
                        %
                      </span>
                    </div>
                  </div>

                  {/* Tasks Section with Add Task Button */}
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-[13px] font-semibold text-[#0a0a0a]">Roadmap Milestones</span>
                    {canPerformAction('department_lead') && (
                      <button
                        onClick={() => setIsAddTaskModalOpen(true)}
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 hover:text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 transition-colors whitespace-nowrap"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Task</span>
                      </button>
                    )}
                  </div>

                  {/* Categorized Tasks */}
                  <div className="space-y-6">
                    {categories.map((cat) => {
                      const catTasks = currentOnboarding.tasks.filter((t) => t.category === cat.id);
                      if (catTasks.length === 0) return null;

                      return (
                        <div key={cat.id} className="flex flex-col gap-2">
                          <div className="text-[12px] font-semibold text-[#0a0a0a] uppercase tracking-wider flex items-center justify-between">
                            <span>{cat.label}</span>
                            <span className="text-[11px] font-normal text-[#737373]">
                              {catTasks.filter((t) => t.isCompleted).length}/{catTasks.length} done
                            </span>
                          </div>

                          <div className="divide-y divide-[#f5f5f5] bg-[#fafafa] rounded-[18px] border border-[#e5e5e5] px-4 py-1">
                            {catTasks.map((task) => (
                              <div
                                key={task.id}
                                className="py-3 flex items-start justify-between group hover:bg-[#f0f0f0]/50 -mx-2 px-2 rounded-[10px] transition-colors"
                              >
                                <div
                                  onClick={() => toggleOnboardingTask(currentOnboarding.id, task.id)}
                                  className="flex items-start gap-3 cursor-pointer flex-1"
                                >
                                  <button
                                    type="button"
                                    className={`mt-0.5 w-4 h-4 rounded-[4px] border flex items-center justify-center transition-colors ${
                                      task.isCompleted
                                        ? 'bg-emerald-600 border-emerald-600 text-[#ffffff]'
                                        : 'border-[#737373] group-hover:border-emerald-600'
                                    }`}
                                  >
                                    {task.isCompleted && <CheckCircle2 className="w-3.5 h-3.5" />}
                                  </button>
                                  <div>
                                    <div
                                      className={`text-[13px] ${
                                        task.isCompleted
                                          ? 'line-through text-[#737373]'
                                          : 'text-[#0a0a0a] font-medium'
                                      }`}
                                    >
                                      {task.title}
                                    </div>
                                    <div className="text-[11px] text-[#737373] mt-0.5">
                                      Role: {task.assignedRole}
                                      {task.completedAt && ` · Completed ${task.completedAt}`}
                                    </div>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2 ml-2">
                                  <span
                                    className={`text-[10px] font-mono px-2 py-0.5 rounded-[18px] whitespace-nowrap ${
                                      task.isCompleted
                                        ? 'bg-emerald-100 text-emerald-800'
                                        : 'bg-[#ffffff] text-[#737373] border border-[#e5e5e5]'
                                    }`}
                                  >
                                    {task.isCompleted ? 'Resolved' : 'Pending'}
                                  </span>
                                  {canPerformAction('super_admin') && (
                                    <button
                                      onClick={() => deleteOnboardingTask(currentOnboarding.id, task.id)}
                                      className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-600 transition-all"
                                      title="Delete task"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="lg:col-span-2 p-12 text-center text-[#737373] liquid-glass-card rounded-[24px] border border-[#e5e5e5]">
                  Select an onboarding candidate on the left to view and toggle tasks.
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* SECTION 2: OFFBOARDING VIEW */}
      {activeSegment === 'offboarding' && (
        <>
          {offboardingRecords.length === 0 ? (
            <div className="liquid-glass-card rounded-[24px] border border-[#e5e5e5] p-12 text-center flex flex-col items-center justify-center">
              <LogOut className="w-12 h-12 text-[#a3a3a3] mb-3" />
              <h3 className="text-[16px] font-semibold text-[#171717]">No Departures in Progress</h3>
              <p className="text-[13px] text-[#737373] max-w-sm mt-1">
                There are no active employee departures, clearance sign-offs, or equipment handovers pending.
              </p>
              {canPerformAction('hr_manager') && (
                <button
                  onClick={() => setIsOffbModalOpen(true)}
                  className="mt-4 inline-flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-xl text-[13px] font-medium transition-colors whitespace-nowrap"
                >
                  <Plus className="w-4 h-4" />
                  <span>Initiate Exit Clearance</span>
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left: Exiting Personnel List */}
              <div className="liquid-glass-card rounded-[24px] border border-[#e5e5e5] p-5 flex flex-col gap-3">
                <span className="text-[11px] font-medium uppercase tracking-wider text-[#737373] px-1">
                  Departures & Exit Audits ({offboardingRecords.length})
                </span>

                <div className="flex flex-col gap-2">
                  {offboardingRecords.map((off) => {
                    const emp = employees.find((e) => e.id === off.employeeId);
                    const isSelected = off.id === (currentOffboarding?.id || selectedOffboardingId);
                    if (!emp) return null;

                    const assetsReturnedCount = off.assets.filter((a) => a.returned).length;

                    return (
                      <button
                        key={off.id}
                        onClick={() => setSelectedOffboardingId(off.id)}
                        className={`p-3.5 rounded-[18px] text-left transition-all flex flex-col gap-2 border ${
                          isSelected
                            ? 'bg-rose-50/50 border-rose-400 shadow-xs'
                            : 'bg-[#ffffff] border-[#e5e5e5] hover:border-rose-200'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <img
                              src={emp.avatar}
                              alt={emp.firstName}
                              className="w-8 h-8 rounded-full object-cover border border-[#e5e5e5]"
                            />
                            <div>
                              <div className="text-[13px] font-semibold text-[#0a0a0a] leading-tight">
                                {emp.firstName} {emp.lastName}
                              </div>
                              <div className="text-[11px] text-[#737373]">
                                {emp.jobTitle}
                              </div>
                            </div>
                          </div>
                          <span className="text-[11px] font-mono uppercase px-2 py-0.5 rounded-[18px] bg-rose-100 text-rose-700 whitespace-nowrap">
                            {off.status.replace('_', ' ')}
                          </span>
                        </div>

                        <div className="text-[11px] text-[#737373] flex items-center justify-between border-t border-[#f5f5f5] pt-2">
                          <span className="whitespace-nowrap">Last Day: {off.lastWorkingDate}</span>
                          <span className="whitespace-nowrap">
                            {assetsReturnedCount}/{off.assets.length} assets
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Right: Exit Checklist & Asset Recovery */}
              {currentOffboarding && currentOffboardingEmp ? (
                <div className="lg:col-span-2 liquid-glass-card rounded-[24px] border border-[#e5e5e5] p-6 flex flex-col gap-6">
                  {/* Header profile info */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#e5e5e5]">
                    <div className="flex items-center gap-3">
                      <img
                        src={currentOffboardingEmp.avatar}
                        alt={currentOffboardingEmp.firstName}
                        className="w-12 h-12 rounded-full object-cover border border-[#e5e5e5]"
                      />
                      <div>
                        <h2 className="text-[18px] font-semibold text-[#0a0a0a] tracking-tight leading-tight">
                          {currentOffboardingEmp.firstName} {currentOffboardingEmp.lastName}
                        </h2>
                        <div className="text-[12px] text-[#737373] mt-0.5 flex items-center gap-2">
                          <span className="font-mono">{currentOffboardingEmp.employeeCode}</span>
                          <span aria-hidden="true">·</span>
                          <span>Last Working Date: {currentOffboarding.lastWorkingDate}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[12px] text-[#737373] bg-[#f5f5f5] px-3 py-1 rounded-[18px] whitespace-nowrap">
                        Reason: {currentOffboarding.reason}
                      </span>
                      {canPerformAction('super_admin') && (
                        <button
                          onClick={() => deleteOffboardingRecord(currentOffboarding.id)}
                          title="Delete Offboarding Record"
                          className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Hardware & Assets Return Protocol */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[12px] font-semibold uppercase tracking-wider text-[#0a0a0a]">
                        Hardware & Credential Asset Clearance
                      </span>
                      {canPerformAction('department_lead') && (
                        <button
                          onClick={() => setIsAddAssetModalOpen(true)}
                          className="inline-flex items-center gap-1 text-xs text-rose-700 hover:text-rose-800 bg-rose-50 px-2 py-0.5 rounded border border-rose-200 transition-colors whitespace-nowrap"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Add Asset</span>
                        </button>
                      )}
                    </div>
                    <div className="divide-y divide-[#f5f5f5] bg-[#fafafa] rounded-[18px] border border-[#e5e5e5] p-4">
                      {currentOffboarding.assets.map((asset) => (
                        <div
                          key={asset.id}
                          className="py-2.5 flex items-center justify-between hover:bg-[#f0f0f0]/40 -mx-2 px-2 rounded-[10px] transition-colors group"
                        >
                          <div
                            onClick={() => toggleOffboardingAsset(currentOffboarding.id, asset.id)}
                            className="flex items-center gap-2.5 cursor-pointer flex-1"
                          >
                            <button
                              type="button"
                              className={`w-4 h-4 rounded-[4px] border flex items-center justify-center ${
                                asset.returned
                                  ? 'bg-emerald-600 border-emerald-600 text-[#ffffff]'
                                  : 'border-[#737373]'
                              }`}
                            >
                              {asset.returned && <CheckCircle2 className="w-3.5 h-3.5" />}
                            </button>
                            <span className="text-[13px] font-medium text-[#0a0a0a]">{asset.item}</span>
                            {asset.serialNumber && (
                              <span className="text-[11px] font-mono text-[#737373]">
                                ({asset.serialNumber})
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            <span
                              className={`text-[11px] font-mono px-2 py-0.5 rounded-[18px] whitespace-nowrap ${
                                asset.returned
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-rose-100 text-rose-700'
                              }`}
                            >
                              {asset.returned ? 'Recovered' : 'Unreturned'}
                            </span>
                            {canPerformAction('super_admin') && (
                              <button
                                onClick={() => deleteOffboardingAsset(currentOffboarding.id, asset.id)}
                                className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-600 transition-all"
                                title="Delete asset"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Departmental Clearances */}
                  <div className="space-y-3">
                    <span className="text-[12px] font-semibold uppercase tracking-wider text-[#0a0a0a] block">
                      Multi-Department Sign-off Ledger
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {currentOffboarding.clearances.map((c) => (
                        <div
                          key={c.department}
                          onClick={() => toggleOffboardingClearance(currentOffboarding.id, c.department)}
                          className={`p-4 rounded-[18px] border cursor-pointer transition-all flex flex-col justify-between ${
                            c.approved
                              ? 'bg-emerald-50/40 border-emerald-300'
                              : 'bg-[#ffffff] border-[#e5e5e5] hover:border-slate-400'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="text-[13px] font-semibold text-[#0a0a0a] leading-tight">
                              {c.department}
                            </div>
                            <span
                              className={`text-[11px] px-2 py-0.5 rounded-[18px] whitespace-nowrap ${
                                c.approved ? 'bg-emerald-600 text-[#ffffff]' : 'bg-[#f5f5f5] text-[#737373]'
                              }`}
                            >
                              {c.approved ? 'Signed Off' : 'Pending'}
                            </span>
                          </div>
                          <div className="text-[11px] text-[#737373] mt-3">
                            Approver: {c.approverName} {c.updatedAt ? `· ${c.updatedAt}` : ''}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Exit Interview Notes */}
                  <div className="bg-[#fafafa] rounded-[18px] border border-[#e5e5e5] p-4 text-[13px]">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-[#737373] block mb-1">
                      Exit Interview Summary
                    </span>
                    <p className="text-[#171717] italic">
                      "{currentOffboarding.exitInterviewNotes}"
                    </p>
                  </div>
                </div>
              ) : (
                <div className="lg:col-span-2 p-12 text-center text-[#737373] liquid-glass-card rounded-[24px] border border-[#e5e5e5]">
                  No exit records found. Select an employee to view clearance status.
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Modal: New Onboarding Pipeline */}
      {isOnbModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-lg font-bold text-emerald-700">Initialize Onboarding Roadmap</h3>
              <button
                onClick={() => setIsOnbModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateOnboarding} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Select Employee *
                </label>
                <select
                  required
                  value={onbForm.employeeId}
                  onChange={(e) => setOnbForm({ ...onbForm, employeeId: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                >
                  <option value="">Choose employee...</option>
                  {availableForOnboarding.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.firstName} {emp.lastName} ({emp.employeeCode}) - {emp.department}
                    </option>
                  ))}
                </select>
                {availableForOnboarding.length === 0 && (
                  <p className="text-xs text-amber-600 mt-1">
                    All registered employees already have onboarding roadmaps. Add a new employee first.
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Assigned Mentor / Buddy
                </label>
                <input
                  type="text"
                  value={onbForm.mentorName}
                  onChange={(e) => setOnbForm({ ...onbForm, mentorName: e.target.value })}
                  placeholder="e.g. Sarah Jenkins (Tech Lead)"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsOnbModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors whitespace-nowrap"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!onbForm.employeeId}
                  className="px-4 py-2 text-xs font-medium bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl shadow-sm transition-colors whitespace-nowrap"
                >
                  Launch Pipeline
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Initiate Offboarding */}
      {isOffbModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-lg font-bold text-rose-600">Initiate Exit Clearance</h3>
              <button
                onClick={() => setIsOffbModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateOffboarding} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Departing Employee *
                </label>
                <select
                  required
                  value={offbForm.employeeId}
                  onChange={(e) => setOffbForm({ ...offbForm, employeeId: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-600"
                >
                  <option value="">Select employee...</option>
                  {availableForOffboarding.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.firstName} {emp.lastName} ({emp.employeeCode}) - {emp.department}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Reason for Departure *
                </label>
                <select
                  value={offbForm.reason}
                  onChange={(e) => setOffbForm({ ...offbForm, reason: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-600"
                >
                  <option value="Voluntary Resignation">Voluntary Resignation</option>
                  <option value="Career Growth / Better Offer">Career Growth / Better Offer</option>
                  <option value="End of Fixed-Term Contract">End of Fixed-Term Contract</option>
                  <option value="Relocation">Relocation</option>
                  <option value="Mutual Separation">Mutual Separation</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Last Working Date *
                </label>
                <input
                  type="date"
                  required
                  value={offbForm.lastWorkingDate}
                  onChange={(e) => setOffbForm({ ...offbForm, lastWorkingDate: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-600"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsOffbModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors whitespace-nowrap"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!offbForm.employeeId}
                  className="px-4 py-2 text-xs font-medium bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white rounded-xl shadow-sm transition-colors whitespace-nowrap"
                >
                  Initiate Clearance
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Onboarding Task */}
      {isAddTaskModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-lg font-bold text-emerald-700">Add Roadmap Milestone</h3>
              <button
                onClick={() => setIsAddTaskModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddTask} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Task Title *
                </label>
                <input
                  type="text"
                  required
                  value={taskForm.title}
                  onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                  placeholder="e.g. Complete AWS Cloud credentials & IAM access"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Category *
                </label>
                <select
                  value={taskForm.category}
                  onChange={(e) =>
                    setTaskForm({
                      ...taskForm,
                      category: e.target.value as 'compliance' | 'it_setup' | 'hr_orientation' | 'team_intro',
                    })
                  }
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                >
                  <option value="compliance">Legal & Compliance</option>
                  <option value="it_setup">IT & Hardware Setup</option>
                  <option value="hr_orientation">HR Orientation & Benefits</option>
                  <option value="team_intro">Team Intro & 1-on-1s</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Responsible Role
                </label>
                <input
                  type="text"
                  value={taskForm.assignedRole}
                  onChange={(e) => setTaskForm({ ...taskForm, assignedRole: e.target.value })}
                  placeholder="e.g. Employee, IT Support, Manager, HR"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddTaskModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors whitespace-nowrap"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-medium bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-sm transition-colors whitespace-nowrap"
                >
                  Add Milestone
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Offboarding Asset */}
      {isAddAssetModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-lg font-bold text-rose-600">Add Returnable Company Asset</h3>
              <button
                onClick={() => setIsAddAssetModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddAsset} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Item Description *
                </label>
                <input
                  type="text"
                  required
                  value={assetForm.item}
                  onChange={(e) => setAssetForm({ ...assetForm, item: e.target.value })}
                  placeholder="e.g. Dell UltraSharp 27 Monitor"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Serial Number (Optional)
                </label>
                <input
                  type="text"
                  value={assetForm.serialNumber}
                  onChange={(e) => setAssetForm({ ...assetForm, serialNumber: e.target.value })}
                  placeholder="e.g. SN-8839210-KY"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-600"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddAssetModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors whitespace-nowrap"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-medium bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-sm transition-colors whitespace-nowrap"
                >
                  Add Asset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
