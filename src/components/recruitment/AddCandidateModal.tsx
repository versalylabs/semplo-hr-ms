/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, UserPlus } from 'lucide-react';
import { useHR } from '../../context/HRContext';
import { CandidateStage } from '../../types/hr';

interface AddCandidateModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultJobOpeningId?: string;
}

export const AddCandidateModal: React.FC<AddCandidateModalProps> = ({
  isOpen,
  onClose,
  defaultJobOpeningId,
}) => {
  const { jobOpenings, addCandidate } = useHR();

  const [jobOpeningId, setJobOpeningId] = useState(
    defaultJobOpeningId || jobOpenings[0]?.id || ''
  );
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('+254 ');
  const [location, setLocation] = useState('Nairobi, Kenya');
  const [currentCompany, setCurrentCompany] = useState('');
  const [currentRole, setCurrentRole] = useState('');
  const [yearsOfExperience, setYearsOfExperience] = useState(4);
  const [education, setEducation] = useState('BSc Computer Science, University of Nairobi');
  const [expectedSalaryKES, setExpectedSalaryKES] = useState(280000);
  const [noticePeriodDays, setNoticePeriodDays] = useState(30);
  const [source, setSource] = useState<
    'LinkedIn Kenya' | 'BrighterMonday' | 'Employee Referral' | 'Company Careers' | 'Direct Outreach'
  >('LinkedIn Kenya');
  const [stage, setStage] = useState<CandidateStage>('applied');
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim()) return;

    const opening = jobOpenings.find((j) => j.id === jobOpeningId) || jobOpenings[0];

    addCandidate({
      jobOpeningId: opening.id,
      jobTitle: opening.title,
      department: opening.department,
      fullName: fullName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      location,
      currentCompany: currentCompany.trim(),
      currentRole: currentRole.trim(),
      yearsOfExperience: Number(yearsOfExperience),
      education: education.trim(),
      expectedSalaryKES: Number(expectedSalaryKES),
      noticePeriodDays: Number(noticePeriodDays),
      source,
      stage,
      rating: 4.0,
      notes: notes.trim(),
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0a0a0a]/40 backdrop-blur-xs p-4 overflow-y-auto animate-fade-in">
      <div className="bg-[#ffffff] w-full max-w-xl rounded-[28px] border border-[#e5e5e5] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-[#e5e5e5] flex items-center justify-between bg-[#fafafa]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[14px] bg-[#0a0a0a] text-[#ffffff] flex items-center justify-center">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight text-[#0a0a0a]">
                Register Candidate Profile
              </h2>
              <p className="text-xs text-[#737373]">
                Add candidate directly into the recruitment pipeline
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
              TARGET JOB REQUISITION *
            </label>
            <select
              value={jobOpeningId}
              onChange={(e) => setJobOpeningId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-[16px] bg-[#fafafa] border border-[#e5e5e5] text-xs font-semibold outline-hidden"
            >
              {jobOpenings.map((j) => (
                <option key={j.id} value={j.id}>
                  {j.requisitionCode} - {j.title} ({j.department})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] font-mono text-[#737373] block mb-1">
                FULL NAME *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Grace Njeri"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-[16px] bg-[#fafafa] border border-[#e5e5e5] text-xs outline-hidden"
              />
            </div>

            <div>
              <label className="text-[11px] font-mono text-[#737373] block mb-1">
                EMAIL ADDRESS *
              </label>
              <input
                type="email"
                required
                placeholder="grace.njeri@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-[16px] bg-[#fafafa] border border-[#e5e5e5] text-xs outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] font-mono text-[#737373] block mb-1">
                KENYAN PHONE NUMBER
              </label>
              <input
                type="text"
                placeholder="+254 7XX XXX XXX"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-[16px] bg-[#fafafa] border border-[#e5e5e5] text-xs font-mono outline-hidden"
              />
            </div>

            <div>
              <label className="text-[11px] font-mono text-[#737373] block mb-1">
                LOCATION / RESIDENCE
              </label>
              <input
                type="text"
                placeholder="Nairobi, Kenya"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-[16px] bg-[#fafafa] border border-[#e5e5e5] text-xs outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] font-mono text-[#737373] block mb-1">
                CURRENT COMPANY
              </label>
              <input
                type="text"
                placeholder="e.g. Equity Bank, Safaricom"
                value={currentCompany}
                onChange={(e) => setCurrentCompany(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-[16px] bg-[#fafafa] border border-[#e5e5e5] text-xs outline-hidden"
              />
            </div>

            <div>
              <label className="text-[11px] font-mono text-[#737373] block mb-1">
                CURRENT ROLE
              </label>
              <input
                type="text"
                placeholder="e.g. Software Engineer"
                value={currentRole}
                onChange={(e) => setCurrentRole(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-[16px] bg-[#fafafa] border border-[#e5e5e5] text-xs outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-[11px] font-mono text-[#737373] block mb-1">
                EXPERIENCE (YRS)
              </label>
              <input
                type="number"
                min="0"
                max="30"
                value={yearsOfExperience}
                onChange={(e) => setYearsOfExperience(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-[14px] bg-[#fafafa] border border-[#e5e5e5] text-xs font-mono outline-hidden"
              />
            </div>

            <div>
              <label className="text-[11px] font-mono text-[#737373] block mb-1">
                EXPECTED (KES)
              </label>
              <input
                type="number"
                step="5000"
                value={expectedSalaryKES}
                onChange={(e) => setExpectedSalaryKES(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-[14px] bg-[#fafafa] border border-[#e5e5e5] text-xs font-mono outline-hidden"
              />
            </div>

            <div>
              <label className="text-[11px] font-mono text-[#737373] block mb-1">
                NOTICE (DAYS)
              </label>
              <input
                type="number"
                value={noticePeriodDays}
                onChange={(e) => setNoticePeriodDays(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-[14px] bg-[#fafafa] border border-[#e5e5e5] text-xs font-mono outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-mono text-[#737373] block mb-1">
              HIGHEST DEGREE & UNIVERSITY
            </label>
            <input
              type="text"
              placeholder="e.g. BCom Finance, Strathmore University"
              value={education}
              onChange={(e) => setEducation(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-[16px] bg-[#fafafa] border border-[#e5e5e5] text-xs outline-hidden"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] font-mono text-[#737373] block mb-1">
                SOURCING CHANNEL
              </label>
              <select
                value={source}
                onChange={(e) =>
                  setSource(
                    e.target.value as
                      | 'LinkedIn Kenya'
                      | 'BrighterMonday'
                      | 'Employee Referral'
                      | 'Company Careers'
                      | 'Direct Outreach'
                  )
                }
                className="w-full px-3.5 py-2.5 rounded-[16px] bg-[#fafafa] border border-[#e5e5e5] text-xs outline-hidden"
              >
                <option value="LinkedIn Kenya">LinkedIn Kenya</option>
                <option value="BrighterMonday">BrighterMonday</option>
                <option value="Employee Referral">Employee Referral</option>
                <option value="Company Careers">Company Careers</option>
                <option value="Direct Outreach">Direct Outreach</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-mono text-[#737373] block mb-1">
                INITIAL PIPELINE STAGE
              </label>
              <select
                value={stage}
                onChange={(e) => setStage(e.target.value as CandidateStage)}
                className="w-full px-3.5 py-2.5 rounded-[16px] bg-[#fafafa] border border-[#e5e5e5] text-xs outline-hidden"
              >
                <option value="applied">Applied</option>
                <option value="screening">Screening</option>
                <option value="interviewing">Interviewing</option>
                <option value="offer">Offer Extended</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-[11px] font-mono text-[#737373] block mb-1">
              INITIAL SCREENING NOTES
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Referral notes, initial recruiter feedback, portfolio link..."
              className="w-full px-3.5 py-2.5 rounded-[16px] bg-[#fafafa] border border-[#e5e5e5] text-xs outline-hidden"
            />
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
              Save Candidate
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
