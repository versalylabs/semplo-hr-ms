import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Users,
  LayoutDashboard,
  GitBranch,
  Building2,
  ClipboardList,
  History,
  RotateCcw,
  Clock,
  CalendarDays,
  Banknote,
  Award,
  Briefcase,
  ChevronDown,
  UserCircle,
  Megaphone,
  Sparkles,
  Zap,
  LogOut,
  X,
} from 'lucide-react';
import { useHR } from '../../context/HRContext';
import { NavTab } from '../../types/hr';

const NAV_ITEMS: { id: NavTab; label: string; icon: React.FC<{ className?: string }> }[] = [
  { id: 'dashboard', label: 'Overview Dashboard', icon: LayoutDashboard },
  { id: 'self_service', label: 'Employee Portal (ESS)', icon: UserCircle },
  { id: 'company_hub', label: 'Company Hub & Notices', icon: Megaphone },
  { id: 'employees', label: 'Employee Directory', icon: Users },
  { id: 'attendance', label: 'Time & Attendance', icon: Clock },
  { id: 'leaves', label: 'Leave Management', icon: CalendarDays },
  { id: 'payroll', label: 'Payroll & Statutory', icon: Banknote },
  { id: 'appraisals', label: 'Performance & OKRs', icon: Award },
  { id: 'recruitment', label: 'Recruitment & ATS', icon: Briefcase },
  { id: 'onboarding', label: 'Lifecycle & Transitions', icon: ClipboardList },
  { id: 'departments', label: 'Departments', icon: Building2 },
  { id: 'org_chart', label: 'Org Hierarchy', icon: GitBranch },
  { id: 'audit', label: 'Audit Trail', icon: History },
];

interface SidebarInnerProps {
  isMobile?: boolean;
  onItemClick?: () => void;
}

