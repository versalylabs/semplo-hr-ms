/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Briefcase, Plus, Trash2 } from 'lucide-react';
import { useHR } from '../../context/HRContext';
import { EmploymentType } from '../../types/hr';

interface NewJobModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NewJobModal: React.FC<NewJobModalProps> = ({ isOpen, onClose }) => {
  const { addJobOpening, departments, employees, activePersona } = useHR();

  const [title, setTitle] = useState('');
  const [department, setDepartment] = useState(departments[0]?.name || 'Engineering & Infrastructure');
  const [location, setLocation] = useState('Nairobi HQ - Upper Hill');
  const [employmentType, setEmploymentType] = useState<EmploymentType>('full_time');
  const [experienceLevel, setExperienceLevel] = useState<'Entry-Level' | 'Mid-Level' | 'Senior' | 'Lead / Director'>('Senior');
  const [minSalary, setMinSalary] = useState(250000);
  const [maxSalary, setMaxSalary] = useState(380000);
  const [openingsCount, setOpeningsCount] = useState(1);
  const [targetHireDate, setTargetHireDate] = useState('2026-11-01');
  const [hiringManagerId, setHiringManagerId] = useState(employees[0]?.id || 'emp_003');
  const [description, setDescription] = useState('');
  const [requirements, setRequirements] = useState<string[]>([
    'Bachelor degree in relevant field or equivalent experience',
    '3+ years direct industry experience within Kenya or East Africa',
  ]);
  const [newReq, setNewReq] = useState('');
  const [skills, setSkills] = useState('TypeScript, Node.js, PostgreSQL');

  if (!isOpen) return null;

  const handleAddRequirement = () => {
    if (!newReq.trim()) return;
    setRequirements([...requirements, newReq.trim()]);
    setNewReq('');
  };

