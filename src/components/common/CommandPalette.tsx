/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  User,
  LayoutDashboard,
  Users,
  ClipboardList,
  Building2,
  GitBranch,
  History,
  Plus,
  ArrowRight,
  Shield,
  Clock,
  CalendarDays,
  Banknote,
  Award,
  Briefcase,
  UserCircle,
  Megaphone,
} from 'lucide-react';
import { useHR } from '../../context/HRContext';
import { NavTab } from '../../types/hr';

export const CommandPalette: React.FC = () => {
  const {
    isCommandPaletteOpen,
    setIsCommandPaletteOpen,
    employees,
    setCurrentTab,
    setSelectedEmployee,
    setIsAddModalOpen,
    personas,
    setActivePersona,
  } = useHR();

  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isCommandPaletteOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isCommandPaletteOpen]);

  if (!isCommandPaletteOpen) return null;

  // Filtered employees
  const matchedEmployees = query.trim()
    ? employees
        .filter(
          (e) =>
            `${e.firstName} ${e.lastName}`.toLowerCase().includes(query.toLowerCase()) ||
            e.jobTitle.toLowerCase().includes(query.toLowerCase()) ||
            e.department.toLowerCase().includes(query.toLowerCase()) ||
            e.employeeCode.toLowerCase().includes(query.toLowerCase()) ||
            (e.kraPin && e.kraPin.toLowerCase().includes(query.toLowerCase()))
        )
        .slice(0, 5)
    : [];

  const navigationCommands: { id: NavTab; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'self_service', label: 'Go to Employee Self-Service (ESS Portal & Request Hub)', icon: UserCircle },
    { id: 'company_hub', label: 'Go to Company Hub & Announcements (Bulletin & Policies)', icon: Megaphone },
    { id: 'dashboard', label: 'Go to Overview Dashboard', icon: LayoutDashboard },
    { id: 'employees', label: 'Go to Employee Directory', icon: Users },
    { id: 'attendance', label: 'Go to Time & Attendance Terminal', icon: Clock },
    { id: 'leaves', label: 'Go to Leave Management & Balances', icon: CalendarDays },
    { id: 'payroll', label: 'Go to Kenyan Payroll & Statutory Deductions (PAYE, NSSF, SHIF, Housing)', icon: Banknote },
    { id: 'appraisals', label: 'Go to Semplo Performance Appraisal & OKRs (360 Reviews & 9-Box)', icon: Award },
    { id: 'recruitment', label: 'Go to Recruitment & Applicant Tracking (ATS Pipelines & Jobs)', icon: Briefcase },
    { id: 'onboarding', label: 'Go to Lifecycle & Transitions', icon: ClipboardList },
    { id: 'departments', label: 'Go to Department Allocations', icon: Building2 },
    { id: 'org_chart', label: 'Go to Org Hierarchy Tree', icon: GitBranch },
    { id: 'audit', label: 'Go to Audit & Compliance Trail', icon: History },
  ];

  const matchedNav = navigationCommands.filter((n) =>
    n.label.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div
      onClick={() => setIsCommandPaletteOpen(false)}
      className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-start justify-center pt-24 z-70 p-4 animate-in fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-[#ffffff] rounded-[24px] border border-[#e5e5e5] max-w-xl w-full card-shadow overflow-hidden flex flex-col animate-in zoom-in-95 duration-150"
      >
        {/* Search Input bar */}
        <div className="p-4 border-b border-[#e5e5e5] flex items-center gap-3">
          <Search className="w-4 h-4 text-[#737373] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search employee, KRA PIN, attendance, leave, or jump to view..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-[14px] text-[#0a0a0a] placeholder:text-[#737373] border-none focus:outline-hidden"
          />
          <kbd className="text-[11px] font-mono bg-[#f5f5f5] text-[#737373] px-2 py-0.5 rounded-[6px]">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-2 divide-y divide-[#f5f5f5] text-[13px]">
          {/* Quick Actions */}
          <div className="py-2">
            <div className="text-[11px] font-medium uppercase tracking-wider text-[#737373] px-3 mb-1">
              Quick Actions
            </div>
            <button
              onClick={() => {
                setIsCommandPaletteOpen(false);
                setIsAddModalOpen(true);
              }}
              className="w-full px-3 py-2 rounded-[18px] flex items-center justify-between hover:bg-[#f5f5f5] text-[#0a0a0a] transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <Plus className="w-4 h-4 text-[#737373]" />
                <span>Add new Kenyan employee</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-[#737373]" />
            </button>
          </div>

          {/* Matched Employees */}
          {matchedEmployees.length > 0 && (
            <div className="py-2">
              <div className="text-[11px] font-medium uppercase tracking-wider text-[#737373] px-3 mb-1">
                Personnel ({matchedEmployees.length})
              </div>
              {matchedEmployees.map((emp) => (
                <button
                  key={emp.id}
                  onClick={() => {
                    setIsCommandPaletteOpen(false);
                    setSelectedEmployee(emp);
                  }}
                  className="w-full px-3 py-2 rounded-[18px] flex items-center justify-between hover:bg-[#f5f5f5] text-left transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <img
                      src={emp.avatar}
                      alt={emp.firstName}
                      className="w-6 h-6 rounded-full object-cover border border-[#e5e5e5]"
                    />
                    <div>
                      <span className="font-medium text-[#0a0a0a]">
                        {emp.firstName} {emp.lastName}
                      </span>
                      <span className="text-[11px] text-[#737373] ml-2">
                        {emp.jobTitle} · {emp.department}
                      </span>
                    </div>
                  </div>
                  <span className="text-[11px] font-mono text-[#737373]">
                    {emp.employeeCode}
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* Navigation views */}
          <div className="py-2">
            <div className="text-[11px] font-medium uppercase tracking-wider text-[#737373] px-3 mb-1">
              Modules & Navigation
            </div>
            {matchedNav.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setCurrentTab(item.id);
                    setIsCommandPaletteOpen(false);
                  }}
                  className="w-full px-3 py-2 rounded-[18px] flex items-center justify-between hover:bg-[#f5f5f5] text-[#0a0a0a] transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4 text-[#737373]" />
                    <span>{item.label}</span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-[#737373]" />
                </button>
              );
            })}
          </div>

          {/* Persona quick switcher */}
          <div className="py-2">
            <div className="text-[11px] font-medium uppercase tracking-wider text-[#737373] px-3 mb-1">
              Switch User Persona
            </div>
            {personas.map((p) => (
              <button
                key={p.id}
                onClick={() => {
                  setActivePersona(p);
                  setIsCommandPaletteOpen(false);
                }}
                className="w-full px-3 py-2 rounded-[18px] flex items-center justify-between hover:bg-[#f5f5f5] text-[#0a0a0a] transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <Shield className="w-3.5 h-3.5 text-[#737373]" />
                  <span>Switch to {p.name} ({p.roleLabel})</span>
                </div>
                <span className="text-[11px] font-mono text-[#737373]">{p.department}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="p-3 bg-[#fafafa] border-t border-[#e5e5e5] text-[11px] text-[#737373] flex items-center justify-between px-4">
          <span>Navigate with mouse or arrow keys</span>
          <span>Press ESC to close</span>
        </div>
      </div>
    </div>
  );
};
