/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  Users,
  UserCheck,
  TrendingUp,
  Clock,
  CalendarDays,
  ArrowUpRight,
  ShieldCheck,
  Building2,
  Banknote,
  Award,
  Briefcase,
  ArrowDownRight,
  Calendar,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { motion } from 'motion/react';
import { useHR } from '../../context/HRContext';

export const OverviewDashboard: React.FC = () => {
  const {
    employees,
    departments,
    onboardingRecords,
    offboardingRecords,
    attendanceRecords,
    leaveRequests,
    payrollCycles,
    candidates,
    jobOpenings,
    setCurrentTab,
    setSelectedEmployee,
    setIsAddModalOpen,
    canPerformAction,
  } = useHR();

  const todayStr = '2026-09-25';

  // Metrics calculation
  const totalEmployees = employees.length;
  const activeEmployees = employees.filter((e) => e.status === 'active').length;
  const probationEmployees = employees.filter((e) => e.status === 'probation').length;
  const onLeaveEmployees = employees.filter((e) => e.status === 'on_leave').length;
  const contractEmployees = employees.filter((e) => e.employmentType === 'contract').length;
  const fullTimeEmployees = employees.filter((e) => e.employmentType === 'full_time').length;
  const activeOnboarding = onboardingRecords.filter((r) => r.status === 'in_progress').length;
  const totalOpenPositions = departments.reduce((acc, d) => acc + d.openPositions, 0);

  // Today attendance
  const todayRecords = attendanceRecords.filter((a) => a.date === todayStr);
  const presentToday = todayRecords.filter((a) => a.status === 'present').length;
  const lateToday = todayRecords.filter((a) => a.isLate).length;
  const pendingLeaves = leaveRequests.filter((l) => l.status === 'pending').length;

  // Recent hires (sorted by joiningDate desc)
  const recentHires = [...employees]
    .sort((a, b) => new Date(b.joiningDate).getTime() - new Date(a.joiningDate).getTime())
    .slice(0, 5);

  const activePayroll = payrollCycles[0];

  // Weekly hours logged data (simulated Mon - Sun)
  const weeklyHours = [
    { day: 'Mon', hours: 38, pct: 95 },
    { day: 'Tue', hours: 41, pct: 100 },
    { day: 'Wed', hours: 39, pct: 97 },
    { day: 'Thu', hours: 40, pct: 100 },
    { day: 'Fri', hours: 36, pct: 90 },
    { day: 'Sat', hours: 8, pct: 20 },
    { day: 'Sun', hours: 0, pct: 0 },
  ];

  // Department colors for bar segments
  const deptColors = [
    { bg: 'bg-emerald-500', text: 'text-emerald-700' },
    { bg: 'bg-teal-500', text: 'text-teal-700' },
    { bg: 'bg-sky-500', text: 'text-sky-700' },
    { bg: 'bg-indigo-500', text: 'text-indigo-700' },
    { bg: 'bg-amber-500', text: 'text-amber-700' },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto flex flex-col gap-6 sm:gap-8">
      {/* Top Banner & Quick Context */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2 border-b border-slate-200/90">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl md:text-3xl font-extrabold text-emerald-700 tracking-tight whitespace-nowrap">
              Semplo Workforce Overview
            </h1>
          </div>
          <p className="text-[13px] text-slate-500 mt-1">
            Real-time biometric attendance, Kenyan statutory leave accruals, KRA PAYE compliance, and talent pipeline.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {canPerformAction('department_lead') && (
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-3.5 py-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-[13px] font-semibold transition-all shadow-sm shadow-emerald-600/30 flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer active:scale-95"
            >
              <span>+ Add New Hire</span>
            </button>
          )}
          <button
            onClick={() => setCurrentTab('attendance')}
            className="px-3.5 py-2 rounded-2xl bg-white border border-slate-200/90 hover:border-emerald-300 text-slate-700 hover:text-emerald-700 text-[13px] font-medium transition-all shadow-xs flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer active:scale-95"
          >
            <Clock className="w-3.5 h-3.5 text-sky-500" />
            <span>Attendance Terminal</span>
          </button>
          <button
            onClick={() => setCurrentTab('payroll')}
            className="px-3.5 py-2 rounded-2xl bg-white border border-slate-200/90 hover:border-emerald-300 text-slate-700 hover:text-emerald-700 text-[13px] font-medium transition-all shadow-xs flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer active:scale-95"
          >
            <Banknote className="w-3.5 h-3.5 text-purple-500" />
            <span>Payroll & KRA</span>
          </button>
        </div>
      </div>

      {/* Primary Stat Blocks with Rich Colored Icons & Trend Badges (SmartHR & TeamHub Style) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Total Employees (Orange/Coral Accent) */}
        <div className="liquid-glass-card rounded-2xl p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="w-11 h-11 rounded-2xl bg-orange-50 border border-orange-200/60 flex items-center justify-center text-orange-600 shadow-2xs">
              <Users className="w-5 h-5" />
            </div>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold font-mono text-emerald-700 bg-emerald-50 border border-emerald-200 whitespace-nowrap">
              <TrendingUp className="w-3 h-3" />
              <span>{totalEmployees > 0 ? '+18%' : 'New'}</span>
            </span>
          </div>

          <div className="mt-3">
            <div className="text-[12px] font-semibold text-slate-500 whitespace-nowrap">
              Total Workforce
            </div>
            <div className="text-3xl font-extrabold text-slate-900 mt-0.5 tracking-tight font-sans">
              {totalEmployees}
            </div>
          </div>

          {/* Segmented mini progress bar */}
          <div className="mt-3 pt-3 border-t border-slate-100 flex flex-col gap-1.5">
            <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden flex">
              <div
                className="h-full bg-emerald-500"
                style={{ width: `${totalEmployees > 0 ? Math.round((fullTimeEmployees / totalEmployees) * 100) : 0}%` }}
                title="Full-Time"
              />
              <div
                className="h-full bg-sky-500"
                style={{ width: `${totalEmployees > 0 ? Math.round((contractEmployees / totalEmployees) * 100) : 0}%` }}
                title="Contract"
              />
              <div
                className="h-full bg-amber-400"
                style={{ width: `${totalEmployees > 0 ? Math.round((probationEmployees / totalEmployees) * 100) : 0}%` }}
                title="Probation"
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-500 whitespace-nowrap">
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span>{fullTimeEmployees} Full-Time</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                <span>{probationEmployees} Probation</span>
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: Attendance Rate (Sky/Cyan Accent) */}
        <div className="liquid-glass-card rounded-2xl p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="w-11 h-11 rounded-2xl bg-sky-50 border border-sky-200/60 flex items-center justify-center text-sky-600 shadow-2xs">
              <Clock className="w-5 h-5" />
            </div>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold font-mono text-sky-700 bg-sky-50 border border-sky-200 whitespace-nowrap">
              <span>Today EAT</span>
            </span>
          </div>

          <div className="mt-3">
            <div className="text-[12px] font-semibold text-slate-500 whitespace-nowrap">
              Attendance Today
            </div>
            <div className="text-3xl font-extrabold text-slate-900 mt-0.5 tracking-tight font-sans">
              {totalEmployees > 0 ? Math.round((presentToday / totalEmployees) * 100) : 0}%
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] whitespace-nowrap">
            <span className="text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
              {presentToday} Present
            </span>
            <span className="text-amber-700 font-semibold bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200">
              {lateToday} Delayed
            </span>
            <button
              onClick={() => setCurrentTab('attendance')}
              className="text-slate-600 hover:text-emerald-700 font-medium underline cursor-pointer"
            >
              Turnstiles
            </button>
          </div>
        </div>

        {/* Card 3: Leaves & Accruals (Emerald Accent) */}
        <div className="liquid-glass-card rounded-2xl p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="w-11 h-11 rounded-2xl bg-emerald-50 border border-emerald-200/60 flex items-center justify-center text-emerald-600 shadow-2xs">
              <CalendarDays className="w-5 h-5" />
            </div>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold font-mono text-emerald-800 bg-emerald-50 border border-emerald-200 whitespace-nowrap">
              Statutory 21d
            </span>
          </div>

          <div className="mt-3">
            <div className="text-[12px] font-semibold text-slate-500 whitespace-nowrap">
              Leave Requests Queue
            </div>
            <div className="text-3xl font-extrabold text-slate-900 mt-0.5 tracking-tight font-sans">
              {pendingLeaves}
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] whitespace-nowrap">
            <span className="text-slate-500">
              {onLeaveEmployees} currently on leave
            </span>
            <button
              onClick={() => setCurrentTab('leaves')}
              className="px-2.5 py-0.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition-colors cursor-pointer"
            >
              Review
            </button>
          </div>
        </div>

        {/* Card 4: Total Payroll Outflow (Purple/Violet Accent) */}
        <div className="liquid-glass-card rounded-2xl p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="w-11 h-11 rounded-2xl bg-purple-50 border border-purple-200/60 flex items-center justify-center text-purple-600 shadow-2xs">
              <Banknote className="w-5 h-5" />
            </div>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold font-mono text-purple-700 bg-purple-50 border border-purple-200 whitespace-nowrap">
              KES Outflow
            </span>
          </div>

          <div className="mt-3">
            <div className="text-[12px] font-semibold text-slate-500 whitespace-nowrap">
              Monthly Net Payout
            </div>
            <div className="text-2xl font-extrabold text-slate-900 mt-0.5 tracking-tight font-mono">
              KES {activePayroll ? (activePayroll.totalNetPay / 1000000).toFixed(2) : (totalEmployees === 0 ? '0.00' : '3.82')}M
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] whitespace-nowrap">
            <span className="text-emerald-700 font-medium flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>KRA / SHIF Compliant</span>
            </span>
            <button
              onClick={() => setCurrentTab('payroll')}
              className="text-purple-700 hover:text-purple-900 font-semibold underline cursor-pointer"
            >
              Slips
            </button>
          </div>
        </div>
      </div>

      {/* Middle Row: Visual Data & Leave Donuts (Inspired by TeamHub Image 1) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left (2 cols): Hours Logged & Weekly Trend Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
                  <span>Weekly Hours Logged & Productivity</span>
                  <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    This Week · 34.30h Avg
                  </span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Aggregated biometric punch records across Nairobi Upper Hill & regional branches.
                </p>
              </div>
              <button
                onClick={() => setCurrentTab('attendance')}
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
              >
                <span>Full Timesheet</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Vertical Bar Chart visualization (TeamHub style) */}
            <div className="mt-6 flex items-end justify-between gap-4 h-44 px-4 pb-2 border-b border-slate-100">
              {weeklyHours.map((bar, i) => (
                <div key={bar.day} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                  <span className="text-[10px] font-mono font-semibold text-slate-400 group-hover:text-emerald-700 transition-colors">
                    {bar.hours}h
                  </span>
                  <div className="w-full max-w-[42px] bg-slate-100 rounded-t-xl overflow-hidden h-full flex items-end">
                    <div
                      className={`w-full rounded-t-xl transition-all duration-500 ${
                        i === 3
                          ? 'bg-gradient-to-t from-emerald-600 to-teal-500 shadow-sm shadow-emerald-500/30'
                          : i % 2 === 0
                          ? 'bg-gradient-to-t from-emerald-400 to-teal-300'
                          : 'bg-emerald-300'
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

          <div className="mt-4 pt-3 flex flex-wrap items-center justify-between text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500"></span>
              <span>Standard Shift: 8.5 Hours/day</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-teal-300"></span>
              <span>Grace Period: 15 mins</span>
            </span>
            <span className="font-mono text-emerald-700 font-semibold">
              99.2% Data Integrity
            </span>
          </div>
        </div>

        {/* Right (1 col): Statutory Leave Donuts & Allowance Balances (TeamHub Image 1) */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900 tracking-tight">
                  Leave Balances & Accruals
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Kenyan statutory policy allowances.
                </p>
              </div>
              <button
                onClick={() => setCurrentTab('leaves')}
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-800"
              >
                Apply
              </button>
            </div>

            {/* Circular rings grid */}
            <div className="mt-5 grid grid-cols-2 gap-4">
              {/* Ring 1: Annual Leave */}
              <div className="p-3.5 bg-emerald-50/50 rounded-2xl border border-emerald-100 flex flex-col items-center text-center">
                <div className="relative w-16 h-16 flex items-center justify-center">
                  <svg className="w-16 h-16 -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-emerald-100"
                      strokeWidth="3.5"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className="text-emerald-600 transition-all duration-1000"
                      strokeDasharray="76, 100"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <span className="absolute text-xs font-extrabold font-mono text-emerald-900">
                    16d
                  </span>
                </div>
                <div className="text-xs font-bold text-slate-800 mt-2">Annual Leave</div>
                <div className="text-[10px] text-emerald-700 font-medium">16 of 21 remaining</div>
              </div>

              {/* Ring 2: Sick Leave */}
              <div className="p-3.5 bg-sky-50/50 rounded-2xl border border-sky-100 flex flex-col items-center text-center">
                <div className="relative w-16 h-16 flex items-center justify-center">
                  <svg className="w-16 h-16 -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-sky-100"
                      strokeWidth="3.5"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className="text-sky-500 transition-all duration-1000"
                      strokeDasharray="93, 100"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <span className="absolute text-xs font-extrabold font-mono text-sky-900">
                    28d
                  </span>
                </div>
                <div className="text-xs font-bold text-slate-800 mt-2">Paid Sick Leave</div>
                <div className="text-[10px] text-sky-700 font-medium">28 of 30 remaining</div>
              </div>
            </div>

            {/* Compassionate & Paternity/Maternity bar */}
            <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between text-xs">
              <span className="text-slate-600 font-medium">Compassionate Leave:</span>
              <span className="font-mono font-bold text-emerald-800">5 Days Available</span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100">
            <button
              onClick={() => setCurrentTab('leaves')}
              className="w-full py-2 rounded-xl bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
            >
              <span>Manage Organization Leave Calendar</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Department Distribution & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Department Breakdown (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900 tracking-tight">
                  Department Headcount & Allocation
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Active department leads and open hiring requisitions.
                </p>
              </div>
              <button
                onClick={() => setCurrentTab('departments')}
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
              >
                <span>View All</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {departments.length === 0 ? (
              <div className="py-10 text-center text-slate-400 text-[13px] flex flex-col items-center justify-center gap-2">
                <Building2 className="w-8 h-8 text-slate-300" />
                <span>No departments created yet. Go to Departments to create your organization's structure.</span>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 mt-2">
                {departments.map((dept, index) => {
                  const pct = totalEmployees > 0 ? Math.round((dept.headcount / totalEmployees) * 100) : 0;
                  const colorObj = deptColors[index % deptColors.length];
                  return (
                    <div key={dept.id} className="py-3.5 flex flex-col gap-1.5">
                      <div className="flex items-center justify-between text-[13px]">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">{dept.name}</span>
                          <span className="text-[11px] font-mono text-slate-400">({dept.code})</span>
                          <span aria-hidden="true" className="text-slate-300">·</span>
                          <span className="text-[12px] text-slate-500">Lead: {dept.leadName}</span>
                        </div>
                        <div className="flex items-center gap-3 text-xs">
                          <span className="font-bold font-mono text-slate-900">{dept.headcount} staff</span>
                          <span className="text-[11px] font-mono text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full font-semibold">
                            {dept.openPositions} open role{dept.openPositions !== 1 ? 's' : ''}
                          </span>
                        </div>
                      </div>

                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div
                          className={`${colorObj.bg} h-full rounded-full transition-all duration-500`}
                          style={{ width: `${pct}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-100 mt-4 flex flex-wrap items-center justify-between text-xs text-slate-500">
            <span>Total Annual Budget: <strong className="font-mono text-slate-800">KES 115.2M</strong></span>
            <span className="text-emerald-700 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Kenya Statutory Compliance: 100% (PAYE, NSSF, SHIF, AHL)</span>
            </span>
          </div>
        </div>

        {/* Right Column: ATS & Quick Recruiter Radar */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900 tracking-tight">
                  Talent Acquisition & ATS
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Screening & interviews in progress.
                </p>
              </div>
              <button
                onClick={() => setCurrentTab('recruitment')}
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
              >
                <span>Pipeline</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="mt-4 flex flex-col gap-3">
              <div className="p-3.5 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-emerald-950">Active Job Openings</div>
                  <div className="text-[11px] text-emerald-700">Engineering & Growth Roles</div>
                </div>
                <span className="text-lg font-mono font-extrabold text-emerald-700">
                  {jobOpenings.filter((j) => j.status === 'active').length}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-gradient-to-r from-sky-50 to-blue-50 border border-sky-100 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-sky-950">Candidates In Pipeline</div>
                  <div className="text-[11px] text-sky-700">Screening, Tech Tests & Offer</div>
                </div>
                <span className="text-lg font-mono font-extrabold text-sky-700">
                  {candidates.length}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-gradient-to-r from-purple-50 to-violet-50 border border-purple-100 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-purple-950">Active Onboarding</div>
                  <div className="text-[11px] text-purple-700">30-Day Induction Program</div>
                </div>
                <span className="text-lg font-mono font-extrabold text-purple-700">
                  {activeOnboarding}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100">
            <button
              onClick={() => setCurrentTab('recruitment')}
              className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-all shadow-xs"
            >
              Open ATS Hiring Board
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Table: Personnel Roster with Colorful Badges */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Recently Added Personnel (Kenya)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Latest recruits and their statutory onboarding readiness.
            </p>
          </div>
          <button
            onClick={() => setCurrentTab('employees')}
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
          >
            <span>View Full Directory ({employees.length})</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto mt-2">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
                <th className="py-3 px-3">Employee</th>
                <th className="py-3 px-3">Department</th>
                <th className="py-3 px-3">Location</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Joined Date</th>
                <th className="py-3 px-3">Supervisor</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentHires.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 text-xs">
                    <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <span>No personnel recorded yet. Click "+ Add New Hire" to register your first team member.</span>
                  </td>
                </tr>
              ) : (
                recentHires.map((emp) => (
                  <tr key={emp.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={emp.avatar}
                          alt={emp.firstName}
                          className="w-8 h-8 rounded-full object-cover ring-2 ring-emerald-500/20"
                        />
                        <div>
                          <div className="font-bold text-slate-900 whitespace-nowrap">
                            {emp.firstName} {emp.lastName}
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono whitespace-nowrap">
                            {emp.employeeCode} · {emp.jobTitle}
                          </div>
                        </div>
                      </div>
                    </td>
                  <td className="py-3 px-3 font-medium text-slate-700">{emp.department}</td>
                  <td className="py-3 px-3 text-slate-500">{emp.location}</td>
                  <td className="py-3 px-3">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono capitalize border ${
                        emp.status === 'active'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : emp.status === 'probation'
                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                          : emp.status === 'on_leave'
                          ? 'bg-sky-50 text-sky-800 border-sky-200'
                          : 'bg-rose-50 text-rose-800 border-rose-200'
                      }`}
                    >
                      {emp.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-500 font-mono">
                    {emp.joiningDate}
                  </td>
                  <td className="py-3 px-3 text-slate-600">
                    {emp.managerName || 'Executive'}
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => setSelectedEmployee(emp)}
                      className="px-3 py-1 rounded-xl bg-slate-100 hover:bg-emerald-600 hover:text-white text-slate-700 text-xs font-semibold transition-all shadow-2xs"
                    >
                      Inspect Profile
                    </button>
                  </td>
                </tr>
              )))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
