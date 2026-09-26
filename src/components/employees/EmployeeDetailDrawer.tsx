/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  X,
  Building,
  Mail,
  Phone,
  MapPin,
  Calendar,
  DollarSign,
  Shield,
  FileCheck,
  UserCheck,
  AlertCircle,
  Edit2,
  Check,
  LogOut,
  Clock,
  ArrowRight,
  CreditCard,
  Building2,
  FileText,
  Award,
  Camera,
  Trash2,
  Upload,
} from 'lucide-react';
import { useHR } from '../../context/HRContext';
import { Employee, EmployeeStatus } from '../../types/hr';

export const EmployeeDetailDrawer: React.FC = () => {
  const {
    selectedEmployee,
    setSelectedEmployee,
    employees,
    updateEmployee,
    deleteEmployee,
    updateEmployeeStatus,
    initiateOffboarding,
    canPerformAction,
    setCurrentTab,
    getEmployeeLeaveBalances,
    payrollCycles,
    selectedPayrollCycleId,
    setSelectedPayslip,
    setIsPayslipModalOpen,
  } = useHR();

  const [activeSubTab, setActiveSubTab] = useState<'profile' | 'job' | 'statutory' | 'leaves' | 'team'>('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [exitReason, setExitReason] = useState('Career Transition / Relocation');
  const [exitDate, setExitDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().split('T')[0];
  });

  // Edit form state
  const [editForm, setEditForm] = useState({
    avatar: '',
    jobTitle: '',
    department: '',
    phone: '',
    location: '',
    compensationTier: '',
    baseSalary: 0,
    emergencyName: '',
    emergencyRelation: '',
    emergencyPhone: '',
    kraPin: '',
    nssfNumber: '',
    shifNumber: '',
    notes: '',
  });

  if (!selectedEmployee) return null;

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        if (isEditing) {
          setEditForm((prev) => ({ ...prev, avatar: result }));
        } else {
          updateEmployee(selectedEmployee.id, { avatar: result });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleStartEdit = () => {
    setEditForm({
      avatar: selectedEmployee.avatar,
      jobTitle: selectedEmployee.jobTitle,
      department: selectedEmployee.department,
      phone: selectedEmployee.phone,
      location: selectedEmployee.location,
      compensationTier: selectedEmployee.compensationTier,
      baseSalary: selectedEmployee.baseSalary,
      emergencyName: selectedEmployee.emergencyContact.name,
      emergencyRelation: selectedEmployee.emergencyContact.relation,
      emergencyPhone: selectedEmployee.emergencyContact.phone,
      kraPin: selectedEmployee.kraPin || '',
      nssfNumber: selectedEmployee.nssfNumber || '',
      shifNumber: selectedEmployee.shifNumber || '',
      notes: selectedEmployee.notes || '',
    });
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    updateEmployee(selectedEmployee.id, {
      avatar: editForm.avatar || selectedEmployee.avatar,
      jobTitle: editForm.jobTitle,
      department: editForm.department,
      phone: editForm.phone,
      location: editForm.location,
      compensationTier: editForm.compensationTier,
      baseSalary: Number(editForm.baseSalary),
      kraPin: editForm.kraPin,
      nssfNumber: editForm.nssfNumber,
      shifNumber: editForm.shifNumber,
      emergencyContact: {
        name: editForm.emergencyName,
        relation: editForm.emergencyRelation,
        phone: editForm.emergencyPhone,
      },
      notes: editForm.notes,
    });
    setIsEditing(false);
  };

  const handleDeleteEmployee = () => {
    deleteEmployee(selectedEmployee.id);
    setShowDeleteConfirm(false);
    setSelectedEmployee(null);
  };

  const handleConfirmExit = () => {
    initiateOffboarding(selectedEmployee.id, exitReason, exitDate);
    updateEmployeeStatus(selectedEmployee.id, 'terminated');
    setShowExitModal(false);
    setSelectedEmployee(null);
    setCurrentTab('onboarding');
  };

  const directReports = employees.filter((e) => e.managerId === selectedEmployee.id);
  const employeeBalances = getEmployeeLeaveBalances(selectedEmployee.id);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/30 backdrop-blur-xs flex justify-end animate-in fade-in">
      <div className="w-full max-w-2xl bg-[#ffffff] h-full shadow-2xl flex flex-col justify-between border-l border-[#e5e5e5] animate-in slide-in-from-right duration-200">
        {/* Top Header */}
        <div className="p-6 border-b border-slate-200/90 bg-slate-50/70 flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="relative group">
              <img
                src={editForm.avatar || selectedEmployee.avatar}
                alt={selectedEmployee.firstName}
                className="w-16 h-16 rounded-full object-cover border-2 border-emerald-500/40 shadow-sm"
              />
              <label
                className="absolute bottom-0 right-0 p-1.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-md cursor-pointer transition-all hover:scale-110"
                title="Upload / Change Photo"
              >
                <Camera className="w-3.5 h-3.5" />
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePhotoUpload}
                />
              </label>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-[20px] font-bold text-emerald-700 tracking-tight whitespace-nowrap">
                  {selectedEmployee.firstName} {selectedEmployee.lastName}
                </h2>
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold capitalize whitespace-nowrap ${
                    selectedEmployee.status === 'active'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : selectedEmployee.status === 'probation'
                      ? 'bg-amber-50 text-amber-800 border border-amber-200'
                      : selectedEmployee.status === 'on_leave'
                      ? 'bg-sky-50 text-sky-800 border border-sky-200'
                      : 'bg-rose-50 text-rose-700 border border-rose-200'
                  }`}
                >
                  {selectedEmployee.status.replace('_', ' ')}
                </span>
              </div>
              <div className="text-[13px] text-slate-500 mt-1 flex items-center gap-2 whitespace-nowrap">
                <span className="font-mono text-emerald-800 font-semibold">{selectedEmployee.employeeCode}</span>
                <span aria-hidden="true">·</span>
                <span>{selectedEmployee.jobTitle}</span>
                <span aria-hidden="true">·</span>
                <span>{selectedEmployee.department}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {canPerformAction('department_lead') && !isEditing && (
              <button
                onClick={handleStartEdit}
                className="p-2 rounded-2xl bg-white border border-slate-200 hover:border-emerald-300 text-slate-700 hover:text-emerald-700 transition-colors shadow-2xs cursor-pointer"
                title="Edit Employee Information"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            )}
            {canPerformAction('super_admin') && (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="p-2 rounded-2xl bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 transition-colors shadow-2xs cursor-pointer"
                title="Permanently Remove Employee from System"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={() => setSelectedEmployee(null)}
              className="p-2 rounded-2xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors shadow-2xs cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="px-4 sm:px-6 border-b border-[#e5e5e5] bg-[#ffffff] flex items-center gap-4 sm:gap-6 text-[13px] overflow-x-auto no-scrollbar whitespace-nowrap">
          {(['profile', 'job', 'statutory', 'leaves', 'team'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveSubTab(tab)}
              className={`py-3 font-medium transition-all capitalize relative whitespace-nowrap shrink-0 ${
                activeSubTab === tab ? 'text-emerald-700 font-bold' : 'text-[#737373] hover:text-[#0a0a0a]'
              }`}
            >
              {tab === 'profile'
                ? 'Profile'
                : tab === 'job'
                ? 'Job & Remuneration'
                : tab === 'statutory'
                ? 'KRA & Statutory'
                : tab === 'leaves'
                ? 'Leave Balances'
                : `Reports (${directReports.length})`}
              {activeSubTab === tab && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0a0a0a]" />
              )}
            </button>
          ))}
        </div>

        {/* Body Content */}
        <div className="p-6 flex-1 overflow-y-auto">
          {/* TAB 1: PROFILE */}
          {activeSubTab === 'profile' && (
            <div className="flex flex-col gap-6">
              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <label className="text-[12px] font-medium text-[#737373] block mb-1">Phone</label>
                    <input
                      type="text"
                      value={editForm.phone}
                      onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                      className="w-full px-3 py-2 bg-[#f5f5f5] rounded-[18px] text-[13px] border-none"
                    />
                  </div>
                  <div>
                    <label className="text-[12px] font-medium text-[#737373] block mb-1">Work Location</label>
                    <input
                      type="text"
                      value={editForm.location}
                      onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                      className="w-full px-3 py-2 bg-[#f5f5f5] rounded-[18px] text-[13px] border-none"
                    />
                  </div>
                  <div className="pt-2 border-t border-[#e5e5e5]">
                    <span className="text-[12px] font-semibold text-[#0a0a0a] block mb-2">Emergency Contact</span>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] text-[#737373] block mb-1">Contact Name</label>
                        <input
                          type="text"
                          value={editForm.emergencyName}
                          onChange={(e) => setEditForm({ ...editForm, emergencyName: e.target.value })}
                          className="w-full px-3 py-2 bg-[#f5f5f5] rounded-[18px] text-[13px] border-none"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-[#737373] block mb-1">Relation</label>
                        <input
                          type="text"
                          value={editForm.emergencyRelation}
                          onChange={(e) => setEditForm({ ...editForm, emergencyRelation: e.target.value })}
                          className="w-full px-3 py-2 bg-[#f5f5f5] rounded-[18px] text-[13px] border-none"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="text-[11px] text-[#737373] block mb-1">Phone</label>
                        <input
                          type="text"
                          value={editForm.emergencyPhone}
                          onChange={(e) => setEditForm({ ...editForm, emergencyPhone: e.target.value })}
                          className="w-full px-3 py-2 bg-[#f5f5f5] rounded-[18px] text-[13px] border-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-6">
                  <div className="bg-[#fafafa] rounded-[24px] border border-[#e5e5e5] p-5 flex flex-col gap-3">
                    <span className="text-[11px] font-medium uppercase tracking-wider text-[#737373]">
                      Primary Details
                    </span>
                    <div className="grid grid-cols-2 gap-4 text-[13px]">
                      <div>
                        <div className="text-[11px] text-[#737373]">Email</div>
                        <div className="font-medium text-[#0a0a0a] mt-0.5">{selectedEmployee.email}</div>
                      </div>
                      <div>
                        <div className="text-[11px] text-[#737373]">Phone</div>
                        <div className="font-medium text-[#0a0a0a] mt-0.5">{selectedEmployee.phone}</div>
                      </div>
                      <div>
                        <div className="text-[11px] text-[#737373]">Work Location</div>
                        <div className="font-medium text-[#0a0a0a] mt-0.5">{selectedEmployee.location}</div>
                      </div>
                      <div>
                        <div className="text-[11px] text-[#737373]">Date of Hire</div>
                        <div className="font-mono text-[#0a0a0a] mt-0.5">{selectedEmployee.joiningDate}</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#ffffff] rounded-[24px] border border-[#e5e5e5] p-5 card-shadow flex flex-col gap-3">
                    <span className="text-[11px] font-medium uppercase tracking-wider text-[#737373]">
                      Emergency Contact
                    </span>
                    <div className="grid grid-cols-3 gap-3 text-[13px]">
                      <div>
                        <div className="text-[11px] text-[#737373]">Name</div>
                        <div className="font-medium text-[#0a0a0a] mt-0.5">{selectedEmployee.emergencyContact.name}</div>
                      </div>
                      <div>
                        <div className="text-[11px] text-[#737373]">Relation</div>
                        <div className="font-medium text-[#0a0a0a] mt-0.5">{selectedEmployee.emergencyContact.relation}</div>
                      </div>
                      <div>
                        <div className="text-[11px] text-[#737373]">Phone</div>
                        <div className="font-medium text-[#0a0a0a] mt-0.5">{selectedEmployee.emergencyContact.phone}</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#ffffff] rounded-[24px] border border-[#e5e5e5] p-5 card-shadow flex flex-col gap-3">
                    <span className="text-[11px] font-medium uppercase tracking-wider text-[#737373]">
                      Disbursement & M-Pesa
                    </span>
                    <div className="grid grid-cols-3 gap-3 text-[13px]">
                      <div>
                        <div className="text-[11px] text-[#737373]">Bank</div>
                        <div className="font-medium text-[#0a0a0a] mt-0.5">{selectedEmployee.bankInfo.bankName}</div>
                      </div>
                      <div>
                        <div className="text-[11px] text-[#737373]">Account (Last 4)</div>
                        <div className="font-mono text-[#0a0a0a] mt-0.5">•••• {selectedEmployee.bankInfo.accountLast4}</div>
                      </div>
                      <div>
                        <div className="text-[11px] text-[#737373]">M-Pesa Mobile</div>
                        <div className="font-mono text-[#0a0a0a] mt-0.5">{selectedEmployee.bankInfo.mpesaNumber || '—'}</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: JOB & REMUNERATION */}
          {activeSubTab === 'job' && (
            <div className="flex flex-col gap-6">
              <div className="bg-[#fafafa] rounded-[24px] border border-[#e5e5e5] p-5 flex flex-col gap-4">
                <span className="text-[11px] font-medium uppercase tracking-wider text-[#737373]">
                  Organizational Placement
                </span>
                <div className="grid grid-cols-2 gap-4 text-[13px]">
                  <div>
                    <div className="text-[11px] text-[#737373]">Department</div>
                    <div className="font-semibold text-[#0a0a0a] mt-0.5">{selectedEmployee.department}</div>
                  </div>
                  <div>
                    <div className="text-[11px] text-[#737373]">Designation</div>
                    <div className="font-medium text-[#0a0a0a] mt-0.5">{selectedEmployee.jobTitle}</div>
                  </div>
                  <div>
                    <div className="text-[11px] text-[#737373]">Manager / Supervisor</div>
                    <div className="font-medium text-[#0a0a0a] mt-0.5">{selectedEmployee.managerName || 'Managing Director'}</div>
                  </div>
                  <div>
                    <div className="text-[11px] text-[#737373]">Employment Type</div>
                    <div className="font-medium text-[#0a0a0a] mt-0.5 capitalize">{selectedEmployee.employmentType.replace('_', ' ')}</div>
                  </div>
                </div>
              </div>

              <div className="bg-[#ffffff] rounded-[24px] border border-[#e5e5e5] p-5 card-shadow flex flex-col gap-4">
                <span className="text-[11px] font-medium uppercase tracking-wider text-[#737373]">
                  Kenyan Compensation Benchmark (Monthly Gross)
                </span>
                <div className="grid grid-cols-2 gap-4 text-[13px]">
                  <div>
                    <div className="text-[11px] text-[#737373]">Band / Tier</div>
                    <div className="font-semibold text-[#0a0a0a] mt-0.5">{selectedEmployee.compensationTier}</div>
                  </div>
                  <div>
                    <div className="text-[11px] text-[#737373]">Monthly Gross Base</div>
                    <div className="text-[20px] font-semibold text-[#0a0a0a] tracking-tight font-mono mt-0.5">
                      KES {selectedEmployee.baseSalary.toLocaleString()}
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#e5e5e5] flex flex-wrap justify-between items-center gap-2">
                  <span className="text-xs text-[#737373]">Actions & Records:</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        const cycle = payrollCycles.find((c) => c.id === selectedPayrollCycleId) || payrollCycles[0];
                        const slip = cycle?.payslips.find((p) => p.employeeId === selectedEmployee.id);
                        if (slip) {
                          setSelectedPayslip(slip);
                          setIsPayslipModalOpen(true);
                        }
                      }}
                      className="px-3 py-1.5 rounded-[18px] bg-[#0a0a0a] hover:bg-[#262626] text-[#ffffff] text-xs font-medium transition-colors flex items-center gap-1.5 shadow-xs"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>View Payslip</span>
                    </button>
                    <button
                      onClick={() => {
                        setCurrentTab('appraisals');
                        setSelectedEmployee(null);
                      }}
                      className="px-3 py-1.5 rounded-[18px] bg-[#f5f5f5] hover:bg-[#e5e5e5] text-[#0a0a0a] text-xs font-medium transition-colors flex items-center gap-1.5"
                    >
                      <Award className="w-3.5 h-3.5 text-amber-500" />
                      <span>Appraisals & OKRs</span>
                    </button>
                  </div>
                </div>
              </div>

              {canPerformAction('hr_manager') && (
                <div className="bg-[#fafafa] rounded-[24px] border border-[#e5e5e5] p-5 flex flex-col gap-3">
                  <span className="text-[11px] font-medium uppercase tracking-wider text-[#737373]">
                    Lifecycle State Control
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {(['active', 'probation', 'on_leave'] as EmployeeStatus[]).map((status) => (
                      <button
                        key={status}
                        onClick={() => updateEmployeeStatus(selectedEmployee.id, status)}
                        disabled={selectedEmployee.status === status}
                        className={`px-3 py-1.5 rounded-[18px] text-[12px] font-medium transition-colors capitalize ${
                          selectedEmployee.status === status
                            ? 'bg-[#0a0a0a] text-[#ffffff]'
                            : 'bg-[#ffffff] border border-[#e5e5e5] text-[#0a0a0a] hover:bg-[#f5f5f5]'
                        }`}
                      >
                        Mark {status.replace('_', ' ')}
                      </button>
                    ))}
                    <button
                      onClick={() => setShowExitModal(true)}
                      className="px-3 py-1.5 rounded-[18px] bg-[#ffffff] border border-[#e7000b]/30 text-[#e7000b] hover:bg-[#e7000b]/10 text-[12px] font-medium transition-colors"
                    >
                      Initiate Exit Clearance
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: KRA & STATUTORY NUMBERS */}
          {activeSubTab === 'statutory' && (
            <div className="flex flex-col gap-6">
              <div className="bg-[#ffffff] rounded-[24px] border border-[#e5e5e5] p-5 card-shadow flex flex-col gap-4">
                <span className="text-[11px] font-medium uppercase tracking-wider text-[#737373]">
                  Kenyan Regulatory Identifiers
                </span>
                <div className="grid grid-cols-2 gap-4 text-[13px]">
                  <div>
                    <div className="text-[11px] text-[#737373]">National ID / Passport</div>
                    <div className="font-mono text-[#0a0a0a] font-semibold mt-0.5">{selectedEmployee.nationalId || '—'}</div>
                  </div>
                  <div>
                    <div className="text-[11px] text-[#737373]">KRA Tax PIN</div>
                    <div className="font-mono text-[#0a0a0a] font-semibold mt-0.5">{selectedEmployee.kraPin || '—'}</div>
                  </div>
                  <div>
                    <div className="text-[11px] text-[#737373]">NSSF Number (Pensions)</div>
                    <div className="font-mono text-[#0a0a0a] font-semibold mt-0.5">{selectedEmployee.nssfNumber || '—'}</div>
                  </div>
                  <div>
                    <div className="text-[11px] text-[#737373]">SHIF Number (Health Fund)</div>
                    <div className="font-mono text-[#0a0a0a] font-semibold mt-0.5">{selectedEmployee.shifNumber || '—'}</div>
                  </div>
                </div>
              </div>

              {/* Compliance Documents */}
              <div className="space-y-3">
                <span className="text-[12px] font-semibold text-[#0a0a0a] uppercase tracking-wider">
                  Verified Records & Certifications
                </span>
                <div className="divide-y divide-[#f5f5f5]">
                  {selectedEmployee.documents.map((doc) => (
                    <div key={doc.id} className="py-2.5 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <FileCheck className="w-4 h-4 text-[#0a0a0a]" />
                        <div>
                          <div className="text-[13px] font-medium text-[#0a0a0a]">{doc.name}</div>
                          <div className="text-[11px] text-[#737373]">{doc.uploadedAt || 'Uploaded on hire'}</div>
                        </div>
                      </div>
                      <span className="text-[11px] font-medium px-2 py-0.5 rounded-[18px] bg-[#171717] text-[#ffffff] uppercase">
                        {doc.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: LEAVE BALANCES */}
          {activeSubTab === 'leaves' && (
            <div className="flex flex-col gap-4">
              <span className="text-[12px] font-semibold text-[#0a0a0a] uppercase tracking-wider">
                Statutory Leave Ledger
              </span>

              <div className="grid grid-cols-2 gap-3">
                {employeeBalances.map((b) => (
                  <div key={b.leaveType} className="p-3.5 rounded-[18px] bg-[#fafafa] border border-[#e5e5e5]">
                    <div className="text-[11px] font-medium text-[#737373] uppercase tracking-wider truncate">
                      {b.label}
                    </div>
                    <div className="text-[20px] font-semibold text-[#0a0a0a] font-mono mt-1">
                      {b.availableDays} <span className="text-[11px] font-normal text-[#737373]">days available</span>
                    </div>
                    <div className="text-[11px] text-[#737373] mt-1">
                      {b.usedDays} used · {b.totalEntitlement} statutory total
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: REPORTING TEAM */}
          {activeSubTab === 'team' && (
            <div className="flex flex-col gap-4">
              <span className="text-[12px] font-semibold text-[#0a0a0a] uppercase tracking-wider">
                Direct Reports ({directReports.length})
              </span>
              {directReports.length > 0 ? (
                <div className="divide-y divide-[#f5f5f5] bg-[#ffffff] rounded-[24px] border border-[#e5e5e5] p-3 card-shadow">
                  {directReports.map((r) => (
                    <div
                      key={r.id}
                      onClick={() => setSelectedEmployee(r)}
                      className="py-2.5 px-3 flex items-center justify-between hover:bg-[#fafafa] rounded-[14px] cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5">
                        <img src={r.avatar} alt={r.firstName} className="w-7 h-7 rounded-full object-cover" />
                        <div>
                          <div className="text-[13px] font-semibold text-[#0a0a0a]">
                            {r.firstName} {r.lastName}
                          </div>
                          <div className="text-[11px] text-[#737373]">{r.jobTitle}</div>
                        </div>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-[#737373]" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 bg-[#fafafa] rounded-[24px] text-center text-[13px] text-[#737373]">
                  Individual Contributor without direct reporting personnel.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#e5e5e5] bg-[#fafafa] flex items-center justify-between">
          <div className="text-[11px] font-mono text-[#737373]">
            National ID: {selectedEmployee.nationalId || 'N/A'} · KRA: {selectedEmployee.kraPin || 'N/A'}
          </div>

          <div className="flex items-center gap-2">
            {isEditing ? (
              <>
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-3.5 py-2 rounded-2xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 text-[13px] font-medium transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="px-4 py-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-[13px] font-semibold transition-all shadow-sm shadow-emerald-600/30 cursor-pointer"
                >
                  Save Changes
                </button>
              </>
            ) : (
              <button
                onClick={() => setSelectedEmployee(null)}
                className="px-4 py-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-[13px] font-semibold transition-all shadow-sm shadow-emerald-600/30 cursor-pointer"
              >
                Done
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Exit Modal */}
      {showExitModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-60 p-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Initiate Exit Clearance (Kenya)
            </h3>
            <p className="text-[13px] text-slate-500 mt-1">
              Start exit clearance for {selectedEmployee.firstName} {selectedEmployee.lastName} ({selectedEmployee.employeeCode}).
            </p>

            <div className="space-y-4 mt-4 text-[13px]">
              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                  Reason for Exit
                </label>
                <input
                  type="text"
                  value={exitReason}
                  onChange={(e) => setExitReason(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-[13px] outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                  Last Working Date
                </label>
                <input
                  type="date"
                  value={exitDate}
                  onChange={(e) => setExitDate(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-[13px] outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setShowExitModal(false)}
                className="px-3.5 py-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 text-[13px] font-medium cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmExit}
                className="px-4 py-2 rounded-xl bg-rose-600 text-white text-[13px] font-semibold hover:bg-rose-700 transition-colors cursor-pointer"
              >
                Confirm Exit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-70 p-4">
          <div className="bg-white rounded-2xl border border-rose-200 p-6 max-w-md w-full shadow-2xl flex flex-col gap-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 tracking-tight">
                  Permanently Delete Employee?
                </h3>
                <p className="text-[12px] text-slate-500">
                  This action cannot be undone.
                </p>
              </div>
            </div>

            <p className="text-[13px] text-slate-600">
              Are you sure you want to permanently remove{' '}
              <strong className="text-slate-900 font-semibold">
                {selectedEmployee.firstName} {selectedEmployee.lastName} ({selectedEmployee.employeeCode})
              </strong>{' '}
              from the system? All associated attendance records, leave requests, and payroll entries will be permanently removed.
            </p>

            <div className="flex justify-end items-center gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-[13px] font-medium cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteEmployee}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-[13px] font-semibold transition-all shadow-sm shadow-rose-600/30 cursor-pointer"
              >
                Yes, Delete Employee
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
