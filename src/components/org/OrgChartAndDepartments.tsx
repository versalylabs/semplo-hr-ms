/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Building2,
  GitBranch,
  Users,
  DollarSign,
  Briefcase,
  ChevronDown,
  ChevronRight,
  User,
  ArrowUpRight,
  Plus,
  Edit2,
  Trash2,
  X,
  Check,
} from 'lucide-react';
import { useHR } from '../../context/HRContext';
import { Department, Employee } from '../../types/hr';

export const OrgChartAndDepartments: React.FC<{ initialTab?: 'departments' | 'org_chart' }> = ({
  initialTab = 'org_chart',
}) => {
  const {
    departments,
    employees,
    setSelectedEmployee,
    setCurrentTab,
    addDepartment,
    updateDepartment,
    deleteDepartment,
    canPerformAction,
  } = useHR();
  const [activeView, setActiveView] = useState<'departments' | 'org_chart'>(initialTab);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [deletingDept, setDeletingDept] = useState<Department | null>(null);
  const [deptForm, setDeptForm] = useState({
    name: '',
    code: '',
    leadName: '',
    budget: 5000000,
    openPositions: 1,
    description: '',
  });
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({
    emp_001: true,
    emp_003: true,
    emp_004: true,
    emp_007: true,
  });

  const toggleExpand = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedNodes((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Find root employees (who have no managerId or managerId not in employees)
  const rootEmployees = employees.filter((e) => !e.managerId);

  // Recursive tree renderer for org hierarchy
  const renderOrgNode = (emp: Employee, depth: number = 0) => {
    const children = employees.filter((e) => e.managerId === emp.id);
    const hasChildren = children.length > 0;
    const isExpanded = !!expandedNodes[emp.id];

    return (
      <div key={emp.id} className="flex flex-col items-center">
        {/* Node Card */}
        <div
          onClick={() => setSelectedEmployee(emp)}
          className={`p-4 rounded-[24px] border transition-all cursor-pointer card-shadow bg-[#ffffff] hover:border-[#0a0a0a] min-w-[240px] max-w-[280px] text-center relative group ${
            depth === 0 ? 'border-[#0a0a0a] ring-1 ring-[#0a0a0a]/10' : 'border-[#e5e5e5]'
          }`}
        >
          <div className="flex flex-col items-center">
            <img
              src={emp.avatar}
              alt={emp.firstName}
              className="w-12 h-12 rounded-full object-cover border-2 border-[#ffffff] shadow-xs group-hover:scale-105 transition-transform"
            />
            <h4 className="text-[14px] font-semibold text-[#0a0a0a] mt-2 group-hover:underline leading-tight">
              {emp.firstName} {emp.lastName}
            </h4>
            <div className="text-[12px] text-[#737373] mt-0.5">{emp.jobTitle}</div>
            <div className="text-[11px] font-mono text-[#737373] mt-1 bg-[#f5f5f5] px-2 py-0.5 rounded-[18px]">
              {emp.department}
            </div>
          </div>

          {/* Toggle expand/collapse if node has reports */}
          {hasChildren && (
            <button
              onClick={(e) => toggleExpand(emp.id, e)}
              className="mt-3 inline-flex items-center gap-1 text-[11px] font-medium text-[#737373] hover:text-[#0a0a0a] bg-[#fafafa] border border-[#e5e5e5] px-2.5 py-0.5 rounded-[18px]"
            >
              {isExpanded ? (
                <>
                  <ChevronDown className="w-3 h-3" />
                  <span>Collapse ({children.length})</span>
                </>
              ) : (
                <>
                  <ChevronRight className="w-3 h-3" />
                  <span>{children.length} direct report{children.length > 1 ? 's' : ''}</span>
                </>
              )}
            </button>
          )}
        </div>

        {/* Children Connection lines */}
        {hasChildren && isExpanded && (
          <div className="flex flex-col items-center w-full">
            {/* Vertical connector from parent */}
            <div className="w-px h-6 bg-[#e5e5e5]"></div>

            {/* Horizontal bar across children */}
            {children.length > 1 && (
              <div className="h-px bg-[#e5e5e5] w-[80%] relative"></div>
            )}

            {/* Sub tree nodes */}
            <div className="flex flex-wrap justify-center gap-6 pt-3 relative">
              {children.map((child) => (
                <div key={child.id} className="relative flex flex-col items-center">
                  <div className="w-px h-3 bg-[#e5e5e5] -mt-3 mb-0"></div>
                  {renderOrgNode(child, depth + 1)}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const handleOpenAdd = () => {
    setEditingDept(null);
    setDeptForm({
      name: '',
      code: '',
      leadName: '',
      budget: 5000000,
      openPositions: 1,
      description: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (dept: Department) => {
    setEditingDept(dept);
    setDeptForm({
      name: dept.name,
      code: dept.code,
      leadName: dept.leadName,
      budget: dept.budget,
      openPositions: dept.openPositions,
      description: dept.description,
    });
    setIsModalOpen(true);
  };

  const handleSaveDept = (e: React.FormEvent) => {
    e.preventDefault();
    if (!deptForm.name || !deptForm.code) return;

    if (editingDept) {
      updateDepartment(editingDept.id, {
        name: deptForm.name,
        code: deptForm.code.toUpperCase(),
        leadName: deptForm.leadName,
        budget: Number(deptForm.budget),
        openPositions: Number(deptForm.openPositions),
        description: deptForm.description,
      });
    } else {
      addDepartment({
        name: deptForm.name,
        code: deptForm.code.toUpperCase(),
        leadEmployeeId: '',
        leadName: deptForm.leadName || 'Unassigned',
        budget: Number(deptForm.budget) || 1000000,
        spentBudget: 0,
        headcount: 0,
        openPositions: Number(deptForm.openPositions) || 0,
        description: deptForm.description,
      });
    }
    setIsModalOpen(false);
  };

  const handleDeleteConfirm = () => {
    if (deletingDept) {
      deleteDepartment(deletingDept.id);
      setDeletingDept(null);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto flex flex-col gap-6">
      {/* Header & View Mode Switcher */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2 border-b border-[#e5e5e5]">
        <div>
          <h1 className="text-2xl sm:text-[30px] font-bold text-emerald-700 tracking-tight leading-tight whitespace-normal sm:whitespace-nowrap">
            {activeView === 'org_chart' ? 'Organizational Hierarchy' : 'Department Matrix'}
          </h1>
          <p className="text-[14px] text-[#737373] mt-1">
            {activeView === 'org_chart'
              ? 'Multi-tier reporting structure and executive management chain.'
              : 'Department operational budgets, headcount, and designated leads.'}
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {canPerformAction('department_lead') && (
            <button
              onClick={handleOpenAdd}
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-[13px] font-medium shadow-sm transition-all whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span>Add Department</span>
            </button>
          )}

          <div className="flex items-center bg-[#f5f5f5] p-1 rounded-[18px]">
            <button
              onClick={() => setActiveView('org_chart')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-[18px] text-[13px] font-medium transition-all whitespace-nowrap ${
                activeView === 'org_chart'
                  ? 'bg-[#ffffff] text-emerald-700 font-semibold shadow-xs'
                  : 'text-[#737373] hover:text-[#0a0a0a]'
              }`}
            >
              <GitBranch className="w-3.5 h-3.5" />
              <span>Org Tree</span>
            </button>
            <button
              onClick={() => setActiveView('departments')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-[18px] text-[13px] font-medium transition-all whitespace-nowrap ${
                activeView === 'departments'
                  ? 'bg-[#ffffff] text-emerald-700 font-semibold shadow-xs'
                  : 'text-[#737373] hover:text-[#0a0a0a]'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Departments ({departments.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* VIEW 1: ORGANIZATIONAL TREE */}
      {activeView === 'org_chart' && (
        <div className="liquid-glass-card rounded-[24px] border border-[#e5e5e5] p-4 sm:p-8 overflow-x-auto min-h-[500px] flex justify-start md:justify-center">
          {rootEmployees.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Users className="w-12 h-12 text-[#a3a3a3] mb-3" />
              <h3 className="text-[16px] font-semibold text-[#171717]">No Org Chart Data Available</h3>
              <p className="text-[13px] text-[#737373] max-w-sm mt-1">
                Add employees with reporting managers from the Employee Directory to build out the organizational tree.
              </p>
              <button
                onClick={() => setCurrentTab('employees')}
                className="mt-4 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-[13px] font-medium rounded-xl transition-colors whitespace-nowrap"
              >
                Go to Employees
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              {rootEmployees.map((root) => renderOrgNode(root, 0))}
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: DEPARTMENT MATRIX */}
      {activeView === 'departments' && (
        <>
          {departments.length === 0 ? (
            <div className="liquid-glass-card rounded-[24px] border border-[#e5e5e5] p-12 text-center flex flex-col items-center justify-center">
              <Building2 className="w-12 h-12 text-[#a3a3a3] mb-3" />
              <h3 className="text-[16px] font-semibold text-[#171717]">No Departments Configured</h3>
              <p className="text-[13px] text-[#737373] max-w-sm mt-1">
                Create departments to organize teams, allocate payroll budgets, and assign leadership.
              </p>
              {canPerformAction('department_lead') && (
                <button
                  onClick={handleOpenAdd}
                  className="mt-4 inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-[13px] font-medium transition-colors whitespace-nowrap"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create First Department</span>
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {departments.map((dept) => {
                const deptEmployees = employees.filter((e) => e.department === dept.name);
                const budgetPercent = dept.budget > 0 ? Math.min(100, Math.round((dept.spentBudget / dept.budget) * 100)) : 0;

                return (
                  <div
                    key={dept.id}
                    className="liquid-glass-card rounded-[24px] border border-[#e5e5e5] p-6 flex flex-col justify-between group relative"
                  >
                    <div>
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="text-[11px] font-mono text-emerald-700 font-bold uppercase tracking-wider">
                            {dept.code}
                          </div>
                          <h3 className="text-[18px] font-semibold text-[#0a0a0a] tracking-tight mt-0.5">
                            {dept.name}
                          </h3>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[12px] font-mono bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 rounded-[18px] font-medium whitespace-nowrap">
                            {deptEmployees.length || dept.headcount} members
                          </span>
                          {canPerformAction('department_lead') && (
                            <div className="flex items-center gap-1 ml-1">
                              <button
                                onClick={() => handleOpenEdit(dept)}
                                title="Edit Department"
                                className="p-1 rounded-lg text-[#737373] hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => setDeletingDept(dept)}
                                title="Delete Department"
                                className="p-1 rounded-lg text-[#737373] hover:text-rose-600 hover:bg-rose-50 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      <p className="text-[13px] text-[#737373] mt-2 line-clamp-2">
                        {dept.description || 'No department overview provided.'}
                      </p>

                      <div className="mt-4 pt-4 border-t border-[#f5f5f5] flex items-center justify-between text-[13px]">
                        <span className="text-[#737373]">Department Lead:</span>
                        <span className="font-medium text-[#0a0a0a]">{dept.leadName || 'Unassigned'}</span>
                      </div>

                      {/* Budget Allocation Progress */}
                      <div className="mt-4 pt-4 border-t border-[#f5f5f5] flex flex-col gap-1.5">
                        <div className="flex items-center justify-between text-[12px]">
                          <span className="text-[#737373]">Payroll Budget</span>
                          <span className="font-mono text-[#0a0a0a]">
                            ${(dept.spentBudget / 1000).toFixed(0)}k / ${(dept.budget / 1000).toFixed(0)}k
                          </span>
                        </div>
                        <div className="w-full bg-[#f5f5f5] h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${budgetPercent > 90 ? 'bg-amber-500' : 'bg-emerald-600'}`}
                            style={{ width: `${budgetPercent}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Department Personnel Avatars */}
                      <div className="mt-4 pt-4 border-t border-[#f5f5f5]">
                        <span className="text-[11px] uppercase tracking-wider text-[#737373] block mb-2">
                          Assigned Personnel ({deptEmployees.length})
                        </span>
                        {deptEmployees.length === 0 ? (
                          <span className="text-[12px] text-[#a3a3a3] italic">No employees assigned yet</span>
                        ) : (
                          <div className="flex items-center -space-x-2 overflow-hidden">
                            {deptEmployees.slice(0, 5).map((emp) => (
                              <img
                                key={emp.id}
                                src={emp.avatar}
                                alt={emp.firstName}
                                title={`${emp.firstName} ${emp.lastName} (${emp.jobTitle})`}
                                className="inline-block w-8 h-8 rounded-full border-2 border-[#ffffff] object-cover"
                              />
                            ))}
                            {deptEmployees.length > 5 && (
                              <div className="w-8 h-8 rounded-full bg-[#f5f5f5] border-2 border-[#ffffff] text-[11px] font-semibold text-[#737373] flex items-center justify-center">
                                +{deptEmployees.length - 5}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="pt-4 border-t border-[#e5e5e5] mt-6 flex items-center justify-between text-[12px]">
                      <span className="text-[#737373] whitespace-nowrap">
                        {dept.openPositions} open position{dept.openPositions !== 1 ? 's' : ''}
                      </span>
                      <button
                        onClick={() => setCurrentTab('employees')}
                        className="text-emerald-700 font-medium hover:underline flex items-center gap-1 whitespace-nowrap"
                      >
                        <span>View roster</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Add / Edit Department Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-lg font-bold text-emerald-700">
                {editingDept ? 'Edit Department' : 'Create New Department'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveDept} className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Department Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={deptForm.name}
                    onChange={(e) => setDeptForm({ ...deptForm, name: e.target.value })}
                    placeholder="e.g. Engineering"
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={deptForm.code}
                    onChange={(e) => setDeptForm({ ...deptForm, code: e.target.value.toUpperCase() })}
                    placeholder="e.g. ENG"
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl uppercase focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Department Lead
                </label>
                <input
                  type="text"
                  value={deptForm.leadName}
                  onChange={(e) => setDeptForm({ ...deptForm, leadName: e.target.value })}
                  placeholder="e.g. Sarah Jenkins"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Payroll Budget ($)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="10000"
                    value={deptForm.budget}
                    onChange={(e) => setDeptForm({ ...deptForm, budget: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Open Positions
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={deptForm.openPositions}
                    onChange={(e) => setDeptForm({ ...deptForm, openPositions: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={deptForm.description}
                  onChange={(e) => setDeptForm({ ...deptForm, description: e.target.value })}
                  placeholder="Key responsibilities and mandate..."
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors whitespace-nowrap"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-medium bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-sm transition-colors whitespace-nowrap"
                >
                  {editingDept ? 'Save Changes' : 'Create Department'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Department Confirmation Modal */}
      {deletingDept && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-lg font-bold text-rose-600">Delete Department</h3>
            <p className="text-sm text-slate-600 mt-2">
              Are you sure you want to delete <span className="font-semibold">{deletingDept.name}</span> ({deletingDept.code})?
              This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-2 mt-6">
              <button
                onClick={() => setDeletingDept(null)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors whitespace-nowrap"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 text-xs font-medium bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-sm transition-colors whitespace-nowrap"
              >
                Delete Department
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
