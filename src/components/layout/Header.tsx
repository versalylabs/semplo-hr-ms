import React, { useState } from 'react';
import {
  ChevronRight,
  Search,
  Plus,
  Bell,
  CheckCircle2,
  AlertCircle,
  Clock,
  Play,
  Square,
  Coffee,
  Calendar,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { useHR } from '../../context/HRContext';

const TAB_TITLES: Record<string, string> = {
  dashboard: 'Overview Dashboard',
  self_service: 'Employee Portal (ESS)',
  company_hub: 'Company Hub & Notices',
  employees: 'Employee Directory',
  attendance: 'Time & Attendance Terminal',
  leaves: 'Leave Management & Balances',
  payroll: 'Payroll & Statutory Deductions',
  appraisals: 'Performance & OKRs',
  recruitment: 'Recruitment & ATS',
  onboarding: 'Lifecycle Management',
  departments: 'Department Allocations',
  org_chart: 'Organizational Hierarchy',
  audit: 'Audit & Compliance Trail',
};

export const Header: React.FC = () => {
  const {
    currentTab,
    setCurrentTab,
    setIsCommandPaletteOpen,
    setIsAddModalOpen,
    canPerformAction,
    activePersona,
    userTodayAttendance,
    clockIn,
    clockOut,
    toggleBreak,
    onboardingRecords,
    offboardingRecords,
    leaveRequests,
    employees,
    currentUser,
    logout,
    setIsMobileSidebarOpen,
  } = useHR();

  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // Generate actionable notifications
  const pendingOnboardingTasks = onboardingRecords.flatMap((r) =>
    r.tasks.filter((t) => !t.isCompleted).map((t) => ({ ...t, recordId: r.id }))
  );
  const pendingLeaves = leaveRequests.filter((l) => l.status === 'pending');
  const pendingOffboarding = offboardingRecords.filter((o) => o.status !== 'completed');

  const totalNotifications =
    pendingOnboardingTasks.length + pendingLeaves.length + pendingOffboarding.length;

  const isClockedIn = !!userTodayAttendance?.clockIn && !userTodayAttendance?.clockOut;
  const lastPunch = userTodayAttendance?.punches?.[userTodayAttendance.punches.length - 1];
  const isOnBreak = lastPunch?.type === 'break_start';

  return (
    <header className="h-16 px-3 sm:px-6 lg:px-8 border-b border-slate-200/80 bg-[#ffffff] flex items-center justify-between sticky top-0 z-30 shadow-xs">
      {/* Left Section: Mobile Menu Button & Breadcrumb */}
      <div className="flex items-center gap-2 min-w-0">
        <button
          onClick={() => setIsMobileSidebarOpen(true)}
          className="lg:hidden p-2 -ml-1 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors shrink-0"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-1.5 sm:gap-2.5 text-[13px] sm:text-[14px] min-w-0">
          <div className="hidden sm:flex items-center gap-1.5 text-slate-500 font-medium shrink-0">
            <span className="text-emerald-700 font-bold">Semplo</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
          </div>
          <span className="font-bold text-slate-900 tracking-tight truncate max-w-[130px] xs:max-w-[170px] sm:max-w-[260px] md:max-w-none">
            {TAB_TITLES[currentTab] || 'Dashboard'}
          </span>
        </div>
      </div>

      {/* Middle & Right Header Actions */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Quick Punch Terminal in Header for current user (hidden on small phones) */}
        <div className="hidden md:flex items-center bg-slate-50/90 p-1 rounded-2xl border border-slate-200 text-[12px]">
          {!isClockedIn ? (
            <button
              onClick={() => clockIn(activePersona.employeeId)}
              className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition-all shadow-xs whitespace-nowrap"
            >
              <Play className="w-3 h-3 fill-current" />
              <span>Clock In</span>
            </button>
          ) : (
            <div className="flex items-center gap-1">
              <span className="text-[11px] font-mono text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200/70 font-semibold whitespace-nowrap">
                In: {userTodayAttendance.clockIn}
              </span>

              <button
                onClick={() => toggleBreak(activePersona.employeeId)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-xl font-medium transition-colors whitespace-nowrap ${
                  isOnBreak
                    ? 'bg-amber-500 text-white font-semibold'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                }`}
                title={isOnBreak ? 'End Break' : 'Take Break'}
              >
                <Coffee className="w-3 h-3" />
                <span>{isOnBreak ? 'On Break' : 'Break'}</span>
              </button>

              <button
                onClick={() => clockOut(activePersona.employeeId)}
                className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-semibold transition-colors whitespace-nowrap"
                title="Clock Out for the Day"
              >
                <Square className="w-3 h-3 fill-current" />
                <span>Out</span>
              </button>
            </div>
          )}
        </div>

        {/* Command Search Trigger (Mobile icon, desktop bar) */}
        <button
          onClick={() => setIsCommandPaletteOpen(true)}
          className="md:hidden p-2 rounded-2xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
          title="Search or jump to (⌘K)"
          aria-label="Search"
        >
          <Search className="w-4 h-4" />
        </button>

        <button
          onClick={() => setIsCommandPaletteOpen(true)}
          className="hidden md:flex items-center justify-between w-40 lg:w-60 px-3.5 py-2 rounded-2xl bg-slate-50 text-slate-500 hover:text-slate-900 hover:bg-slate-100/80 transition-all text-[13px] border border-slate-200/80"
        >
          <div className="flex items-center gap-2 truncate">
            <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">Search or jump to...</span>
          </div>
          <kbd className="text-[10px] font-mono bg-white border border-slate-200 px-1.5 py-0.5 rounded-md text-slate-500 font-semibold shadow-2xs shrink-0">
            ⌘K
          </kbd>
        </button>

        {/* Action Center Notifications */}
        <div className="relative">
          <button
            onClick={() => setIsNotificationsOpen((prev) => !prev)}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl border border-slate-200 hover:bg-slate-50 flex items-center justify-center text-slate-600 transition-colors relative"
            title="Notifications & Tasks"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4 text-slate-600" />
            {totalNotifications > 0 && (
              <span className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-white"></span>
            )}
          </button>

          {isNotificationsOpen && (
            <>
              {/* Mobile Backdrop Overlay to dismiss on tap */}
              <div
                className="fixed inset-0 z-40 bg-black/25 backdrop-blur-2xs"
                onClick={() => setIsNotificationsOpen(false)}
              />

              <div className="fixed inset-x-3 top-16 sm:absolute sm:inset-auto sm:right-0 sm:top-full sm:mt-2 w-auto sm:w-84 max-w-[calc(100vw-24px)] bg-white rounded-2xl border border-slate-200 shadow-2xl z-50 p-4 animate-in fade-in zoom-in-95">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] font-bold text-slate-900">
                      Notification Center
                    </span>
                    <span className="text-[10px] font-mono font-bold bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full whitespace-nowrap">
                      {totalNotifications} open
                    </span>
                  </div>
                  <button
                    onClick={() => setIsNotificationsOpen(false)}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto py-1">
                  {pendingLeaves.map((l) => (
                    <div
                      key={l.id}
                      onClick={() => {
                        setCurrentTab('leaves');
                        setIsNotificationsOpen(false);
                      }}
                      className="py-2.5 px-2 flex items-start gap-2.5 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer"
                    >
                      <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="text-[12px] font-semibold text-slate-900 leading-tight truncate">
                          Leave: {l.employeeName}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5 truncate capitalize">
                          {l.leaveType} ({l.daysCount} days) · {l.department}
                        </div>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400 mt-1 shrink-0" />
                    </div>
                  ))}

                  {pendingOnboardingTasks.slice(0, 4).map((task) => (
                    <div
                      key={task.id}
                      onClick={() => {
                        setCurrentTab('onboarding');
                        setIsNotificationsOpen(false);
                      }}
                      className="py-2.5 px-2 flex items-start gap-2.5 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="text-[12px] font-semibold text-slate-900 leading-tight truncate">
                          {task.title}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5 truncate">
                          Assigned: {task.assignedRole} · Induction
                        </div>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400 mt-1 shrink-0" />
                    </div>
                  ))}

                  {pendingOffboarding.map((off) => {
                    const emp = employees.find((e) => e.id === off.employeeId);
                    const empName = emp ? `${emp.firstName} ${emp.lastName}` : 'Personnel';
                    return (
                      <div
                        key={off.id}
                        onClick={() => {
                          setCurrentTab('onboarding');
                          setIsNotificationsOpen(false);
                        }}
                        className="py-2.5 px-2 flex items-start gap-2.5 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer"
                      >
                        <AlertCircle className="w-4 h-4 text-rose-500 mt-0.5 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="text-[12px] font-semibold text-slate-900 leading-tight truncate">
                            Exit Clearance: {empName}
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5 truncate">
                            Last day: {off.lastWorkingDate}
                          </div>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400 mt-1 shrink-0" />
                      </div>
                    );
                  })}

                  {totalNotifications === 0 && (
                    <div className="py-6 text-center text-[12px] text-slate-500">
                      No pending approvals or tasks.
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Add Employee CTA */}
        {canPerformAction('department_lead') && (
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-2.5 sm:px-3.5 py-2 rounded-2xl text-[13px] font-semibold transition-all shadow-sm shadow-emerald-600/30 whitespace-nowrap"
            title="Add Personnel"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Personnel</span>
          </button>
        )}

        {/* User Profile & Sign Out */}
        <div className="flex items-center gap-1.5 sm:gap-2 pl-1 sm:pl-2 border-l border-slate-200">
          <img
            src={activePersona.avatar}
            alt={activePersona.name}
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover border border-slate-200 shrink-0"
          />
          <div className="hidden lg:block text-left">
            <div className="text-xs font-bold text-slate-900 leading-tight whitespace-nowrap">
              {currentUser?.name || activePersona.name}
            </div>
            <div className="text-[10px] text-slate-500 font-medium whitespace-nowrap">
              {currentUser?.companyName || 'Semplo'}
            </div>
          </div>
          <button
            onClick={logout}
            className="p-1.5 sm:p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
            title="Sign Out of workspace"
            aria-label="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};

