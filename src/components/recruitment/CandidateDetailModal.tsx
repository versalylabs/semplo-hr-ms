/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  X,
  Star,
  Building2,
  MapPin,
  Mail,
  Phone,
  Calendar,
  Briefcase,
  GraduationCap,
  Clock,
  DollarSign,
  UserCheck,
  CheckCircle2,
  AlertCircle,
  FileText,
  Send,
  ArrowRight,
  Shield,
  ThumbsUp,
  ThumbsDown,
  Sparkles,
} from 'lucide-react';
import { useHR } from '../../context/HRContext';
import { Candidate, CandidateStage, CandidateScorecard } from '../../types/hr';

const STAGES: { id: CandidateStage; label: string }[] = [
  { id: 'applied', label: '1. Applied' },
  { id: 'screening', label: '2. Screening' },
  { id: 'interviewing', label: '3. Interviewing' },
  { id: 'offer', label: '4. Offer Extended' },
  { id: 'hired', label: '5. Hired & Onboarding' },
];

export const CandidateDetailModal: React.FC = () => {
  const {
    selectedCandidate,
    setSelectedCandidate,
    updateCandidateStage,
    addCandidateScorecard,
    hireCandidate,
    activePersona,
    canPerformAction,
    employees,
    setCurrentTab,
    setSelectedEmployee,
  } = useHR();

  const [activeTab, setActiveTab] = useState<'profile' | 'scorecards' | 'hire'>('profile');
  const [isSubmittingScorecard, setIsSubmittingScorecard] = useState(false);
  const [scorecardStage, setScorecardStage] = useState('Technical Interview');
  const [scorecardRating, setScorecardRating] = useState(4);
  const [technicalScore, setTechnicalScore] = useState(4);
  const [cultureScore, setCultureScore] = useState(4);
  const [commScore, setCommScore] = useState(4);
  const [scorecardRec, setScorecardRec] = useState<CandidateScorecard['recommendation']>('hire');
  const [scorecardNotes, setScorecardNotes] = useState('');

  // Hire flow state
  const [hireSalary, setHireSalary] = useState(selectedCandidate?.expectedSalaryKES || 320000);
  const [hireDate, setHireDate] = useState('2026-10-01');
  const [hireManagerId, setHireManagerId] = useState('emp_003');
  const [hiredSuccessEmployee, setHiredSuccessEmployee] = useState<string | null>(null);

  if (!selectedCandidate) return null;

  const isHrOrAdmin = canPerformAction('hr_manager');
  const isManagerOrAdmin = canPerformAction('department_lead');

  const handleStageChange = (newStage: CandidateStage) => {
    updateCandidateStage(selectedCandidate.id, newStage);
  };

  const handleScorecardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scorecardNotes.trim()) return;

    addCandidateScorecard(selectedCandidate.id, {
      interviewerName: activePersona.name,
      interviewerRole: activePersona.roleLabel,
      stageName: scorecardStage,
      rating: scorecardRating,
      recommendation: scorecardRec,
      technicalCompetency: technicalScore,
      culturalAlignment: cultureScore,
      communicationSkills: commScore,
      notes: scorecardNotes.trim(),
    });

    setScorecardNotes('');
    setIsSubmittingScorecard(false);
  };

  const handleFinalizeHire = () => {
    const newEmp = hireCandidate(selectedCandidate.id, {
      baseSalary: hireSalary,
      joiningDate: hireDate,
      managerId: hireManagerId,
    });
    if (newEmp) {
      setHiredSuccessEmployee(newEmp.employeeCode);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0a0a0a]/40 backdrop-blur-xs p-4 overflow-y-auto animate-fade-in">
      <div className="bg-[#ffffff] w-full max-w-3xl rounded-[28px] border border-[#e5e5e5] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header Ribbon */}
        <div className="p-6 border-b border-[#e5e5e5] flex items-start justify-between bg-[#fafafa]">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-[20px] bg-[#0a0a0a] text-[#ffffff] font-bold text-lg flex items-center justify-center font-mono shrink-0 shadow-sm">
              {selectedCandidate.fullName
                .split(' ')
                .map((n) => n[0])
                .join('')}
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-xl font-bold tracking-tight text-[#0a0a0a]">
                  {selectedCandidate.fullName}
                </h2>
                <span
                  className={`text-[11px] font-mono px-2.5 py-0.5 rounded-full border ${
                    selectedCandidate.stage === 'hired'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200 font-semibold'
                      : selectedCandidate.stage === 'offer'
                      ? 'bg-amber-50 text-amber-700 border-amber-200 font-semibold'
                      : selectedCandidate.stage === 'rejected'
                      ? 'bg-rose-50 text-rose-700 border-rose-200'
                      : 'bg-[#f0f0f0] text-[#171717] border-[#e5e5e5]'
                  }`}
                >
                  {selectedCandidate.stage.toUpperCase()}
                </span>
                <span className="flex items-center gap-1 text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                  <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                  <span>{selectedCandidate.rating.toFixed(1)} / 5.0</span>
                </span>
              </div>

              <div className="text-sm font-medium text-[#171717] mt-1 flex items-center gap-2">
                <span>{selectedCandidate.jobTitle}</span>
                <span className="text-[#a3a3a3]">·</span>
                <span className="text-[#737373]">{selectedCandidate.department}</span>
              </div>

              <div className="flex items-center gap-3 text-xs text-[#737373] mt-2 flex-wrap font-mono">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  {selectedCandidate.location}
                </span>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5" />
                  {selectedCandidate.email}
                </span>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5" />
                  {selectedCandidate.phone}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setSelectedCandidate(null)}
            className="p-2 rounded-full text-[#737373] hover:text-[#0a0a0a] hover:bg-[#e5e5e5] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stage Stepper Ribbon */}
        <div className="px-6 py-3 bg-[#ffffff] border-b border-[#e5e5e5] flex items-center justify-between overflow-x-auto gap-2">
          <div className="flex items-center gap-1 text-xs font-mono text-[#737373] shrink-0 mr-2">
            <span>PIPELINE STAGE:</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {STAGES.map((s, idx) => {
              const isCurrent = selectedCandidate.stage === s.id;
              const isPast =
                STAGES.findIndex((st) => st.id === selectedCandidate.stage) > idx;

              return (
                <button
                  key={s.id}
                  disabled={!isManagerOrAdmin || selectedCandidate.stage === 'hired'}
                  onClick={() => handleStageChange(s.id)}
                  className={`px-3 py-1.5 rounded-[18px] text-xs font-medium transition-all flex items-center gap-1.5 ${
                    isCurrent
                      ? 'bg-[#0a0a0a] text-[#ffffff] shadow-xs'
                      : isPast
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                      : 'bg-[#fafafa] text-[#737373] border border-[#e5e5e5] hover:bg-[#f0f0f0]'
                  }`}
                >
                  {isPast && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                  <span>{s.label}</span>
                </button>
              );
            })}

            {selectedCandidate.stage !== 'hired' && (
              <button
                disabled={!isManagerOrAdmin}
                onClick={() => handleStageChange('rejected')}
                className={`px-3 py-1.5 rounded-[18px] text-xs font-medium transition-all ${
                  selectedCandidate.stage === 'rejected'
                    ? 'bg-rose-600 text-[#ffffff]'
                    : 'text-rose-600 border border-rose-200 hover:bg-rose-50'
                }`}
              >
                Archive / Reject
              </button>
            )}
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-2 px-6 pt-3 border-b border-[#e5e5e5] bg-[#fafafa]">
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-3 py-2 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'profile'
                ? 'border-[#0a0a0a] text-[#0a0a0a]'
                : 'border-transparent text-[#737373] hover:text-[#0a0a0a]'
            }`}
          >
            Candidate Profile & Dossier
          </button>
          <button
            onClick={() => setActiveTab('scorecards')}
            className={`px-3 py-2 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'scorecards'
                ? 'border-[#0a0a0a] text-[#0a0a0a]'
                : 'border-transparent text-[#737373] hover:text-[#0a0a0a]'
            }`}
          >
            <span>Interviewer Scorecards</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-[#e5e5e5] font-mono">
              {selectedCandidate.scorecards.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('hire')}
            className={`px-3 py-2 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'hire'
                ? 'border-[#0a0a0a] text-[#0a0a0a]'
                : 'border-transparent text-emerald-700 hover:text-emerald-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Hire & Onboard Conversion</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {activeTab === 'profile' && (
            <div className="space-y-6">
              {/* Quick Spec Matrix */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-3.5 rounded-[20px] bg-[#fafafa] border border-[#e5e5e5]">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-[#737373]">
                    Expected Compensation
                  </div>
                  <div className="text-base font-bold text-[#0a0a0a] mt-1 font-mono">
                    KES {selectedCandidate.expectedSalaryKES.toLocaleString()}
                  </div>
                  <div className="text-[11px] text-[#737373] mt-0.5">Gross monthly</div>
                </div>

                <div className="p-3.5 rounded-[20px] bg-[#fafafa] border border-[#e5e5e5]">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-[#737373]">
                    Experience & Notice
                  </div>
                  <div className="text-base font-bold text-[#0a0a0a] mt-1 font-mono">
                    {selectedCandidate.yearsOfExperience} Yrs Exp
                  </div>
                  <div className="text-[11px] text-[#737373] mt-0.5">
                    {selectedCandidate.noticePeriodDays} days notice period
                  </div>
                </div>

                <div className="p-3.5 rounded-[20px] bg-[#fafafa] border border-[#e5e5e5]">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-[#737373]">
                    Sourcing Channel
                  </div>
                  <div className="text-base font-bold text-[#0a0a0a] mt-1">
                    {selectedCandidate.source}
                  </div>
                  <div className="text-[11px] text-[#737373] mt-0.5">Applied: {selectedCandidate.appliedDate}</div>
                </div>

                <div className="p-3.5 rounded-[20px] bg-[#fafafa] border border-[#e5e5e5]">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-[#737373]">
                    Current Organization
                  </div>
                  <div className="text-base font-bold text-[#0a0a0a] mt-1 truncate">
                    {selectedCandidate.currentCompany || 'Not disclosed'}
                  </div>
                  <div className="text-[11px] text-[#737373] mt-0.5 truncate">
                    {selectedCandidate.currentRole || 'Mid/Senior Tech'}
                  </div>
                </div>
              </div>

              {/* Education & Qualifications */}
              <div className="p-4 rounded-[20px] border border-[#e5e5e5] bg-[#ffffff]">
                <div className="text-xs font-mono uppercase tracking-wider text-[#737373] mb-2 flex items-center gap-1.5">
                  <GraduationCap className="w-4 h-4 text-[#0a0a0a]" />
                  <span>Academic Credentials & Qualifications</span>
                </div>
                <div className="text-sm font-semibold text-[#0a0a0a]">
                  {selectedCandidate.education}
                </div>
              </div>

              {/* Candidate Notes & Application Memo */}
              <div className="p-4 rounded-[20px] border border-[#e5e5e5] bg-[#fafafa]">
                <div className="text-xs font-mono uppercase tracking-wider text-[#737373] mb-2 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-[#0a0a0a]" />
                  <span>Talent Acquisition Screening Notes</span>
                </div>
                <p className="text-xs leading-relaxed text-[#171717]">
                  {selectedCandidate.notes || 'No preliminary notes recorded.'}
                </p>
              </div>

              {/* Attached CV Preview Box */}
              <div className="p-4 rounded-[20px] border border-[#e5e5e5] bg-[#ffffff] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-[12px] bg-[#f5f5f5] flex items-center justify-center text-[#0a0a0a]">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#0a0a0a]">
                      Curriculum Vitae (PDF)
                    </div>
                    <div className="text-[11px] text-[#737373]">
                      Verified Kenyan Identity & Academic Records attached
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => alert(`Simulated downloading CV for ${selectedCandidate.fullName}`)}
                  className="px-3 py-1.5 rounded-[18px] bg-[#fafafa] border border-[#e5e5e5] text-xs font-semibold text-[#0a0a0a] hover:bg-[#f0f0f0] transition-colors"
                >
                  Download Dossier
                </button>
              </div>
            </div>
          )}

          {activeTab === 'scorecards' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="text-xs font-mono uppercase tracking-wider text-[#737373]">
                  Candidate Interview Evaluations ({selectedCandidate.scorecards.length})
                </div>
                {!isSubmittingScorecard && isManagerOrAdmin && (
                  <button
                    onClick={() => setIsSubmittingScorecard(true)}
                    className="px-3 py-1.5 rounded-[18px] bg-[#0a0a0a] text-xs font-semibold text-[#ffffff] hover:bg-[#262626] transition-colors flex items-center gap-1.5"
                  >
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>Submit Scorecard</span>
                  </button>
                )}
              </div>

              {/* New Scorecard Form */}
              {isSubmittingScorecard && (
                <form
                  onSubmit={handleScorecardSubmit}
                  className="p-5 rounded-[24px] border border-[#0a0a0a] bg-[#fafafa] space-y-4"
                >
                  <div className="flex items-center justify-between border-b border-[#e5e5e5] pb-3">
                    <div className="text-xs font-bold text-[#0a0a0a]">
                      New Evaluation by {activePersona.name} ({activePersona.roleLabel})
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsSubmittingScorecard(false)}
                      className="text-xs text-[#737373] hover:text-[#0a0a0a]"
                    >
                      Cancel
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[11px] font-mono text-[#737373] block mb-1">
                        INTERVIEW STAGE
                      </label>
                      <input
                        type="text"
                        value={scorecardStage}
                        onChange={(e) => setScorecardStage(e.target.value)}
                        className="w-full px-3 py-2 rounded-[14px] bg-[#ffffff] border border-[#e5e5e5] text-xs outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-mono text-[#737373] block mb-1">
                        HIRING RECOMMENDATION
                      </label>
                      <select
                        value={scorecardRec}
                        onChange={(e) =>
                          setScorecardRec(e.target.value as CandidateScorecard['recommendation'])
                        }
                        className="w-full px-3 py-2 rounded-[14px] bg-[#ffffff] border border-[#e5e5e5] text-xs outline-hidden"
                      >
                        <option value="strong_hire">Strong Hire</option>
                        <option value="hire">Hire</option>
                        <option value="neutral">Neutral / Re-interview</option>
                        <option value="no_hire">No Hire</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="text-[11px] font-mono text-[#737373] block mb-1">
                        TECHNICAL (1-5)
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="5"
                        step="0.5"
                        value={technicalScore}
                        onChange={(e) => setTechnicalScore(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-[14px] bg-[#ffffff] border border-[#e5e5e5] text-xs font-mono outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-mono text-[#737373] block mb-1">
                        CULTURE (1-5)
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="5"
                        step="0.5"
                        value={cultureScore}
                        onChange={(e) => setCultureScore(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-[14px] bg-[#ffffff] border border-[#e5e5e5] text-xs font-mono outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-mono text-[#737373] block mb-1">
                        COMMUNICATION (1-5)
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="5"
                        step="0.5"
                        value={commScore}
                        onChange={(e) => setCommScore(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-[14px] bg-[#ffffff] border border-[#e5e5e5] text-xs font-mono outline-hidden"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-mono text-[#737373] block mb-1">
                      ASSESSMENT NOTES & OBSERVATIONS
                    </label>
                    <textarea
                      rows={3}
                      value={scorecardNotes}
                      onChange={(e) => setScorecardNotes(e.target.value)}
                      placeholder="Detail technical problem solving, domain competency, and alignment with Semplo principles..."
                      className="w-full px-3 py-2 rounded-[14px] bg-[#ffffff] border border-[#e5e5e5] text-xs outline-hidden"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-[18px] bg-[#0a0a0a] text-xs font-semibold text-[#ffffff] hover:bg-[#262626] transition-colors"
                  >
                    Submit Official Scorecard
                  </button>
                </form>
              )}

              {/* Scorecards List */}
              {selectedCandidate.scorecards.length === 0 ? (
                <div className="p-8 text-center bg-[#fafafa] rounded-[24px] border border-dashed border-[#e5e5e5] text-[#737373] text-xs">
                  No interview scorecards submitted yet. Click "Submit Scorecard" to add interviewer notes.
                </div>
              ) : (
                <div className="space-y-4">
                  {selectedCandidate.scorecards.map((sc) => (
                    <div
                      key={sc.id}
                      className="p-5 rounded-[22px] border border-[#e5e5e5] bg-[#ffffff] space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-xs font-bold text-[#0a0a0a]">
                            {sc.interviewerName}
                          </div>
                          <div className="text-[11px] text-[#737373] font-mono">
                            {sc.interviewerRole} · {sc.stageName}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                              sc.recommendation === 'strong_hire'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 font-bold'
                                : sc.recommendation === 'hire'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : sc.recommendation === 'neutral'
                                ? 'bg-amber-50 text-amber-700 border-amber-200'
                                : 'bg-rose-50 text-rose-700 border-rose-200'
                            }`}
                          >
                            {sc.recommendation.replace('_', ' ').toUpperCase()}
                          </span>
                          <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 flex items-center gap-1 font-mono">
                            <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                            {sc.rating.toFixed(1)}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2 py-2 px-3 bg-[#fafafa] rounded-[14px] text-[11px] font-mono text-[#737373]">
                        <div>Technical: <span className="font-bold text-[#0a0a0a]">{sc.technicalCompetency}/5</span></div>
                        <div>Culture: <span className="font-bold text-[#0a0a0a]">{sc.culturalAlignment}/5</span></div>
                        <div>Comms: <span className="font-bold text-[#0a0a0a]">{sc.communicationSkills}/5</span></div>
                      </div>

                      <p className="text-xs leading-relaxed text-[#171717]">{sc.notes}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'hire' && (
            <div className="space-y-6">
              {hiredSuccessEmployee ? (
                <div className="p-6 rounded-[24px] bg-emerald-50 border border-emerald-200 text-center space-y-4">
                  <div className="w-12 h-12 rounded-full bg-emerald-600 text-[#ffffff] flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-emerald-900">
                      Hire Completed & Onboarding Initialized!
                    </h3>
                    <p className="text-xs text-emerald-700 mt-1">
                      {selectedCandidate.fullName} has been officially converted to active employee code{' '}
                      <span className="font-mono font-bold">{hiredSuccessEmployee}</span>. A 30-day onboarding roadmap with Nairobi HQ turnstile enrollment has been generated.
                    </p>
                  </div>
                  <div className="flex items-center justify-center gap-3 pt-2">
                    <button
                      onClick={() => {
                        setSelectedCandidate(null);
                        setCurrentTab('employees');
                      }}
                      className="px-4 py-2 rounded-[18px] bg-emerald-700 text-xs font-semibold text-[#ffffff] hover:bg-emerald-800 transition-colors"
                    >
                      Open Employee Directory
                    </button>
                    <button
                      onClick={() => {
                        setSelectedCandidate(null);
                        setCurrentTab('onboarding');
                      }}
                      className="px-4 py-2 rounded-[18px] bg-[#ffffff] border border-emerald-300 text-xs font-semibold text-emerald-800 hover:bg-emerald-100 transition-colors"
                    >
                      View 30-Day Onboarding Roadmap
                    </button>
                  </div>
                </div>
              ) : selectedCandidate.stage === 'hired' ? (
                <div className="p-6 rounded-[24px] bg-[#fafafa] border border-[#e5e5e5] text-center space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                  <div className="text-sm font-bold text-[#0a0a0a]">
                    Candidate Already Hired
                  </div>
                  <p className="text-xs text-[#737373]">
                    This candidate has already been officially hired and transitioned to an employee profile.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 rounded-[20px] bg-emerald-50/60 border border-emerald-200 flex items-start gap-3">
                    <Sparkles className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs font-bold text-emerald-900">
                        One-Click Hire-to-Onboard Protocol
                      </div>
                      <div className="text-[11px] text-emerald-800 mt-0.5 leading-relaxed">
                        Converting this candidate will automatically generate an official Kenyan Employee Record (with simulated KRA PIN, NSSF, SHIF numbers) and launch their structured 30-day Induction Roadmap under Phase 2.
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[11px] font-mono text-[#737373] block mb-1">
                        AGREED MONTHLY GROSS (KES)
                      </label>
                      <input
                        type="number"
                        step="5000"
                        value={hireSalary}
                        onChange={(e) => setHireSalary(Number(e.target.value))}
                        className="w-full px-3.5 py-2.5 rounded-[16px] bg-[#ffffff] border border-[#e5e5e5] text-xs font-mono font-bold text-[#0a0a0a] outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-mono text-[#737373] block mb-1">
                        OFFICIAL JOINING DATE
                      </label>
                      <input
                        type="date"
                        value={hireDate}
                        onChange={(e) => setHireDate(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-[16px] bg-[#ffffff] border border-[#e5e5e5] text-xs font-mono outline-hidden"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-mono text-[#737373] block mb-1">
                      REPORTING MANAGER / MENTOR
                    </label>
                    <select
                      value={hireManagerId}
                      onChange={(e) => setHireManagerId(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-[16px] bg-[#ffffff] border border-[#e5e5e5] text-xs outline-hidden"
                    >
                      {employees.map((emp) => (
                        <option key={emp.id} value={emp.id}>
                          {emp.firstName} {emp.lastName} ({emp.jobTitle})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="pt-2">
                    <button
                      disabled={!isHrOrAdmin}
                      onClick={handleFinalizeHire}
                      className="w-full py-3 rounded-[20px] bg-emerald-700 hover:bg-emerald-800 text-xs font-bold text-[#ffffff] transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
                    >
                      <UserCheck className="w-4 h-4" />
                      <span>Confirm Official Hire & Launch Onboarding</span>
                    </button>
                    {!isHrOrAdmin && (
                      <p className="text-[11px] text-[#737373] text-center mt-2">
                        HR Manager or Super Admin role required to execute hire conversion.
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
