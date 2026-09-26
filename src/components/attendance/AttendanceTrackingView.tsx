/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Clock,
  Play,
  Square,
  Coffee,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  MapPin,
  Smartphone,
  Filter,
  Users,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Sparkles,
  Timer,
  Check,
} from 'lucide-react';
import { useHR } from '../../context/HRContext';
import { AttendanceRecord, AttendanceStatus, PunchType } from '../../types/hr';

export const AttendanceTrackingView: React.FC = () => {
  const {
    attendanceRecords,
    shifts,
    employees,
    activePersona,
    userTodayAttendance,
    clockIn,
    clockOut,
    toggleBreak,
    holidays,
    canPerformAction,
  } = useHR();

  const [filterDepartment, setFilterDepartment] = useState('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [punchLocation, setPunchLocation] = useState('Nairobi HQ - Upper Hill Turnstile 1');

  const todayStr = '2026-09-25';

  const isClockedIn = !!userTodayAttendance?.clockIn && !userTodayAttendance?.clockOut;
  const lastPunch = userTodayAttendance?.punches?.[userTodayAttendance.punches.length - 1];
  const isOnBreak = lastPunch?.type === 'break_start';

  // Metrics calculation for today
  const todayRecords = attendanceRecords.filter((a) => a.date === todayStr);
  const presentCount = todayRecords.filter((a) => a.status === 'present').length;
  const lateCount = todayRecords.filter((a) => a.status === 'late').length;
  const onLeaveCount = todayRecords.filter((a) => a.status === 'on_leave').length;
  const totalTracked = employees.length;
  const absentCount = Math.max(0, totalTracked - (presentCount + lateCount + onLeaveCount));

  // Filtered attendance log
  const filteredRecords = todayRecords.filter((record) => {
    const emp = employees.find((e) => e.id === record.employeeId);
    if (!emp) return false;

    const matchDept = filterDepartment === 'all' || emp.department === filterDepartment;
    const matchStatus = filterStatus === 'all' || record.status === filterStatus;
    return matchDept && matchStatus;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto flex flex-col gap-6 sm:gap-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2 border-b border-[#e5e5e5]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-[30px] font-bold text-emerald-700 tracking-tight leading-tight whitespace-nowrap">
              Attendance & Time Tracking
            </h1>
            <span className="text-[11px] font-mono text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full whitespace-nowrap">
              East Africa Time (UTC+3)
            </span>
          </div>
          <p className="text-[14px] text-[#737373] mt-1">
            Biometric turnstile logs, automated shift rosters, and Kenya Employment Act daily work hour tracking.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 text-[13px] font-mono bg-white border border-[#e2e8f0] px-3.5 py-2 rounded-[18px] card-shadow text-[#0a0a0a]">
            <Calendar className="w-4 h-4 text-emerald-600" />
            <span className="font-semibold">Friday, 25 September 2026</span>
          </div>
        </div>
      </div>

      {/* Terminal Card: Live User Punching Box */}
      <div className="bg-[#ffffff] rounded-[24px] border border-[#e5e5e5] p-6 card-shadow flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
        {/* Soft background glow */}
        <div className="absolute right-0 top-0 w-80 h-full bg-gradient-to-l from-emerald-50/50 to-transparent pointer-events-none" />

        <div className="flex items-center gap-4 z-10">
          <div className="relative">
            <img
              src={activePersona.avatar}
              alt={activePersona.name}
              className="w-14 h-14 rounded-full object-cover border-2 border-emerald-500 shadow-sm"
            />
            {isClockedIn ? (
              <span className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-emerald-500 ring-2 ring-white animate-pulse" />
            ) : (
              <span className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-slate-300 ring-2 ring-white" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-[18px] font-bold text-[#0a0a0a] tracking-tight">
                {activePersona.name}
              </h2>
              <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                {activePersona.roleLabel}
              </span>
            </div>
            <div className="text-[13px] text-[#64748b] mt-0.5 flex items-center gap-1.5">
              <span>Shift:</span>
              <span className="text-[#0a0a0a] font-semibold">Nairobi Standard (08:30 - 17:00 EAT)</span>
              {isClockedIn && (
                <span className="ml-1 text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md font-bold">
                  • Clocked In at {userTodayAttendance?.clockIn}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Punch Controls & Live Status */}
        <div className="flex flex-wrap items-center gap-3 z-10">
          <div className="flex items-center gap-2 text-[13px] bg-[#f8fafc] border border-[#e2e8f0] px-3 py-1.5 rounded-[18px]">
            <MapPin className="w-3.5 h-3.5 text-emerald-600" />
            <select
              value={punchLocation}
              onChange={(e) => setPunchLocation(e.target.value)}
              className="bg-transparent text-[#0a0a0a] text-[12px] font-semibold border-none focus:outline-hidden cursor-pointer"
            >
              <option value="Nairobi HQ - Upper Hill Turnstile 1">Nairobi HQ - Upper Hill Turnstile 1</option>
              <option value="Nairobi HQ - Gate A Biometrics">Nairobi HQ - Gate A Biometrics</option>
              <option value="Mombasa Coastal Hub - Nyali">Mombasa Coastal Hub - Nyali</option>
              <option value="Remote / Geofence Mobile Punch">Remote / Geofence Mobile Punch</option>
            </select>
          </div>

          {!isClockedIn ? (
            <button
              onClick={() => clockIn(activePersona.employeeId, punchLocation)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-[18px] bg-emerald-600 hover:bg-emerald-700 text-white text-[13px] font-bold shadow-md shadow-emerald-600/25 transition-all transform active:scale-95"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Clock In Now</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => toggleBreak(activePersona.employeeId)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-[18px] text-[13px] font-semibold transition-all ${
                  isOnBreak
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
                }`}
              >
                <Coffee className="w-4 h-4" />
                <span>{isOnBreak ? 'Resume Work' : 'Take Break'}</span>
              </button>

              <button
                onClick={() => clockOut(activePersona.employeeId, punchLocation)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-[18px] bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 text-[13px] font-semibold transition-all shadow-xs"
              >
                <Square className="w-4 h-4 fill-current" />
                <span>Clock Out</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* SmartHR-Inspired Multi-Accent Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Present Card */}
        <div className="bg-[#ffffff] rounded-[24px] border border-[#e5e5e5] p-5 card-shadow flex flex-col justify-between hover:border-emerald-200 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[12px] font-bold uppercase tracking-wider text-[#64748b]">
              Present Today
            </span>
            <div className="w-10 h-10 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-[36px] font-bold tracking-tight text-[#0a0a0a] font-mono leading-none">
              {presentCount}
            </div>
            <div className="text-[12px] text-emerald-700 font-semibold mt-2 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>{Math.round((presentCount / totalTracked) * 100)}% punctuality rate</span>
            </div>
          </div>
        </div>

        {/* Tardy Card */}
        <div className="bg-[#ffffff] rounded-[24px] border border-[#e5e5e5] p-5 card-shadow flex flex-col justify-between hover:border-amber-200 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[12px] font-bold uppercase tracking-wider text-[#64748b]">
              Tardy / Late Clock-ins
            </span>
            <div className="w-10 h-10 rounded-full bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-[36px] font-bold tracking-tight text-[#0a0a0a] font-mono leading-none">
              {lateCount}
            </div>
            <div className="text-[12px] text-amber-700 font-medium mt-2">
              Traffic delay grace: 15 mins
            </div>
          </div>
        </div>

        {/* On Leave Card */}
        <div className="bg-[#ffffff] rounded-[24px] border border-[#e5e5e5] p-5 card-shadow flex flex-col justify-between hover:border-sky-200 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[12px] font-bold uppercase tracking-wider text-[#64748b]">
              On Authorized Leave
            </span>
            <div className="w-10 h-10 rounded-full bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-[36px] font-bold tracking-tight text-[#0a0a0a] font-mono leading-none">
              {onLeaveCount}
            </div>
            <div className="text-[12px] text-sky-700 font-medium mt-2">
              Statutory sick & annual leaves
            </div>
          </div>
        </div>

        {/* Absent Card */}
        <div className="bg-[#ffffff] rounded-[24px] border border-[#e5e5e5] p-5 card-shadow flex flex-col justify-between hover:border-rose-200 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[12px] font-bold uppercase tracking-wider text-[#64748b]">
              Pending / Unmarked
            </span>
            <div className="w-10 h-10 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600">
              <Timer className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-[36px] font-bold tracking-tight text-[#0a0a0a] font-mono leading-none">
              {absentCount}
            </div>
            <div className="text-[12px] text-rose-700 font-medium mt-2">
              Awaiting gate turnstile sync
            </div>
          </div>
        </div>
      </div>

      {/* Main Content: Attendance Roster Table */}
      <div className="bg-[#ffffff] rounded-[24px] border border-[#e5e5e5] p-6 card-shadow flex flex-col gap-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#e5e5e5]">
          <div>
            <h3 className="text-[18px] font-bold text-[#0a0a0a] tracking-tight">
              Daily Attendance Roster & Punch Verification
            </h3>
            <p className="text-[13px] text-[#737373] mt-0.5">
              Verified timestamps with Kenyan statutory overtime calculation and biometric location audit.
            </p>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
              className="bg-[#f8fafc] text-[#0a0a0a] px-3 py-1.5 rounded-[16px] text-[12px] border border-[#e2e8f0] font-medium"
            >
              <option value="all">All Departments</option>
              <option value="Software Engineering">Software Engineering</option>
              <option value="Product & Design">Product & Design</option>
              <option value="People Operations">People Operations</option>
              <option value="Enterprise Commercial & Growth">Enterprise Commercial</option>
              <option value="Finance & Compliance">Finance & Compliance</option>
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-[#f8fafc] text-[#0a0a0a] px-3 py-1.5 rounded-[16px] text-[12px] border border-[#e2e8f0] font-medium"
            >
              <option value="all">All Statuses</option>
              <option value="present">Present</option>
              <option value="late">Late</option>
              <option value="on_leave">On Leave</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#e5e5e5] text-[11px] uppercase tracking-wider text-[#737373] bg-[#f8fafc]">
                <th className="py-3 px-3 font-semibold rounded-l-lg">Employee</th>
                <th className="py-3 px-3 font-semibold">Shift</th>
                <th className="py-3 px-3 font-semibold">Clock In</th>
                <th className="py-3 px-3 font-semibold">Clock Out</th>
                <th className="py-3 px-3 font-semibold">Work Time</th>
                <th className="py-3 px-3 font-semibold">Status</th>
                <th className="py-3 px-3 font-semibold rounded-r-lg">Last Punch Terminal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f1f5f9] text-[13px]">
              {filteredRecords.map((rec) => {
                const emp = employees.find((e) => e.id === rec.employeeId);
                if (!emp) return null;

                const lastPunchItem = rec.punches[rec.punches.length - 1];

                return (
                  <tr key={rec.id} className="hover:bg-[#f8fafc] transition-colors">
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={emp.avatar}
                          alt={emp.firstName}
                          className="w-8 h-8 rounded-full object-cover border border-[#e5e5e5]"
                        />
                        <div>
                          <div className="font-bold text-[#0a0a0a]">
                            {emp.firstName} {emp.lastName}
                          </div>
                          <div className="text-[11px] font-mono text-[#64748b]">
                            {emp.employeeCode} · {emp.department}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-3 text-[#64748b] text-[12px] font-medium">
                      {rec.shiftName}
                    </td>

                    <td className="py-3.5 px-3 font-mono text-[12px] text-[#0a0a0a] font-semibold">
                      {rec.clockIn || '—'}
                    </td>

                    <td className="py-3.5 px-3 font-mono text-[12px] text-[#64748b]">
                      {rec.clockOut || (
                        <span className="text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md text-[11px]">
                          Active Shift
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-3 font-mono text-[12px] text-[#0a0a0a]">
                      {rec.totalWorkMinutes > 0 ? (
                        <span className="font-bold bg-[#f1f5f9] px-2 py-0.5 rounded-md">
                          {Math.floor(rec.totalWorkMinutes / 60)}h {rec.totalWorkMinutes % 60}m
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>

                    <td className="py-3.5 px-3">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold capitalize ${
                          rec.status === 'present'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : rec.status === 'late'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : rec.status === 'on_leave'
                            ? 'bg-sky-50 text-sky-700 border border-sky-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {rec.status.replace('_', ' ')}
                      </span>
                    </td>

                    <td className="py-3.5 px-3 text-[12px] text-[#64748b]">
                      {lastPunchItem ? (
                        <div className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                          <span className="font-medium text-[#0a0a0a]">{lastPunchItem.location}</span>
                          <span className="font-mono text-[11px] text-[#94a3b8]">({lastPunchItem.timestamp})</span>
                        </div>
                      ) : (
                        '—'
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Kenyan Shift Policies & Upcoming Gazetted Public Holidays */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Shifts List */}
        <div className="bg-[#ffffff] rounded-[24px] border border-[#e5e5e5] p-6 card-shadow flex flex-col gap-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#e5e5e5]">
            <h3 className="text-[16px] font-bold text-[#0a0a0a] tracking-tight">
              Configured Shift Schedules
            </h3>
            <span className="text-[11px] font-mono text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              Kenyan 45-hr Statutory Week
            </span>
          </div>

          <div className="space-y-3">
            {shifts.map((shift) => (
              <div
                key={shift.id}
                className="p-3.5 rounded-[18px] bg-[#f8fafc] border border-[#e2e8f0] flex items-center justify-between hover:border-emerald-200 transition-all"
              >
                <div>
                  <div className="text-[13px] font-bold text-[#0a0a0a]">{shift.name}</div>
                  <div className="text-[12px] text-[#64748b] mt-0.5">
                    {shift.startTime} – {shift.endTime} EAT ({shift.workDays.join(', ')})
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[11px] font-mono font-bold text-emerald-800 bg-emerald-100 border border-emerald-200 px-2 py-0.5 rounded-full">
                    {shift.assignedEmployeesCount} staff
                  </span>
                  <div className="text-[11px] text-[#64748b] mt-1 font-medium">
                    Grace: {shift.graceMinutes}m
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Kenya Gazetted Holidays */}
        <div className="bg-[#ffffff] rounded-[24px] border border-[#e5e5e5] p-6 card-shadow flex flex-col gap-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#e5e5e5]">
            <h3 className="text-[16px] font-bold text-[#0a0a0a] tracking-tight">
              Gazetted Kenyan Public Holidays
            </h3>
            <span className="text-[11px] text-[#64748b]">Public Holidays Act (Cap 110)</span>
          </div>

          <div className="space-y-2.5 max-h-64 overflow-y-auto">
            {holidays.map((h) => (
              <div
                key={h.date}
                className="py-2.5 px-3 rounded-[16px] bg-[#f8fafc] border border-[#e2e8f0] flex items-center justify-between text-[13px]"
              >
                <div>
                  <div className="font-semibold text-[#0a0a0a]">{h.name}</div>
                  <div className="text-[11px] text-emerald-700 capitalize font-medium">{h.type} holiday</div>
                </div>
                <span className="font-mono text-[12px] text-[#64748b] font-semibold bg-white px-2 py-0.5 rounded-md border border-[#e2e8f0]">
                  {h.date}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