  const handleRemoveRequirement = (index: number) => {
    setRequirements(requirements.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    const manager = employees.find((emp) => emp.id === hiringManagerId);
    const parsedSkills = skills
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    addJobOpening({
      title: title.trim(),
      department,
      location,
      employmentType,
      experienceLevel,
      minSalaryKES: Number(minSalary),
      maxSalaryKES: Number(maxSalary),
      targetHireDate,
      openingsCount: Number(openingsCount),
      status: 'active',
      hiringManagerId,
      hiringManagerName: manager ? `${manager.firstName} ${manager.lastName}` : activePersona.name,
      description: description.trim(),
      requirements: requirements.length > 0 ? requirements : ['Professional domain competence'],
      skills: parsedSkills.length > 0 ? parsedSkills : ['General'],
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0a0a0a]/40 backdrop-blur-xs p-4 overflow-y-auto animate-fade-in">
      <div className="bg-[#ffffff] w-full max-w-2xl rounded-[28px] border border-[#e5e5e5] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-[#e5e5e5] flex items-center justify-between bg-[#fafafa]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[14px] bg-[#0a0a0a] text-[#ffffff] flex items-center justify-center">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight text-[#0a0a0a]">
                Open New Job Requisition
              </h2>
              <p className="text-xs text-[#737373]">
                Post a new position and launch candidate pipeline sourcing
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-[#737373] hover:text-[#0a0a0a] hover:bg-[#e5e5e5] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
          <div>
            <label className="text-[11px] font-mono text-[#737373] block mb-1">
              POSITION / JOB TITLE *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Senior Financial Accountant, Full-Stack Lead"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-[16px] bg-[#fafafa] border border-[#e5e5e5] text-xs font-semibold text-[#0a0a0a] outline-hidden focus:border-[#0a0a0a]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] font-mono text-[#737373] block mb-1">
                DEPARTMENT
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-[16px] bg-[#fafafa] border border-[#e5e5e5] text-xs outline-hidden"
              >
                {departments.map((d) => (
                  <option key={d.id} value={d.name}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] font-mono text-[#737373] block mb-1">
                LOCATION / WORKSPACE
              </label>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-[16px] bg-[#fafafa] border border-[#e5e5e5] text-xs outline-hidden"
              >
                <option value="Nairobi HQ - Upper Hill">Nairobi HQ - Upper Hill</option>
                <option value="Nairobi / Hybrid">Nairobi / Hybrid</option>
                <option value="Mombasa Hub">Mombasa Hub</option>
                <option value="Kisumu Hub">Kisumu Hub</option>
                <option value="Remote Kenya">Remote Kenya</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-[11px] font-mono text-[#737373] block mb-1">
                EMPLOYMENT TYPE
              </label>
              <select
                value={employmentType}
                onChange={(e) => setEmploymentType(e.target.value as EmploymentType)}
                className="w-full px-3 py-2 rounded-[14px] bg-[#fafafa] border border-[#e5e5e5] text-xs outline-hidden"
              >
                <option value="full_time">Full-Time</option>
                <option value="contract">Contract</option>
                <option value="part_time">Part-Time</option>
                <option value="intern">Intern</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-mono text-[#737373] block mb-1">
                SENIORITY LEVEL
              </label>
              <select
                value={experienceLevel}
                onChange={(e) =>
                  setExperienceLevel(
                    e.target.value as 'Entry-Level' | 'Mid-Level' | 'Senior' | 'Lead / Director'
                  )
                }
                className="w-full px-3 py-2 rounded-[14px] bg-[#fafafa] border border-[#e5e5e5] text-xs outline-hidden"
              >
                <option value="Entry-Level">Entry-Level</option>
                <option value="Mid-Level">Mid-Level</option>
                <option value="Senior">Senior</option>
                <option value="Lead / Director">Lead / Director</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-mono text-[#737373] block mb-1">
                OPENINGS COUNT
              </label>
              <input
                type="number"
                min="1"
                max="20"
                value={openingsCount}
                onChange={(e) => setOpeningsCount(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-[14px] bg-[#fafafa] border border-[#e5e5e5] text-xs font-mono outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-[11px] font-mono text-[#737373] block mb-1">
                MIN SALARY (KES)
              </label>
              <input
                type="number"
                step="10000"
                value={minSalary}
                onChange={(e) => setMinSalary(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-[14px] bg-[#fafafa] border border-[#e5e5e5] text-xs font-mono outline-hidden"
              />
            </div>

            <div>
              <label className="text-[11px] font-mono text-[#737373] block mb-1">
                MAX SALARY (KES)
              </label>
              <input
                type="number"
                step="10000"
                value={maxSalary}
                onChange={(e) => setMaxSalary(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-[14px] bg-[#fafafa] border border-[#e5e5e5] text-xs font-mono outline-hidden"
              />
            </div>

            <div>
              <label className="text-[11px] font-mono text-[#737373] block mb-1">
                TARGET HIRE DATE
              </label>
              <input
                type="date"
                value={targetHireDate}
                onChange={(e) => setTargetHireDate(e.target.value)}
                className="w-full px-3 py-2 rounded-[14px] bg-[#fafafa] border border-[#e5e5e5] text-xs font-mono outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-mono text-[#737373] block mb-1">
              ASSIGNED HIRING MANAGER
            </label>
            <select
              value={hiringManagerId}
              onChange={(e) => setHiringManagerId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-[16px] bg-[#fafafa] border border-[#e5e5e5] text-xs outline-hidden"
            >
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.firstName} {emp.lastName} ({emp.jobTitle} - {emp.department})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] font-mono text-[#737373] block mb-1">
              ROLE SUMMARY & MISSION *
            </label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Outline the core objective, day-to-day responsibilities, and team impact..."
              className="w-full px-3.5 py-2.5 rounded-[16px] bg-[#fafafa] border border-[#e5e5e5] text-xs outline-hidden focus:border-[#0a0a0a]"
            />
          </div>

          <div>
            <label className="text-[11px] font-mono text-[#737373] block mb-1">
              KEY SKILLS & TAGS (comma-separated)
            </label>
            <input
              type="text"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              placeholder="e.g. M-Pesa, Golang, Financial Auditing, KRA iTax"
              className="w-full px-3.5 py-2.5 rounded-[16px] bg-[#fafafa] border border-[#e5e5e5] text-xs font-mono outline-hidden"
            />
          </div>

          <div>
            <label className="text-[11px] font-mono text-[#737373] block mb-1">
              CORE REQUIREMENTS & QUALIFICATIONS
            </label>
            <div className="flex items-center gap-2 mb-2">
              <input
                type="text"
                value={newReq}
                onChange={(e) => setNewReq(e.target.value)}
                placeholder="Add requirement bullet..."
                className="flex-1 px-3 py-2 rounded-[14px] bg-[#fafafa] border border-[#e5e5e5] text-xs outline-hidden"
              />
              <button
                type="button"
                onClick={handleAddRequirement}
                className="px-3 py-2 rounded-[14px] bg-[#0a0a0a] text-xs font-semibold text-[#ffffff]"
              >
                Add
              </button>
            </div>
            <div className="space-y-1.5">
              {requirements.map((req, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between px-3 py-1.5 rounded-[12px] bg-[#f5f5f5] text-xs text-[#171717]"
                >
                  <span>• {req}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveRequirement(idx)}
                    className="text-[#737373] hover:text-rose-600"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-[#e5e5e5] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-[18px] text-xs font-semibold text-[#737373] hover:text-[#0a0a0a]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-[18px] bg-[#0a0a0a] text-xs font-bold text-[#ffffff] hover:bg-[#262626] transition-colors"
            >
              Publish Requisition
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
