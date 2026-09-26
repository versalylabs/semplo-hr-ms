/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Target, Check } from 'lucide-react';
import { useHR } from '../../context/HRContext';
import { OKRGoal } from '../../types/hr';

interface NewOKRModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NewOKRModal: React.FC<NewOKRModalProps> = ({ isOpen, onClose }) => {
  const { employees, departments, addOKRGoal, activePersona } = useHR();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [departmentId, setDepartmentId] = useState('dept_eng');
  const [ownerEmployeeId, setOwnerEmployeeId] = useState(activePersona.employeeId);
  const [quarter, setQuarter] = useState('Q3 2026');
  const [metric, setMetric] = useState('');
  const [weight, setWeight] = useState(25);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const owner = employees.find((e) => e.id === ownerEmployeeId) || employees[0];

    addOKRGoal({
      title,
      description,
      departmentId,
      ownerEmployeeId: owner.id,
      ownerName: `${owner.firstName} ${owner.lastName}`,
      ownerAvatar: owner.avatar,
      quarter,
      progress: 0,
      status: 'on_track',
      metric: metric || '100% completion target',
      weight: Number(weight) || 20,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#ffffff] rounded-[24px] border border-[#e5e5e5] w-full max-w-lg p-6 shadow-2xl animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between border-b border-[#e5e5e5] pb-4">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-[#0a0a0a]" />
            <h3 className="text-base font-bold text-[#0a0a0a]">
              Create Semplo OKR Objective
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-[#737373] hover:text-[#0a0a0a] hover:bg-[#ebebeb] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
          <div>
            <label className="block text-[11px] font-mono uppercase text-[#737373] mb-1">
              Objective Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Expand East African Enterprise API Integration..."
              className="w-full p-2.5 bg-[#fafafa] rounded-[14px] border border-[#e5e5e5] text-xs text-[#0a0a0a] focus:bg-[#ffffff] focus:border-[#0a0a0a] outline-hidden font-medium"
            />
          </div>

          <div>
            <label className="block text-[11px] font-mono uppercase text-[#737373] mb-1">
              Description & Context
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Outline the operational milestones, target deliverables, and strategic purpose..."
              className="w-full p-2.5 bg-[#fafafa] rounded-[14px] border border-[#e5e5e5] text-xs text-[#0a0a0a] focus:bg-[#ffffff] focus:border-[#0a0a0a] outline-hidden resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-mono uppercase text-[#737373] mb-1">
                Department
              </label>
              <select
                value={departmentId}
                onChange={(e) => setDepartmentId(e.target.value)}
                className="w-full p-2.5 bg-[#fafafa] rounded-[14px] border border-[#e5e5e5] text-xs text-[#0a0a0a] outline-hidden"
              >
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase text-[#737373] mb-1">
                Objective Owner
              </label>
              <select
                value={ownerEmployeeId}
                onChange={(e) => setOwnerEmployeeId(e.target.value)}
                className="w-full p-2.5 bg-[#fafafa] rounded-[14px] border border-[#e5e5e5] text-xs text-[#0a0a0a] outline-hidden"
              >
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.firstName} {emp.lastName} ({emp.department})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-mono uppercase text-[#737373] mb-1">
                Target Metric (KPI)
              </label>
              <input
                type="text"
                value={metric}
                onChange={(e) => setMetric(e.target.value)}
                placeholder="e.g. 99.98% uptime / KES 50M ARR"
                className="w-full p-2.5 bg-[#fafafa] rounded-[14px] border border-[#e5e5e5] text-xs text-[#0a0a0a] focus:bg-[#ffffff] focus:border-[#0a0a0a] outline-hidden"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase text-[#737373] mb-1">
                Weight in Appraisal (%)
              </label>
              <input
                type="number"
                min="5"
                max="100"
                value={weight}
                onChange={(e) => setWeight(Number(e.target.value))}
                className="w-full p-2.5 bg-[#fafafa] rounded-[14px] border border-[#e5e5e5] text-xs text-[#0a0a0a] font-mono outline-hidden"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-[#e5e5e5]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-[18px] bg-[#f5f5f5] hover:bg-[#ebebeb] text-[#0a0a0a] text-xs font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-[18px] bg-[#0a0a0a] hover:bg-[#262626] text-[#ffffff] text-xs font-medium transition-colors flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Create Objective</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
