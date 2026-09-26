/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  CalendarDays,
  Plus,
  Check,
  X,
  Clock,
  AlertCircle,
  FileText,
  UserCheck,
  Filter,
  CheckCircle2,
  Calendar,
  Sparkles,
  Users,
  ShieldCheck,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { useHR } from '../../context/HRContext';
import { LeaveRequest, LeaveStatus, LeaveType } from '../../types/hr';
import { KENYAN_LEAVE_TYPES_CONFIG } from '../../data/initialData';

export const LeaveManagementView: React.FC = () => {
  const {
    leaveRequests,
    employees,
    activePersona,
    submitLeaveRequest,
    reviewLeaveRequest,
    getEmployeeLeaveBalances,
    canPerformAction,
  } = useHR();

  const [activeTab, setActiveTab] = useState<'requests' | 'balances' | 'calendar'>('requests');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showApplyModal, setShowApplyModal] = useState(false);

  // New leave request form state
  const [leaveForm, setLeaveForm] = useState({
    leaveType: 'annual' as LeaveType,
    startDate: '2026-10-05',
    endDate: '2026-10-09',
    daysCount: 5,
    reason: '',
    handoverId: '',
  });

  const [reviewModalRequest, setReviewModalRequest] = useState<LeaveRequest | null>(null);
  const [reviewComment, setReviewComment] = useState('');

  // Current persona balances
  const userBalances = getEmployeeLeaveBalances(activePersona.employeeId);

  // Calculate day difference when dates change
  const handleDateChange = (start: string, end: string) => {
    const s = new Date(start);
    const e = new Date(end);
    if (!isNaN(s.getTime()) && !isNaN(e.getTime()) && e >= s) {
      const diffTime = Math.abs(e.getTime() - s.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      setLeaveForm((prev) => ({ ...prev, startDate: start, endDate: end, daysCount: diffDays }));
    } else {
      setLeaveForm((prev) => ({ ...prev, startDate: start, endDate: end }));
    }
  };

  const handleApplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const handoverEmp = employees.find((emp) => emp.id === leaveForm.handoverId);

    submitLeaveRequest({
      employeeId: activePersona.employeeId,
      employeeName: activePersona.name,
      department: activePersona.department,
      leaveType: leaveForm.leaveType,
      startDate: leaveForm.startDate,
      endDate: leaveForm.endDate,
      daysCount: leaveForm.daysCount,
      reason: leaveForm.reason || 'Personal leave as per statutory allocation',
      handoverToEmployeeId: leaveForm.handoverId || undefined,
      handoverToEmployeeName: handoverEmp ? `${handoverEmp.firstName} ${handoverEmp.lastName}` : undefined,
    });

    setShowApplyModal(false);
    setLeaveForm({
      leaveType: 'annual',
      startDate: '2026-10-05',
      endDate: '2026-10-09',
      daysCount: 5,
      reason: '',
      handoverId: '',
    });
  };

  const filteredRequests = leaveRequests.filter((req) => {
    if (filterStatus === 'all') return true;
    return req.status === filterStatus;
  });

  const pendingCount = leaveRequests.filter((r) => r.status === 'pending').length;
  const approvedCount = leaveRequests.filter((r) => r.status === 'approved').length;

  // Visual helper for circular SVG donut ring
  const DonutRing = ({
    percentage,
    color,
    trackColor = '#e2e8f0',
    size = 72,
    strokeWidth = 6,
  }: {
    percentage: number;
    color: string;
    trackColor?: string;
    size?: number;
    strokeWidth?: number;
  }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (Math.min(100, Math.max(0, percentage)) / 100) * circumference;

    return (
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={trackColor}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="none"
          className="transition-all duration-700 ease-out"
        />
      </svg>
    );
  };

  // Curated theme mapping for leave cards
  const getLeaveTypeStyle = (type: LeaveType) => {
    switch (type) {
      case 'annual':
        return {
          stroke: '#10b981',
          bg: 'bg-emerald-50/60',
          border: 'border-emerald-200/80',
          badge: 'bg-emerald-100 text-emerald-800',
          accent: 'text-emerald-700',
        };
      case 'sick':
        return {
          stroke: '#0284c7',
          bg: 'bg-sky-50/60',
          border: 'border-sky-200/80',
          badge: 'bg-sky-100 text-sky-800',
          accent: 'text-sky-700',
        };
      case 'compassionate':
        return {
          stroke: '#f59e0b',
          bg: 'bg-amber-50/60',
          border: 'border-amber-200/80',
          badge: 'bg-amber-100 text-amber-800',
          accent: 'text-amber-700',
        };
      case 'maternity':
      case 'paternity':
        return {
          stroke: '#8b5cf6',
          bg: 'bg-purple-50/60',
          border: 'border-purple-200/80',
          badge: 'bg-purple-100 text-purple-800',
          accent: 'text-purple-700',
        };
      default:
        return {
          stroke: '#14b8a6',
          bg: 'bg-teal-50/60',
          border: 'border-teal-200/80',
          badge: 'bg-teal-100 text-teal-800',
          accent: 'text-teal-700',
        };
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto flex flex-col gap-6 sm:gap-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2 border-b border-[#e5e5e5]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-[30px] font-bold text-emerald-700 tracking-tight leading-tight whitespace-nowrap">
              Leave & Absence Management
            </h1>
            <span className="text-[11px] font-medium text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full whitespace-nowrap">
              Kenya Employment Act 2007 (Cap 226)
            </span>
          </div>
          <p className="text-[14px] text-[#737373] mt-1">
            Statutory Kenyan annual leave (21 days), certified sick leave, maternity/paternity tracking, and approvals.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Apply Leave CTA */}
          <button
            onClick={() => setShowApplyModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-[18px] bg-emerald-600 hover:bg-emerald-700 text-white text-[13px] font-semibold shadow-md shadow-emerald-600/25 transition-all transform active:scale-95 whitespace-nowrap"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Apply for Leave</span>
          </button>
        </div>
      </div>

      {/* TeamHub Inspired Circular SVG Leave Donut Cards */}
      <div className="bg-[#ffffff] rounded-[24px] border border-[#e5e5e5] p-6 card-shadow flex flex-col gap-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#f0f0f0]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-xs">
              {activePersona.name.charAt(0)}
            </div>
            <div>
              <span className="text-[11px] font-medium uppercase tracking-wider text-[#737373]">
                Personal Statutory Accruals
              </span>
              <h3 className="text-[16px] font-bold text-[#0a0a0a] tracking-tight">
                {activePersona.name} · <span className="text-emerald-700 font-medium">{activePersona.jobTitle}</span>
              </h3>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-[#737373] bg-[#f8fafc] border border-[#e2e8f0] px-3 py-1 rounded-full">
              FY2026 Statutory Cycle
            </span>
          </div>
        </div>

        {/* Donut cards row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {userBalances.slice(0, 4).map((bal) => {
            const style = getLeaveTypeStyle(bal.leaveType);
            const percentAvailable = Math.round((bal.availableDays / (bal.totalEntitlement || 1)) * 100);

            return (
              <div
                key={bal.leaveType}
                className={`p-4 rounded-[20px] border ${style.border} ${style.bg} flex items-center justify-between transition-all hover:scale-[1.01]`}
              >
                <div className="flex flex-col justify-between">
                  <div>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${style.badge}`}>
                      {bal.label}
                    </span>
                    <div className="mt-2 text-[26px] font-bold text-[#0a0a0a] font-mono tracking-tight leading-none">
                      {bal.availableDays}
                      <span className="text-[12px] font-normal text-[#737373] ml-1">
                        / {bal.totalEntitlement}d
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 text-[11px] text-[#737373] flex items-center gap-2">
                    <span className="font-medium text-[#0a0a0a]">{bal.usedDays}d used</span>
                    {bal.pendingDays > 0 && (
                      <span className="text-amber-700 font-semibold">• {bal.pendingDays}d pending</span>
                    )}
                  </div>
                </div>

                {/* Circular Donut Meter */}
                <div className="relative flex items-center justify-center shrink-0">
                  <DonutRing percentage={percentAvailable} color={style.stroke} size={64} strokeWidth={5} />
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="text-[11px] font-bold text-[#0a0a0a] font-mono leading-none">
                      {percentAvailable}%
                    </span>
                    <span className="text-[8px] text-[#737373] uppercase mt-0.5">left</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Additional Statutory Balances Bar (Casual, Compassionate, Study) */}
        {userBalances.length > 4 && (
          <div className="pt-2 border-t border-[#f0f0f0] grid grid-cols-2 sm:grid-cols-4 gap-3">
            {userBalances.slice(4).map((bal) => (
              <div key={bal.leaveType} className="p-3 bg-[#fafafa] rounded-[16px] border border-[#e5e5e5] flex items-center justify-between">
                <div>
                  <div className="text-[11px] font-medium text-[#737373] truncate">{bal.label}</div>
                  <div className="text-[15px] font-bold text-[#0a0a0a] font-mono mt-0.5">
                    {bal.availableDays} <span className="text-[10px] text-[#737373] font-normal">avail</span>
                  </div>
                </div>
                <div className="text-[11px] font-mono text-[#737373]">
                  {bal.usedDays}/{bal.totalEntitlement}d
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Main Leave Requests Section with Pill Navigation */}
      <div className="bg-[#ffffff] rounded-[24px] border border-[#e5e5e5] p-6 card-shadow flex flex-col gap-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#e5e5e5]">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-[18px] font-bold text-[#0a0a0a] tracking-tight">
                Leave Applications & Approvals
              </h3>
              {pendingCount > 0 && (
                <span className="text-[11px] font-semibold bg-amber-100 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {pendingCount} Pending Review
                </span>
              )}
            </div>
            <p className="text-[13px] text-[#737373] mt-0.5">
              Multi-tier approval queue with coverage handover and medical certification check.
            </p>
          </div>

          {/* Sub-tab pills & Filter */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center bg-[#f1f5f9] p-1 rounded-[16px]">
              <button
                onClick={() => setActiveTab('requests')}
                className={`px-3 py-1.5 rounded-[12px] text-xs font-semibold transition-all ${
                  activeTab === 'requests'
                    ? 'bg-white text-emerald-700 shadow-xs'
                    : 'text-[#64748b] hover:text-[#0a0a0a]'
                }`}
              >
                Requests Queue ({leaveRequests.length})
              </button>
              <button
                onClick={() => setActiveTab('balances')}
                className={`px-3 py-1.5 rounded-[12px] text-xs font-semibold transition-all ${
                  activeTab === 'balances'
                    ? 'bg-white text-emerald-700 shadow-xs'
                    : 'text-[#64748b] hover:text-[#0a0a0a]'
                }`}
              >
                Employee Balances
              </button>
              <button
                onClick={() => setActiveTab('calendar')}
                className={`px-3 py-1.5 rounded-[12px] text-xs font-semibold transition-all ${
                  activeTab === 'calendar'
                    ? 'bg-white text-emerald-700 shadow-xs'
                    : 'text-[#64748b] hover:text-[#0a0a0a]'
                }`}
              >
                Absence Calendar
              </button>
            </div>

            {activeTab === 'requests' && (
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-[#f8fafc] text-[#0a0a0a] px-3 py-1.5 rounded-[16px] text-[12px] border border-[#e2e8f0] font-medium"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending Approval</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            )}
          </div>
        </div>

        {/* TAB 1: REQUESTS TABLE */}
        {activeTab === 'requests' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#e5e5e5] text-[11px] uppercase tracking-wider text-[#737373] bg-[#f8fafc]">
                  <th className="py-3 px-3 font-semibold rounded-l-lg">Applicant</th>
                  <th className="py-3 px-3 font-semibold">Leave Category</th>
                  <th className="py-3 px-3 font-semibold">Duration</th>
                  <th className="py-3 px-3 font-semibold">Working Days</th>
                  <th className="py-3 px-3 font-semibold">Handover Colleague</th>
                  <th className="py-3 px-3 font-semibold">Status</th>
                  <th className="py-3 px-3 font-semibold text-right rounded-r-lg">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f1f5f9] text-[13px]">
                {filteredRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-[#f8fafc] transition-colors">
                    <td className="py-3.5 px-3">
                      <div className="font-bold text-[#0a0a0a]">{req.employeeName}</div>
                      <div className="text-[11px] text-[#737373]">{req.department}</div>
                    </td>

                    <td className="py-3.5 px-3">
                      <span className="font-semibold text-[#0a0a0a] capitalize">
                        {req.leaveType} Leave
                      </span>
                      {req.medicalCertAttached && (
                        <span className="block text-[10px] text-emerald-700 font-semibold mt-0.5">
                          ✓ Medical Certificate Attached
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-3 font-mono text-[12px] text-[#64748b]">
                      {req.startDate} → {req.endDate}
                    </td>

                    <td className="py-3.5 px-3">
                      <span className="font-mono text-[12px] font-bold text-[#0a0a0a] bg-[#f1f5f9] px-2 py-0.5 rounded-md">
                        {req.daysCount} days
                      </span>
                    </td>

                    <td className="py-3.5 px-3 text-[12px] text-[#64748b]">
                      {req.handoverToEmployeeName ? (
                        <div className="flex items-center gap-1.5">
                          <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{req.handoverToEmployeeName}</span>
                        </div>
                      ) : (
                        <span className="text-[#94a3b8]">None assigned</span>
                      )}
                    </td>

                    <td className="py-3.5 px-3">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold capitalize ${
                          req.status === 'approved'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : req.status === 'pending'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {req.status === 'approved' && <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-600" />}
                        {req.status === 'pending' && <Clock className="w-3 h-3 mr-1 text-amber-600" />}
                        {req.status === 'rejected' && <X className="w-3 h-3 mr-1 text-rose-600" />}
                        {req.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-3 text-right">
                      {req.status === 'pending' && canPerformAction('department_lead') ? (
                        <button
                          onClick={() => setReviewModalRequest(req)}
                          className="px-3.5 py-1.5 rounded-[14px] bg-emerald-600 hover:bg-emerald-700 text-white text-[12px] font-semibold transition-all shadow-xs"
                        >
                          Review & Decide
                        </button>
                      ) : (
                        <span className="text-[11px] text-[#737373]">
                          {req.reviewedBy ? `Approved by ${req.reviewedBy}` : 'Completed'}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 2: EMPLOYEE BALANCES ROSTER */}
        {activeTab === 'balances' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {employees.map((emp) => {
              const empBals = getEmployeeLeaveBalances(emp.id);
              const annualBal = empBals.find((b) => b.leaveType === 'annual');
              const usedPct = annualBal ? Math.round((annualBal.usedDays / (annualBal.totalEntitlement || 1)) * 100) : 0;

              return (
                <div key={emp.id} className="p-4 rounded-[20px] border border-[#e5e5e5] bg-[#ffffff] card-shadow flex flex-col justify-between">
                  <div className="flex items-center gap-3">
                    <img src={emp.avatar} alt={emp.firstName} className="w-10 h-10 rounded-full object-cover border border-[#e5e5e5]" />
                    <div>
                      <div className="font-bold text-[#0a0a0a] text-[14px]">{emp.firstName} {emp.lastName}</div>
                      <div className="text-[11px] text-[#737373]">{emp.jobTitle} · {emp.department}</div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#f0f0f0]">
                    <div className="flex justify-between items-center text-[12px]">
                      <span className="text-[#64748b] font-medium">Annual Leave Balance:</span>
                      <span className="font-mono font-bold text-emerald-700">
                        {annualBal?.availableDays || 0} / {annualBal?.totalEntitlement || 21}d
                      </span>
                    </div>

                    {/* Progress bar */}
                    <div className="w-full bg-[#f1f5f9] h-2 rounded-full overflow-hidden mt-2">
                      <div className="bg-emerald-500 h-full rounded-full transition-all" style={{ width: `${Math.min(100, 100 - usedPct)}%` }}></div>
                    </div>
                    <div className="text-[10px] text-[#94a3b8] mt-1 text-right">{annualBal?.usedDays || 0} days utilized</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* TAB 3: CALENDAR VIEW */}
        {activeTab === 'calendar' && (
          <div className="p-4 bg-[#f8fafc] rounded-[20px] border border-[#e2e8f0] flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#0a0a0a] text-sm flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-emerald-600" />
                Active Departures for October 2026
              </span>
              <span className="text-xs text-[#64748b]">Showing approved roster</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {leaveRequests
                .filter((r) => r.status === 'approved')
                .map((req) => (
                  <div key={req.id} className="p-3 bg-white rounded-[16px] border border-emerald-100 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-[#0a0a0a] text-xs">{req.employeeName}</div>
                      <div className="text-[11px] text-emerald-700 capitalize font-medium">{req.leaveType} Leave · {req.daysCount} days</div>
                    </div>
                    <span className="font-mono text-xs text-[#64748b] bg-[#f8fafc] px-2 py-1 rounded-md border border-[#e2e8f0]">
                      {req.startDate} to {req.endDate}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>

      {/* Kenyan Labor Law Statutory Entitlements Cards */}
      <div className="bg-[#ffffff] rounded-[24px] border border-[#e5e5e5] p-6 card-shadow">
        <div className="flex items-center gap-2 mb-4">
          <ShieldCheck className="w-5 h-5 text-emerald-600" />
          <h3 className="text-[16px] font-bold text-[#0a0a0a] tracking-tight">
            Kenyan Labor Law Statutory Entitlements (Employment Act 2007)
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-[13px]">
          <div className="p-4 rounded-[18px] bg-emerald-50/50 border border-emerald-200/80">
            <h4 className="font-bold text-emerald-950 text-[14px]">Annual Leave (Sec 28)</h4>
            <p className="mt-1 text-emerald-800/90 leading-relaxed text-xs">
              Every employee is entitled to no less than 21 working days of paid annual leave for every 12 consecutive months of completed service.
            </p>
          </div>
          <div className="p-4 rounded-[18px] bg-purple-50/50 border border-purple-200/80">
            <h4 className="font-bold text-purple-950 text-[14px]">Maternity & Paternity (Sec 29)</h4>
            <p className="mt-1 text-purple-800/90 leading-relaxed text-xs">
              Female employees are entitled to 3 calendar months maternity leave with full pay. Male employees receive 2 weeks (14 calendar days) paternity leave.
            </p>
          </div>
          <div className="p-4 rounded-[18px] bg-sky-50/50 border border-sky-200/80">
            <h4 className="font-bold text-sky-950 text-[14px]">Sick Leave (Sec 30)</h4>
            <p className="mt-1 text-sky-800/90 leading-relaxed text-xs">
              Employees after two consecutive months of service are entitled to up to 30 days of sick leave on full pay, followed by 15 days on half-pay.
            </p>
          </div>
        </div>
      </div>

      {/* Apply Leave Modal */}
      {showApplyModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-60 p-4">
          <div className="bg-[#ffffff] rounded-[24px] border border-[#e5e5e5] max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 card-shadow flex flex-col gap-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#e5e5e5]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700">
                  <CalendarDays className="w-4 h-4" />
                </div>
                <h3 className="text-[18px] font-bold text-[#0a0a0a] tracking-tight">
                  Submit Leave Application
                </h3>
              </div>
              <button
                onClick={() => setShowApplyModal(false)}
                className="p-1.5 rounded-[18px] hover:bg-[#f5f5f5]"
              >
                <X className="w-4 h-4 text-[#737373]" />
              </button>
            </div>

            <form onSubmit={handleApplySubmit} className="space-y-4 text-[13px]">
              <div>
                <label className="text-[12px] font-semibold text-[#0a0a0a] block mb-1">
                  Leave Category *
                </label>
                <select
                  value={leaveForm.leaveType}
                  onChange={(e) => setLeaveForm({ ...leaveForm, leaveType: e.target.value as LeaveType })}
                  className="w-full px-3 py-2 bg-[#f8fafc] border border-[#e2e8f0] rounded-[16px] text-[13px] font-medium"
                >
                  {KENYAN_LEAVE_TYPES_CONFIG.map((c) => (
                    <option key={c.type} value={c.type}>
                      {c.label} ({c.defaultEntitlement} days statutory)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[12px] font-semibold text-[#0a0a0a] block mb-1">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={leaveForm.startDate}
                    onChange={(e) => handleDateChange(e.target.value, leaveForm.endDate)}
                    className="w-full px-3 py-2 bg-[#f8fafc] border border-[#e2e8f0] rounded-[16px] text-[13px] font-medium"
                  />
                </div>
                <div>
                  <label className="text-[12px] font-semibold text-[#0a0a0a] block mb-1">
                    End Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={leaveForm.endDate}
                    onChange={(e) => handleDateChange(leaveForm.startDate, e.target.value)}
                    className="w-full px-3 py-2 bg-[#f8fafc] border border-[#e2e8f0] rounded-[16px] text-[13px] font-medium"
                  />
                </div>
              </div>

              <div className="p-3.5 rounded-[16px] bg-emerald-50/70 border border-emerald-200/80 flex items-center justify-between text-[12px]">
                <span className="text-emerald-800 font-medium">Calculated Working Days:</span>
                <span className="font-mono font-bold text-emerald-950 text-sm">{leaveForm.daysCount} days</span>
              </div>

              <div>
                <label className="text-[12px] font-semibold text-[#0a0a0a] block mb-1">
                  Handover Colleague (Work Coverage)
                </label>
                <select
                  value={leaveForm.handoverId}
                  onChange={(e) => setLeaveForm({ ...leaveForm, handoverId: e.target.value })}
                  className="w-full px-3 py-2 bg-[#f8fafc] border border-[#e2e8f0] rounded-[16px] text-[13px] font-medium"
                >
                  <option value="">Select designated colleague...</option>
                  {employees
                    .filter((e) => e.id !== activePersona.employeeId)
                    .map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.firstName} {emp.lastName} ({emp.jobTitle})
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="text-[12px] font-semibold text-[#0a0a0a] block mb-1">
                  Reason & Purpose of Absence
                </label>
                <textarea
                  rows={2}
                  placeholder="Provide context for manager approval..."
                  value={leaveForm.reason}
                  onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })}
                  className="w-full px-3 py-2 bg-[#f8fafc] border border-[#e2e8f0] rounded-[16px] text-[13px]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#e5e5e5]">
                <button
                  type="button"
                  onClick={() => setShowApplyModal(false)}
                  className="px-4 py-2 rounded-[16px] bg-[#f1f5f9] text-[#0a0a0a] font-semibold hover:bg-[#e2e8f0] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-[16px] bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-xs transition-all"
                >
                  Submit Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {reviewModalRequest && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-60 p-4">
          <div className="bg-[#ffffff] rounded-[24px] border border-[#e5e5e5] max-w-md w-full p-6 card-shadow flex flex-col gap-4">
            <h3 className="text-[18px] font-bold text-[#0a0a0a] tracking-tight">
              Review Leave Application
            </h3>
            <p className="text-[13px] text-[#64748b]">
              Application by <span className="font-bold text-[#0a0a0a]">{reviewModalRequest.employeeName}</span> for{' '}
              <span className="capitalize font-semibold text-emerald-700">{reviewModalRequest.leaveType}</span> leave ({reviewModalRequest.daysCount} days: {reviewModalRequest.startDate} to {reviewModalRequest.endDate}).
            </p>

            <div className="p-3 bg-[#f8fafc] border border-[#e2e8f0] rounded-[14px] text-[12px] text-[#334155] italic">
              "{reviewModalRequest.reason}"
            </div>

            <div>
              <label className="text-[12px] font-semibold text-[#0a0a0a] block mb-1">
                Approver Feedback / Condition
              </label>
              <input
                type="text"
                placeholder="e.g. Approved. Ensure Git PR handovers are complete."
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                className="w-full px-3 py-2 bg-[#f8fafc] border border-[#e2e8f0] rounded-[16px] text-[13px]"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-[#e5e5e5]">
              <button
                onClick={() => setReviewModalRequest(null)}
                className="px-3.5 py-1.5 rounded-[14px] bg-[#f1f5f9] text-[#0a0a0a] text-[13px] font-semibold"
              >
                Close
              </button>
              <button
                onClick={() => {
                  reviewLeaveRequest(reviewModalRequest.id, 'rejected', reviewComment);
                  setReviewModalRequest(null);
                  setReviewComment('');
                }}
                className="px-3.5 py-1.5 rounded-[14px] bg-rose-50 border border-rose-200 text-rose-700 text-[13px] font-semibold hover:bg-rose-100 transition-colors"
              >
                Reject
              </button>
              <button
                onClick={() => {
                  reviewLeaveRequest(reviewModalRequest.id, 'approved', reviewComment);
                  setReviewModalRequest(null);
                  setReviewComment('');
                }}
                className="px-3.5 py-1.5 rounded-[14px] bg-emerald-600 hover:bg-emerald-700 text-white text-[13px] font-semibold shadow-xs transition-colors"
              >
                Approve Leave
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
