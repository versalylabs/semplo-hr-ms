/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  X,
  Printer,
  Download,
  CheckCircle2,
  Clock,
  Building,
  ShieldCheck,
  CreditCard,
  Phone,
  Edit3,
} from 'lucide-react';
import { useHR } from '../../context/HRContext';
import { Payslip } from '../../types/hr';

interface DigitalPayslipModalProps {
  payslip: Payslip | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenAdjust?: (payslip: Payslip) => void;
}

export const DigitalPayslipModal: React.FC<DigitalPayslipModalProps> = ({
  payslip,
  isOpen,
  onClose,
  onOpenAdjust,
}) => {
  const { canPerformAction } = useHR();
  const [isCopied, setIsCopied] = useState(false);

  if (!isOpen || !payslip) return null;

  const handlePrint = () => {
    window.print();
  };

  const formatKes = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const handleCopySummary = () => {
    const summary = `PAYSLIP SUMMARY - ${payslip.employeeName} (${payslip.employeeCode})
Period: ${payslip.payPeriod}
Gross Pay: ${formatKes(payslip.earnings.grossPay)}
Total Deductions: ${formatKes(payslip.totalDeductions)}
Net Pay: ${formatKes(payslip.netPay)}
KRA PIN: ${payslip.kraPin}
NSSF: ${payslip.nssfNumber} | SHIF: ${payslip.shifNumber}
Bank: ${payslip.bankName} (${payslip.bankAccount})`;

    navigator.clipboard.writeText(summary);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const isHrOrAdmin = canPerformAction('hr_manager');

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 print:p-0 print:bg-white print:static">
      <div className="bg-[#ffffff] w-full max-w-4xl rounded-[24px] border border-[#e5e5e5] shadow-2xl overflow-hidden flex flex-col my-auto print:border-none print:shadow-none print:rounded-none">
        {/* Top Control Bar (Hidden when printing) */}
        <div className="px-6 py-4 border-b border-[#e5e5e5] bg-[#fafafa] flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono uppercase tracking-wider text-[#737373]">
              Official Digital Payslip
            </span>
            <span
              className={`text-[11px] font-mono px-2.5 py-0.5 rounded-full border ${
                payslip.status === 'paid'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : payslip.status === 'approved'
                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                  : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}
            >
              {payslip.status === 'paid'
                ? 'Disbursed / Paid'
                : payslip.status === 'approved'
                ? 'Approved for Payout'
                : 'Draft Calculation'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {isHrOrAdmin && onOpenAdjust && payslip.status !== 'paid' && (
              <button
                onClick={() => onOpenAdjust(payslip)}
                className="px-3 py-1.5 rounded-[18px] bg-[#ffffff] border border-[#e5e5e5] hover:border-[#0a0a0a] text-[12px] font-medium text-[#0a0a0a] transition-all flex items-center gap-1.5"
                title="Adjust bonus or overtime for this employee"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Adjust Earnings</span>
              </button>
            )}

            <button
              onClick={handleCopySummary}
              className="px-3 py-1.5 rounded-[18px] bg-[#ffffff] border border-[#e5e5e5] hover:border-[#0a0a0a] text-[12px] font-medium text-[#0a0a0a] transition-all flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isCopied ? 'Copied' : 'Copy Summary'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-[18px] bg-[#0a0a0a] text-[#ffffff] hover:bg-[#262626] text-[12px] font-medium transition-all flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-[#737373] hover:text-[#0a0a0a] hover:bg-[#ebebeb] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Payslip Body */}
        <div className="p-6 sm:p-10 space-y-8 text-[#0a0a0a] bg-[#ffffff] print:p-6" id="printable-payslip">
          {/* Header & Corporate Information */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 border-b border-[#e5e5e5] pb-6">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-[8px] bg-[#0a0a0a] text-[#ffffff] flex items-center justify-center font-bold text-sm tracking-tight">
                  SP
                </div>
                <div>
                  <h1 className="text-xl font-bold tracking-tight text-[#0a0a0a]">
                    Semplo Kenya Ltd.
                  </h1>
                  <p className="text-xs text-[#737373]">
                    Technology & People Operations · Nairobi HQ
                  </p>
                </div>
              </div>
              <div className="text-[11px] font-mono text-[#525252] pt-1 space-y-0.5">
                <div>PIN: <span className="font-semibold text-[#0a0a0a]">P051239842Z</span> · NSSF Employer: <span className="font-semibold text-[#0a0a0a]">2049102-K</span></div>
                <div>SHIF Employer: <span className="font-semibold text-[#0a0a0a]">1049281-S</span> · Housing Levy Code: <span className="font-semibold text-[#0a0a0a]">AHL-NRB-89210</span></div>
                <div>Delta Corner Annex, Westlands, P.O. Box 48291-00100, Nairobi, Kenya</div>
              </div>
            </div>

            <div className="sm:text-right bg-[#fafafa] p-4 rounded-[16px] border border-[#e5e5e5] shrink-0 sm:min-w-[220px]">
              <div className="text-[11px] font-mono uppercase tracking-wider text-[#737373]">
                Pay Period
              </div>
              <div className="text-base font-bold text-[#0a0a0a] tracking-tight mt-0.5">
                {payslip.payPeriod}
              </div>
              <div className="text-xs text-[#737373] mt-1">
                Disbursement: <span className="font-medium text-[#0a0a0a]">{payslip.payDate}</span>
              </div>
              <div className="text-[11px] font-mono text-[#737373] mt-1">
                Slip Ref: #{payslip.id.slice(-8).toUpperCase()}
              </div>
            </div>
          </div>

          {/* Employee Demographic & Statutory IDs Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-[#fafafa] p-4 rounded-[16px] border border-[#e5e5e5] text-xs">
            <div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-[#737373]">
                Employee Name
              </div>
              <div className="font-semibold text-[#0a0a0a] mt-0.5 text-[13px]">
                {payslip.employeeName}
              </div>
              <div className="text-[11px] font-mono text-[#737373]">
                {payslip.employeeCode}
              </div>
            </div>

            <div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-[#737373]">
                Job Title & Dept
              </div>
              <div className="font-medium text-[#0a0a0a] mt-0.5 text-[12px]">
                {payslip.jobTitle}
              </div>
              <div className="text-[11px] text-[#737373]">
                {payslip.department}
              </div>
            </div>

            <div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-[#737373]">
                Kenyan Statutory IDs
              </div>
              <div className="font-mono text-[11px] text-[#0a0a0a] mt-0.5">
                KRA: <span className="font-semibold">{payslip.kraPin}</span>
              </div>
              <div className="font-mono text-[11px] text-[#737373]">
                NSSF: {payslip.nssfNumber}
              </div>
              <div className="font-mono text-[11px] text-[#737373]">
                SHIF: {payslip.shifNumber}
              </div>
            </div>

            <div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-[#737373]">
                Payment Destination
              </div>
              <div className="font-medium text-[#0a0a0a] mt-0.5 text-[12px] flex items-center gap-1">
                <CreditCard className="w-3 h-3 text-[#737373]" />
                <span>{payslip.bankName}</span>
              </div>
              <div className="font-mono text-[11px] text-[#737373]">
                A/C: {payslip.bankAccount}
              </div>
              {payslip.mpesaNumber && (
                <div className="font-mono text-[11px] text-emerald-700 flex items-center gap-1 mt-0.5">
                  <Phone className="w-2.5 h-2.5" />
                  <span>M-Pesa: {payslip.mpesaNumber}</span>
                </div>
              )}
            </div>
          </div>

          {/* Core Remuneration Ledger (Earnings vs Deductions) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-b border-[#e5e5e5] pb-8">
            {/* Left: Earnings */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-[#0a0a0a] pb-2">
                <h3 className="text-xs font-mono uppercase tracking-wider font-bold text-[#0a0a0a]">
                  Earnings & Allowances
                </h3>
                <span className="text-[11px] font-mono text-[#737373]">KES Amount</span>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between items-center py-1 border-b border-[#f0f0f0]">
                  <span className="text-[#171717]">Basic Contract Salary</span>
                  <span className="font-mono font-medium">{formatKes(payslip.earnings.basicSalary)}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-[#f0f0f0]">
                  <span className="text-[#525252]">House Allowance (15%)</span>
                  <span className="font-mono">{formatKes(payslip.earnings.houseAllowance)}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-[#f0f0f0]">
                  <span className="text-[#525252]">Transport / Commuter Allowance</span>
                  <span className="font-mono">{formatKes(payslip.earnings.transportAllowance)}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-[#f0f0f0]">
                  <span className="text-[#525252]">Utility / Airtime / Hardship</span>
                  <span className="font-mono">{formatKes(payslip.earnings.otherAllowances)}</span>
                </div>
                {payslip.earnings.overtimePay > 0 && (
                  <div className="flex justify-between items-center py-1 border-b border-[#f0f0f0] text-emerald-700">
                    <span>Overtime Remuneration</span>
                    <span className="font-mono font-medium">+{formatKes(payslip.earnings.overtimePay)}</span>
                  </div>
                )}
                {payslip.earnings.bonus > 0 && (
                  <div className="flex justify-between items-center py-1 border-b border-[#f0f0f0] text-emerald-700">
                    <span>Performance Incentive / Bonus</span>
                    <span className="font-mono font-medium">+{formatKes(payslip.earnings.bonus)}</span>
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center pt-3 border-t-2 border-[#0a0a0a] text-sm font-bold bg-[#fafafa] p-3 rounded-[12px]">
                <span>Total Gross Earnings</span>
                <span className="font-mono text-base">{formatKes(payslip.earnings.grossPay)}</span>
              </div>
            </div>

            {/* Right: Deductions (Statutory & Voluntary) */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-[#0a0a0a] pb-2">
                <h3 className="text-xs font-mono uppercase tracking-wider font-bold text-[#0a0a0a]">
                  Statutory & Other Deductions
                </h3>
                <span className="text-[11px] font-mono text-[#737373]">KES Amount</span>
              </div>

              <div className="space-y-2.5 text-xs">
                {/* NSSF */}
                <div className="flex justify-between items-center py-1 border-b border-[#f0f0f0]">
                  <div>
                    <span className="text-[#171717]">NSSF Tier I & II (Act 2013)</span>
                    <span className="block text-[10px] text-[#737373] font-mono">
                      T1: {formatKes(payslip.statutory.nssfTier1)} · T2: {formatKes(payslip.statutory.nssfTier2)}
                    </span>
                  </div>
                  <span className="font-mono font-medium text-[#171717]">
                    {formatKes(payslip.statutory.nssfTotalEmployee)}
                  </span>
                </div>

                {/* SHIF */}
                <div className="flex justify-between items-center py-1 border-b border-[#f0f0f0]">
                  <div>
                    <span className="text-[#171717]">SHIF (Social Health Insurance)</span>
                    <span className="block text-[10px] text-[#737373]">Gazetted 2.75% of Gross Pay</span>
                  </div>
                  <span className="font-mono font-medium text-[#171717]">
                    {formatKes(payslip.statutory.shif)}
                  </span>
                </div>

                {/* Affordable Housing Levy */}
                <div className="flex justify-between items-center py-1 border-b border-[#f0f0f0]">
                  <div>
                    <span className="text-[#171717]">Affordable Housing Levy (AHL)</span>
                    <span className="block text-[10px] text-[#737373]">1.50% Employee Contribution</span>
                  </div>
                  <span className="font-mono font-medium text-[#171717]">
                    {formatKes(payslip.statutory.housingLevyEmployee)}
                  </span>
                </div>

                {/* PAYE */}
                <div className="flex justify-between items-center py-1 border-b border-[#f0f0f0]">
                  <div>
                    <span className="text-[#171717]">PAYE Income Tax (KRA Net)</span>
                    <span className="block text-[10px] text-[#737373] font-mono">
                      Taxable: {formatKes(payslip.statutory.taxablePay)} · Relief: -{formatKes(payslip.statutory.totalTaxRelief)}
                    </span>
                  </div>
                  <span className="font-mono font-medium text-[#171717]">
                    {formatKes(payslip.statutory.netPaye)}
                  </span>
                </div>

                {/* Voluntary Deductions */}
                {payslip.voluntary.saccoContribution > 0 && (
                  <div className="flex justify-between items-center py-1 border-b border-[#f0f0f0]">
                    <span className="text-[#525252]">SACCO Shares & Deposits</span>
                    <span className="font-mono">{formatKes(payslip.voluntary.saccoContribution)}</span>
                  </div>
                )}
                {payslip.voluntary.saccoLoanRepayment > 0 && (
                  <div className="flex justify-between items-center py-1 border-b border-[#f0f0f0]">
                    <span className="text-[#525252]">SACCO Loan Repayment</span>
                    <span className="font-mono">{formatKes(payslip.voluntary.saccoLoanRepayment)}</span>
                  </div>
                )}
                {payslip.voluntary.helbLoan > 0 && (
                  <div className="flex justify-between items-center py-1 border-b border-[#f0f0f0]">
                    <span className="text-[#525252]">HELB Loan Recovery</span>
                    <span className="font-mono">{formatKes(payslip.voluntary.helbLoan)}</span>
                  </div>
                )}
                {payslip.voluntary.pensionVoluntary > 0 && (
                  <div className="flex justify-between items-center py-1 border-b border-[#f0f0f0]">
                    <span className="text-[#525252]">Voluntary Pension Scheme</span>
                    <span className="font-mono">{formatKes(payslip.voluntary.pensionVoluntary)}</span>
                  </div>
                )}
                {payslip.voluntary.welfareContribution > 0 && (
                  <div className="flex justify-between items-center py-1 border-b border-[#f0f0f0]">
                    <span className="text-[#525252]">Staff Welfare Association</span>
                    <span className="font-mono">{formatKes(payslip.voluntary.welfareContribution)}</span>
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center pt-3 border-t-2 border-[#0a0a0a] text-sm font-bold bg-[#fafafa] p-3 rounded-[12px]">
                <span>Total Deductions</span>
                <span className="font-mono text-base">{formatKes(payslip.totalDeductions)}</span>
              </div>
            </div>
          </div>

          {/* Net Take-Home Pay Banner */}
          <div className="bg-gradient-to-r from-[#062e24] via-[#091b15] to-[#0a0a0a] border border-emerald-800/40 text-[#ffffff] p-6 rounded-[20px] flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-md">
            <div>
              <div className="text-xs font-mono uppercase tracking-widest text-emerald-400 font-bold">
                Net Salary Payable
              </div>
              <div className="text-3xl font-extrabold tracking-tight mt-1 font-mono text-white flex items-center gap-2">
                <span>{formatKes(payslip.netPay)}</span>
              </div>
              <div className="text-xs text-emerald-100/80 italic mt-1 max-w-xl">
                {payslip.netPayInWords}
              </div>
            </div>

            <div className="text-left md:text-right text-xs text-emerald-200/70 font-mono border-t md:border-t-0 md:border-l border-emerald-800/40 pt-3 md:pt-0 md:pl-6 space-y-1">
              <div>Bank Transfer / EFT / M-Pesa</div>
              <div>Authorized By: <span className="text-[#ffffff] font-semibold">HR Operations</span></div>
              <div className="text-[11px] text-emerald-400 flex items-center md:justify-end gap-1 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>KRA iTax & Statutory Compliant</span>
              </div>
            </div>
          </div>

          {/* Employer Statutory Contributions Notice (For complete audit compliance) */}
          <div className="p-4 bg-[#fafafa] rounded-[16px] border border-[#e5e5e5] text-xs text-[#737373]">
            <div className="font-semibold text-[#0a0a0a] uppercase tracking-wider text-[11px] mb-2 font-mono flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
              <span>Employer Matching Statutory Contributions (Non-deductible from Net Pay)</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-[11px]">
              <div>
                Employer NSSF Match: <span className="font-semibold text-[#0a0a0a]">{formatKes(payslip.employerCosts.employerNssf)}</span>
              </div>
              <div>
                Employer Housing Match: <span className="font-semibold text-[#0a0a0a]">{formatKes(payslip.employerCosts.employerHousingLevy)}</span>
              </div>
              <div>
                Total Cost to Company (CTC): <span className="font-semibold text-[#0a0a0a]">{formatKes(payslip.employerCosts.totalEmployerCost)}</span>
              </div>
            </div>
          </div>

          {/* Footer Footnote */}
          <div className="text-[11px] text-[#737373] text-center pt-4 border-t border-[#f0f0f0] font-mono">
            This is an authentic, system-generated electronic payslip issued in compliance with the Employment Act (Kenya), KRA Income Tax Act Cap 470, NSSF Act 2013, and Affordable Housing Act 2024.
          </div>
        </div>
      </div>
    </div>
  );
};
