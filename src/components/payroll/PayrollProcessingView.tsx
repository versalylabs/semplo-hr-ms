/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  FileText,
  Download,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Building,
  CreditCard,
  Phone,
  Shield,
  Search,
  Filter,
  Eye,
  Edit3,
  RotateCw,
  Send,
  Lock,
  Layers,
  HelpCircle,
  DollarSign,
} from 'lucide-react';
import { useHR } from '../../context/HRContext';
import { Payslip } from '../../types/hr';
import { DigitalPayslipModal } from './DigitalPayslipModal';
import { PayslipAdjustModal } from './PayslipAdjustModal';

export const PayrollProcessingView: React.FC = () => {
  const {
    payrollCycles,
    selectedPayrollCycleId,
    setSelectedPayrollCycleId,
    selectedPayslip,
    setSelectedPayslip,
    isPayslipModalOpen,
    setIsPayslipModalOpen,
    runPayrollCalculation,
    approvePayrollCycle,
    disbursePayrollCycle,
    canPerformAction,
    activePersona,
    departments,
  } = useHR();

  const [activeSubTab, setActiveSubTab] = useState<'register' | 'statutory' | 'bank_mpesa' | 'my_payslips'>('register');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [adjustingPayslip, setAdjustingPayslip] = useState<Payslip | null>(null);
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  const currentCycle =
    payrollCycles.find((c) => c.id === selectedPayrollCycleId) || payrollCycles[0];

  const isHrOrAdmin = canPerformAction('hr_manager');

  const formatKes = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatKesExact = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  // Filtered payslips
  const filteredPayslips = (currentCycle?.payslips || []).filter((p) => {
    const matchesSearch =
      p.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.employeeCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.kraPin.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDept = selectedDept === 'ALL' || p.department === selectedDept;

    return matchesSearch && matchesDept;
  });

  // Current persona's payslip
  const myPayslip = (currentCycle?.payslips || []).find(
    (p) => p.employeeId === activePersona.employeeId
  );

  const handleOpenPayslip = (payslip: Payslip) => {
    setSelectedPayslip(payslip);
    setIsPayslipModalOpen(true);
  };

  const handleOpenAdjust = (payslip: Payslip) => {
    setAdjustingPayslip(payslip);
    setIsAdjustModalOpen(true);
  };

  const handleExportKraCsv = () => {
    if (!currentCycle) return;
    const headers = [
      'PIN',
      'Employee Name',
      'Residential Status',
      'Type of Employee',
      'Basic Salary',
      'Housing Allowance',
      'Transport Allowance',
      'Other Allowances',
      'Gross Pay',
      'Allowable NSSF Deductions',
      'Taxable Pay',
      'Tax Charged',
      'Personal Relief',
      'Insurance Relief',
      'Housing Relief',
      'PAYE Tax Deducted',
    ];

    const rows = currentCycle.payslips.map((p) => [
      p.kraPin,
      `"${p.employeeName}"`,
      'Resident',
      'Primary Employee',
      p.earnings.basicSalary,
      p.earnings.houseAllowance,
      p.earnings.transportAllowance,
      p.earnings.otherAllowances + p.earnings.overtimePay + p.earnings.bonus,
      p.earnings.grossPay,
      p.statutory.nssfTotalEmployee,
      p.statutory.taxablePay,
      p.statutory.grossTaxPaye,
      p.statutory.personalRelief,
      p.statutory.insuranceRelief,
      p.statutory.housingRelief,
      p.statutory.netPaye,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `KRA_iTax_PAYE_Return_${currentCycle.cycleMonth.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setExportNotice('KRA iTax P10 bulk return CSV downloaded successfully.');
    setTimeout(() => setExportNotice(null), 3500);
  };

  const handleExportBankBatchCsv = () => {
    if (!currentCycle) return;
    const headers = [
      'Beneficiary Name',
      'Beneficiary Account Number',
      'Bank Name',
      'Amount KES',
      'Payment Reference',
      'M-Pesa Phone',
      'Payment Method',
    ];

    const rows = currentCycle.payslips.map((p) => [
      `"${p.employeeName}"`,
      `"${p.bankAccount}"`,
      `"${p.bankName}"`,
      p.netPay,
      `"SALARY-${currentCycle.cycleMonth.replace(/\s+/g, '')}"`,
      `"${p.mpesaNumber || ''}"`,
      p.paymentMethod,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Bank_EFT_Disbursement_${currentCycle.cycleMonth.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setExportNotice('Bank EFT & M-Pesa batch file generated.');
    setTimeout(() => setExportNotice(null), 3500);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Top Banner / Cycle Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#ffffff] p-5 rounded-[24px] border border-[#e5e5e5] card-shadow">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-[12px] bg-[#0a0a0a] text-[#ffffff] flex items-center justify-center font-bold">
            <DollarSign className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-[24px] font-bold tracking-tight text-emerald-700 whitespace-nowrap">
                Kenyan Payroll Processing
              </h2>
              <span
                className={`text-[11px] font-mono px-2.5 py-0.5 rounded-full border whitespace-nowrap ${
                  currentCycle?.status === 'disbursed'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : currentCycle?.status === 'approved'
                    ? 'bg-blue-50 text-blue-700 border-blue-200'
                    : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}
              >
                {currentCycle?.status === 'disbursed'
                  ? 'Disbursed / Paid'
                  : currentCycle?.status === 'approved'
                  ? 'Approved'
                  : 'Calculated (In Review)'}
              </span>
            </div>
            <p className="text-xs text-[#737373] mt-0.5">
              Statutory deductions conform to KRA PAYE bands, NSSF Act 2013, SHIF 2.75%, and Housing Levy 1.5%
            </p>
          </div>
        </div>

        {/* Cycle Switcher & Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Select Cycle Dropdown */}
          <div className="flex items-center gap-1.5 bg-[#f5f5f5] px-3 py-1.5 rounded-[18px] border border-[#e5e5e5]">
            <Calendar className="w-3.5 h-3.5 text-[#737373]" />
            <select
              value={selectedPayrollCycleId}
              onChange={(e) => setSelectedPayrollCycleId(e.target.value)}
              className="bg-transparent text-xs font-semibold text-[#0a0a0a] outline-hidden cursor-pointer"
            >
              {payrollCycles.map((cycle) => (
                <option key={cycle.id} value={cycle.id}>
                  {cycle.cycleMonth} ({cycle.status})
                </option>
              ))}
            </select>
          </div>

          {/* Action buttons */}
          {isHrOrAdmin && currentCycle && (
            <>
              {currentCycle.status !== 'disbursed' && (
                <button
                  onClick={() => runPayrollCalculation(currentCycle.id)}
                  className="px-3 py-1.5 rounded-[18px] bg-[#ffffff] border border-[#e5e5e5] hover:border-[#0a0a0a] text-xs font-medium text-[#0a0a0a] transition-all flex items-center gap-1.5"
                  title="Recalculate statutory formulas for all active staff"
                >
                  <RotateCw className="w-3.5 h-3.5 text-[#737373]" />
                  <span>Recalculate</span>
                </button>
              )}

              {currentCycle.status === 'calculated' && (
                <button
                  onClick={() => approvePayrollCycle(currentCycle.id)}
                  className="px-3.5 py-1.5 rounded-[18px] bg-emerald-600 hover:bg-emerald-700 text-xs font-semibold text-[#ffffff] transition-all flex items-center gap-1.5 shadow-sm whitespace-nowrap"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                  <span>Approve Run</span>
                </button>
              )}

              {currentCycle.status === 'approved' && (
                <button
                  onClick={() => disbursePayrollCycle(currentCycle.id)}
                  className="px-3.5 py-1.5 rounded-[18px] bg-emerald-700 hover:bg-emerald-800 text-xs font-medium text-[#ffffff] transition-all flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Disburse Salaries</span>
                </button>
              )}
            </>
          )}

          {/* Export Dropdown / buttons */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleExportKraCsv}
              className="px-3 py-1.5 rounded-[18px] bg-[#ffffff] border border-[#e5e5e5] hover:border-[#0a0a0a] text-xs font-medium text-[#0a0a0a] transition-all flex items-center gap-1.5"
              title="Download KRA iTax P10 Monthly PAYE Return CSV"
            >
              <Download className="w-3.5 h-3.5 text-[#737373]" />
              <span>KRA iTax Return</span>
            </button>

            <button
              onClick={handleExportBankBatchCsv}
              className="px-3 py-1.5 rounded-[18px] bg-[#ffffff] border border-[#e5e5e5] hover:border-[#0a0a0a] text-xs font-medium text-[#0a0a0a] transition-all flex items-center gap-1.5"
              title="Download Bank EFT & M-Pesa batch disbursement file"
            >
              <CreditCard className="w-3.5 h-3.5 text-[#737373]" />
              <span>EFT / M-Pesa Batch</span>
            </button>
          </div>
        </div>
      </div>

      {exportNotice && (
        <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-[16px] text-xs flex items-center justify-between animate-in fade-in">
          <span>{exportNotice}</span>
          <button onClick={() => setExportNotice(null)} className="text-emerald-900 font-bold ml-2">
            ×
          </button>
        </div>
      )}

      {/* Statutory Summary Ribbon & KPI Cards */}
      {currentCycle && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
          {/* Card 1: Gross Remuneration */}
          <div className="bg-white p-4 rounded-[20px] border border-sky-200/80 bg-gradient-to-b from-sky-50/40 to-white card-shadow flex flex-col justify-between hover:scale-[1.01] transition-transform">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-sky-800">
                Gross Payroll
              </span>
              <div className="w-7 h-7 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-xs">
                KES
              </div>
            </div>
            <div className="mt-2">
              <div className="text-lg font-bold text-[#0a0a0a] font-mono tracking-tight">
                {formatKes(currentCycle.totalGross)}
              </div>
              <div className="text-[10px] text-sky-700/80 mt-1 font-medium">
                Basic: {formatKes(currentCycle.totalBasic)}
              </div>
            </div>
          </div>

          {/* Card 2: Net Take-Home */}
          <div className="bg-white p-4 rounded-[20px] border border-emerald-200/80 bg-gradient-to-b from-emerald-50/40 to-white card-shadow flex flex-col justify-between hover:scale-[1.01] transition-transform">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
                Net Payout
              </span>
              <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                ✓
              </div>
            </div>
            <div className="mt-2">
              <div className="text-lg font-bold text-emerald-700 font-mono tracking-tight">
                {formatKes(currentCycle.totalNetPay)}
              </div>
              <div className="text-[10px] text-emerald-700/80 mt-1 font-semibold">
                {currentCycle.employeeCount} Staff Members
              </div>
            </div>
          </div>

          {/* Card 3: KRA PAYE */}
          <div className="bg-white p-4 rounded-[20px] border border-rose-200/80 bg-gradient-to-b from-rose-50/40 to-white card-shadow flex flex-col justify-between hover:scale-[1.01] transition-transform">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-rose-800">
                KRA PAYE
              </span>
              <span className="text-[9px] font-bold bg-rose-100 text-rose-800 px-1.5 py-0.5 rounded-full">
                iTax
              </span>
            </div>
            <div className="mt-2">
              <div className="text-lg font-bold text-[#0a0a0a] font-mono tracking-tight">
                {formatKes(currentCycle.totalPaye)}
              </div>
              <div className="text-[10px] text-rose-700/80 mt-1 font-medium">
                Due 9th of next mo.
              </div>
            </div>
          </div>

          {/* Card 4: NSSF Tier I & II */}
          <div className="bg-white p-4 rounded-[20px] border border-purple-200/80 bg-gradient-to-b from-purple-50/40 to-white card-shadow flex flex-col justify-between hover:scale-[1.01] transition-transform">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-purple-800">
                NSSF (Total)
              </span>
              <span className="text-[9px] font-bold bg-purple-100 text-purple-800 px-1.5 py-0.5 rounded-full">
                Tier I & II
              </span>
            </div>
            <div className="mt-2">
              <div className="text-lg font-bold text-[#0a0a0a] font-mono tracking-tight">
                {formatKes(currentCycle.totalNssfEmployee + currentCycle.totalNssfEmployer)}
              </div>
              <div className="text-[10px] text-purple-700/80 mt-1 font-medium truncate">
                Emp + Match (50/50)
              </div>
            </div>
          </div>

          {/* Card 5: SHIF */}
          <div className="bg-white p-4 rounded-[20px] border border-indigo-200/80 bg-gradient-to-b from-indigo-50/40 to-white card-shadow flex flex-col justify-between hover:scale-[1.01] transition-transform">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-800">
                SHIF (2.75%)
              </span>
              <span className="text-[9px] font-bold bg-indigo-100 text-indigo-800 px-1.5 py-0.5 rounded-full">
                SHA
              </span>
            </div>
            <div className="mt-2">
              <div className="text-lg font-bold text-[#0a0a0a] font-mono tracking-tight">
                {formatKes(currentCycle.totalShif)}
              </div>
              <div className="text-[10px] text-indigo-700/80 mt-1 font-medium">
                Social Health Auth
              </div>
            </div>
          </div>

          {/* Card 6: Housing Levy */}
          <div className="bg-white p-4 rounded-[20px] border border-amber-200/80 bg-gradient-to-b from-amber-50/40 to-white card-shadow flex flex-col justify-between hover:scale-[1.01] transition-transform">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800">
                Housing Levy
              </span>
              <span className="text-[9px] font-bold bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded-full">
                3.0%
              </span>
            </div>
            <div className="mt-2">
              <div className="text-lg font-bold text-[#0a0a0a] font-mono tracking-tight">
                {formatKes(currentCycle.totalHousingLevyEmployee + currentCycle.totalHousingLevyEmployer)}
              </div>
              <div className="text-[10px] text-amber-700/80 mt-1 font-medium">
                1.5% Staff + 1.5% Org
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Subtab Navigation Pills */}
      <div className="flex items-center gap-1.5 bg-[#f1f5f9] p-1.5 rounded-[20px] overflow-x-auto w-fit">
        <button
          onClick={() => setActiveSubTab('register')}
          className={`px-4 py-2 rounded-[14px] text-xs font-bold transition-all whitespace-nowrap ${
            activeSubTab === 'register'
              ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/25'
              : 'text-[#64748b] hover:text-[#0a0a0a]'
          }`}
        >
          Payroll Register & Digital Payslips
        </button>

        <button
          onClick={() => setActiveSubTab('statutory')}
          className={`px-4 py-2 rounded-[14px] text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
            activeSubTab === 'statutory'
              ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/25'
              : 'text-[#64748b] hover:text-[#0a0a0a]'
          }`}
        >
          <Shield className="w-3.5 h-3.5" />
          <span>Statutory Remittance Ledger</span>
        </button>

        <button
          onClick={() => setActiveSubTab('bank_mpesa')}
          className={`px-4 py-2 rounded-[14px] text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
            activeSubTab === 'bank_mpesa'
              ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/25'
              : 'text-[#64748b] hover:text-[#0a0a0a]'
          }`}
        >
          <CreditCard className="w-3.5 h-3.5" />
          <span>Bank EFT & M-Pesa Schedule</span>
        </button>

        <button
          onClick={() => setActiveSubTab('my_payslips')}
          className={`px-4 py-2 rounded-[14px] text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
            activeSubTab === 'my_payslips'
              ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/25'
              : 'text-[#64748b] hover:text-[#0a0a0a]'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>My Payslip ({activePersona.name.split(' ')[0]})</span>
        </button>
      </div>

      {/* SUBTAB 1: PAYROLL REGISTER */}
      {activeSubTab === 'register' && (
        <div className="bg-[#ffffff] rounded-[24px] border border-[#e5e5e5] overflow-hidden card-shadow">
          {/* Table Search & Department Filter */}
          <div className="p-4 border-b border-[#e5e5e5] bg-[#fafafa] flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-72">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#737373]" />
              <input
                type="text"
                placeholder="Search staff, code, KRA PIN..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-[#ffffff] rounded-[16px] text-xs text-[#0a0a0a] border border-[#e5e5e5] focus:border-[#0a0a0a] outline-hidden"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs text-[#737373] whitespace-nowrap">Department:</span>
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="bg-[#ffffff] px-3 py-1.5 rounded-[16px] border border-[#e5e5e5] text-xs text-[#0a0a0a] outline-hidden cursor-pointer"
              >
                <option value="ALL">All Departments</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.name}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Employee Register Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#fafafa] border-b border-[#e5e5e5] font-mono text-[11px] text-[#737373] uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Employee</th>
                  <th className="py-3 px-3">Department</th>
                  <th className="py-3 px-3 text-right">Basic Pay</th>
                  <th className="py-3 px-3 text-right">Gross Pay</th>
                  <th className="py-3 px-3 text-right">NSSF</th>
                  <th className="py-3 px-3 text-right">SHIF</th>
                  <th className="py-3 px-3 text-right">Housing</th>
                  <th className="py-3 px-3 text-right">Net PAYE</th>
                  <th className="py-3 px-3 text-right">Voluntary</th>
                  <th className="py-3 px-3 text-right font-bold text-[#0a0a0a]">Net Pay</th>
                  <th className="py-3 px-3 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f0f0f0]">
                {filteredPayslips.map((p) => (
                  <tr
                    key={p.id}
                    className="hover:bg-[#fafafa] transition-colors cursor-pointer group"
                    onClick={() => handleOpenPayslip(p)}
                  >
                    <td className="py-3 px-4">
                      <div className="font-semibold text-[#0a0a0a]">{p.employeeName}</div>
                      <div className="text-[10px] font-mono text-[#737373]">
                        {p.employeeCode} · {p.kraPin}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-[#525252]">{p.department}</td>
                    <td className="py-3 px-3 text-right font-mono text-[#525252]">
                      {formatKes(p.earnings.basicSalary)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-medium text-[#0a0a0a]">
                      {formatKes(p.earnings.grossPay)}
                      {(p.earnings.bonus > 0 || p.earnings.overtimePay > 0) && (
                        <span className="block text-[9px] text-emerald-600">
                          +{(p.earnings.bonus + p.earnings.overtimePay).toLocaleString()} add'l
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-[#525252]">
                      {formatKes(p.statutory.nssfTotalEmployee)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-[#525252]">
                      {formatKes(p.statutory.shif)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-[#525252]">
                      {formatKes(p.statutory.housingLevyEmployee)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-[#525252]">
                      {formatKes(p.statutory.netPaye)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-[#737373]">
                      {p.voluntary.totalVoluntary > 0
                        ? formatKes(p.voluntary.totalVoluntary)
                        : '—'}
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-[#0a0a0a] bg-zinc-50/50">
                      {formatKes(p.netPay)}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                          p.status === 'paid'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : p.status === 'approved'
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td
                      className="py-3 px-4 text-right"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-end gap-1.5">
                        {isHrOrAdmin && p.status !== 'paid' && (
                          <button
                            onClick={() => handleOpenAdjust(p)}
                            className="p-1.5 rounded-[8px] hover:bg-[#ebebeb] text-[#737373] hover:text-[#0a0a0a]"
                            title="Adjust Overtime / Bonus"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => handleOpenPayslip(p)}
                          className="px-2.5 py-1 rounded-[14px] bg-[#f5f5f5] hover:bg-[#0a0a0a] hover:text-[#ffffff] text-[11px] font-medium transition-all flex items-center gap-1"
                        >
                          <Eye className="w-3 h-3" />
                          <span>Payslip</span>
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

      {/* SUBTAB 2: STATUTORY REMITTANCE LEDGER */}
      {activeSubTab === 'statutory' && currentCycle && (
        <div className="space-y-6">
          {/* Statutory Compliance Notice Banner */}
          <div className="bg-[#fafafa] p-4 rounded-[20px] border border-[#e5e5e5] flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div className="text-xs text-[#525252]">
              <span className="font-semibold text-[#0a0a0a]">
                Statutory Remittance Obligations (Kenya Revenue Authority & Social Funds):
              </span>{' '}
              According to the Kenyan Employment Act and tax laws, remittances for PAYE, NSSF, SHIF, and Affordable Housing Levy must be filed and remitted on or before the <strong>9th day</strong> of the month following the payroll period. Non-compliance incurs a statutory penalty of 5% plus 1% monthly interest.
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Box 1: KRA PAYE & Housing Levy Remittance */}
            <div className="bg-[#ffffff] rounded-[24px] border border-[#e5e5e5] p-6 card-shadow space-y-4">
              <div className="flex items-center justify-between border-b border-[#e5e5e5] pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-[8px] bg-red-100 text-red-700 flex items-center justify-center font-bold text-xs">
                    KRA
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#0a0a0a]">
                      KRA iTax Remittance Package
                    </h3>
                    <p className="text-[11px] text-[#737373]">Employer PIN: P051239842Z</p>
                  </div>
                </div>
                <button
                  onClick={handleExportKraCsv}
                  className="px-2.5 py-1 rounded-[14px] bg-[#f5f5f5] hover:bg-[#0a0a0a] hover:text-[#ffffff] text-[11px] font-medium transition-all flex items-center gap-1"
                >
                  <Download className="w-3 h-3" />
                  <span>Download Return CSV</span>
                </button>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between py-1 border-b border-[#f0f0f0]">
                  <span className="text-[#525252]">Total Taxable Pay</span>
                  <span className="font-mono font-medium">
                    {formatKesExact(
                      currentCycle.payslips.reduce((s, p) => s + p.statutory.taxablePay, 0)
                    )}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#f0f0f0]">
                  <span className="text-[#525252]">Gross Tax Charged</span>
                  <span className="font-mono">
                    {formatKesExact(
                      currentCycle.payslips.reduce((s, p) => s + p.statutory.grossTaxPaye, 0)
                    )}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#f0f0f0]">
                  <span className="text-[#525252]">Personal Relief Granted (KES 2,400/head)</span>
                  <span className="font-mono text-emerald-600">
                    -{formatKesExact(currentCycle.employeeCount * 2400)}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#f0f0f0]">
                  <span className="text-[#525252]">Insurance (SHIF) Relief (15%)</span>
                  <span className="font-mono text-emerald-600">
                    -{formatKesExact(
                      currentCycle.payslips.reduce((s, p) => s + p.statutory.insuranceRelief, 0)
                    )}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#f0f0f0]">
                  <span className="text-[#525252]">Affordable Housing Relief (15%)</span>
                  <span className="font-mono text-emerald-600">
                    -{formatKesExact(
                      currentCycle.payslips.reduce((s, p) => s + p.statutory.housingRelief, 0)
                    )}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-t-2 border-[#0a0a0a] font-bold text-sm bg-[#fafafa] px-3 rounded-[12px]">
                  <span>Net PAYE to KRA</span>
                  <span className="font-mono">{formatKesExact(currentCycle.totalPaye)}</span>
                </div>
              </div>

              {/* Housing Levy Sub-box */}
              <div className="pt-2 border-t border-[#e5e5e5] space-y-2 text-xs">
                <div className="font-semibold text-[#0a0a0a] flex items-center justify-between">
                  <span>Affordable Housing Levy (AHL) Return</span>
                  <span className="text-[10px] font-mono text-[#737373]">AHL-NRB-89210</span>
                </div>
                <div className="flex justify-between text-[#525252]">
                  <span>Employee Contribution (1.5%)</span>
                  <span className="font-mono">{formatKesExact(currentCycle.totalHousingLevyEmployee)}</span>
                </div>
                <div className="flex justify-between text-[#525252]">
                  <span>Employer Matched Contribution (1.5%)</span>
                  <span className="font-mono">{formatKesExact(currentCycle.totalHousingLevyEmployer)}</span>
                </div>
                <div className="flex justify-between font-semibold text-[#0a0a0a] pt-1 border-t border-[#f0f0f0]">
                  <span>Total Housing Levy to KRA / AHL Account</span>
                  <span className="font-mono">
                    {formatKesExact(
                      currentCycle.totalHousingLevyEmployee + currentCycle.totalHousingLevyEmployer
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* Box 2: Social Security & Health Funds (NSSF & SHIF) */}
            <div className="bg-[#ffffff] rounded-[24px] border border-[#e5e5e5] p-6 card-shadow space-y-4">
              <div className="flex items-center justify-between border-b border-[#e5e5e5] pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-[8px] bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                    SOC
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#0a0a0a]">
                      NSSF & SHIF Statutory Returns
                    </h3>
                    <p className="text-[11px] text-[#737373]">
                      National Social Security & Social Health Funds
                    </p>
                  </div>
                </div>
                <span className="text-[11px] font-mono text-[#737373]">Due: 9th Next Month</span>
              </div>

              {/* NSSF Section */}
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between font-semibold text-[#0a0a0a]">
                  <span>National Social Security Fund (Act 2013)</span>
                  <span className="text-[10px] font-mono text-[#737373]">Employer No: 2049102-K</span>
                </div>
                <div className="flex justify-between text-[#525252]">
                  <span>Tier I Contributions (up to KES 7,000)</span>
                  <span className="font-mono">
                    {formatKesExact(
                      currentCycle.payslips.reduce((s, p) => s + p.statutory.nssfTier1 * 2, 0)
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-[#525252]">
                  <span>Tier II Contributions (KES 7,001 - 36,000)</span>
                  <span className="font-mono">
                    {formatKesExact(
                      currentCycle.payslips.reduce((s, p) => s + p.statutory.nssfTier2 * 2, 0)
                    )}
                  </span>
                </div>
                <div className="flex justify-between font-bold text-sm bg-[#fafafa] p-2 rounded-[10px]">
                  <span>Total NSSF Remittance (Staff + Org)</span>
                  <span className="font-mono">
                    {formatKesExact(currentCycle.totalNssfEmployee + currentCycle.totalNssfEmployer)}
                  </span>
                </div>
              </div>

              {/* SHIF Section */}
              <div className="pt-4 border-t border-[#e5e5e5] space-y-2 text-xs">
                <div className="flex items-center justify-between font-semibold text-[#0a0a0a]">
                  <span>Social Health Insurance Fund (SHIF)</span>
                  <span className="text-[10px] font-mono text-[#737373]">Employer No: 1049281-S</span>
                </div>
                <div className="text-[11px] text-[#737373]">
                  Gazetted 2.75% mandatory statutory contribution on gross salary (replaces former NHIF bands).
                </div>
                <div className="flex justify-between text-[#525252]">
                  <span>Total Eligible Gross Earnings</span>
                  <span className="font-mono">{formatKesExact(currentCycle.totalGross)}</span>
                </div>
                <div className="flex justify-between font-bold text-sm bg-[#fafafa] p-2 rounded-[10px]">
                  <span>Total SHIF Remittance to SHA</span>
                  <span className="font-mono">{formatKesExact(currentCycle.totalShif)}</span>
                </div>
              </div>

              {/* Combined Remittance Summary */}
              <div className="p-3 bg-[#0a0a0a] text-[#ffffff] rounded-[16px] flex items-center justify-between mt-4">
                <div className="text-xs">
                  <div className="text-[#a3a3a3] text-[10px] uppercase font-mono tracking-wider">
                    Total Statutory Exposure
                  </div>
                  <div className="font-bold text-sm">
                    KRA + NSSF + SHA Combined
                  </div>
                </div>
                <div className="font-mono font-bold text-base text-emerald-400">
                  {formatKesExact(currentCycle.totalStatutoryRemittance)}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 3: BANK EFT & M-PESA SCHEDULE */}
      {activeSubTab === 'bank_mpesa' && currentCycle && (
        <div className="bg-[#ffffff] rounded-[24px] border border-[#e5e5e5] p-6 card-shadow space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#e5e5e5] pb-4">
            <div>
              <h3 className="text-base font-bold text-[#0a0a0a]">
                Bank EFT & M-Pesa Disbursement Schedule
              </h3>
              <p className="text-xs text-[#737373] mt-0.5">
                Automated payment schedule for KEPSS, EFT, Pesalink, and Safaricom M-Pesa B2C
              </p>
            </div>
            <button
              onClick={handleExportBankBatchCsv}
              className="px-3 py-1.5 rounded-[18px] bg-[#0a0a0a] text-[#ffffff] hover:bg-[#262626] text-xs font-medium transition-all flex items-center gap-1.5 shrink-0"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Payment Batch CSV</span>
            </button>
          </div>

          {/* Grouped by Bank / Channel Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {['KCB Bank Kenya', 'Equity Bank Kenya', 'Standard Chartered', 'Co-operative Bank'].map(
              (bank) => {
                const count = currentCycle.payslips.filter((p) => p.bankName === bank).length;
                const total = currentCycle.payslips
                  .filter((p) => p.bankName === bank)
                  .reduce((s, p) => s + p.netPay, 0);

                return (
                  <div
                    key={bank}
                    className="p-3 bg-[#fafafa] rounded-[16px] border border-[#e5e5e5] text-xs"
                  >
                    <div className="text-[11px] font-semibold text-[#0a0a0a] truncate">{bank}</div>
                    <div className="text-sm font-mono font-bold text-[#0a0a0a] mt-1">
                      {formatKes(total)}
                    </div>
                    <div className="text-[10px] text-[#737373] mt-0.5">{count} Employees</div>
                  </div>
                );
              }
            )}
          </div>

          {/* Detailed Account List */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#fafafa] border-b border-[#e5e5e5] font-mono text-[11px] text-[#737373] uppercase tracking-wider">
                <tr>
                  <th className="py-2.5 px-3">Employee</th>
                  <th className="py-2.5 px-3">Bank / Channel</th>
                  <th className="py-2.5 px-3">Account Number</th>
                  <th className="py-2.5 px-3">M-Pesa Alternate</th>
                  <th className="py-2.5 px-3 text-right">Net Payable Amount</th>
                  <th className="py-2.5 px-3 text-center">Transfer Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f0f0f0]">
                {currentCycle.payslips.map((p) => (
                  <tr key={p.id} className="hover:bg-[#fafafa]">
                    <td className="py-2.5 px-3 font-medium text-[#0a0a0a]">
                      {p.employeeName}
                      <span className="block text-[10px] font-mono text-[#737373]">
                        {p.employeeCode}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-[#525252]">{p.bankName}</td>
                    <td className="py-2.5 px-3 font-mono text-[#0a0a0a]">{p.bankAccount}</td>
                    <td className="py-2.5 px-3 font-mono text-emerald-700">
                      {p.mpesaNumber || '—'}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-[#0a0a0a]">
                      {formatKes(p.netPay)}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                          p.status === 'paid'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {p.status === 'paid' ? 'Transferred' : 'Pending Batch'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUBTAB 4: MY PAYSLIPS (EMPLOYEE SELF-SERVICE VIEW) */}
      {activeSubTab === 'my_payslips' && (
        <div className="space-y-6">
          <div className="bg-[#ffffff] rounded-[24px] border border-[#e5e5e5] p-6 card-shadow">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#e5e5e5] pb-4">
              <div>
                <h3 className="text-base font-bold text-[#0a0a0a]">
                  My Remuneration & Digital Payslips
                </h3>
                <p className="text-xs text-[#737373] mt-0.5">
                  Logged in as <span className="font-semibold text-[#0a0a0a]">{activePersona.name}</span> ({activePersona.roleLabel})
                </p>
              </div>

              {myPayslip && (
                <button
                  onClick={() => handleOpenPayslip(myPayslip)}
                  className="px-4 py-2 rounded-[18px] bg-[#0a0a0a] text-[#ffffff] hover:bg-[#262626] text-xs font-medium transition-all flex items-center gap-1.5"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>View Official {currentCycle?.cycleMonth} Payslip</span>
                </button>
              )}
            </div>

            {myPayslip ? (
              <div className="mt-6 space-y-6">
                {/* Take-home card */}
                <div className="bg-[#fafafa] p-6 rounded-[20px] border border-[#e5e5e5] flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="text-xs font-mono uppercase tracking-wider text-[#737373]">
                      September 2026 Net Salary
                    </div>
                    <div className="text-3xl font-extrabold text-[#0a0a0a] mt-1 font-mono tracking-tight">
                      {formatKes(myPayslip.netPay)}
                    </div>
                    <div className="text-xs text-[#737373] mt-1">
                      {myPayslip.netPayInWords}
                    </div>
                  </div>

                  <div className="text-xs font-mono text-[#525252] border-t md:border-t-0 md:border-l border-[#e5e5e5] pt-3 md:pt-0 md:pl-6 space-y-1">
                    <div>Gross Earnings: <span className="font-semibold text-[#0a0a0a]">{formatKes(myPayslip.earnings.grossPay)}</span></div>
                    <div>Statutory Deductions: <span className="font-semibold text-[#0a0a0a]">{formatKes(myPayslip.totalDeductions)}</span></div>
                    <div>Deposit Bank: <span className="font-semibold text-[#0a0a0a]">{myPayslip.bankName} ({myPayslip.bankAccount})</span></div>
                  </div>
                </div>

                {/* Quick Breakdown Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 bg-[#ffffff] rounded-[16px] border border-[#e5e5e5]">
                    <span className="text-[10px] font-mono uppercase text-[#737373]">Basic Pay</span>
                    <div className="font-mono font-bold text-sm text-[#0a0a0a] mt-0.5">
                      {formatKes(myPayslip.earnings.basicSalary)}
                    </div>
                  </div>

                  <div className="p-3 bg-[#ffffff] rounded-[16px] border border-[#e5e5e5]">
                    <span className="text-[10px] font-mono uppercase text-[#737373]">KRA PAYE Tax</span>
                    <div className="font-mono font-bold text-sm text-[#0a0a0a] mt-0.5">
                      {formatKes(myPayslip.statutory.netPaye)}
                    </div>
                  </div>

                  <div className="p-3 bg-[#ffffff] rounded-[16px] border border-[#e5e5e5]">
                    <span className="text-[10px] font-mono uppercase text-[#737373]">NSSF + SHIF</span>
                    <div className="font-mono font-bold text-sm text-[#0a0a0a] mt-0.5">
                      {formatKes(myPayslip.statutory.nssfTotalEmployee + myPayslip.statutory.shif)}
                    </div>
                  </div>

                  <div className="p-3 bg-[#ffffff] rounded-[16px] border border-[#e5e5e5]">
                    <span className="text-[10px] font-mono uppercase text-[#737373]">Housing Levy</span>
                    <div className="font-mono font-bold text-sm text-[#0a0a0a] mt-0.5">
                      {formatKes(myPayslip.statutory.housingLevyEmployee)}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-[#737373]">
                No payslip generated for your active profile in this cycle.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Payslip Modal */}
      <DigitalPayslipModal
        payslip={selectedPayslip}
        isOpen={isPayslipModalOpen}
        onClose={() => setIsPayslipModalOpen(false)}
        onOpenAdjust={(p) => {
          setIsPayslipModalOpen(false);
          handleOpenAdjust(p);
        }}
      />

      {/* Adjustment Modal */}
      <PayslipAdjustModal
        payslip={adjustingPayslip}
        isOpen={isAdjustModalOpen}
        onClose={() => {
          setIsAdjustModalOpen(false);
          setAdjustingPayslip(null);
        }}
      />
    </div>
  );
};
