/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Briefcase,
  Users,
  Plus,
  Search,
  Filter,
  Star,
  MapPin,
  Clock,
  CheckCircle2,
  AlertCircle,
  Building2,
  Calendar,
  Sparkles,
  ArrowRight,
  ChevronRight,
  TrendingUp,
  Award,
  Layers,
  BarChart3,
  ExternalLink,
  DollarSign,
  UserCheck,
} from 'lucide-react';
import { useHR } from '../../context/HRContext';
import { Candidate, CandidateStage, JobOpening } from '../../types/hr';
import { CandidateDetailModal } from './CandidateDetailModal';
import { NewJobModal } from './NewJobModal';
import { AddCandidateModal } from './AddCandidateModal';

const PIPELINE_COLUMNS: { stage: CandidateStage; label: string; color: string }[] = [
  { stage: 'applied', label: 'Applied', color: 'border-blue-400' },
  { stage: 'screening', label: 'Screening', color: 'border-purple-400' },
  { stage: 'interviewing', label: 'Interviewing', color: 'border-amber-400' },
  { stage: 'offer', label: 'Offer Extended', color: 'border-emerald-500' },
  { stage: 'hired', label: 'Hired & Onboarded', color: 'border-emerald-700' },
];

export const RecruitmentATSView: React.FC = () => {
  const {
    jobOpenings,
    candidates,
    selectedCandidate,
    setSelectedCandidate,
    updateCandidateStage,
    updateJobOpeningStatus,
    canPerformAction,
    setCurrentTab,
  } = useHR();

  const [activeTab, setActiveTab] = useState<'pipeline' | 'requisitions' | 'analytics'>('pipeline');
  const [selectedJobFilter, setSelectedJobFilter] = useState<string>('ALL');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isNewJobOpen, setIsNewJobOpen] = useState(false);
  const [isAddCandidateOpen, setIsAddCandidateOpen] = useState(false);

  const isHrOrAdmin = canPerformAction('hr_manager');
  const isManagerOrAdmin = canPerformAction('department_lead');

  // Filter candidates
  const filteredCandidates = candidates.filter((c) => {
    if (selectedJobFilter !== 'ALL' && c.jobOpeningId !== selectedJobFilter) return false;
    if (selectedDeptFilter !== 'ALL' && c.department !== selectedDeptFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = c.fullName.toLowerCase().includes(q);
      const matchRole = c.jobTitle.toLowerCase().includes(q);
      const matchCompany = c.currentCompany?.toLowerCase().includes(q) || false;
      const matchEdu = c.education.toLowerCase().includes(q);
      if (!matchName && !matchRole && !matchCompany && !matchEdu) return false;
    }
    return true;
  });

  // KPI Calculations
  const activeOpenings = jobOpenings.filter((j) => j.status === 'active');
  const totalTargetHires = activeOpenings.reduce((sum, j) => sum + j.openingsCount, 0);
  const candidatesInOffer = candidates.filter((c) => c.stage === 'offer').length;
  const hiredCount = candidates.filter((c) => c.stage === 'hired').length;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 animate-fade-in">
      {/* Top Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#e5e5e5] pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-emerald-800">
            <Briefcase className="w-3.5 h-3.5 text-emerald-700" />
            <span className="whitespace-normal sm:whitespace-nowrap">Talent Acquisition & Hiring Pipelines</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-emerald-700 mt-1 whitespace-normal sm:whitespace-nowrap">
            Recruitment & Applicant Tracking System
          </h1>
          <p className="text-xs text-[#737373] mt-0.5">
            Manage Kenyan talent pipelines, candidate scorecards, and one-click hire onboarding.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => setIsAddCandidateOpen(true)}
            className="px-3.5 py-1.5 rounded-[18px] bg-[#ffffff] border border-[#e5e5e5] text-xs font-semibold text-[#0a0a0a] hover:bg-[#fafafa] transition-colors card-shadow flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Candidate</span>
          </button>

          {isManagerOrAdmin && (
            <button
              onClick={() => setIsNewJobOpen(true)}
              className="px-3.5 py-1.5 rounded-[18px] bg-[#0a0a0a] hover:bg-[#262626] text-xs font-semibold text-[#ffffff] transition-all flex items-center gap-1.5 shadow-sm"
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>Post New Requisition</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Stats Ribbon */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#ffffff] p-4 rounded-[20px] border border-[#e5e5e5] card-shadow">
          <div className="text-[11px] font-mono uppercase tracking-wider text-[#737373]">
            Active Requisitions
          </div>
          <div className="text-2xl font-bold text-[#0a0a0a] mt-1 font-mono tracking-tight">
            {activeOpenings.length} Roles
          </div>
          <div className="text-[11px] text-[#737373] mt-1 flex items-center gap-1">
            <span className="font-semibold text-[#0a0a0a]">{totalTargetHires}</span>
            <span>target positions in Nairobi & remote</span>
          </div>
        </div>

        <div className="bg-[#ffffff] p-4 rounded-[20px] border border-[#e5e5e5] card-shadow">
          <div className="text-[11px] font-mono uppercase tracking-wider text-[#737373]">
            Total Active Pipeline
          </div>
          <div className="text-2xl font-bold text-[#0a0a0a] mt-1 font-mono tracking-tight">
            {candidates.filter((c) => c.stage !== 'hired' && c.stage !== 'rejected').length}
          </div>
          <div className="text-[11px] text-[#737373] mt-1">
            Across 5 recruitment stages
          </div>
        </div>

        <div className="bg-[#ffffff] p-4 rounded-[20px] border border-[#e5e5e5] card-shadow">
          <div className="text-[11px] font-mono uppercase tracking-wider text-[#737373]">
            Offers Extended
          </div>
          <div className="text-2xl font-bold text-amber-600 mt-1 font-mono tracking-tight flex items-center gap-1.5">
            <span>{candidatesInOffer} Candidates</span>
          </div>
          <div className="text-[11px] text-[#737373] mt-1">
            Ready for 1-click hire conversion
          </div>
        </div>

        <div className="bg-[#ffffff] p-4 rounded-[20px] border border-[#e5e5e5] card-shadow">
          <div className="text-[11px] font-mono uppercase tracking-wider text-[#737373]">
            Hired & Onboarded
          </div>
          <div className="text-2xl font-bold text-emerald-700 mt-1 font-mono tracking-tight">
            {hiredCount} New Hires
          </div>
          <div className="text-[11px] text-[#737373] mt-1">
            Seamlessly linked to Phase 2 induction
          </div>
        </div>
      </div>

      {/* Subtab Navigation & Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#e5e5e5] pb-3">
        <div className="flex items-center gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('pipeline')}
            className={`px-3.5 py-1.5 rounded-[18px] text-xs font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'pipeline'
                ? 'bg-[#0a0a0a] text-[#ffffff]'
                : 'bg-[#fafafa] text-[#737373] hover:text-[#0a0a0a]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Kanban Pipeline Board</span>
          </button>

          <button
            onClick={() => setActiveTab('requisitions')}
            className={`px-3.5 py-1.5 rounded-[18px] text-xs font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'requisitions'
                ? 'bg-[#0a0a0a] text-[#ffffff]'
                : 'bg-[#fafafa] text-[#737373] hover:text-[#0a0a0a]'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>Job Openings Directory ({jobOpenings.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-3.5 py-1.5 rounded-[18px] text-xs font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'analytics'
                ? 'bg-[#0a0a0a] text-[#ffffff]'
                : 'bg-[#fafafa] text-[#737373] hover:text-[#0a0a0a]'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Sourcing & Analytics</span>
          </button>
        </div>

        {/* Global Search and Opening Filter */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#737373]" />
            <input
              type="text"
              placeholder="Search candidate, role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 rounded-[16px] bg-[#ffffff] border border-[#e5e5e5] text-xs outline-hidden focus:border-[#0a0a0a] w-48"
            />
          </div>

          <select
            value={selectedJobFilter}
            onChange={(e) => setSelectedJobFilter(e.target.value)}
            className="px-3 py-1.5 rounded-[16px] bg-[#ffffff] border border-[#e5e5e5] text-xs text-[#0a0a0a] outline-hidden cursor-pointer max-w-[200px] truncate"
          >
            <option value="ALL">All Requisitions ({jobOpenings.length})</option>
            {jobOpenings.map((j) => (
              <option key={j.id} value={j.id}>
                {j.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Tab Content */}
      {activeTab === 'pipeline' && (
        <div className="space-y-4">
          {/* Kanban Board Columns */}
          <div className="flex md:grid md:grid-cols-5 gap-4 items-start overflow-x-auto pb-4 no-scrollbar">
            {PIPELINE_COLUMNS.map((col) => {
              const colCandidates = filteredCandidates.filter((c) => c.stage === col.stage);

              return (
                <div
                  key={col.stage}
                  className="bg-[#fafafa] rounded-[24px] border border-[#e5e5e5] p-3 flex flex-col min-h-[500px] min-w-[280px] md:min-w-0 flex-1 shrink-0 md:shrink"
                >
                  {/* Column Header */}
                  <div className="flex items-center justify-between px-2 py-1 mb-3 border-b border-[#e5e5e5] pb-2">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${col.stage === 'hired' ? 'bg-emerald-600' : col.stage === 'offer' ? 'bg-amber-500' : 'bg-[#0a0a0a]'}`} />
                      <span className="text-xs font-bold tracking-tight text-[#0a0a0a]">
                        {col.label}
                      </span>
                    </div>
                    <span className="text-[11px] font-mono px-2 py-0.2 rounded-full bg-[#ffffff] border border-[#e5e5e5] text-[#737373] font-semibold">
                      {colCandidates.length}
                    </span>
                  </div>

                  {/* Candidate Cards */}
                  <div className="space-y-3 flex-1">
                    {colCandidates.length === 0 ? (
                      <div className="py-8 text-center text-[11px] text-[#a3a3a3] font-mono">
                        No candidates
                      </div>
                    ) : (
                      colCandidates.map((cand) => (
                        <div
                          key={cand.id}
                          onClick={() => setSelectedCandidate(cand)}
                          className="p-3.5 rounded-[18px] bg-[#ffffff] border border-[#e5e5e5] hover:border-[#0a0a0a] card-shadow cursor-pointer transition-all hover:scale-[1.01] group space-y-2.5"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="text-xs font-bold text-[#0a0a0a] group-hover:text-[#0a0a0a]">
                                {cand.fullName}
                              </div>
                              <div className="text-[11px] text-[#737373] truncate max-w-[150px]">
                                {cand.jobTitle}
                              </div>
                            </div>
                            <span className="text-[10px] font-mono font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-full border border-amber-200 flex items-center gap-0.5 shrink-0">
                              <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />
                              {cand.rating.toFixed(1)}
                            </span>
                          </div>

                          <div className="text-[11px] text-[#737373] font-mono flex items-center justify-between border-t border-[#f0f0f0] pt-2">
                            <span>KES {(cand.expectedSalaryKES / 1000).toFixed(0)}k</span>
                            <span>{cand.yearsOfExperience}y exp</span>
                          </div>

                          <div className="flex items-center justify-between pt-1">
                            <span className="text-[10px] text-[#737373] bg-[#fafafa] px-2 py-0.5 rounded-[10px] border border-[#e5e5e5] truncate max-w-[110px]">
                              {cand.source}
                            </span>

                            {cand.stage === 'offer' && (
                              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 animate-pulse">
                                Click to Hire
                              </span>
                            )}

                            {cand.stage === 'hired' && (
                              <span className="text-[10px] font-semibold text-emerald-700 flex items-center gap-0.5">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                Onboarding
                              </span>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Requisitions Directory */}
      {activeTab === 'requisitions' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {jobOpenings.map((job) => {
              const jobCandidates = candidates.filter((c) => c.jobOpeningId === job.id);
              const offersCount = jobCandidates.filter((c) => c.stage === 'offer').length;

              return (
                <div
                  key={job.id}
                  className="p-5 rounded-[24px] bg-[#ffffff] border border-[#e5e5e5] card-shadow flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#fafafa] border border-[#e5e5e5] text-[#737373]">
                        {job.requisitionCode}
                      </span>
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                          job.status === 'active'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 font-bold'
                            : 'bg-[#fafafa] text-[#737373] border-[#e5e5e5]'
                        }`}
                      >
                        {job.status.toUpperCase()}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-[#0a0a0a] leading-snug">
                        {job.title}
                      </h3>
                      <div className="text-xs text-[#737373] mt-0.5">
                        {job.department} · {job.location}
                      </div>
                    </div>

                    <p className="text-xs text-[#171717] line-clamp-2 leading-relaxed">
                      {job.description}
                    </p>

                    <div className="flex items-center gap-1.5 flex-wrap pt-1">
                      {job.skills.slice(0, 3).map((skill, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] font-mono bg-[#f5f5f5] text-[#171717] px-2 py-0.5 rounded-[8px]"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-[#f0f0f0] pt-3 space-y-3">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-[#737373]">Compensation:</span>
                      <span className="font-bold text-[#0a0a0a]">
                        KES {(job.minSalaryKES / 1000).toFixed(0)}k - {(job.maxSalaryKES / 1000).toFixed(0)}k
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-[#737373]">Hiring Lead:</span>
                      <span className="text-[#0a0a0a] font-medium">{job.hiringManagerName}</span>
                    </div>

                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-[#737373]">Pipeline:</span>
                      <span className="font-bold text-[#0a0a0a]">
                        {jobCandidates.length} applicants ({offersCount} offers)
                      </span>
                    </div>

                    <div className="pt-2 flex items-center gap-2">
                      <button
                        onClick={() => {
                          setSelectedJobFilter(job.id);
                          setActiveTab('pipeline');
                        }}
                        className="flex-1 py-1.5 rounded-[16px] bg-[#0a0a0a] text-xs font-semibold text-[#ffffff] hover:bg-[#262626] transition-colors text-center"
                      >
                        View Pipeline ({jobCandidates.length})
                      </button>

                      {isManagerOrAdmin && (
                        <button
                          onClick={() =>
                            updateJobOpeningStatus(
                              job.id,
                              job.status === 'active' ? 'closed' : 'active'
                            )
                          }
                          className="px-3 py-1.5 rounded-[16px] border border-[#e5e5e5] text-xs text-[#737373] hover:text-[#0a0a0a]"
                        >
                          {job.status === 'active' ? 'Close' : 'Reopen'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Kenyan Sourcing Analytics */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Sourcing Channel Performance */}
            <div className="p-6 rounded-[24px] bg-[#ffffff] border border-[#e5e5e5] card-shadow space-y-4">
              <div className="flex items-center justify-between border-b border-[#e5e5e5] pb-3">
                <div>
                  <h3 className="text-sm font-bold text-[#0a0a0a]">
                    Kenyan Talent Sourcing Channels
                  </h3>
                  <p className="text-xs text-[#737373]">
                    Inbound and referral performance across East African talent pools
                  </p>
                </div>
                <TrendingUp className="w-4 h-4 text-emerald-600" />
              </div>

              <div className="space-y-3">
                {[
                  { channel: 'LinkedIn Kenya', count: 3, pct: 43 },
                  { channel: 'BrighterMonday', count: 1, pct: 14 },
                  { channel: 'Employee Referral', count: 1, pct: 14 },
                  { channel: 'Company Careers', count: 1, pct: 14 },
                  { channel: 'Direct Outreach', count: 1, pct: 14 },
                ].map((item, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="font-semibold text-[#0a0a0a]">{item.channel}</span>
                      <span className="text-[#737373]">
                        {item.count} candidates ({item.pct}%)
                      </span>
                    </div>
                    <div className="w-full bg-[#f0f0f0] h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-[#0a0a0a] h-full rounded-full transition-all duration-500"
                        style={{ width: `${item.pct}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pipeline Stage Health */}
            <div className="p-6 rounded-[24px] bg-[#ffffff] border border-[#e5e5e5] card-shadow space-y-4">
              <div className="flex items-center justify-between border-b border-[#e5e5e5] pb-3">
                <div>
                  <h3 className="text-sm font-bold text-[#0a0a0a]">
                    Hiring Velocity & SLA Met
                  </h3>
                  <p className="text-xs text-[#737373]">
                    Average days spent per interview round in Nairobi HQ
                  </p>
                </div>
                <Award className="w-4 h-4 text-amber-500" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-[20px] bg-[#fafafa] border border-[#e5e5e5]">
                  <div className="text-[11px] font-mono text-[#737373]">
                    AVG TIME TO HIRE
                  </div>
                  <div className="text-2xl font-bold text-[#0a0a0a] mt-1 font-mono">
                    18 Days
                  </div>
                  <div className="text-[11px] text-emerald-700 mt-1 font-medium">
                    5 days faster than East Africa benchmark (23d)
                  </div>
                </div>

                <div className="p-4 rounded-[20px] bg-[#fafafa] border border-[#e5e5e5]">
                  <div className="text-[11px] font-mono text-[#737373]">
                    OFFER ACCEPTANCE
                  </div>
                  <div className="text-2xl font-bold text-emerald-700 mt-1 font-mono">
                    94.2%
                  </div>
                  <div className="text-[11px] text-[#737373] mt-1">
                    Competitive market remuneration in KES
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-[20px] bg-emerald-50 border border-emerald-200">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-900">
                  <UserCheck className="w-4 h-4" />
                  <span>Automated 30-Day Onboarding Link</span>
                </div>
                <p className="text-[11px] text-emerald-800 mt-1 leading-relaxed">
                  Every candidate accepted under "Offer Extended" automatically provisions biometric attendance turnstiles, KRA PIN & SHIF statutory documents, and mentor roadmaps upon hire.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Global Modals */}
      <CandidateDetailModal />
      <NewJobModal isOpen={isNewJobOpen} onClose={() => setIsNewJobOpen(false)} />
      <AddCandidateModal
        isOpen={isAddCandidateOpen}
        onClose={() => setIsAddCandidateOpen(false)}
        defaultJobOpeningId={selectedJobFilter !== 'ALL' ? selectedJobFilter : undefined}
      />
    </div>
  );
};
