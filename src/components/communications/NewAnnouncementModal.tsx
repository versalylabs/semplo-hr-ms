/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Megaphone, ArrowRight, AlertCircle } from 'lucide-react';
import { useHR } from '../../context/HRContext';
import { AnnouncementCategory } from '../../types/hr';

interface NewAnnouncementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NewAnnouncementModal: React.FC<NewAnnouncementModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { activePersona, addAnnouncement } = useHR();

  const [form, setForm] = useState({
    title: '',
    category: 'company_update' as AnnouncementCategory,
    priority: 'normal' as 'normal' | 'important' | 'urgent',
    isPinned: false,
    content: '',
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addAnnouncement({
      title: form.title,
      category: form.category,
      priority: form.priority,
      isPinned: form.isPinned,
      content: form.content,
      authorName: activePersona.name,
      authorRole: activePersona.roleLabel,
      authorAvatar: activePersona.avatar,
      department: activePersona.department,
    });
    setForm({
      title: '',
      category: 'company_update',
      priority: 'normal',
      isPinned: false,
      content: '',
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in">
      <div className="bg-[#ffffff] rounded-[24px] border border-[#e5e5e5] w-full max-w-lg card-shadow overflow-hidden max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#e5e5e5] flex items-center justify-between bg-[#fafafa]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#0a0a0a] text-[#ffffff] flex items-center justify-center">
              <Megaphone className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-[#0a0a0a] tracking-tight">
                Publish Company Bulletin
              </h2>
              <p className="text-[12px] text-[#737373]">
                Broadcasting as <span className="font-semibold text-[#0a0a0a]">{activePersona.name}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-[#e5e5e5] text-[#737373] hover:text-[#0a0a0a]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
          <div>
            <label className="block text-[11px] font-medium text-[#737373] uppercase tracking-wider mb-1">
              Notice Title
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Q4 Company Strategy & Public Holidays Notice"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full bg-[#f5f5f5] border border-[#e5e5e5] rounded-[14px] px-3.5 py-2 text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0a0a0a]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-[#737373] uppercase tracking-wider mb-1">
                Category
              </label>
              <select
                value={form.category}
                onChange={(e) =>
                  setForm({ ...form, category: e.target.value as AnnouncementCategory })
                }
                className="w-full bg-[#f5f5f5] border border-[#e5e5e5] rounded-[14px] px-3 py-2 text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0a0a0a]"
              >
                <option value="company_update">Company Update</option>
                <option value="event">Town Hall / Event</option>
                <option value="policy">Policy & Compliance</option>
                <option value="celebration">Celebration & Milestone</option>
                <option value="alert">Notice / Alert</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-[#737373] uppercase tracking-wider mb-1">
                Priority Level
              </label>
              <select
                value={form.priority}
                onChange={(e) =>
                  setForm({ ...form, priority: e.target.value as 'normal' | 'important' | 'urgent' })
                }
                className="w-full bg-[#f5f5f5] border border-[#e5e5e5] rounded-[14px] px-3 py-2 text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0a0a0a]"
              >
                <option value="normal">Normal</option>
                <option value="important">Important (Featured)</option>
                <option value="urgent">Urgent Priority</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-[#737373] uppercase tracking-wider mb-1">
              Notice Content
            </label>
            <textarea
              rows={4}
              required
              placeholder="Write the full announcement message for company staff..."
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              className="w-full bg-[#f5f5f5] border border-[#e5e5e5] rounded-[14px] p-3 text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0a0a0a]"
            />
          </div>

          <label className="flex items-center gap-2 cursor-pointer p-3 bg-[#fafafa] border border-[#e5e5e5] rounded-[14px]">
            <input
              type="checkbox"
              checked={form.isPinned}
              onChange={(e) => setForm({ ...form, isPinned: e.target.checked })}
              className="rounded text-[#0a0a0a] focus:ring-0"
            />
            <span className="text-[12px] font-medium text-[#0a0a0a]">
              Pin this notice to top of Bulletin Board
            </span>
          </label>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#e5e5e5]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-[18px] bg-[#f5f5f5] text-[#171717] text-[13px] font-medium hover:bg-[#ebebeb]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-[18px] bg-[#0a0a0a] text-[#ffffff] text-[13px] font-medium hover:bg-[#262626] flex items-center gap-1.5 shadow-sm"
            >
              <span>Publish Notice</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
