/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Megaphone,
  BookOpen,
  Calendar,
  Gift,
  Award,
  Pin,
  Search,
  Filter,
  Plus,
  Heart,
  CheckCircle2,
  Clock,
  Download,
  Share2,
  Users,
  MapPin,
  CalendarDays,
  FileCheck,
  ChevronRight,
  X,
  Sparkles,
} from 'lucide-react';
import { useHR } from '../../context/HRContext';
import { Announcement, PolicyDocument, CompanyEvent } from '../../types/hr';
import { NewAnnouncementModal } from './NewAnnouncementModal';

export const CompanyHubView: React.FC = () => {
  const {
    announcements,
    policyDocuments,
    companyEvents,
    employees,
    activePersona,
    toggleAnnouncementReaction,
    deleteAnnouncement,
    canPerformAction,
  } = useHR();

  const [activeTab, setActiveTab] = useState<'bulletin' | 'policies' | 'celebrations'>('bulletin');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isNewAnnouncementModalOpen, setIsNewAnnouncementModalOpen] = useState(false);

  // Policy Reader Modal
  const [selectedPolicy, setSelectedPolicy] = useState<PolicyDocument | null>(null);
  const [acknowledgedPolicies, setAcknowledgedPolicies] = useState<{ [id: string]: boolean }>({
    pol_001: true,
  });

  // Event RSVP state
  const [rsvps, setRsvps] = useState<{ [id: string]: boolean }>({
    evt_001: true,
  });

  // Wishes state
  const [sentWishes, setSentWishes] = useState<{ [id: string]: boolean }>({});

  const isHRorAdmin = canPerformAction('department_lead') || activePersona.role === 'hr_manager' || activePersona.role === 'super_admin';

  // Filter announcements
  const filteredAnnouncements = announcements.filter((ann) => {
    if (categoryFilter !== 'all' && ann.category !== categoryFilter) return false;
    if (
      searchQuery &&
      !ann.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !ann.content.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !ann.authorName.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  // Pinned vs Regular
  const pinnedAnnouncements = filteredAnnouncements.filter((a) => a.isPinned);
  const regularAnnouncements = filteredAnnouncements.filter((a) => !a.isPinned);

  // Calculate upcoming birthdays & work anniversaries from employees
  const today = new Date('2026-09-26');
  
  // Work anniversaries in September & October
  const anniversaries = employees
    .map((emp) => {
      const joinDate = new Date(emp.joiningDate);
      const joinYear = joinDate.getFullYear();
      const currentYear = 2026;
      const yearsAtCompany = currentYear - joinYear;
      return {
        emp,
        joinDate: emp.joiningDate,
        yearsAtCompany: Math.max(1, yearsAtCompany),
        month: joinDate.getMonth(),
        day: joinDate.getDate(),
      };
    })
    .filter((a) => a.yearsAtCompany >= 1)
    .slice(0, 5);

  // Upcoming simulated birthdays
  const birthdays = [
    {
      emp: employees[4] || employees[0],
      dateLabel: 'Sept 28 (In 2 Days)',
      ageMilestone: 'Senior Engineer Celebration',
    },
    {
      emp: employees[2] || employees[1],
      dateLabel: 'Oct 04 (Next Week)',
      ageMilestone: 'Engineering Lead Celebration',
    },
    {
      emp: employees[7] || employees[2],
      dateLabel: 'Oct 14',
      ageMilestone: 'Product Design Milestone',
    },
    {
      emp: employees[9] || employees[3],
      dateLabel: 'Oct 22',
      ageMilestone: 'DevOps Milestone',
    },
  ];

  const handleToggleRSVP = (evtId: string) => {
    setRsvps((prev) => ({
      ...prev,
      [evtId]: !prev[evtId],
    }));
  };

  const handleSendWish = (empId: string) => {
    setSentWishes((prev) => ({
      ...prev,
      [empId]: true,
    }));
  };

  const handleAcknowledgePolicy = (polId: string) => {
    setAcknowledgedPolicies((prev) => ({
      ...prev,
      [polId]: true,
    }));
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto flex flex-col gap-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-[12px] whitespace-nowrap">
              Communications
            </span>
            <span className="text-[11px] text-[#737373] whitespace-nowrap">
              Company Hub & Bulletin
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-emerald-700 mt-1 whitespace-normal sm:whitespace-nowrap">
            Company Hub & Bulletin
          </h1>
          <p className="text-[13px] text-[#737373] mt-0.5">
            Official announcements, statutory policy handbooks, and team celebrations.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="bg-[#f1f5f9] p-1.5 rounded-[20px] flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setActiveTab('bulletin')}
              className={`px-4 py-2 rounded-[14px] text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'bulletin'
                  ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/25'
                  : 'text-[#64748b] hover:text-[#0a0a0a]'
              }`}
            >
              <Megaphone className="w-3.5 h-3.5" />
              <span>Bulletin Board</span>
            </button>
            <button
              onClick={() => setActiveTab('policies')}
              className={`px-4 py-2 rounded-[14px] text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'policies'
                  ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/25'
                  : 'text-[#64748b] hover:text-[#0a0a0a]'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Policy Handbooks</span>
            </button>
            <button
              onClick={() => setActiveTab('celebrations')}
              className={`px-4 py-2 rounded-[14px] text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'celebrations'
                  ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/25'
                  : 'text-[#64748b] hover:text-[#0a0a0a]'
              }`}
            >
              <Gift className="w-3.5 h-3.5" />
              <span>Events & Celebrations</span>
            </button>
          </div>

          {isHRorAdmin && (
            <button
              onClick={() => setIsNewAnnouncementModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-[#ffffff] rounded-[18px] text-[13px] font-bold shadow-md shadow-emerald-600/25 transition-all transform active:scale-95 shrink-0"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Post Bulletin</span>
            </button>
          )}
        </div>
      </div>

      {/* TAB 1: BULLETIN BOARD */}
      {activeTab === 'bulletin' && (
        <div className="flex flex-col gap-6">
          {/* Filter Bar */}
          <div className="bg-[#ffffff] rounded-[24px] border border-[#e5e5e5] p-4 flex flex-col md:flex-row items-center justify-between gap-3 card-shadow">
            <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto">
              {[
                { id: 'all', label: 'All Notices' },
                { id: 'company_update', label: 'Company Updates' },
                { id: 'event', label: 'Town Halls & Events' },
                { id: 'policy', label: 'Policy & Compliance' },
                { id: 'celebration', label: 'Celebrations' },
              ].map((c) => (
                <button
                  key={c.id}
                  onClick={() => setCategoryFilter(c.id)}
                  className={`px-3 py-1.5 rounded-[14px] text-xs font-medium transition-all shrink-0 ${
                    categoryFilter === c.id
                      ? 'bg-[#0a0a0a] text-[#fafafa]'
                      : 'text-[#737373] hover:bg-[#f5f5f5] hover:text-[#0a0a0a]'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>

            <div className="relative w-full md:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#737373]" />
              <input
                type="text"
                placeholder="Search bulletin..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#f5f5f5] border border-[#e5e5e5] rounded-[14px] pl-8 pr-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-[#0a0a0a]"
              />
            </div>
          </div>

          {/* Pinned Announcements Hero */}
          {pinnedAnnouncements.length > 0 && (
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-[#0a0a0a]">
                <Pin className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
                <span>Featured & Pinned Notices</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pinnedAnnouncements.map((ann) => (
                  <div
                    key={ann.id}
                    className="bg-[#ffffff] rounded-[24px] border-2 border-[#0a0a0a] p-5 card-shadow flex flex-col justify-between relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 bg-[#0a0a0a] text-[#ffffff] px-3 py-1 text-[10px] font-mono uppercase tracking-wider rounded-bl-[14px] flex items-center gap-1">
                      <Pin className="w-3 h-3 fill-white" />
                      <span>Pinned</span>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#f5f5f5] text-[#171717] border border-[#e5e5e5]">
                          {ann.category.replace('_', ' ')}
                        </span>
                        {ann.priority === 'urgent' && (
                          <span className="text-[10px] font-mono uppercase bg-rose-50 text-rose-700 px-2 py-0.5 rounded-full border border-rose-200">
                            Urgent
                          </span>
                        )}
                        {ann.priority === 'important' && (
                          <span className="text-[10px] font-mono uppercase bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full border border-amber-200">
                            Important
                          </span>
                        )}
                      </div>

                      <h3 className="text-base font-bold text-[#0a0a0a] tracking-tight">
                        {ann.title}
                      </h3>
                      <p className="text-[13px] text-[#404040] mt-2 leading-relaxed">
                        {ann.content}
                      </p>
                    </div>

                    {/* Footer */}
                    <div className="mt-5 pt-3 border-t border-[#e5e5e5] flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <img
                          src={ann.authorAvatar}
                          alt={ann.authorName}
                          className="w-6 h-6 rounded-full object-cover border border-[#e5e5e5]"
                        />
                        <div className="text-[11px]">
                          <span className="font-semibold text-[#0a0a0a]">{ann.authorName}</span>
                          <span className="text-[#737373]"> · {ann.publishedAt}</span>
                        </div>
                      </div>

                      {/* Emoji reactions */}
                      <div className="flex items-center gap-1.5">
                        {['🎉', '👍', '❤️', '🚀'].map((emoji) => {
                          const count = ann.reactions[emoji] || 0;
                          const hasReacted = ann.userReacted?.[emoji];
                          return (
                            <button
                              key={emoji}
                              onClick={() => toggleAnnouncementReaction(ann.id, emoji)}
                              className={`px-2 py-1 rounded-[12px] text-xs transition-all flex items-center gap-1 border ${
                                hasReacted
                                  ? 'bg-amber-50 border-amber-300 font-bold'
                                  : 'bg-[#fafafa] border-[#e5e5e5] hover:bg-[#f0f0f0]'
                              }`}
                            >
                              <span>{emoji}</span>
                              {count > 0 && <span className="text-[10px] text-[#737373]">{count}</span>}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* All Other Feed Announcements */}
          <div className="flex flex-col gap-3">
            <div className="text-xs font-semibold text-[#0a0a0a]">Recent Communications Feed</div>
            <div className="grid grid-cols-1 gap-4">
              {regularAnnouncements.length === 0 ? (
                <div className="py-12 bg-[#ffffff] rounded-[24px] border border-[#e5e5e5] text-center text-[#737373] text-[13px]">
                  No additional notices found in this category.
                </div>
              ) : (
                regularAnnouncements.map((ann) => (
                  <div
                    key={ann.id}
                    className="bg-[#ffffff] rounded-[24px] border border-[#e5e5e5] p-5 card-shadow hover:border-[#d4d4d4] transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#f5f5f5] text-[#171717] border border-[#e5e5e5]">
                            {ann.category.replace('_', ' ')}
                          </span>
                          <span className="text-[11px] text-[#737373]">{ann.department}</span>
                        </div>
                        {isHRorAdmin && (
                          <button
                            onClick={() => deleteAnnouncement(ann.id)}
                            className="text-[11px] text-rose-600 hover:underline"
                          >
                            Remove
                          </button>
                        )}
                      </div>

                      <h3 className="text-base font-semibold text-[#0a0a0a]">
                        {ann.title}
                      </h3>
                      <p className="text-[13px] text-[#404040] mt-1.5 leading-relaxed">
                        {ann.content}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-[#e5e5e5] flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <img
                          src={ann.authorAvatar}
                          alt={ann.authorName}
                          className="w-6 h-6 rounded-full object-cover border border-[#e5e5e5]"
                        />
                        <div className="text-[11px]">
                          <span className="font-semibold text-[#0a0a0a]">{ann.authorName}</span>
                          <span className="text-[#737373]"> · {ann.publishedAt}</span>
                        </div>
                      </div>

                      {/* Emoji reaction pills */}
                      <div className="flex items-center gap-1.5">
                        {['🎉', '👍', '❤️', '🏆'].map((emoji) => {
                          const count = ann.reactions[emoji] || 0;
                          const hasReacted = ann.userReacted?.[emoji];
                          return (
                            <button
                              key={emoji}
                              onClick={() => toggleAnnouncementReaction(ann.id, emoji)}
                              className={`px-2 py-1 rounded-[12px] text-xs transition-all flex items-center gap-1 border ${
                                hasReacted
                                  ? 'bg-amber-50 border-amber-300 font-bold'
                                  : 'bg-[#fafafa] border-[#e5e5e5] hover:bg-[#f0f0f0]'
                              }`}
                            >
                              <span>{emoji}</span>
                              {count > 0 && <span className="text-[10px] text-[#737373]">{count}</span>}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: POLICY HANDBOOKS */}
      {activeTab === 'policies' && (
        <div className="flex flex-col gap-6">
          <div className="bg-[#ffffff] rounded-[24px] border border-[#e5e5e5] p-5 card-shadow flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-semibold text-[#0a0a0a]">
                Statutory Policies & Employee Handbooks
              </h2>
              <p className="text-[13px] text-[#737373] mt-0.5">
                All company governance policies are compliant with Kenya Employment Act 2007, ODPC Data Protection 2019, and DOSHS safety standards.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1 rounded-[14px]">
                5 Active Handbooks Registered
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {policyDocuments.map((policy) => {
              const isAcknowledged = acknowledgedPolicies[policy.id];
              return (
                <div
                  key={policy.id}
                  className="bg-[#ffffff] rounded-[24px] border border-[#e5e5e5] p-5 card-shadow hover:border-[#d4d4d4] transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-mono uppercase bg-[#f5f5f5] text-[#171717] px-2 py-0.5 rounded-[12px] border border-[#e5e5e5]">
                        {policy.categoryLabel}
                      </span>
                      <span className="text-[10px] font-mono text-[#737373]">
                        {policy.version} · {policy.fileSize}
                      </span>
                    </div>

                    <h3 className="text-base font-semibold text-[#0a0a0a] tracking-tight">
                      {policy.title}
                    </h3>
                    <p className="text-[13px] text-[#737373] mt-2 leading-relaxed">
                      {policy.description}
                    </p>

                    <div className="mt-4 flex flex-wrap gap-2 text-[11px] text-[#737373]">
                      <span>Est. Read: {policy.readTime}</span>
                      <span>·</span>
                      <span>Updated: {policy.lastUpdated}</span>
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-[#e5e5e5] flex items-center justify-between">
                    <div>
                      {isAcknowledged ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Acknowledged & Signed</span>
                        </span>
                      ) : (
                        <span className="text-[11px] text-amber-700 font-medium">
                          Acknowledgement Pending
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedPolicy(policy)}
                        className="px-3 py-1.5 rounded-[14px] bg-[#0a0a0a] text-[#ffffff] text-xs font-medium hover:bg-[#262626] transition-colors flex items-center gap-1"
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>Read Policy</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: CELEBRATIONS & EVENTS */}
      {activeTab === 'celebrations' && (
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Upcoming Birthdays Card */}
            <div className="bg-[#ffffff] rounded-[24px] border border-[#e5e5e5] p-5 card-shadow flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Gift className="w-4 h-4 text-[#737373]" />
                    <span className="text-[13px] font-semibold text-[#0a0a0a]">Upcoming Birthdays</span>
                  </div>
                  <span className="text-[10px] font-mono uppercase bg-rose-50 text-rose-700 px-2 py-0.5 rounded-full border border-rose-200">
                    September / October
                  </span>
                </div>

                <div className="flex flex-col gap-3">
                  {birthdays.map((item) => {
                    const isWishSent = sentWishes[item.emp.id];
                    return (
                      <div
                        key={item.emp.id}
                        className="p-3 bg-[#fafafa] rounded-[18px] border border-[#e5e5e5] flex items-center justify-between hover:border-[#d4d4d4] transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={item.emp.avatar}
                            alt={item.emp.firstName}
                            className="w-9 h-9 rounded-full object-cover border border-[#e5e5e5]"
                          />
                          <div>
                            <div className="text-[13px] font-medium text-[#0a0a0a]">
                              {item.emp.firstName} {item.emp.lastName}
                            </div>
                            <div className="text-[11px] text-[#737373]">
                              {item.emp.jobTitle} · <span className="font-semibold text-rose-600">{item.dateLabel}</span>
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => handleSendWish(item.emp.id)}
                          className={`px-3 py-1 rounded-[12px] text-xs font-medium transition-all flex items-center gap-1 ${
                            isWishSent
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-[#ffffff] text-[#0a0a0a] border border-[#e5e5e5] hover:bg-[#f0f0f0]'
                          }`}
                        >
                          <Sparkles className="w-3 h-3 text-amber-500" />
                          <span>{isWishSent ? 'Wishes Sent!' : 'Send Kudos'}</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-[#e5e5e5] text-[11px] text-[#737373] text-center">
                🎂 Birthday announcements are broadcasted across company Slack / Teams channels at 09:00 EAT.
              </div>
            </div>

            {/* Work Anniversaries Card */}
            <div className="bg-[#ffffff] rounded-[24px] border border-[#e5e5e5] p-5 card-shadow flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-[#737373]" />
                    <span className="text-[13px] font-semibold text-[#0a0a0a]">Work Anniversaries</span>
                  </div>
                  <span className="text-[10px] font-mono uppercase bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full border border-amber-200">
                    Tenure Milestones
                  </span>
                </div>

                <div className="flex flex-col gap-3">
                  {anniversaries.map((item) => (
                    <div
                      key={item.emp.id}
                      className="p-3 bg-[#fafafa] rounded-[18px] border border-[#e5e5e5] flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={item.emp.avatar}
                          alt={item.emp.firstName}
                          className="w-9 h-9 rounded-full object-cover border border-[#e5e5e5]"
                        />
                        <div>
                          <div className="text-[13px] font-medium text-[#0a0a0a]">
                            {item.emp.firstName} {item.emp.lastName}
                          </div>
                          <div className="text-[11px] text-[#737373]">
                            Joined {item.joinDate} · {item.emp.department}
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="px-2.5 py-1 rounded-[12px] bg-amber-100/70 text-amber-900 border border-amber-200 text-xs font-mono font-bold">
                          {item.yearsAtCompany} Year{item.yearsAtCompany > 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-[#e5e5e5] text-[11px] text-[#737373] text-center">
                🏆 Long-service awards are commemorated annually during Jamhuri Gala Dinner.
              </div>
            </div>
          </div>

          {/* Upcoming Corporate Events & Town Halls */}
          <div className="bg-[#ffffff] rounded-[24px] border border-[#e5e5e5] p-5 card-shadow flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#737373]" />
                <h3 className="text-base font-semibold text-[#0a0a0a]">
                  Corporate Events & Town Halls
                </h3>
              </div>
              <span className="text-xs font-mono text-[#737373]">
                East Africa Time (EAT UTC+3)
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {companyEvents.map((evt) => {
                const isRsvped = rsvps[evt.id];
                return (
                  <div
                    key={evt.id}
                    className="p-4 bg-[#fafafa] rounded-[20px] border border-[#e5e5e5] flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between text-[11px] font-mono text-[#737373] mb-1">
                        <span>{evt.date}</span>
                        <span className="font-semibold text-[#0a0a0a]">{evt.time}</span>
                      </div>

                      <h4 className="text-sm font-semibold text-[#0a0a0a] mt-1">
                        {evt.title}
                      </h4>
                      <p className="text-[12px] text-[#737373] mt-2 leading-relaxed">
                        {evt.description}
                      </p>

                      <div className="mt-3 flex flex-col gap-1 text-[11px] text-[#737373]">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3 h-3 text-[#737373]" />
                          <span>{evt.location}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Users className="w-3 h-3 text-[#737373]" />
                          <span>{evt.attendeeCount + (isRsvped ? 1 : 0)} Attending</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-[#e5e5e5]">
                      <button
                        onClick={() => handleToggleRSVP(evt.id)}
                        className={`w-full py-1.5 rounded-[14px] text-xs font-medium transition-all ${
                          isRsvped
                            ? 'bg-emerald-600 text-[#ffffff]'
                            : 'bg-[#ffffff] text-[#0a0a0a] border border-[#e5e5e5] hover:bg-[#ebebeb]'
                        }`}
                      >
                        {isRsvped ? '✓ RSVP Confirmed (Attending)' : 'RSVP for Event'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* POLICY READER MODAL / DRAWER */}
      {selectedPolicy && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in">
          <div className="bg-[#ffffff] rounded-[24px] border border-[#e5e5e5] max-w-2xl w-full max-h-[85vh] flex flex-col card-shadow overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-[#e5e5e5] flex items-center justify-between bg-[#fafafa]">
              <div>
                <span className="text-[10px] font-mono uppercase bg-[#ffffff] border border-[#e5e5e5] px-2 py-0.5 rounded-[10px]">
                  {selectedPolicy.version} · {selectedPolicy.categoryLabel}
                </span>
                <h3 className="text-base font-semibold text-[#0a0a0a] mt-1">
                  {selectedPolicy.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedPolicy(null)}
                className="p-1.5 rounded-full hover:bg-[#e5e5e5] text-[#737373]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body: Policy Content Chapters */}
            <div className="p-6 overflow-y-auto flex-1 flex flex-col gap-5 text-xs leading-relaxed text-[#171717]">
              <div className="p-3.5 bg-blue-50/70 border border-blue-200/80 rounded-[18px] text-[12px] text-blue-900">
                <strong>Statutory Scope: </strong>
                {selectedPolicy.description}
              </div>

              {selectedPolicy.contentSections.map((sec, idx) => (
                <div key={idx} className="p-4 bg-[#fafafa] rounded-[18px] border border-[#e5e5e5]">
                  <h4 className="text-[13px] font-bold text-[#0a0a0a] mb-2">{sec.title}</h4>
                  <p className="text-[12px] text-[#404040] leading-normal">{sec.content}</p>
                </div>
              ))}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-[#e5e5e5] bg-[#fafafa] flex items-center justify-between">
              <span className="text-[11px] text-[#737373]">
                Effective Date: {selectedPolicy.effectiveDate}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedPolicy(null)}
                  className="px-4 py-2 rounded-[18px] bg-[#f5f5f5] text-[#171717] text-xs font-medium hover:bg-[#ebebeb]"
                >
                  Close Reader
                </button>
                <button
                  onClick={() => {
                    handleAcknowledgePolicy(selectedPolicy.id);
                    setSelectedPolicy(null);
                  }}
                  className="px-4 py-2 rounded-[18px] bg-[#0a0a0a] text-[#ffffff] text-xs font-medium hover:bg-[#262626] flex items-center gap-1.5 shadow-sm"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Acknowledge & Sign</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New Announcement Modal */}
      <NewAnnouncementModal
        isOpen={isNewAnnouncementModalOpen}
        onClose={() => setIsNewAnnouncementModalOpen(false)}
      />
    </div>
  );
};
