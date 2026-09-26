/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Clock,
  CalendarDays,
  Banknote,
  Award,
  CheckSquare,
  Plus,
  Filter,
  Search,
  CheckCircle2,
  XCircle,
  FileText,
  Receipt,
  CreditCard,
  Laptop,
  UserCheck,
  ChevronRight,
  Download,
  AlertCircle,
  TrendingUp,
  MapPin,
  Coffee,
  Play,
  Square,
  Calendar,
  Eye,
  ShieldCheck,
  Mail,
  Phone,
  Briefcase,
  File,
  Sparkles,
} from 'lucide-react';
import { useHR } from '../../context/HRContext';
import {
  DigitalRequestType,
  UnifiedDigitalRequest,
  SalaryAdvanceRequest,
  ExpenseClaim,
  DocumentLetterRequest,
  AssetRequest,
  ProfileUpdateRequest,
} from '../../types/hr';
import { NewDigitalRequestModal } from './NewDigitalRequestModal';

export const EmployeeSelfServiceView: React.FC = () => {
  const {
    activePersona,
    employees,
    attendanceRecords,
    clockIn,
    clockOut,
    toggleBreak,
    userTodayAttendance,
    getEmployeeLeaveBalances,
    payrollCycles,
    okrGoals,
    onboardingRecords,
    salaryAdvances,
    expenseClaims,
    documentLetters,
    assetRequests,
    profileUpdates,
    reviewSalaryAdvance,
    reviewExpenseClaim,
    reviewDocumentLetter,
    reviewAssetRequest,
    reviewProfileUpdate,
    setSelectedPayslip,
    setIsPayslipModalOpen,
    canPerformAction,
    setCurrentTab,
  } = useHR();

  const [activeSubTab, setActiveSubTab] = useState<'dashboard' | 'requests'>('dashboard');
  const [requestFilterType, setRequestFilterType] = useState<string>('all');
  const [requestStatusFilter, setRequestStatusFilter] = useState<string>('all');
  const [requestSearch, setRequestSearch] = useState<string>('');
  const [isNewRequestModalOpen, setIsNewRequestModalOpen] = useState(false);
  const [defaultRequestType, setDefaultRequestType] = useState<
    'expense' | 'letter' | 'salary_advance' | 'asset' | 'profile_update'
  >('expense');

  // Review modal state
  const [reviewItem, setReviewItem] = useState<UnifiedDigitalRequest | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [reimbursementMethod, setReimbursementMethod] = useState<'mpesa' | 'bank_transfer' | 'payroll_addition'>('mpesa');

  // Current employee record
  const currentEmployee = employees.find((e) => e.id === activePersona.employeeId) || employees[0];
  const isManagerOrAdmin = canPerformAction('department_lead') || activePersona.role === 'hr_manager' || activePersona.role === 'super_admin';

  // 1. Attendance status
  const todayRecord = userTodayAttendance;
  const isClockedIn = todayRecord?.clockIn && !todayRecord?.clockOut;
  const lastPunch = todayRecord?.punches?.[todayRecord.punches.length - 1];
  const isOnBreak = lastPunch?.type === 'break_start';

  // 2. Leave balances
  const leaveBalances = getEmployeeLeaveBalances(currentEmployee.id);
  const annualLeave = leaveBalances.find((l) => l.leaveType === 'annual');
  const sickLeave = leaveBalances.find((l) => l.leaveType === 'sick');
  const compassionateLeave = leaveBalances.find((l) => l.leaveType === 'compassionate');

  // 3. Recent Payslips
  const employeePayslips = payrollCycles
    .flatMap((c) => c.payslips || [])
    .filter((p) => p.employeeId === currentEmployee.id)
    .slice(0, 3);

  // 4. Assigned OKRs
  const userOKRs = okrGoals.filter((g) => g.ownerEmployeeId === currentEmployee.id);

  // 5. Pending Tasks
  const userOnboarding = onboardingRecords.find((r) => r.employeeId === currentEmployee.id && r.status === 'in_progress');
  const pendingOnboardingTasks = userOnboarding?.tasks.filter((t) => !t.isCompleted) || [];

  // Build unified requests
  const unifiedRequests: UnifiedDigitalRequest[] = [
    ...salaryAdvances.map((adv) => ({
      id: adv.id,
      requestNumber: adv.requestNumber,
      type: 'salary_advance' as DigitalRequestType,
      categoryLabel: 'Salary Advance',
      employeeId: adv.employeeId,
      employeeName: adv.employeeName,
      department: adv.department,
      title: `${adv.reason}: KES ${adv.amountKES.toLocaleString()}`,
      amountKES: adv.amountKES,
      status: adv.status,
      badgeVariant:
        adv.status === 'disbursed'
          ? ('success' as const)
          : adv.status === 'rejected'
          ? ('danger' as const)
          : adv.status === 'hr_approved' || adv.status === 'manager_approved'
          ? ('info' as const)
          : ('warning' as const),
      submittedAt: adv.submittedAt,
      details: `${adv.deductionTenureMonths} Month(s) tenure · ${adv.disbursementMethod.toUpperCase()} (${adv.disbursementAccount})`,
      rawRequest: adv,
    })),
    ...expenseClaims.map((exp) => ({
      id: exp.id,
      requestNumber: exp.claimNumber,
      type: 'expense' as DigitalRequestType,
      categoryLabel: 'Expense Claim',
      employeeId: exp.employeeId,
      employeeName: exp.employeeName,
      department: exp.department,
      title: exp.title,
      amountKES: exp.amountKES,
      status: exp.status,
      badgeVariant:
        exp.status === 'reimbursed'
          ? ('success' as const)
          : exp.status === 'approved'
          ? ('info' as const)
          : exp.status === 'rejected'
          ? ('danger' as const)
          : ('warning' as const),
      submittedAt: exp.submittedAt,
      details: `${exp.merchantName} · ${exp.receiptFileName || 'No receipt'}`,
      rawRequest: exp,
    })),
    ...documentLetters.map((ltr) => ({
      id: ltr.id,
      requestNumber: ltr.letterNumber,
      type: 'letter' as DigitalRequestType,
      categoryLabel: 'Official Letter',
      employeeId: ltr.employeeId,
      employeeName: ltr.employeeName,
      department: ltr.department,
      title: `${ltr.letterType.replace(/_/g, ' ').toUpperCase()} (${ltr.urgency})`,
      status: ltr.status,
      badgeVariant:
        ltr.status === 'ready_for_download'
          ? ('success' as const)
          : ltr.status === 'rejected'
          ? ('danger' as const)
          : ('warning' as const),
      submittedAt: ltr.submittedAt,
      details: `Addressed to: ${ltr.addressedTo}`,
      rawRequest: ltr,
    })),
    ...assetRequests.map((ast) => ({
      id: ast.id,
      requestNumber: ast.requestNumber,
      type: 'asset' as DigitalRequestType,
      categoryLabel: 'IT Equipment',
      employeeId: ast.employeeId,
      employeeName: ast.employeeName,
      department: ast.department,
      title: ast.itemName,
      status: ast.status,
      badgeVariant:
        ast.status === 'fulfilled'
          ? ('success' as const)
          : ast.status === 'approved'
          ? ('info' as const)
          : ast.status === 'rejected'
          ? ('danger' as const)
          : ('warning' as const),
      submittedAt: ast.submittedAt,
      details: `Urgency: ${ast.urgency.toUpperCase()} · ${ast.reason.slice(0, 50)}...`,
      rawRequest: ast,
    })),
    ...profileUpdates.map((prf) => ({
      id: prf.id,
      requestNumber: prf.requestNumber,
      type: 'profile_update' as DigitalRequestType,
      categoryLabel: 'Profile Update',
      employeeId: prf.employeeId,
      employeeName: prf.employeeName,
      department: prf.department,
      title: `Update ${prf.updateType.replace(/_/g, ' ').toUpperCase()}`,
      status: prf.status,
      badgeVariant:
        prf.status === 'approved'
          ? ('success' as const)
          : prf.status === 'rejected'
          ? ('danger' as const)
          : ('warning' as const),
      submittedAt: prf.submittedAt,
      details: prf.reason,
      rawRequest: prf,
    })),
  ].sort((a, b) => (b.submittedAt > a.submittedAt ? 1 : -1));

  // Filter requests
  const filteredRequests = unifiedRequests.filter((req) => {
    if (!isManagerOrAdmin && req.employeeId !== currentEmployee.id) {
      return false;
    }
    if (requestFilterType !== 'all' && req.type !== requestFilterType) return false;
    if (requestStatusFilter !== 'all' && req.status !== requestStatusFilter) return false;
    if (
      requestSearch &&
      !req.title.toLowerCase().includes(requestSearch.toLowerCase()) &&
      !req.requestNumber.toLowerCase().includes(requestSearch.toLowerCase()) &&
      !req.employeeName.toLowerCase().includes(requestSearch.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const myPendingRequestsCount = unifiedRequests.filter(
    (r) => r.employeeId === currentEmployee.id && (r.status === 'pending' || r.status === 'manager_approved')
  ).length;

  const totalAdminPendingCount = unifiedRequests.filter(
    (r) => r.status === 'pending' || r.status === 'manager_approved'
  ).length;

  const handleOpenNewRequest = (
    type: 'expense' | 'letter' | 'salary_advance' | 'asset' | 'profile_update'
  ) => {
    setDefaultRequestType(type);
    setIsNewRequestModalOpen(true);
  };

  const handleReviewAction = (status: 'approved' | 'rejected' | 'reimbursed' | 'fulfilled' | 'ready_for_download') => {
    if (!reviewItem) return;

    if (reviewItem.type === 'salary_advance') {
      const targetStatus = status === 'approved' ? (activePersona.role === 'super_admin' || activePersona.role === 'hr_manager' ? 'hr_approved' : 'manager_approved') : 'rejected';
      reviewSalaryAdvance(reviewItem.id, targetStatus as any, reviewNotes);
    } else if (reviewItem.type === 'expense') {
      const targetStatus = status === 'approved' ? 'approved' : status === 'reimbursed' ? 'reimbursed' : 'rejected';
      reviewExpenseClaim(reviewItem.id, targetStatus as any, reimbursementMethod, reviewNotes);
    } else if (reviewItem.type === 'letter') {
      const targetStatus = status === 'approved' || status === 'ready_for_download' ? 'ready_for_download' : 'rejected';
      const rawLetter = reviewItem.rawRequest as DocumentLetterRequest;
      const sampleDoc = `OFFICIAL HR CERTIFICATE - SEMPLO KENYA LIMITED\n\nThis is to certify that ${rawLetter.employeeName} is an active, permanent employee in good standing in the ${rawLetter.department} department.\n\nDate: 26th September 2026\nAuthorized By: ${activePersona.name} (${activePersona.roleLabel})`;
      reviewDocumentLetter(reviewItem.id, targetStatus as any, sampleDoc, reviewNotes);
    } else if (reviewItem.type === 'asset') {
      const targetStatus = status === 'approved' ? 'approved' : status === 'fulfilled' ? 'fulfilled' : 'rejected';
      reviewAssetRequest(reviewItem.id, targetStatus as any, reviewNotes);
    } else if (reviewItem.type === 'profile_update') {
      const targetStatus = status === 'approved' ? 'approved' : 'rejected';
      reviewProfileUpdate(reviewItem.id, targetStatus as any, reviewNotes);
    }

    setReviewItem(null);
    setReviewNotes('');
  };

  // Weekly hours data for visual chart
  const weeklyHours = [
    { day: 'Mon', hours: 8.5, pct: 90 },
    { day: 'Tue', hours: 9.0, pct: 98 },
    { day: 'Wed', hours: 8.2, pct: 85 },
    { day: 'Thu', hours: 8.6, pct: 92 },
    { day: 'Fri', hours: 7.8, pct: 80 },
    { day: 'Sat', hours: 0, pct: 0 },
    { day: 'Sun', hours: 0, pct: 0 },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto flex flex-col gap-6">
      {/* Top Header & Sub-tab Navigation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full whitespace-nowrap">
              Self-Service Hub
            </span>
            <span className="text-xs text-slate-500 whitespace-nowrap">
              {currentEmployee.firstName} {currentEmployee.lastName} ({currentEmployee.employeeCode})
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-emerald-700 tracking-tight mt-1 whitespace-normal sm:whitespace-nowrap">
            Employee Portal & Requests
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Biometric attendance, digital pay slips, leave balances, and company service requests.
          </p>
        </div>

        {/* View Switcher & Action */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="bg-white border border-slate-200 rounded-2xl p-1 flex items-center gap-1 shadow-xs">
            <button
              onClick={() => setActiveSubTab('dashboard')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeSubTab === 'dashboard'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Personal Dashboard
            </button>
            <button
              onClick={() => setActiveSubTab('requests')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeSubTab === 'requests'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>Request Hub</span>
              {(isManagerOrAdmin ? totalAdminPendingCount : myPendingRequestsCount) > 0 && (
                <span className="w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-mono flex items-center justify-center font-bold">
                  {isManagerOrAdmin ? totalAdminPendingCount : myPendingRequestsCount}
                </span>
              )}
            </button>
          </div>

          <button
            onClick={() => handleOpenNewRequest('expense')}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-[13px] font-semibold transition-all shadow-sm shadow-emerald-600/30 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>New Request</span>
          </button>
        </div>
      </div>

      {/* SUB-TAB 1: PERSONAL DASHBOARD (TeamHub Style) */}
      {activeSubTab === 'dashboard' && (
        <div className="flex flex-col gap-6">
          {/* 1. HERO EMPLOYEE PROFILE & LEAVE RINGS (TeamHub Top Section) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Profile Card (4 cols) */}
            <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs flex flex-col items-center text-center justify-between">
              <div className="flex flex-col items-center">
                <div className="relative">
                  <div className="w-24 h-24 rounded-3xl overflow-hidden ring-4 ring-emerald-500/25 shadow-md">
                    <img
                      src={currentEmployee.avatar}
                      alt={currentEmployee.firstName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-emerald-500 ring-2 ring-white"></span>
                </div>

                <h2 className="text-xl font-bold text-slate-900 mt-3.5 tracking-tight">
                  {currentEmployee.firstName} {currentEmployee.lastName}
                </h2>
                <div className="text-xs font-semibold text-emerald-700 mt-0.5">
                  {currentEmployee.jobTitle}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  {currentEmployee.department}
                </div>

                <div className="flex items-center gap-2 mt-3">
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-100 font-mono text-[11px] text-slate-700 font-semibold border border-slate-200">
                    {currentEmployee.employeeCode}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-semibold text-[11px] border border-emerald-200">
                    Full-Time
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-800 font-semibold text-[11px] border border-teal-200">
                    Hybrid
                  </span>
                </div>

                <div className="w-full mt-5 pt-4 border-t border-slate-100 flex flex-col gap-2 text-left text-xs">
                  <div className="flex items-center justify-between text-slate-600">
                    <span className="flex items-center gap-1.5 text-slate-400">
                      <Mail className="w-3.5 h-3.5" />
                      <span>Email</span>
                    </span>
                    <span className="font-medium text-slate-800 truncate max-w-[170px]">{currentEmployee.email}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <span className="flex items-center gap-1.5 text-slate-400">
                      <Phone className="w-3.5 h-3.5" />
                      <span>Phone</span>
                    </span>
                    <span className="font-mono text-slate-800">{currentEmployee.phone}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <span className="flex items-center gap-1.5 text-slate-400">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>Office</span>
                    </span>
                    <span className="text-slate-800 truncate max-w-[170px]">{currentEmployee.location}</span>
                  </div>
                </div>
              </div>

              <div className="w-full mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span>Joined {currentEmployee.joiningDate}</span>
                <span className="font-mono text-emerald-700 font-semibold">{currentEmployee.compensationTier}</span>
              </div>
            </div>

            {/* Right: Leave Donut Progress Rings & Overview (8 cols - TeamHub Image 1) */}
            <div className="lg:col-span-8 flex flex-col gap-6">
              {/* 4 Circular Progress Meters */}
              <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h3 className="text-base font-bold text-slate-900 tracking-tight">
                    Leave Accruals & Balance Radar
                  </h3>
                  <span className="text-xs font-mono font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    Year 2026 Cycle
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
                  {/* Donut 1: Total Leaves Used */}
                  <div className="flex flex-col items-center text-center p-3 rounded-2xl bg-slate-50/80 border border-slate-100">
                    <div className="relative w-16 h-16 flex items-center justify-center">
                      <svg className="w-16 h-16 -rotate-90" viewBox="0 0 36 36">
                        <path className="text-slate-200" strokeWidth="3.5" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                        <path className="text-emerald-500" strokeDasharray="14, 100" strokeWidth="3.5" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                      </svg>
                      <span className="absolute text-xs font-mono font-extrabold text-emerald-900">14%</span>
                    </div>
                    <div className="text-xs font-bold text-slate-800 mt-2">All Leaves</div>
                    <div className="text-[10px] text-slate-400">Total Utilization</div>
                  </div>

                  {/* Donut 2: Annual Leaves */}
                  <div className="flex flex-col items-center text-center p-3 rounded-2xl bg-emerald-50/50 border border-emerald-100">
                    <div className="relative w-16 h-16 flex items-center justify-center">
                      <svg className="w-16 h-16 -rotate-90" viewBox="0 0 36 36">
                        <path className="text-emerald-100" strokeWidth="3.5" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                        <path className="text-emerald-600" strokeDasharray="76, 100" strokeWidth="3.5" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                      </svg>
                      <span className="absolute text-xs font-mono font-extrabold text-emerald-900">{annualLeave?.availableDays ?? 16}d</span>
                    </div>
                    <div className="text-xs font-bold text-slate-800 mt-2">Annual Leaves</div>
                    <div className="text-[10px] text-emerald-700 font-semibold">16 of 21 Days</div>
                  </div>

                  {/* Donut 3: Casual / Compassionate */}
                  <div className="flex flex-col items-center text-center p-3 rounded-2xl bg-amber-50/50 border border-amber-100">
                    <div className="relative w-16 h-16 flex items-center justify-center">
                      <svg className="w-16 h-16 -rotate-90" viewBox="0 0 36 36">
                        <path className="text-amber-100" strokeWidth="3.5" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                        <path className="text-amber-500" strokeDasharray="71, 100" strokeWidth="3.5" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                      </svg>
                      <span className="absolute text-xs font-mono font-extrabold text-amber-900">{compassionateLeave?.availableDays ?? 5}d</span>
                    </div>
                    <div className="text-xs font-bold text-slate-800 mt-2">Casual Leaves</div>
                    <div className="text-[10px] text-amber-700 font-semibold">5 of 7 Days</div>
                  </div>

                  {/* Donut 4: Sick Leaves */}
                  <div className="flex flex-col items-center text-center p-3 rounded-2xl bg-sky-50/50 border border-sky-100">
                    <div className="relative w-16 h-16 flex items-center justify-center">
                      <svg className="w-16 h-16 -rotate-90" viewBox="0 0 36 36">
                        <path className="text-sky-100" strokeWidth="3.5" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                        <path className="text-sky-500" strokeDasharray="93, 100" strokeWidth="3.5" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                      </svg>
                      <span className="absolute text-xs font-mono font-extrabold text-sky-900">{sickLeave?.availableDays ?? 28}d</span>
                    </div>
                    <div className="text-xs font-bold text-slate-800 mt-2">Sick Leaves</div>
                    <div className="text-[10px] text-sky-700 font-semibold">28 of 30 Days</div>
                  </div>
                </div>
              </div>

              {/* Fast Actions Grid */}
              <div className="bg-white rounded-2xl border border-slate-200/90 p-4 flex flex-wrap items-center justify-between gap-3 shadow-xs">
                <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <span>Self-Service Trays:</span>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => setCurrentTab('leaves')}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 text-xs font-semibold transition-colors flex items-center gap-1.5"
                  >
                    <CalendarDays className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Apply Leave</span>
                  </button>
                  <button
                    onClick={() => handleOpenNewRequest('salary_advance')}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 text-xs font-semibold transition-colors flex items-center gap-1.5"
                  >
                    <CreditCard className="w-3.5 h-3.5 text-orange-600" />
                    <span>Salary Advance</span>
                  </button>
                  <button
                    onClick={() => handleOpenNewRequest('expense')}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 text-xs font-semibold transition-colors flex items-center gap-1.5"
                  >
                    <Receipt className="w-3.5 h-3.5 text-sky-600" />
                    <span>Expense Claim</span>
                  </button>
                  <button
                    onClick={() => handleOpenNewRequest('letter')}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 text-xs font-semibold transition-colors flex items-center gap-1.5"
                  >
                    <FileText className="w-3.5 h-3.5 text-purple-600" />
                    <span>Official Letter</span>
                  </button>
                  <button
                    onClick={() => handleOpenNewRequest('asset')}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 text-xs font-semibold transition-colors flex items-center gap-1.5"
                  >
                    <Laptop className="w-3.5 h-3.5 text-teal-600" />
                    <span>IT Equipment</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 2. MIDDLE ROW: HOURS LOGGED & PUNCH TERMINAL (TeamHub Image 1) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Hours Logged Bar Graph (2 cols) */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
                      <span>Hours Logged This Week</span>
                      <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                        34.30 hrs
                      </span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Shift: 08:30 – 17:00 EAT · Nairobi HQ Upper Hill
                    </p>
                  </div>
                  <span
                    className={`text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${
                      isClockedIn
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : 'bg-slate-100 text-slate-600 border-slate-200'
                    }`}
                  >
                    {isClockedIn ? (isOnBreak ? 'ON BREAK' : 'ACTIVE CLOCKED IN') : 'OFF-DUTY'}
                  </span>
                </div>

                {/* Vertical Bar Chart (TeamHub Style) */}
                <div className="mt-5 flex items-end justify-between gap-4 h-36 px-4 pb-2 border-b border-slate-100">
                  {weeklyHours.map((bar, i) => (
                    <div key={bar.day} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                      <span className="text-[10px] font-mono font-semibold text-slate-400 group-hover:text-emerald-700">
                        {bar.hours}h
                      </span>
                      <div className="w-full max-w-[38px] bg-slate-100 rounded-t-xl overflow-hidden h-full flex items-end">
                        <div
                          className={`w-full rounded-t-xl transition-all duration-500 ${
                            i === 1 || i === 3
                              ? 'bg-emerald-600 shadow-sm shadow-emerald-500/30'
                              : 'bg-emerald-400'
                          }`}
                          style={{ height: `${bar.pct}%` }}
                        />
                      </div>
                      <span className="text-xs font-semibold text-slate-600 mt-1">
                        {bar.day}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Punch Controls */}
              <div className="mt-4 pt-3 flex flex-wrap items-center justify-between gap-3">
                <div className="text-xs text-slate-500">
                  Today Duration: <strong className="font-mono text-emerald-700">{Math.floor((todayRecord?.totalWorkMinutes || 0) / 60)}h {(todayRecord?.totalWorkMinutes || 0) % 60}m</strong>
                </div>

                <div className="flex items-center gap-2">
                  {!isClockedIn ? (
                    <button
                      onClick={() => clockIn(currentEmployee.id, 'Nairobi HQ Upper Hill')}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-all shadow-xs flex items-center gap-1.5"
                    >
                      <Play className="w-3.5 h-3.5 fill-white" />
                      <span>Clock In Terminal</span>
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => toggleBreak(currentEmployee.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 border ${
                          isOnBreak
                            ? 'bg-amber-500 text-white font-semibold'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <Coffee className="w-3.5 h-3.5" />
                        <span>{isOnBreak ? 'Resume Work' : 'Break'}</span>
                      </button>
                      <button
                        onClick={() => clockOut(currentEmployee.id, 'Nairobi HQ Upper Hill')}
                        className="px-4 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs font-semibold transition-all flex items-center gap-1.5"
                      >
                        <Square className="w-3.5 h-3.5 fill-current" />
                        <span>Clock Out</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Documents & Compliance Checklist (TeamHub Image 1) */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h3 className="text-base font-bold text-slate-900 tracking-tight">
                    Documents & Contracts
                  </h3>
                  <span className="text-[11px] font-mono text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 font-semibold">
                    Verified
                  </span>
                </div>

                <div className="mt-3 flex flex-col gap-2.5">
                  <div className="p-2.5 bg-slate-50/80 rounded-xl border border-slate-200/80 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center font-mono font-bold text-[10px]">
                        PDF
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-800">Employment Contract</div>
                        <div className="text-[10px] text-slate-400">Signed · Permanent Terms</div>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-slate-500 font-semibold">1.2 MB</span>
                  </div>

                  <div className="p-2.5 bg-slate-50/80 rounded-xl border border-slate-200/80 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center font-mono font-bold text-[10px]">
                        PDF
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-800">KRA PIN & Tax Card</div>
                        <div className="text-[10px] text-slate-400">P051029481A · Certified</div>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-slate-500 font-semibold">480 KB</span>
                  </div>

                  <div className="p-2.5 bg-slate-50/80 rounded-xl border border-slate-200/80 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-mono font-bold text-[10px]">
                        PDF
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-800">NDAs & IT Security Policy</div>
                        <div className="text-[10px] text-slate-400">ODPC Compliant</div>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-slate-500 font-semibold">890 KB</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>Bank: {currentEmployee.bankInfo.bankName}</span>
                <span className="font-mono">····{currentEmployee.bankInfo.accountLast4}</span>
              </div>
            </div>
          </div>

          {/* 3. BOTTOM ROW: RECENT PAYSLIPS & ASSIGNED GOALS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Recent Payslips */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <Banknote className="w-4 h-4 text-purple-600" />
                    <h3 className="text-base font-bold text-slate-900 tracking-tight">Recent Digital Payslips</h3>
                  </div>
                  <span className="text-[10px] font-mono font-bold bg-purple-50 text-purple-800 px-2 py-0.5 rounded-full border border-purple-200">
                    KES Itemized
                  </span>
                </div>

                <div className="mt-4 flex flex-col gap-2.5">
                  {employeePayslips.length === 0 ? (
                    <div className="py-8 text-center text-xs text-slate-500">
                      No payslips available for current cycle.
                    </div>
                  ) : (
                    employeePayslips.map((ps) => (
                      <div
                        key={ps.id}
                        className="p-3 bg-slate-50/80 rounded-xl border border-slate-200/80 flex items-center justify-between hover:border-slate-300 transition-all"
                      >
                        <div>
                          <div className="text-xs font-bold text-slate-900">{ps.payPeriod}</div>
                          <div className="text-[11px] font-mono text-slate-500 mt-0.5">
                            Gross: KES {ps.earnings.grossPay.toLocaleString()} · Net: <span className="font-bold text-emerald-700">KES {ps.netPay.toLocaleString()}</span>
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            setSelectedPayslip(ps);
                            setIsPayslipModalOpen(true);
                          }}
                          className="px-3 py-1 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-xs font-semibold text-slate-800 transition-colors flex items-center gap-1 shadow-2xs"
                        >
                          <Eye className="w-3 h-3 text-slate-500" />
                          <span>View Slip</span>
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500 text-center">
                Statutory deductions (KRA PAYE, NSSF, SHIF, AHL) are itemized on each slip.
              </div>
            </div>

            {/* Assigned OKRs & Goals */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-amber-500" />
                    <h3 className="text-base font-bold text-slate-900 tracking-tight">Assigned Goals & OKRs</h3>
                  </div>
                  <button
                    onClick={() => setCurrentTab('appraisals')}
                    className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-0.5"
                  >
                    <span>Appraisal Board</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>

                <div className="mt-4 flex flex-col gap-3">
                  {userOKRs.length === 0 ? (
                    <div className="py-8 text-center text-xs text-slate-500 bg-slate-50 rounded-xl">
                      No individual OKRs assigned for this quarter.
                    </div>
                  ) : (
                    userOKRs.map((goal) => (
                      <div key={goal.id} className="p-3 bg-slate-50/80 rounded-xl border border-slate-200/80 flex flex-col gap-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-900">{goal.title}</span>
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                            {goal.progress}%
                          </span>
                        </div>
                        <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mt-1">
                          <div
                            className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                            style={{ width: `${goal.progress}%` }}
                          />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100">
                <button
                  onClick={() => setCurrentTab('appraisals')}
                  className="w-full py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
                >
                  Open 360° Review & Performance Matrix
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: REQUEST HUB */}
      {activeSubTab === 'requests' && (
        <div className="flex flex-col gap-4">
          {/* Top Filter and Controls Bar */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-4 flex flex-col md:flex-row items-center justify-between gap-3 shadow-xs">
            {/* Category tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto">
              {[
                { id: 'all', label: 'All Requests' },
                { id: 'expense', label: 'Expense Claims' },
                { id: 'letter', label: 'Official Letters' },
                { id: 'salary_advance', label: 'Salary Advances' },
                { id: 'asset', label: 'IT Equipment' },
                { id: 'profile_update', label: 'Profile Updates' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setRequestFilterType(cat.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
                    requestFilterType === cat.id
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Status & Search */}
            <div className="flex items-center gap-2.5 w-full md:w-auto">
              <div className="relative flex-1 md:w-56">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search requests..."
                  value={requestSearch}
                  onChange={(e) => setRequestSearch(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-600"
                />
              </div>

              <select
                value={requestStatusFilter}
                onChange={(e) => setRequestStatusFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-medium focus:outline-none"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending Review</option>
                <option value="approved">Approved</option>
                <option value="reimbursed">Reimbursed / Disbursed</option>
                <option value="ready_for_download">Ready for Download</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>

          {/* Requests Table */}
          <div className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Request #</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Details / Purpose</th>
                    <th className="py-3 px-4">Requester</th>
                    <th className="py-3 px-4">Amount / Items</th>
                    <th className="py-3 px-4">Submitted</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredRequests.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-500">
                        No digital requests found matching your filter criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredRequests.map((req) => (
                      <tr key={req.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-slate-900">
                          {req.requestNumber}
                        </td>
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold border border-slate-200">
                            {req.categoryLabel}
                          </span>
                        </td>
                        <td className="py-3 px-4 max-w-xs">
                          <div className="font-bold text-slate-900 truncate">{req.title}</div>
                          <div className="text-[11px] text-slate-500 truncate">{req.details}</div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-900">{req.employeeName}</div>
                          <div className="text-[10px] text-slate-400">{req.department}</div>
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-slate-900">
                          {req.amountKES ? `KES ${req.amountKES.toLocaleString()}` : '--'}
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-500">
                          {req.submittedAt}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border ${
                              req.badgeVariant === 'success'
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                : req.badgeVariant === 'info'
                                ? 'bg-sky-50 text-sky-800 border-sky-200'
                                : req.badgeVariant === 'danger'
                                ? 'bg-rose-50 text-rose-800 border-rose-200'
                                : 'bg-amber-50 text-amber-800 border-amber-200'
                            }`}
                          >
                            {req.status.replace(/_/g, ' ').toUpperCase()}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {req.type === 'letter' && req.status === 'ready_for_download' && (
                              <button
                                onClick={() => {
                                  const rawLetter = req.rawRequest as DocumentLetterRequest;
                                  alert(`Generated Official Document:\n\n${rawLetter.generatedDocumentContent || 'Document ready on company letterhead.'}`);
                                }}
                                className="px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 transition-colors flex items-center gap-1 font-semibold"
                              >
                                <Download className="w-3 h-3" />
                                <span>Letter</span>
                              </button>
                            )}

                            {isManagerOrAdmin ? (
                              <button
                                onClick={() => setReviewItem(req)}
                                className="px-3 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition-colors text-[11px] font-semibold shadow-2xs"
                              >
                                Manage
                              </button>
                            ) : (
                              <button
                                onClick={() => setReviewItem(req)}
                                className="px-3 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors text-[11px] font-medium"
                              >
                                View
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Review & Management Drawer/Modal */}
      {reviewItem && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 max-w-lg w-full shadow-2xl flex flex-col gap-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-mono uppercase bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200 text-slate-700 font-semibold">
                  {reviewItem.requestNumber} · {reviewItem.categoryLabel}
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-1">
                  {reviewItem.title}
                </h3>
              </div>
              <button
                onClick={() => setReviewItem(null)}
                className="p-1 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700"
              >
                <XCircle className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-200 text-xs flex flex-col gap-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Employee:</span>
                <span className="font-bold text-slate-900">{reviewItem.employeeName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Department:</span>
                <span className="text-slate-800 font-medium">{reviewItem.department}</span>
              </div>
              {reviewItem.amountKES && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Amount:</span>
                  <span className="font-mono font-bold text-emerald-700">
                    KES {reviewItem.amountKES.toLocaleString()}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-slate-500">Submitted:</span>
                <span className="font-mono text-slate-600">{reviewItem.submittedAt}</span>
              </div>
              <div className="pt-2 border-t border-slate-200 text-slate-600">
                <span className="font-semibold text-slate-800">Details: </span>
                {reviewItem.details}
              </div>
            </div>

            {/* If Expense, offer reimbursement channel selection */}
            {isManagerOrAdmin && reviewItem.type === 'expense' && reviewItem.status === 'approved' && (
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Disburse Reimbursement Via
                </label>
                <select
                  value={reimbursementMethod}
                  onChange={(e) => setReimbursementMethod(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-medium"
                >
                  <option value="mpesa">Direct M-Pesa Disbursal</option>
                  <option value="bank_transfer">Direct Bank Transfer</option>
                  <option value="payroll_addition">Next Monthly Payroll Addition</option>
                </select>
              </div>
            )}

            {isManagerOrAdmin && (
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Reviewer Remarks / Approval Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="Optional review feedback or disbursement note..."
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-600"
                />
              </div>
            )}

            {/* Action buttons */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setReviewItem(null)}
                className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold hover:bg-slate-200"
              >
                Close
              </button>

              {isManagerOrAdmin && reviewItem.status === 'pending' && (
                <>
                  <button
                    onClick={() => handleReviewAction('rejected')}
                    className="px-3.5 py-1.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold hover:bg-rose-100"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => handleReviewAction('approved')}
                    className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs"
                  >
                    Approve Request
                  </button>
                </>
              )}

              {isManagerOrAdmin && reviewItem.type === 'expense' && reviewItem.status === 'approved' && (
                <button
                  onClick={() => handleReviewAction('reimbursed')}
                  className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs"
                >
                  Confirm Disbursal (Reimbursed)
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* New Digital Request Modal */}
      <NewDigitalRequestModal
        isOpen={isNewRequestModalOpen}
        onClose={() => setIsNewRequestModalOpen(false)}
        defaultType={defaultRequestType}
      />
    </div>
  );
};