const SidebarInner: React.FC<SidebarInnerProps> = ({ isMobile, onItemClick }) => {
  const {
    currentTab,
    setCurrentTab,
    activePersona,
    setActivePersona,
    personas,
    employees,
    onboardingRecords,
    leaveRequests,
    candidates,
    announcements,
    salaryAdvances,
    expenseClaims,
    resetAllData,
    logout,
    currentUser,
    setIsMobileSidebarOpen,
  } = useHR();

  const [isPersonaMenuOpen, setIsPersonaMenuOpen] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Active onboarding count & pending leaves & active pipeline count
  const activeOnboardingCount = onboardingRecords.filter((r) => r.status === 'in_progress').length;
  const pendingLeavesCount = leaveRequests.filter((r) => r.status === 'pending').length;
  const activeCandidatesCount = candidates.filter((c) => c.stage !== 'hired' && c.stage !== 'rejected').length;
  const pendingRequestsCount =
    salaryAdvances.filter((a) => a.status === 'pending').length +
    expenseClaims.filter((e) => e.status === 'pending').length;

  const handleNavClick = (tabId: NavTab) => {
    setCurrentTab(tabId);
    if (onItemClick) onItemClick();
  };

  return (
    <div className="flex flex-col justify-between h-full w-full bg-white select-none">
      {/* Top Branding & Navigation */}
      <div className="p-4 flex flex-col gap-4 overflow-y-auto">
        <div className="flex items-center justify-between px-1 pt-1">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-400 text-white flex items-center justify-center font-bold text-sm shadow-md shadow-emerald-600/30 shrink-0">
              <Sparkles className="w-4 h-4 fill-white text-white" />
            </div>
            <div className="min-w-0">
              <div className="text-base font-extrabold tracking-tight text-slate-900 leading-none flex items-center gap-1.5 whitespace-nowrap">
                <span className="truncate max-w-[140px] sm:max-w-[160px]">{currentUser?.companyName || 'Semplo'}</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
              </div>
              <div className="text-[11px] font-medium text-emerald-600 mt-0.5 tracking-tight truncate max-w-[140px] whitespace-nowrap">
                {currentUser?.isDemoAdmin ? 'HR & Employee Hub' : 'Custom Workspace'}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200/80 rounded-full px-2 py-0.5 whitespace-nowrap shrink-0">
              KES
            </span>
            {isMobile && (
              <button
                onClick={() => setIsMobileSidebarOpen(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors ml-1"
                aria-label="Close sidebar"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex flex-col gap-1 mt-1">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 py-1 whitespace-nowrap">
            Workforce Modules
          </div>
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`group flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-[13px] font-medium transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/25 font-semibold'
                    : 'text-slate-600 hover:bg-emerald-50/70 hover:text-emerald-950'
                }`}
              >
                <div className="flex items-center gap-2.5 whitespace-nowrap shrink-0">
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-colors ${
                      isActive ? 'text-white' : 'text-slate-400 group-hover:text-emerald-600'
                    }`}
                  />
                  <span className="whitespace-nowrap shrink-0">{item.label}</span>
                </div>

                {item.id === 'self_service' && pendingRequestsCount > 0 && (
                  <span
                    className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full whitespace-nowrap shrink-0 ${
                      isActive
                        ? 'bg-white text-emerald-700 shadow-xs'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {pendingRequestsCount}
                  </span>
                )}

                {item.id === 'company_hub' && announcements.length > 0 && (
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded-full whitespace-nowrap shrink-0 ${
                      isActive
                        ? 'bg-white text-emerald-700 font-bold'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {announcements.length}
                  </span>
                )}

                {item.id === 'employees' && employees.length > 0 && (
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded-full whitespace-nowrap shrink-0 ${
                      isActive
                        ? 'bg-white text-emerald-700 font-bold'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {employees.length}
                  </span>
                )}

                {item.id === 'leaves' && pendingLeavesCount > 0 && (
                  <span
                    className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full whitespace-nowrap shrink-0 ${
                      isActive
                        ? 'bg-amber-400 text-slate-950'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {pendingLeavesCount}
                  </span>
                )}

                {item.id === 'payroll' && (
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded-full whitespace-nowrap shrink-0 ${
                      isActive
                        ? 'bg-white text-emerald-700 font-bold'
                        : 'bg-purple-100 text-purple-800'
                    }`}
                  >
                    Auto
                  </span>
                )}

                {item.id === 'recruitment' && activeCandidatesCount > 0 && (
                  <span
                    className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full whitespace-nowrap shrink-0 ${
                      isActive
                        ? 'bg-white text-emerald-700 shadow-xs'
                        : 'bg-teal-100 text-teal-800'
                    }`}
                  >
                    {activeCandidatesCount}
                  </span>
                )}

                {item.id === 'onboarding' && activeOnboardingCount > 0 && (
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded-full whitespace-nowrap shrink-0 ${
                      isActive
                        ? 'bg-white text-emerald-700 font-bold'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {activeOnboardingCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Persona Switcher & Controls */}
      <div className="p-4 border-t border-slate-100/90 flex flex-col gap-3 bg-slate-50/50">
        {/* Multi-Persona Session Switcher */}
        <div className="relative">
          <button
            onClick={() => setIsPersonaMenuOpen(!isPersonaMenuOpen)}
            className="w-full flex items-center justify-between p-2.5 rounded-2xl bg-white border border-slate-200/90 hover:border-emerald-500/50 hover:shadow-sm transition-all text-left cursor-pointer group"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <img
                src={activePersona.avatar}
                alt={activePersona.name}
                className="w-8 h-8 rounded-full object-cover border border-slate-200 shrink-0"
              />
              <div className="min-w-0">
                <div className="text-[13px] font-bold text-slate-900 truncate leading-tight flex items-center gap-1.5 whitespace-nowrap">
                  <span>{activePersona.name}</span>
                </div>
                <div className="text-[11px] font-medium text-emerald-700 truncate whitespace-nowrap">
                  {activePersona.roleLabel}
                </div>
              </div>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-slate-700 shrink-0 transition-transform" />
          </button>

          {/* Persona Dropdown Drawer */}
          {isPersonaMenuOpen && (
            <div className="absolute bottom-full left-0 mb-2 w-full bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden z-50 p-1 animate-in fade-in slide-in-from-bottom-2 duration-150">
              <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 flex items-center justify-between whitespace-nowrap">
                <span>Switch Access Role</span>
                <Zap className="w-3 h-3 text-amber-500 fill-amber-500" />
              </div>
              <div className="max-h-56 overflow-y-auto py-1">
                {personas.map((persona) => {
                  const isSelected = persona.id === activePersona.id;
                  return (
                    <button
                      key={persona.id}
                      onClick={() => {
                        setActivePersona(persona);
                        setIsPersonaMenuOpen(false);
                      }}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-50 text-emerald-950 font-semibold'
                          : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <img
                        src={persona.avatar}
                        alt={persona.name}
                        className="w-7 h-7 rounded-full object-cover border border-slate-200 shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="text-[12px] font-bold truncate leading-tight whitespace-nowrap">
                          {persona.name}
                        </div>
                        <div className="text-[10px] text-slate-500 truncate whitespace-nowrap">
                          {persona.roleLabel} · {persona.department}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* System Reset, Status & Sign Out */}
        <div className="flex items-center justify-between text-[11px] text-slate-500 px-1 pt-2 border-t border-slate-100">
          <button
            onClick={logout}
            className="flex items-center gap-1.5 font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-2.5 py-1 rounded-xl transition-all cursor-pointer whitespace-nowrap"
            title="Log out of current workspace"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>

          <div className="flex items-center gap-2">
            {currentUser?.isDemoAdmin && (
              <button
                onClick={() => setShowResetConfirm(true)}
                className="hover:text-emerald-700 transition-colors flex items-center gap-1 text-[10px] font-medium text-slate-400 hover:text-slate-700 whitespace-nowrap"
                title="Reset to default Kenya seed dataset"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            )}
            <span className="flex items-center gap-1 text-[10px] font-medium text-slate-400 whitespace-nowrap">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>EAT</span>
            </span>
          </div>
        </div>
      </div>

      {/* Reset Confirmation Dialog */}
      {showResetConfirm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-[#ffffff] rounded-2xl border border-slate-200 p-6 max-w-sm w-full shadow-2xl">
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Reset Semplo system data?
            </h3>
            <p className="text-[13px] text-slate-600 mt-2">
              This will restore all Kenyan employee profiles, biometric attendance logs, leave balances, and appraisal records to default seed values.
            </p>
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-3.5 py-1.5 rounded-xl bg-slate-100 text-slate-700 text-[13px] font-medium hover:bg-slate-200 transition-colors whitespace-nowrap"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  resetAllData();
                  setShowResetConfirm(false);
                }}
                className="px-3.5 py-1.5 rounded-xl bg-rose-600 text-white text-[13px] font-medium hover:bg-rose-700 transition-colors whitespace-nowrap"
              >
                Reset Data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const Sidebar: React.FC = () => {
  const { isMobileSidebarOpen, setIsMobileSidebarOpen } = useHR();

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:flex w-72 shrink-0 bg-white/95 backdrop-blur-md border-r border-slate-200/90 h-screen sticky top-0 flex-col justify-between select-none shadow-[2px_0_12px_rgba(0,0,0,0.02)] z-30">
        <SidebarInner isMobile={false} />
      </aside>

      {/* Mobile Slide-over Drawer */}
      <AnimatePresence>
        {isMobileSidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setIsMobileSidebarOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            />
            {/* Drawer */}
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 280 }}
              className="relative w-80 max-w-[85vw] bg-white h-full flex flex-col justify-between select-none shadow-2xl z-10"
            >
              <SidebarInner
                isMobile={true}
                onItemClick={() => setIsMobileSidebarOpen(false)}
              />
            </motion.aside>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
