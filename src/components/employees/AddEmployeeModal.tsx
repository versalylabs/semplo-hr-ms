/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, UserPlus, Check, Camera, Upload } from 'lucide-react';
import { useHR } from '../../context/HRContext';
import { EmploymentType, UserRole } from '../../types/hr';

export const AddEmployeeModal: React.FC = () => {
  const {
    isAddModalOpen,
    setIsAddModalOpen,
    departments,
    employees,
    addEmployee,
    addOnboardingRecord,
    setSelectedEmployee,
  } = useHR();

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    department: departments[0]?.name || 'Software Engineering',
    jobTitle: '',
    role: 'employee' as UserRole,
    employmentType: 'full_time' as EmploymentType,
    managerId: '',
    location: 'Nairobi HQ - Upper Hill',
    compensationTier: 'L4 Mid',
    baseSalary: 220000, // KES per month
    nationalId: '',
    kraPin: '',
    nssfNumber: '',
    shifNumber: '',
    emergencyName: '',
    emergencyRelation: '',
    emergencyPhone: '',
    bankName: 'Equity Bank Kenya',
    accountLast4: '7741',
    mpesaNumber: '',
    createOnboarding: true,
  });

  if (!isAddModalOpen) return null;

  const handlePhotoFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setForm((prev) => ({ ...prev, avatar: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.firstName || !form.lastName || !form.email) return;

    const manager = employees.find((e) => e.id === form.managerId);

    const newEmp = addEmployee({
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      email: form.email.trim(),
      phone: form.phone || '+254 700 000 000',
      avatar: form.avatar || `https://images.unsplash.com/photo-${1534528741775 + Math.floor(Math.random() * 1000)}?w=200&auto=format&fit=crop&q=80`,
      department: form.department,
      jobTitle: form.jobTitle || 'Associate Software Engineer',
      role: form.role,
      employmentType: form.employmentType,
      status: 'active',
      joiningDate: '2026-09-25',
      managerId: form.managerId || undefined,
      managerName: manager ? `${manager.firstName} ${manager.lastName}` : undefined,
      location: form.location,
      compensationTier: form.compensationTier,
      baseSalary: Number(form.baseSalary),
      currency: 'KES',
      nationalId: form.nationalId || `${Math.floor(20000000 + Math.random() * 19000000)}`,
      kraPin: form.kraPin || `A00${Math.floor(1000000 + Math.random() * 9000000)}Z`,
      nssfNumber: form.nssfNumber || `${Math.floor(100000000 + Math.random() * 90000000)}`,
      shifNumber: form.shifNumber || `SHIF-${Math.floor(100000 + Math.random() * 900000)}`,
      emergencyContact: {
        name: form.emergencyName || 'Family Kin',
        relation: form.emergencyRelation || 'Next of Kin',
        phone: form.emergencyPhone || '+254 722 000 000',
      },
      bankInfo: {
        bankName: form.bankName,
        accountLast4: form.accountLast4,
        mpesaNumber: form.mpesaNumber || form.phone,
      },
      documents: [
        {
          id: `doc_${Date.now()}_1`,
          name: 'Employment Contract (Kenya Employment Act)',
          type: 'contract',
          status: 'verified',
          uploadedAt: '2026-09-25',
        },
      ],
    });

    if (form.createOnboarding) {
      addOnboardingRecord(
        newEmp.id,
        manager ? `${manager.firstName} ${manager.lastName}` : 'Brian Otieno'
      );
    }

    setIsAddModalOpen(false);
    setSelectedEmployee(newEmp);
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-60 p-4 animate-in fade-in">
      <div className="bg-[#ffffff] rounded-[24px] border border-[#e5e5e5] max-w-2xl w-full p-6 card-shadow flex flex-col gap-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#e5e5e5]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-[10px] bg-[#0a0a0a] text-[#ffffff] flex items-center justify-center">
              <UserPlus className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-[18px] font-bold text-emerald-700 tracking-tight whitespace-normal sm:whitespace-nowrap">
                New Employee Provisioning
              </h2>
              <p className="text-[12px] text-slate-500">
                Capture statutory requirements (KRA PIN, National ID, NSSF, SHIF) and assign payroll tier.
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsAddModalOpen(false)}
            className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Employee Photo Upload Section */}
          <div className="flex items-center gap-4 p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl">
            <div className="relative group shrink-0">
              <img
                src={form.avatar}
                alt="Preview"
                className="w-14 h-14 rounded-full object-cover border-2 border-emerald-500/40 shadow-xs"
              />
              <label
                className="absolute bottom-0 right-0 p-1.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-md cursor-pointer transition-all hover:scale-110"
                title="Upload Photo"
              >
                <Camera className="w-3.5 h-3.5" />
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePhotoFile}
                />
              </label>
            </div>
            <div className="flex-1 min-w-0">
              <label className="text-xs font-semibold text-slate-700 block">
                Employee Photo (Upload from device or enter URL)
              </label>
              <div className="flex items-center gap-2 mt-1.5">
                <label className="px-3 py-1 bg-white border border-slate-200 hover:border-emerald-300 text-slate-700 hover:text-emerald-700 text-xs font-medium rounded-xl cursor-pointer shadow-2xs transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Choose Image</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handlePhotoFile}
                  />
                </label>
                <input
                  type="text"
                  placeholder="Or paste image URL"
                  value={form.avatar}
                  onChange={(e) => setForm({ ...form, avatar: e.target.value })}
                  className="w-full px-2.5 py-1 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:border-emerald-500 text-slate-600 truncate"
                />
              </div>
            </div>
          </div>

          {/* Identity */}
          <div>
            <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400 block mb-2">
              Identity & Contact
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[12px] text-[#0a0a0a] block mb-1">First Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Kiprotich"
                  value={form.firstName}
                  onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                  className="w-full px-3 py-2 bg-[#f5f5f5] rounded-[18px] text-[13px] border-none"
                />
              </div>
              <div>
                <label className="text-[12px] text-[#0a0a0a] block mb-1">Last Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Koech"
                  value={form.lastName}
                  onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                  className="w-full px-3 py-2 bg-[#f5f5f5] rounded-[18px] text-[13px] border-none"
                />
              </div>
              <div>
                <label className="text-[12px] text-[#0a0a0a] block mb-1">Work Email *</label>
                <input
                  type="email"
                  required
                  placeholder="kiprotich.koech@pulse.co.ke"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-3 py-2 bg-[#f5f5f5] rounded-[18px] text-[13px] border-none"
                />
              </div>
              <div>
                <label className="text-[12px] text-[#0a0a0a] block mb-1">Mobile Phone (M-Pesa)</label>
                <input
                  type="text"
                  placeholder="+254 712 345 678"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full px-3 py-2 bg-[#f5f5f5] rounded-[18px] text-[13px] border-none"
                />
              </div>
            </div>
          </div>

          {/* Statutory Identifiers */}
          <div className="pt-2 border-t border-[#f5f5f5]">
            <span className="text-[11px] font-medium uppercase tracking-wider text-[#737373] block mb-2">
              Kenyan Statutory Identifiers
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[12px] text-[#0a0a0a] block mb-1">National ID / Passport Number</label>
                <input
                  type="text"
                  placeholder="e.g. 30192847"
                  value={form.nationalId}
                  onChange={(e) => setForm({ ...form, nationalId: e.target.value })}
                  className="w-full px-3 py-2 bg-[#f5f5f5] rounded-[18px] text-[13px] border-none"
                />
              </div>
              <div>
                <label className="text-[12px] text-[#0a0a0a] block mb-1">KRA Tax PIN</label>
                <input
                  type="text"
                  placeholder="e.g. A009829103Z"
                  value={form.kraPin}
                  onChange={(e) => setForm({ ...form, kraPin: e.target.value })}
                  className="w-full px-3 py-2 bg-[#f5f5f5] rounded-[18px] text-[13px] border-none"
                />
              </div>
            </div>
          </div>

          {/* Role & Department */}
          <div className="pt-2 border-t border-[#f5f5f5]">
            <span className="text-[11px] font-medium uppercase tracking-wider text-[#737373] block mb-2">
              Role & Department
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[12px] text-[#0a0a0a] block mb-1">Department</label>
                <select
                  value={form.department}
                  onChange={(e) => setForm({ ...form, department: e.target.value })}
                  className="w-full px-3 py-2 bg-[#f5f5f5] rounded-[18px] text-[13px] border-none"
                >
                  {departments.map((d) => (
                    <option key={d.id} value={d.name}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[12px] text-[#0a0a0a] block mb-1">Job Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Cloud Security Analyst"
                  value={form.jobTitle}
                  onChange={(e) => setForm({ ...form, jobTitle: e.target.value })}
                  className="w-full px-3 py-2 bg-[#f5f5f5] rounded-[18px] text-[13px] border-none"
                />
              </div>
              <div>
                <label className="text-[12px] text-[#0a0a0a] block mb-1">Hub Location</label>
                <select
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  className="w-full px-3 py-2 bg-[#f5f5f5] rounded-[18px] text-[13px] border-none"
                >
                  <option value="Nairobi HQ - Upper Hill">Nairobi HQ - Upper Hill</option>
                  <option value="Mombasa Coastal Hub">Mombasa Coastal Hub</option>
                  <option value="Kisumu Western Hub">Kisumu Western Hub</option>
                  <option value="Remote Kenya">Remote Kenya</option>
                </select>
              </div>
              <div>
                <label className="text-[12px] text-[#0a0a0a] block mb-1">Supervisor / Lead</label>
                <select
                  value={form.managerId}
                  onChange={(e) => setForm({ ...form, managerId: e.target.value })}
                  className="w-full px-3 py-2 bg-[#f5f5f5] rounded-[18px] text-[13px] border-none"
                >
                  <option value="">Executive Leadership</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.firstName} {emp.lastName} ({emp.jobTitle})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Compensation */}
          <div className="pt-2 border-t border-[#f5f5f5]">
            <span className="text-[11px] font-medium uppercase tracking-wider text-[#737373] block mb-2">
              Monthly Remuneration (KES)
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[12px] text-[#0a0a0a] block mb-1">Band Tier</label>
                <input
                  type="text"
                  placeholder="L4 Mid"
                  value={form.compensationTier}
                  onChange={(e) => setForm({ ...form, compensationTier: e.target.value })}
                  className="w-full px-3 py-2 bg-[#f5f5f5] rounded-[18px] text-[13px] border-none"
                />
              </div>
              <div>
                <label className="text-[12px] text-[#0a0a0a] block mb-1">Base Monthly Gross (KES)</label>
                <input
                  type="number"
                  placeholder="220000"
                  value={form.baseSalary}
                  onChange={(e) => setForm({ ...form, baseSalary: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-[#f5f5f5] rounded-[18px] text-[13px] border-none"
                />
              </div>
            </div>
          </div>

          {/* Onboarding trigger */}
          <div className="p-3 bg-[#fafafa] rounded-[18px] border border-[#e5e5e5] flex items-center justify-between">
            <div>
              <div className="text-[13px] font-medium text-[#0a0a0a]">
                Initialize 30-Day Onboarding Roadmap
              </div>
              <div className="text-[11px] text-[#737373]">
                Triggers Kenyan compliance checks, Upper Hill access card, and mentorship pairing.
              </div>
            </div>
            <input
              type="checkbox"
              checked={form.createOnboarding}
              onChange={(e) => setForm({ ...form, createOnboarding: e.target.checked })}
              className="w-4 h-4 accent-[#0a0a0a] cursor-pointer"
            />
          </div>

          {/* Submit */}
          <div className="pt-4 border-t border-slate-200/90 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 rounded-2xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 text-[13px] font-medium transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-[13px] font-semibold transition-all shadow-sm shadow-emerald-600/30 flex items-center gap-1.5 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Complete Provisioning</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
