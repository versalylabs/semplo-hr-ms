/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Award,
  Target,
  Users,
  TrendingUp,
  Star,
  CheckCircle2,
  Clock,
  ChevronRight,
  Plus,
  Edit2,
  DollarSign,
  Grid,
  Search,
  Filter,
  ArrowUpRight,
  Shield,
  HelpCircle,
} from 'lucide-react';
import { useHR } from '../../context/HRContext';
import { AppraisalRecord, OKRGoal, NineBoxPosition } from '../../types/hr';
import { AppraisalModal } from './AppraisalModal';
import { NewOKRModal } from './NewOKRModal';

export const PerformanceAppraisalView: React.FC = () => {
  const {
    reviewCycles,
    selectedReviewCycleId,
    setSelectedReviewCycleId,
    appraisals,
    okrGoals,
    updateOKRProgress,
    activePersona,
    canPerformAction,
    setCurrentTab,
  } = useHR();

  const [activeTab, setActiveTab] = useState<'my_reviews' | 'team_reviews' | 'okrs' | 'nine_box' | 'promotions'>('my_reviews');
  const [selectedAppraisal, setSelectedAppraisal] = useState<AppraisalRecord | null>(null);
  const [modalMode, setModalMode] = useState<'view' | 'self_review' | 'manager_review' | 'calibrate'>('view');
  const [isAppraisalModalOpen, setIsAppraisalModalOpen] = useState(false);
  const [isNewOKROpen, setIsNewOKROpen] = useState(false);
  const [filterDept, setFilterDept] = useState('ALL');
  const [selected9BoxFilter, setSelected9BoxFilter] = useState<NineBoxPosition | 'ALL'>('ALL');

  const currentCycle = reviewCycles.find((c) => c.id === selectedReviewCycleId) || reviewCycles[0];
  const isManagerOrAdmin = canPerformAction('department_lead');
  const isHrOrAdmin = canPerformAction('hr_manager');

  // Active persona's appraisal
  const myAppraisal = appraisals.find((a) => a.employeeId === activePersona.employeeId);

  // Appraisals in current cycle
  const cycleAppraisals = appraisals.filter((a) => {
    const matchesCycle = a.cycleId === currentCycle?.id;
    const matchesDept = filterDept === 'ALL' || a.department === filterDept;
    const matches9Box = selected9BoxFilter === 'ALL' || a.nineBoxPosition === selected9BoxFilter;
    return matchesCycle && matchesDept && matches9Box;
  });

  const handleOpenAppraisal = (app: AppraisalRecord, mode: 'view' | 'self_review' | 'manager_review' | 'calibrate') => {
    setSelectedAppraisal(app);
    setModalMode(mode);
    setIsAppraisalModalOpen(true);
  };

  // 9-Box Matrix positions
  const nineBoxMatrix: {
    position: NineBoxPosition;
    label: string;
    perf: 'Low' | 'Medium' | 'High';
    pot: 'Low' | 'Medium' | 'High';
    color: string;
  }[] = [
    { position: 'High Potential', label: 'Enigma / High Potential', perf: 'Low', pot: 'High', color: 'bg-purple-50/70 border-purple-200 text-purple-900' },
    { position: 'High Potential', label: 'Growth Leader', perf: 'Medium', pot: 'High', color: 'bg-indigo-50/70 border-indigo-200 text-indigo-900' },
    { position: 'Star', label: 'Future Leader / Star', perf: 'High', pot: 'High', color: 'bg-emerald-50/80 border-emerald-300 text-emerald-950 ring-1 ring-emerald-400/30' },
    { position: 'Inconsistent', label: 'Dilemma / Inconsistent', perf: 'Low', pot: 'Medium', color: 'bg-amber-50/70 border-amber-200 text-amber-900' },
    { position: 'Core Contributor', label: 'Core Contributor', perf: 'Medium', pot: 'Medium', color: 'bg-blue-50/70 border-blue-200 text-blue-900' },
    { position: 'High Performer', label: 'High Performer', perf: 'High', pot: 'Medium', color: 'bg-emerald-50/70 border-emerald-200 text-emerald-900' },
    { position: 'Underperformer', label: 'Risk / Underperformer', perf: 'Low', pot: 'Low', color: 'bg-rose-50/70 border-rose-200 text-rose-900' },
    { position: 'Solid Performer', label: 'Effective Specialist', perf: 'Medium', pot: 'Low', color: 'bg-zinc-50 border-zinc-200 text-zinc-800' },
    { position: 'Solid Performer', label: 'Trusted Workhorse', perf: 'High', pot: 'Low', color: 'bg-blue-50/60 border-blue-200 text-blue-900' },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Top Banner / Cycle Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#ffffff] p-5 rounded-[24px] border border-[#e5e5e5] card-shadow">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-[12px] bg-[#0a0a0a] text-[#ffffff] flex items-center justify-center font-bold">
            <Award className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-[24px] font-bold tracking-tight text-emerald-700 whitespace-nowrap">
                Semplo Performance & OKRs
              </h2>
              <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 uppercase whitespace-nowrap">
                {currentCycle?.status.replace('_', ' ')}
              </span>
            </div>
            <p className="text-xs text-[#737373] mt-0.5">
              360° Competency reviews, cascading company objectives, and 9-box talent matrix calibration.
            </p>
          </div>
        </div>

        {/* Cycle Dropdown & Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5 bg-[#f5f5f5] px-3 py-1.5 rounded-[18px] border border-[#e5e5e5]">
            <span className="text-xs text-[#737373]">Cycle:</span>
            <select
              value={selectedReviewCycleId}
              onChange={(e) => setSelectedReviewCycleId(e.target.value)}
              className="bg-transparent text-xs font-semibold text-[#0a0a0a] outline-hidden cursor-pointer"
            >
              {reviewCycles.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {isManagerOrAdmin && (
            <button
              onClick={() => setIsNewOKROpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-[18px] bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/25 transition-all transform active:scale-95"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>New OKR Objective</span>
            </button>
          )}
        </div>
      </div>

      {/* SmartHR Inspired KPI Stats Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Cycle Progress */}
        <div className="bg-[#ffffff] p-5 rounded-[22px] border border-sky-200/80 bg-gradient-to-b from-sky-50/40 to-white card-shadow flex flex-col justify-between hover:scale-[1.01] transition-transform">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-sky-800">
              Cycle Progress
            </span>
            <div className="w-8 h-8 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-xs">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-[#0a0a0a] font-mono tracking-tight">
              {currentCycle?.completedAppraisals} / {currentCycle?.totalAppraisals}
            </div>
            <div className="text-[11px] text-sky-700/90 font-medium mt-1">
              {Math.round(((currentCycle?.completedAppraisals || 0) / (currentCycle?.totalAppraisals || 1)) * 100)}% reviews completed
            </div>
          </div>
        </div>

        {/* Card 2: Org Average Rating */}
        <div className="bg-[#ffffff] p-5 rounded-[22px] border border-amber-200/80 bg-gradient-to-b from-amber-50/40 to-white card-shadow flex flex-col justify-between hover:scale-[1.01] transition-transform">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800">
              Org Average Rating
            </span>
            <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-xs">
              <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-amber-600 font-mono tracking-tight flex items-baseline gap-1">
              <span>{currentCycle?.averageScore.toFixed(2)}</span>
              <span className="text-xs text-[#737373] font-normal">/ 5.0</span>
            </div>
            <div className="text-[11px] text-amber-800/90 font-medium mt-1">
              Exceeds Expectations baseline
            </div>
          </div>
        </div>

        {/* Card 3: Active OKR Objectives */}
        <div className="bg-[#ffffff] p-5 rounded-[22px] border border-purple-200/80 bg-gradient-to-b from-purple-50/40 to-white card-shadow flex flex-col justify-between hover:scale-[1.01] transition-transform">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-purple-800">
              Active OKR Objectives
            </span>
            <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xs">
              <Target className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-[#0a0a0a] font-mono tracking-tight">
              {okrGoals.length} Goals
            </div>
            <div className="text-[11px] text-purple-700/90 font-medium mt-1">
              Avg completion: {Math.round(okrGoals.reduce((s, g) => s + g.progress, 0) / okrGoals.length)}%
            </div>
          </div>
        </div>

        {/* Card 4: High Potential / Stars */}
        <div className="bg-[#ffffff] p-5 rounded-[22px] border border-emerald-200/80 bg-gradient-to-b from-emerald-50/40 to-white card-shadow flex flex-col justify-between hover:scale-[1.01] transition-transform">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
              High Potential / Stars
            </span>
            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-emerald-700 font-mono tracking-tight">
              {appraisals.filter((a) => a.nineBoxPosition === 'Star' || a.nineBoxPosition === 'High Performer').length} Leaders
            </div>
            <div className="text-[11px] text-emerald-700/90 font-semibold mt-1">
              Succession pipeline ready
            </div>
          </div>
        </div>
      </div>

      {/* Subtab Navigation Pills */}
      <div className="flex items-center gap-1.5 bg-[#f1f5f9] p-1.5 rounded-[20px] overflow-x-auto w-fit">
        <button
          onClick={() => setActiveTab('my_reviews')}
          className={`px-4 py-2 rounded-[14px] text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'my_reviews'
              ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/25'
              : 'text-[#64748b] hover:text-[#0a0a0a]'
          }`}
        >
          My Self-Review & Goals
        </button>

        <button
          onClick={() => setActiveTab('team_reviews')}
          className={`px-4 py-2 rounded-[14px] text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'team_reviews'
              ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/25'
              : 'text-[#64748b] hover:text-[#0a0a0a]'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Team Review Queue ({cycleAppraisals.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('okrs')}
          className={`px-4 py-2 rounded-[14px] text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'okrs'
              ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/25'
              : 'text-[#64748b] hover:text-[#0a0a0a]'
          }`}
        >
          <Target className="w-3.5 h-3.5" />
          <span>Company & Dept OKRs ({okrGoals.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('nine_box')}
          className={`px-4 py-2 rounded-[14px] text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'nine_box'
              ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/25'
              : 'text-[#64748b] hover:text-[#0a0a0a]'
          }`}
        >
          <Grid className="w-3.5 h-3.5" />
          <span>9-Box Talent Matrix</span>
        </button>

        <button
          onClick={() => setActiveTab('promotions')}
          className={`px-4 py-2 rounded-[14px] text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'promotions'
              ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/25'
              : 'text-[#64748b] hover:text-[#0a0a0a]'
          }`}
        >
          <DollarSign className="w-3.5 h-3.5" />
          <span>Merit Increases & Promotions</span>
        </button>
      </div>

      {/* SUBTAB 1: MY SELF-REVIEW & GOALS */}
      {activeTab === 'my_reviews' && (
        <div className="space-y-6">
          {myAppraisal ? (
            <div className="bg-[#ffffff] rounded-[24px] border border-[#e5e5e5] p-6 card-shadow space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#e5e5e5] pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-[#0a0a0a]">
                      {myAppraisal.cycleName}
                    </h3>
                    <span
                      className={`text-[11px] font-mono px-2 py-0.5 rounded-full border ${
                        myAppraisal.status === 'completed'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : 'bg-amber-50 text-amber-800 border-amber-200'
                      }`}
                    >
                      {myAppraisal.status.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-xs text-[#737373] mt-0.5">
                    Reviewer: <strong className="text-[#0a0a0a]">{myAppraisal.reviewerName}</strong>
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenAppraisal(myAppraisal, 'self_review')}
                    className="px-3.5 py-2 rounded-[18px] bg-[#0a0a0a] hover:bg-[#262626] text-[#ffffff] text-xs font-medium transition-colors flex items-center gap-1.5"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit Self-Assessment</span>
                  </button>

                  <button
                    onClick={() => handleOpenAppraisal(myAppraisal, 'view')}
                    className="px-3.5 py-2 rounded-[18px] bg-[#f5f5f5] hover:bg-[#e5e5e5] text-[#0a0a0a] text-xs font-medium transition-colors"
                  >
                    View Scorecard
                  </button>
                </div>
              </div>

              {/* Score Snapshot */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="p-4 bg-[#fafafa] rounded-[18px] border border-[#e5e5e5]">
                  <span className="text-[10px] font-mono uppercase text-[#737373]">Self Rating</span>
                  <div className="text-2xl font-bold text-[#0a0a0a] mt-1 font-mono">
                    {myAppraisal.selfOverallScore.toFixed(1)} <span className="text-xs text-[#737373]">/ 5.0</span>
                  </div>
                  <div className="text-[11px] text-[#737373] mt-1 truncate">
                    "{myAppraisal.selfSummary}"
                  </div>
                </div>

                <div className="p-4 bg-[#fafafa] rounded-[18px] border border-[#e5e5e5]">
                  <span className="text-[10px] font-mono uppercase text-[#737373]">Manager Rating</span>
                  <div className="text-2xl font-bold text-emerald-700 mt-1 font-mono">
                    {myAppraisal.managerOverallScore > 0 ? myAppraisal.managerOverallScore.toFixed(1) : 'Pending'} <span className="text-xs text-[#737373]">/ 5.0</span>
                  </div>
                  <div className="text-[11px] text-[#737373] mt-1 truncate">
                    {myAppraisal.managerSummary || 'Awaiting manager evaluation session.'}
                  </div>
                </div>

                <div className="p-4 bg-[#fafafa] rounded-[18px] border border-[#e5e5e5]">
                  <span className="text-[10px] font-mono uppercase text-[#737373]">Talent Position & Grade</span>
                  <div className="text-base font-bold text-[#0a0a0a] mt-1">
                    {myAppraisal.nineBoxPosition}
                  </div>
                  <div className="text-[11px] text-emerald-700 mt-1 font-medium">
                    {myAppraisal.finalGrade || 'In Calibration Stage'}
                  </div>
                </div>
              </div>

              {/* Competencies Progress */}
              <div className="space-y-3">
                <h4 className="font-mono text-xs uppercase tracking-wider font-bold text-[#0a0a0a]">
                  My Competency Ratings
                </h4>
                <div className="divide-y divide-[#f0f0f0] border border-[#e5e5e5] rounded-[16px] overflow-hidden">
                  {myAppraisal.competencies.map((c) => (
                    <div key={c.id} className="p-3.5 flex items-center justify-between text-xs hover:bg-[#fafafa]">
                      <div>
                        <div className="font-semibold text-[#0a0a0a]">{c.name}</div>
                        <div className="text-[11px] text-[#737373]">{c.description}</div>
                      </div>
                      <div className="flex items-center gap-4 text-xs font-mono shrink-0">
                        <span className="text-[#737373]">Self: <strong className="text-[#0a0a0a]">{c.selfScore}</strong>/5</span>
                        <span className="text-[#737373]">Manager: <strong className="text-emerald-700">{c.managerScore}</strong>/5</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center bg-[#ffffff] rounded-[24px] border border-[#e5e5e5] text-xs text-[#737373]">
              No active appraisal profile assigned for {activePersona.name} in this cycle.
            </div>
          )}
        </div>
      )}

      {/* SUBTAB 2: TEAM REVIEW QUEUE */}
      {activeTab === 'team_reviews' && (
        <div className="bg-[#ffffff] rounded-[24px] border border-[#e5e5e5] overflow-hidden card-shadow space-y-0">
          <div className="p-4 border-b border-[#e5e5e5] bg-[#fafafa] flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-xs text-[#737373]">
              Review queue for department leads and HR managers.
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-[#737373]">Filter Dept:</span>
              <select
                value={filterDept}
                onChange={(e) => setFilterDept(e.target.value)}
                className="bg-[#ffffff] px-3 py-1.5 rounded-[16px] border border-[#e5e5e5] text-xs text-[#0a0a0a] outline-hidden cursor-pointer"
              >
                <option value="ALL">All Departments</option>
                <option value="Software Engineering">Software Engineering</option>
                <option value="People Operations">People Operations</option>
                <option value="Enterprise Commercial & Growth">Commercial</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#fafafa] border-b border-[#e5e5e5] font-mono text-[11px] text-[#737373] uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Employee</th>
                  <th className="py-3 px-3">Department</th>
                  <th className="py-3 px-3 text-center">Self Score</th>
                  <th className="py-3 px-3 text-center">Mgr Score</th>
                  <th className="py-3 px-3">9-Box Position</th>
                  <th className="py-3 px-3">Review Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f0f0f0]">
                {cycleAppraisals.map((app) => (
                  <tr key={app.id} className="hover:bg-[#fafafa] transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={app.employeeAvatar}
                          alt={app.employeeName}
                          className="w-8 h-8 rounded-full object-cover border border-[#e5e5e5]"
                        />
                        <div>
                          <div className="font-semibold text-[#0a0a0a]">{app.employeeName}</div>
                          <div className="text-[10px] font-mono text-[#737373]">
                            {app.employeeCode} · {app.jobTitle}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-[#525252]">{app.department}</td>
                    <td className="py-3 px-3 text-center font-mono font-medium text-[#0a0a0a]">
                      {app.selfOverallScore.toFixed(1)}
                    </td>
                    <td className="py-3 px-3 text-center font-mono font-medium text-emerald-700">
                      {app.managerOverallScore > 0 ? app.managerOverallScore.toFixed(1) : '—'}
                    </td>
                    <td className="py-3 px-3">
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-[#f5f5f5] text-[#0a0a0a] border border-[#e5e5e5]">
                        {app.nineBoxPosition}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                          app.status === 'completed'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : app.status === 'pending_calibration'
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}
                      >
                        {app.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {isManagerOrAdmin && app.status !== 'completed' && (
                          <button
                            onClick={() => handleOpenAppraisal(app, 'manager_review')}
                            className="px-2.5 py-1 rounded-[14px] bg-[#0a0a0a] text-[#ffffff] hover:bg-[#262626] text-[11px] font-medium transition-all"
                          >
                            Evaluate
                          </button>
                        )}
                        {isHrOrAdmin && (
                          <button
                            onClick={() => handleOpenAppraisal(app, 'calibrate')}
                            className="px-2.5 py-1 rounded-[14px] bg-[#f5f5f5] hover:bg-[#e5e5e5] text-[#0a0a0a] text-[11px] font-medium transition-all"
                          >
                            Calibrate
                          </button>
                        )}
                        <button
                          onClick={() => handleOpenAppraisal(app, 'view')}
                          className="px-2.5 py-1 rounded-[14px] border border-[#e5e5e5] text-[#737373] hover:text-[#0a0a0a] text-[11px] transition-all"
                        >
                          View
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUBTAB 3: OKRS & GOALS */}
      {activeTab === 'okrs' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {okrGoals.map((goal) => (
              <div
                key={goal.id}
                className="bg-[#ffffff] rounded-[24px] border border-[#e5e5e5] p-5 card-shadow space-y-4 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#f5f5f5] text-[#737373] border border-[#e5e5e5]">
                        {goal.quarter} · Weight {goal.weight}%
                      </span>
                      <h4 className="font-bold text-[14px] text-[#0a0a0a] mt-2 leading-snug">
                        {goal.title}
                      </h4>
                    </div>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded-full shrink-0 border ${
                        goal.status === 'achieved'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : goal.status === 'on_track'
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}
                    >
                      {goal.status.replace('_', ' ')}
                    </span>
                  </div>

                  <p className="text-xs text-[#525252] mt-2">{goal.description}</p>
                </div>

                <div className="space-y-3 pt-3 border-t border-[#f0f0f0]">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#737373] font-mono">Target Metric: <strong>{goal.metric}</strong></span>
                    <span className="font-mono font-bold text-[#0a0a0a]">{goal.progress}%</span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-[#f5f5f5] h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-[#0a0a0a] h-full rounded-full transition-all duration-300"
                      style={{ width: `${goal.progress}%` }}
                    />
                  </div>

                  {/* Interactive slider for owner */}
                  <div className="flex items-center justify-between pt-1 text-[11px] text-[#737373]">
                    <div className="flex items-center gap-1.5">
                      <img
                        src={goal.ownerAvatar}
                        alt={goal.ownerName}
                        className="w-5 h-5 rounded-full object-cover border border-[#e5e5e5]"
                      />
                      <span>{goal.ownerName}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px]">Update Progress:</span>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={goal.progress}
                        onChange={(e) =>
                          updateOKRProgress(
                            goal.id,
                            Number(e.target.value),
                            Number(e.target.value) >= 100 ? 'achieved' : goal.status
                          )
                        }
                        className="w-24 accent-[#0a0a0a] cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUBTAB 4: 9-BOX TALENT MATRIX */}
      {activeTab === 'nine_box' && (
        <div className="bg-[#ffffff] rounded-[24px] border border-[#e5e5e5] p-6 card-shadow space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#e5e5e5] pb-4">
            <div>
              <h3 className="text-base font-bold text-[#0a0a0a]">
                Semplo 9-Box Talent & Leadership Matrix
              </h3>
              <p className="text-xs text-[#737373] mt-0.5">
                Evaluation of employee Current Performance vs. Future Potential for executive succession planning.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-[#737373]">Filter by Category:</span>
              <select
                value={selected9BoxFilter}
                onChange={(e) => setSelected9BoxFilter(e.target.value as NineBoxPosition | 'ALL')}
                className="bg-[#fafafa] px-3 py-1.5 rounded-[16px] border border-[#e5e5e5] text-xs text-[#0a0a0a] outline-hidden cursor-pointer font-medium"
              >
                <option value="ALL">All Talent Categories</option>
                <option value="Star">Stars (High Potential & High Performance)</option>
                <option value="High Performer">High Performers</option>
                <option value="High Potential">High Potentials</option>
                <option value="Core Contributor">Core Contributors</option>
              </select>
            </div>
          </div>

          {/* 3x3 Visual Matrix Grid (Responsive) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
            {nineBoxMatrix.map((box, idx) => {
              const matchedStaff = cycleAppraisals.filter((a) => a.nineBoxPosition === box.position);

              return (
                <div
                  key={idx}
                  className={`p-4 rounded-[20px] border ${box.color} min-h-[140px] flex flex-col justify-between transition-all`}
                >
                  <div>
                    <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-wider font-semibold opacity-75">
                      <span>{box.perf} Perf</span>
                      <span>{box.pot} Pot</span>
                    </div>
                    <div className="font-bold text-[13px] mt-1">{box.label}</div>
                  </div>

                  <div className="mt-3 space-y-1">
                    {matchedStaff.map((staff) => (
                      <div
                        key={staff.id}
                        onClick={() => handleOpenAppraisal(staff, 'view')}
                        className="bg-white/80 backdrop-blur-xs p-1.5 rounded-[12px] border border-black/5 flex items-center justify-between cursor-pointer hover:bg-white text-[11px]"
                      >
                        <span className="font-semibold truncate text-[#0a0a0a]">
                          {staff.employeeName}
                        </span>
                        <span className="font-mono text-[10px] text-[#737373]">
                          {staff.managerOverallScore.toFixed(1)}★
                        </span>
                      </div>
                    ))}
                    {matchedStaff.length === 0 && (
                      <span className="text-[10px] text-zinc-400 italic">No staff placed</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUBTAB 5: COMPENSATION & PROMOTIONS */}
      {activeTab === 'promotions' && (
        <div className="bg-[#ffffff] rounded-[24px] border border-[#e5e5e5] p-6 card-shadow space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#e5e5e5] pb-4">
            <div>
              <h3 className="text-base font-bold text-[#0a0a0a]">
                Performance-Linked Remuneration & Promotion Calibration
              </h3>
              <p className="text-xs text-[#737373] mt-0.5">
                Increments recommended during appraisal cycles feed directly into the Kenyan statutory payroll.
              </p>
            </div>
            <button
              onClick={() => setCurrentTab('payroll')}
              className="px-3.5 py-1.5 rounded-[18px] bg-[#0a0a0a] text-[#ffffff] hover:bg-[#262626] text-xs font-medium transition-all flex items-center gap-1.5 shrink-0"
            >
              <span>Go to Kenyan Payroll Processing</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#fafafa] border-b border-[#e5e5e5] font-mono text-[11px] text-[#737373] uppercase tracking-wider">
                <tr>
                  <th className="py-2.5 px-3">Employee</th>
                  <th className="py-2.5 px-3">Current Title</th>
                  <th className="py-2.5 px-3 text-center">Score</th>
                  <th className="py-2.5 px-3">Recommended Salary Bump</th>
                  <th className="py-2.5 px-3">Promotion Status</th>
                  <th className="py-2.5 px-3 text-right">Appraisal Grade</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f0f0f0]">
                {cycleAppraisals.map((app) => (
                  <tr key={app.id} className="hover:bg-[#fafafa]">
                    <td className="py-2.5 px-3 font-semibold text-[#0a0a0a]">
                      {app.employeeName}
                      <span className="block text-[10px] font-mono text-[#737373]">
                        {app.employeeCode}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-[#525252]">{app.jobTitle}</td>
                    <td className="py-2.5 px-3 text-center font-mono font-bold text-amber-600">
                      {app.managerOverallScore.toFixed(1)} / 5.0
                    </td>
                    <td className="py-2.5 px-3">
                      {app.recommendedSalaryIncrementPct ? (
                        <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-[12px] border border-emerald-200">
                          +{app.recommendedSalaryIncrementPct}% Increment
                        </span>
                      ) : (
                        <span className="text-[#737373]">—</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3">
                      {app.promotionRecommended ? (
                        <div>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                            Promote
                          </span>
                          <span className="block text-[11px] text-[#0a0a0a] font-medium mt-0.5">
                            New: {app.recommendedNewTitle}
                          </span>
                        </div>
                      ) : (
                        <span className="text-[#737373]">Retain Band</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-right font-medium text-[#0a0a0a]">
                      {app.finalGrade || 'Pending HR Calibration'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modals */}
      <AppraisalModal
        appraisal={selectedAppraisal}
        isOpen={isAppraisalModalOpen}
        onClose={() => {
          setIsAppraisalModalOpen(false);
          setSelectedAppraisal(null);
        }}
        mode={modalMode}
      />

      <NewOKRModal
        isOpen={isNewOKROpen}
        onClose={() => setIsNewOKROpen(false)}
      />
    </div>
  );
};
