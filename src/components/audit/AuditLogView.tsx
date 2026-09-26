/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { History, ShieldCheck, Filter, Download } from 'lucide-react';
import { useHR } from '../../context/HRContext';

export const AuditLogView: React.FC = () => {
  const { auditLogs } = useHR();
  const [filterType, setFilterType] = useState<string>('all');

  const filteredLogs = auditLogs.filter((log) => {
    if (filterType === 'all') return true;
    return log.actionType === filterType;
  });

  const exportLogsAsJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(auditLogs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `hr_compliance_audit_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto flex flex-col gap-6">
      {/* Title & Actions */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2 border-b border-[#e5e5e5]">
        <div>
          <h1 className="text-2xl sm:text-[30px] font-bold text-emerald-700 tracking-tight leading-tight whitespace-normal sm:whitespace-nowrap">
            Audit Trail & Compliance Log
          </h1>
          <p className="text-[14px] text-[#737373] mt-1">
            Immutable chronological ledger of personnel mutations, security sign-offs, and status changes.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportLogsAsJSON}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-[18px] bg-[#ffffff] border border-[#e5e5e5] text-[#0a0a0a] text-[13px] font-medium hover:bg-[#f5f5f5] transition-colors card-shadow whitespace-nowrap"
          >
            <Download className="w-3.5 h-3.5 text-[#737373]" />
            <span>Export Audit JSON</span>
          </button>
        </div>
      </div>

      {/* Filter Selector */}
      <div className="bg-[#ffffff] rounded-[24px] border border-[#e5e5e5] p-4 card-shadow flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 max-w-full overflow-x-auto no-scrollbar">
          <Filter className="w-3.5 h-3.5 text-[#737373] shrink-0" />
          <span className="text-[12px] font-medium text-[#737373] uppercase tracking-wider shrink-0">
            Filter Ledger:
          </span>
          <div className="flex items-center gap-1 bg-[#f5f5f5] p-1 rounded-[18px] shrink-0">
            {(['all', 'create', 'update', 'status_change', 'onboarding', 'offboarding'] as const).map(
              (type) => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={`px-3 py-1 rounded-[18px] text-[12px] font-medium capitalize transition-all whitespace-nowrap ${
                    filterType === type
                      ? 'bg-[#ffffff] text-[#0a0a0a] shadow-xs'
                      : 'text-[#737373] hover:text-[#0a0a0a]'
                  }`}
                >
                  {type === 'all' ? 'All Events' : type.replace('_', ' ')}
                </button>
              )
            )}
          </div>
        </div>

        <span className="text-[12px] font-mono text-[#737373] shrink-0">
          {filteredLogs.length} events logged
        </span>
      </div>

      {/* Ledger Table */}
      <div className="bg-[#ffffff] rounded-[24px] border border-[#e5e5e5] p-6 card-shadow overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#e5e5e5] text-[11px] uppercase tracking-wider text-[#737373]">
              <th className="py-3 px-3 font-medium">Timestamp</th>
              <th className="py-3 px-3 font-medium">Actor</th>
              <th className="py-3 px-3 font-medium">Action Category</th>
              <th className="py-3 px-3 font-medium">Entity</th>
              <th className="py-3 px-3 font-medium">Operation Description</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#f5f5f5] text-[13px]">
            {filteredLogs.map((log) => (
              <tr key={log.id} className="hover:bg-[#fafafa] transition-colors">
                <td className="py-3 px-3 font-mono text-[12px] text-[#737373] whitespace-nowrap">
                  {log.timestamp}
                </td>
                <td className="py-3 px-3">
                  <div className="font-medium text-[#0a0a0a]">{log.actorName}</div>
                  <div className="text-[11px] text-[#737373] capitalize">
                    {log.actorRole.replace('_', ' ')}
                  </div>
                </td>
                <td className="py-3 px-3">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-[18px] text-[11px] font-mono uppercase tracking-wider ${
                      log.actionType === 'create'
                        ? 'bg-[#171717] text-[#ffffff]'
                        : log.actionType === 'status_change'
                        ? 'bg-[#f5f5f5] text-[#171717] border border-[#e5e5e5]'
                        : 'bg-[#fafafa] text-[#737373] border border-[#e5e5e5]'
                    }`}
                  >
                    {log.actionType.replace('_', ' ')}
                  </span>
                </td>
                <td className="py-3 px-3 text-[#737373] uppercase font-mono text-[11px]">
                  {log.entityType}
                </td>
                <td className="py-3 px-3 text-[#171717] font-medium max-w-lg">
                  {log.description}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredLogs.length === 0 && (
          <div className="py-12 text-center text-[13px] text-[#737373]">
            No audit records found matching the active filter.
          </div>
        )}
      </div>
    </div>
  );
};
