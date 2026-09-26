/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  X,
  Star,
  CheckCircle2,
  TrendingUp,
  Award,
  DollarSign,
  UserCheck,
  Shield,
  MessageSquare,
  HelpCircle,
} from 'lucide-react';
import { useHR } from '../../context/HRContext';
import { AppraisalRecord, NineBoxPosition } from '../../types/hr';

interface AppraisalModalProps {
  appraisal: AppraisalRecord | null;
  isOpen: boolean;
  onClose: () => void;
  mode: 'view' | 'self_review' | 'manager_review' | 'calibrate';
}

const NINE_BOX_OPTIONS: NineBoxPosition[] = [
  'Star',
  'High Performer',
  'High Potential',
  'Core Contributor',
  'Solid Performer',
  'Inconsistent',
  'Underperformer',
];

export const AppraisalModal: React.FC<AppraisalModalProps> = ({
  appraisal,
  isOpen,
  onClose,
  mode,
}) => {
  const {
    activePersona,
    submitSelfAppraisal,
    submitManagerEvaluation,
    calibrateAppraisal,
    canPerformAction,
  } = useHR();

  const [scores, setScores] = useState<{ [id: string]: number }>({});
  const [summary, setSummary] = useState('');
  const [nineBox, setNineBox] = useState<NineBoxPosition>('High Performer');
  const [salaryBump, setSalaryBump] = useState<number>(10);
  const [promotion, setPromotion] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [calibratedGrade, setCalibratedGrade] = useState<AppraisalRecord['finalGrade']>(
    'Exceeds Expectations (4.0 - 4.9)'
  );

  useEffect(() => {
    if (appraisal) {
      const initialScores: { [id: string]: number } = {};
      appraisal.competencies.forEach((c) => {
        initialScores[c.id] = mode === 'self_review' ? c.selfScore : c.managerScore || c.selfScore;
      });
      setScores(initialScores);
      setSummary(mode === 'self_review' ? appraisal.selfSummary : appraisal.managerSummary);
      setNineBox(appraisal.nineBoxPosition || 'High Performer');
      setSalaryBump(appraisal.recommendedSalaryIncrementPct || 10);
      setPromotion(!!appraisal.promotionRecommended);
      setNewTitle(appraisal.recommendedNewTitle || '');
      setCalibratedGrade(appraisal.finalGrade || 'Exceeds Expectations (4.0 - 4.9)');
    }
  }, [appraisal, mode]);

  if (!isOpen || !appraisal) return null;

  const handleScoreChange = (compId: string, score: number) => {
    setScores((prev) => ({ ...prev, [compId]: score }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'self_review') {
      submitSelfAppraisal(appraisal.id, scores, summary);
    } else if (mode === 'manager_review') {
      submitManagerEvaluation(
        appraisal.id,
        scores,
        summary,
        nineBox,
        Number(salaryBump) || 0,
        promotion,
        newTitle
      );
    } else if (mode === 'calibrate') {
      calibrateAppraisal(appraisal.id, calibratedGrade);
    }
    onClose();
  };

  const isReadOnly = mode === 'view';

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-[#ffffff] w-full max-w-3xl rounded-[24px] border border-[#e5e5e5] shadow-2xl overflow-hidden flex flex-col my-auto animate-in fade-in zoom-in-95 max-h-[90vh]">
        {/* Top Header */}
        <div className="px-6 py-4 border-b border-[#e5e5e5] bg-[#fafafa] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono uppercase tracking-wider text-[#737373]">
              Semplo Performance Appraisal
            </span>
            <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-[#f5f5f5] text-[#0a0a0a] border border-[#e5e5e5]">
              {appraisal.cycleName}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-[#737373] hover:text-[#0a0a0a] hover:bg-[#ebebeb] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* Employee Header Ribbon */}
          <div className="p-4 bg-[#fafafa] rounded-[18px] border border-[#e5e5e5] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src={appraisal.employeeAvatar}
                alt={appraisal.employeeName}
                className="w-10 h-10 rounded-full object-cover border border-[#e5e5e5]"
              />
              <div>
                <h3 className="text-sm font-bold text-[#0a0a0a]">
                  {appraisal.employeeName}
                </h3>
                <p className="text-[11px] text-[#737373]">
                  {appraisal.employeeCode} · {appraisal.jobTitle} · {appraisal.department}
                </p>
              </div>
            </div>

            <div className="text-right">
              <div className="text-[10px] font-mono uppercase text-[#737373]">Reviewer</div>
              <div className="font-semibold text-[#0a0a0a] mt-0.5">{appraisal.reviewerName}</div>
            </div>
          </div>

          {/* Mode Instruction Prompt */}
          <div className="p-3 bg-zinc-50 border border-[#e5e5e5] rounded-[14px] flex items-center gap-2 text-[#525252]">
            <HelpCircle className="w-4 h-4 text-[#737373] shrink-0" />
            <span>
              {mode === 'self_review'
                ? 'Rate your performance across key competencies on a 1.0 - 5.0 scale and outline key achievements.'
                : mode === 'manager_review'
                ? 'Evaluate employee competencies, designate 9-box talent matrix quadrant, and propose compensation review.'
                : mode === 'calibrate'
                ? 'Review calibrated performance ratings and confirm final organizational sign-off.'
                : 'Detailed assessment scorecard and qualitative feedback review.'}
            </span>
          </div>

          {/* Competency Ratings Table */}
          <div className="space-y-4">
            <h4 className="font-mono text-[11px] uppercase tracking-wider font-bold text-[#0a0a0a] border-b border-[#0a0a0a] pb-1">
              Core Competencies & Behavioral Expectations
            </h4>

            <div className="space-y-3">
              {appraisal.competencies.map((comp) => {
                const currentScore = scores[comp.id] || (mode === 'self_review' ? comp.selfScore : comp.managerScore);

                return (
                  <div
                    key={comp.id}
                    className="p-3.5 bg-[#ffffff] rounded-[16px] border border-[#e5e5e5] space-y-2 card-shadow"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <div className="font-bold text-[13px] text-[#0a0a0a]">{comp.name}</div>
                        <div className="text-[11px] text-[#737373]">{comp.description}</div>
                      </div>

                      {/* Interactive Score Selector */}
                      <div className="flex items-center gap-1.5 shrink-0 bg-[#fafafa] p-1.5 rounded-[14px] border border-[#e5e5e5]">
                        {[1, 2, 3, 4, 5].map((num) => {
                          const isSelected = currentScore === num;
                          return (
                            <button
                              type="button"
                              key={num}
                              disabled={isReadOnly || mode === 'calibrate'}
                              onClick={() => handleScoreChange(comp.id, num)}
                              className={`w-7 h-7 rounded-[10px] font-mono text-xs font-bold transition-all ${
                                isSelected
                                  ? 'bg-[#0a0a0a] text-[#ffffff] shadow-xs'
                                  : 'text-[#737373] hover:bg-[#e5e5e5]'
                              } ${isReadOnly ? 'cursor-default' : 'cursor-pointer'}`}
                            >
                              {num}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Historical Comparison */}
                    <div className="flex items-center gap-4 text-[11px] font-mono pt-1 text-[#737373] border-t border-[#f0f0f0]">
                      <span>Self Score: <strong className="text-[#0a0a0a]">{comp.selfScore || '—'}</strong></span>
                      <span>Manager Score: <strong className="text-[#0a0a0a]">{comp.managerScore || '—'}</strong></span>
                      {comp.comments && <span className="italic truncate">"{comp.comments}"</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Qualitative Narrative */}
          <div className="space-y-2">
            <label className="block font-mono text-[11px] uppercase tracking-wider font-bold text-[#0a0a0a]">
              {mode === 'self_review' ? 'Self-Assessment Summary & Key Impact' : 'Manager Evaluation & Growth Feedback'}
            </label>
            <textarea
              rows={3}
              value={summary}
              disabled={isReadOnly || mode === 'calibrate'}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Detail specific milestones, sprint deliveries, leadership impact, and areas for continued elevation..."
              className="w-full p-3 bg-[#fafafa] rounded-[16px] border border-[#e5e5e5] text-xs text-[#0a0a0a] focus:bg-[#ffffff] focus:border-[#0a0a0a] outline-hidden resize-none"
            />
          </div>

          {/* Manager Assessment Controls: 9-Box & Salary Increments */}
          {(mode === 'manager_review' || isReadOnly) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#fafafa] p-4 rounded-[18px] border border-[#e5e5e5]">
              <div>
                <label className="block text-[10px] font-mono uppercase text-[#737373] mb-1">
                  9-Box Talent Placement
                </label>
                {isReadOnly ? (
                  <div className="font-bold text-[#0a0a0a] text-sm font-mono">{nineBox}</div>
                ) : (
                  <select
                    value={nineBox}
                    onChange={(e) => setNineBox(e.target.value as NineBoxPosition)}
                    className="w-full p-2 bg-[#ffffff] rounded-[12px] border border-[#e5e5e5] text-xs text-[#0a0a0a] font-medium outline-hidden"
                  >
                    {NINE_BOX_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase text-[#737373] mb-1">
                  Recommended Salary Bump (%)
                </label>
                {isReadOnly ? (
                  <div className="font-bold text-emerald-700 text-sm font-mono">
                    +{salaryBump}% Increment
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="0"
                      max="40"
                      value={salaryBump}
                      onChange={(e) => setSalaryBump(Number(e.target.value))}
                      className="w-24 p-2 bg-[#ffffff] rounded-[12px] border border-[#e5e5e5] text-xs text-[#0a0a0a] font-mono font-medium outline-hidden"
                    />
                    <span className="text-[11px] text-[#737373]">
                      Applied to next Kenyan payroll cycle
                    </span>
                  </div>
                )}
              </div>

              {/* Promotion Checkbox */}
              <div className="sm:col-span-2 pt-2 border-t border-[#e5e5e5]">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={promotion}
                    disabled={isReadOnly}
                    onChange={(e) => setPromotion(e.target.checked)}
                    className="w-4 h-4 rounded text-[#0a0a0a] accent-[#0a0a0a]"
                  />
                  <span className="font-semibold text-[#0a0a0a]">
                    Recommend Promotion to Next Compensation Grade
                  </span>
                </label>
                {promotion && !isReadOnly && (
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="Enter recommended new job title (e.g. Lead Frontend Architect)..."
                    className="w-full mt-2 p-2 bg-[#ffffff] rounded-[12px] border border-[#e5e5e5] text-xs text-[#0a0a0a] outline-hidden"
                  />
                )}
              </div>
            </div>
          )}

          {/* Calibration Mode Selector */}
          {mode === 'calibrate' && (
            <div className="p-4 bg-[#fafafa] rounded-[18px] border border-[#e5e5e5] space-y-3">
              <label className="block text-xs font-mono uppercase font-bold text-[#0a0a0a]">
                Final Calibrated Performance Grade
              </label>
              <select
                value={calibratedGrade}
                onChange={(e) =>
                  setCalibratedGrade(e.target.value as AppraisalRecord['finalGrade'])
                }
                className="w-full p-2.5 bg-[#ffffff] rounded-[12px] border border-[#e5e5e5] text-xs text-[#0a0a0a] font-medium outline-hidden"
              >
                <option value="Exceptional (5.0)">Exceptional (5.0)</option>
                <option value="Exceeds Expectations (4.0 - 4.9)">
                  Exceeds Expectations (4.0 - 4.9)
                </option>
                <option value="Meets Expectations (3.0 - 3.9)">
                  Meets Expectations (3.0 - 3.9)
                </option>
                <option value="Needs Improvement (2.0 - 2.9)">
                  Needs Improvement (2.0 - 2.9)
                </option>
                <option value="Unsatisfactory (1.0 - 1.9)">Unsatisfactory (1.0 - 1.9)</option>
              </select>
            </div>
          )}

          {/* Modal Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t border-[#e5e5e5]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-[18px] bg-[#f5f5f5] hover:bg-[#ebebeb] text-[#0a0a0a] text-xs font-medium transition-colors"
            >
              Close
            </button>

            {!isReadOnly && (
              <button
                type="submit"
                className="px-4 py-2 rounded-[18px] bg-[#0a0a0a] hover:bg-[#262626] text-[#ffffff] text-xs font-medium transition-colors flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>
                  {mode === 'self_review'
                    ? 'Submit Self-Appraisal'
                    : mode === 'manager_review'
                    ? 'Submit Manager Review'
                    : 'Confirm Calibration'}
                </span>
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
