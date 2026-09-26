/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useState } from 'react';
import {
  Search,
  Filter,
  Grid,
  List,
  Plus,
  Mail,
  Phone,
  MapPin,
  Building,
  MoreVertical,
  ExternalLink,
  ShieldAlert,
} from 'lucide-react';
import { useHR } from '../../context/HRContext';
import { Employee, EmployeeStatus, EmploymentType } from '../../types/hr';

export const EmployeeDirectory: React.FC = () => {
  const {
    employees,
    departments,
    setSelectedEmployee,
    setIsAddModalOpen,
    canPerformAction,
  } = useHR();

  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Filtered employees
  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      const matchSearch =
        search.trim() === '' ||
        `${emp.firstName} ${emp.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
        emp.email.toLowerCase().includes(search.toLowerCase()) ||
        emp.jobTitle.toLowerCase().includes(search.toLowerCase()) ||
        emp.employeeCode.toLowerCase().includes(search.toLowerCase()) ||
        (emp.kraPin && emp.kraPin.toLowerCase().includes(search.toLowerCase()));

      const matchDept = selectedDept === 'all' || emp.department === selectedDept;
      const matchStatus = selectedStatus === 'all' || emp.status === selectedStatus;
      const matchType = selectedType === 'all' || emp.employmentType === selectedType;

      return matchSearch && matchDept && matchStatus && matchType;
    });
  }, [employees, search, selectedDept, selectedStatus, selectedType]);

  const formatEmploymentType = (type: EmploymentType) => {
    switch (type) {
      case 'full_time':
        return 'Full-time';
      case 'part_time':
        return 'Part-time';
      case 'contract':
        return 'Contract';
      case 'intern':
        return 'Intern';
      default:
        return type;
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto flex flex-col gap-6">
      {/* Title & Top Action Bar */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2 border-b border-[#e5e5e5]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-[30px] font-bold text-emerald-700 tracking-tight leading-tight whitespace-nowrap">
              Employee Directory
            </h1>
            <span className="text-[11px] font-mono text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-[18px] whitespace-nowrap">
              Active Roster
            </span>
          </div>
          <p className="text-[14px] text-[#737373] mt-1">
            Personnel profiles with Kenyan statutory tax & health registrations, compensation tiers, and supervisor lines.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-[#f5f5f5] p-1 rounded-[18px]">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-[18px] transition-colors ${
                viewMode === 'grid' ? 'bg-[#ffffff] text-[#0a0a0a] shadow-xs' : 'text-[#737373] hover:text-[#0a0a0a]'
              }`}
              title="Grid View"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-[18px] transition-colors ${
                viewMode === 'table' ? 'bg-[#ffffff] text-[#0a0a0a] shadow-xs' : 'text-[#737373] hover:text-[#0a0a0a]'
              }`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          {canPerformAction('department_lead') && (
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-[18px] bg-emerald-600 hover:bg-emerald-700 text-white text-[13px] font-bold shadow-md shadow-emerald-600/25 transition-all transform active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>New Personnel</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#ffffff] rounded-[24px] border border-[#e5e5e5] p-4 card-shadow flex flex-wrap items-center justify-between gap-4">
        {/* Search Field */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-[#737373] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, KRA PIN, title, code, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#f8fafc] text-[#0a0a0a] text-[13px] rounded-[18px] placeholder:text-[#737373] border border-[#e2e8f0] focus:outline-hidden focus:border-emerald-500"
          />
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="px-3 py-2 bg-[#f8fafc] text-[#0a0a0a] text-[13px] font-medium rounded-[18px] border border-[#e2e8f0] cursor-pointer"
          >
            <option value="all">All Departments</option>
            {departments.map((dept) => (
              <option key={dept.id} value={dept.name}>
                {dept.name}
              </option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 bg-[#f8fafc] text-[#0a0a0a] text-[13px] font-medium rounded-[18px] border border-[#e2e8f0] cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="probation">Probation</option>
            <option value="on_leave">On Leave</option>
            <option value="terminated">Terminated</option>
          </select>

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-2 bg-[#f8fafc] text-[#0a0a0a] text-[13px] font-medium rounded-[18px] border border-[#e2e8f0] cursor-pointer"
          >
            <option value="all">All Contract Types</option>
            <option value="full_time">Full-time</option>
            <option value="part_time">Part-time</option>
            <option value="contract">Contract</option>
            <option value="intern">Intern</option>
          </select>

          {(search || selectedDept !== 'all' || selectedStatus !== 'all' || selectedType !== 'all') && (
            <button
              onClick={() => {
                setSearch('');
                setSelectedDept('all');
                setSelectedStatus('all');
                setSelectedType('all');
              }}
              className="text-[12px] text-emerald-700 font-semibold hover:text-emerald-800 px-2 py-1 underline underline-offset-2"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Directory Count Bar */}
      <div className="flex items-center justify-between text-[12px] text-[#737373] px-1">
        <span>
          Showing <span className="font-bold text-[#0a0a0a]">{filteredEmployees.length}</span> of{' '}
          {employees.length} Kenyan employees
        </span>
        <span className="font-mono text-emerald-800 font-medium">Currency: KES (Kenya Shillings)</span>
      </div>

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEmployees.map((emp) => (
            <div
              key={emp.id}
              onClick={() => setSelectedEmployee(emp)}
              className="bg-[#ffffff] rounded-[24px] border border-[#e5e5e5] p-5 card-shadow flex flex-col justify-between hover:border-emerald-300 transition-all cursor-pointer group"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={emp.avatar}
                      alt={emp.firstName}
                      className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-xs group-hover:scale-105 transition-transform"
                    />
                    <div>
                      <h3 className="text-[15px] font-bold text-[#0a0a0a] leading-tight group-hover:text-emerald-700 transition-colors">
                        {emp.firstName} {emp.lastName}
                      </h3>
                      <div className="text-[11px] font-mono text-[#64748b] mt-0.5">
                        {emp.employeeCode} · KRA: <span className="font-semibold text-[#0a0a0a]">{emp.kraPin || 'Pending'}</span>
                      </div>
                    </div>
                  </div>

                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold capitalize ${
                      emp.status === 'active'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : emp.status === 'probation'
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : emp.status === 'on_leave'
                        ? 'bg-sky-50 text-sky-700 border border-sky-200'
                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}
                  >
                    {emp.status.replace('_', ' ')}
                  </span>
                </div>

                <div className="mt-4">
                  <div className="text-[13px] font-bold text-[#0a0a0a]">
                    {emp.jobTitle}
                  </div>
                  <div className="text-[12px] text-[#64748b] mt-0.5 font-medium">
                    {emp.department}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-1.5 text-[12px] text-[#737373] mt-3 pt-3 border-t border-[#f5f5f5]">
                  <span>{formatEmploymentType(emp.employmentType)}</span>
                  <span aria-hidden="true">·</span>
                  <span>{emp.location}</span>
                  <span aria-hidden="true">·</span>
                  <span>KES {(emp.baseSalary / 1000).toFixed(0)}k/mo</span>
                </div>
              </div>

              <div className="pt-4 border-t border-[#e5e5e5] mt-4 flex items-center justify-between text-[12px]">
                <div className="text-[#737373] truncate max-w-[170px]">
                  Lead: {emp.managerName || 'Executive'}
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedEmployee(emp);
                  }}
                  className="px-2.5 py-1 rounded-[18px] bg-[#f5f5f5] group-hover:bg-[#0a0a0a] group-hover:text-[#ffffff] text-[#0a0a0a] font-medium transition-colors"
                >
                  View Profile
                </button>
              </div>
            </div>
          ))}

          {filteredEmployees.length === 0 && (
            <div className="col-span-full py-16 text-center bg-[#ffffff] rounded-[24px] border border-[#e5e5e5]">
              <p className="text-[14px] text-[#737373]">
                No personnel found matching the specified criteria.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Table View */}
      {viewMode === 'table' && (
        <div className="bg-[#ffffff] rounded-[24px] border border-[#e5e5e5] p-6 card-shadow overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#e5e5e5] text-[11px] uppercase tracking-wider text-[#737373]">
                <th className="py-3 px-3 font-medium">Employee</th>
                <th className="py-3 px-3 font-medium">Role & Level</th>
                <th className="py-3 px-3 font-medium">Department</th>
                <th className="py-3 px-3 font-medium">Location</th>
                <th className="py-3 px-3 font-medium">KRA Tax PIN</th>
                <th className="py-3 px-3 font-medium">Gross Salary</th>
                <th className="py-3 px-3 font-medium">Status</th>
                <th className="py-3 px-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f5f5f5] text-[13px]">
              {filteredEmployees.map((emp) => (
                <tr
                  key={emp.id}
                  onClick={() => setSelectedEmployee(emp)}
                  className="hover:bg-[#fafafa] cursor-pointer transition-colors"
                >
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={emp.avatar}
                        alt={emp.firstName}
                        className="w-7 h-7 rounded-full object-cover border border-[#e5e5e5]"
                      />
                      <div>
                        <div className="font-semibold text-[#0a0a0a]">
                          {emp.firstName} {emp.lastName}
                        </div>
                        <div className="text-[11px] font-mono text-[#737373]">{emp.employeeCode}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <div className="text-[#0a0a0a] font-medium">{emp.jobTitle}</div>
                    <div className="text-[11px] text-[#737373]">{emp.compensationTier}</div>
                  </td>
                  <td className="py-3 px-3 text-[#171717]">{emp.department}</td>
                  <td className="py-3 px-3 text-[#737373]">{emp.location}</td>
                  <td className="py-3 px-3 font-mono text-[12px] text-[#0a0a0a]">{emp.kraPin || '—'}</td>
                  <td className="py-3 px-3 font-mono text-[12px] text-[#0a0a0a]">
                    KES {emp.baseSalary.toLocaleString()}
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold capitalize ${
                        emp.status === 'active'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : emp.status === 'probation'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : emp.status === 'on_leave'
                          ? 'bg-sky-50 text-sky-700 border border-sky-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}
                    >
                      {emp.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedEmployee(emp);
                      }}
                      className="px-2.5 py-1 rounded-[18px] bg-[#f5f5f5] hover:bg-[#ebebeb] text-[#0a0a0a] text-[12px] font-medium transition-colors"
                    >
                      Inspect
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
