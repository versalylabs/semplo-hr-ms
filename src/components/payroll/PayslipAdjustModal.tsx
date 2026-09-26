/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Check, Calculator } from 'lucide-react';
import { Payslip } from '../../types/hr';
import { useHR } from '../../context/HRContext';

interface PayslipAdjustModalProps {
  payslip: Payslip | null;
  isOpen: boolean;
  onClose: () => void;
}

export const PayslipAdjustModal: React.FC<PayslipAdjustModalProps> = ({
  payslip,
  isOpen,
  onClose,
}) => {
  const { updatePayslipEarnings } = useHR();

  const [bonus, setBonus] = useState<number>(payslip?.earnings.bonus || 0);
  const [overtimePay, setOvertimePay] = useState<number>(payslip?.earnings.overtimePay || 0);

  // Sync state if payslip changes
  React.useEffect(() => {
    if (payslip) {
      setBonus(payslip.earnings.bonus || 0);
      setOvertimePay(payslip.earnings.overtimePay || 0);
    }
  }, [payslip]);

  if (!isOpen || !payslip) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updatePayslipEarnings(payslip.id, Number(bonus) || 0, Number(overtimePay) || 0);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#ffffff] rounded-[24px] border border-[#e5e5e5] w-full max-w-md p-6 shadow-xl animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between border-b border-[#e5e5e5] pb-4">
          <div className="flex items-center gap-2">
            <Calculator className="w-4 h-4 text-[#0a0a0a]" />
            <h3 className="text-base font-semibold text-[#0a0a0a]">
              Adjust Remuneration
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-[#737373] hover:text-[#0a0a0a] hover:bg-[#ebebeb] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSave} className="mt-4 space-y-4">
          <div>
            <div className="text-xs text-[#737373]">Employee</div>
            <div className="text-sm font-semibold text-[#0a0a0a] mt-0.5">
              {payslip.employeeName} ({payslip.employeeCode})
            </div>
            <div className="text-xs text-[#737373] mt-0.5">
              Base Salary: KES {payslip.earnings.basicSalary.toLocaleString()}
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-[#737373] mb-1">
              Performance Bonus (KES)
            </label>
            <input
              type="number"
              min="0"
              step="500"
              value={bonus}
              onChange={(e) => setBonus(Number(e.target.value))}
              className="w-full px-3 py-2 bg-[#f5f5f5] rounded-[14px] text-sm text-[#0a0a0a] border border-transparent focus:border-[#0a0a0a] focus:bg-[#ffffff] transition-all outline-hidden font-mono"
              placeholder="e.g. 15000"
            />
            <span className="text-[11px] text-[#737373] mt-1 block">
              Direct taxable addition to September 2026 gross earnings.
            </span>
          </div>

          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-[#737373] mb-1">
              Overtime Pay (KES)
            </label>
            <input
              type="number"
              min="0"
              step="200"
              value={overtimePay}
              onChange={(e) => setOvertimePay(Number(e.target.value))}
              className="w-full px-3 py-2 bg-[#f5f5f5] rounded-[14px] text-sm text-[#0a0a0a] border border-transparent focus:border-[#0a0a0a] focus:bg-[#ffffff] transition-all outline-hidden font-mono"
              placeholder="e.g. 8500"
            />
            <span className="text-[11px] text-[#737373] mt-1 block">
              Calculated based on verified attendance clock logs & weekend work.
            </span>
          </div>

          <div className="bg-[#fafafa] p-3 rounded-[14px] border border-[#e5e5e5] text-xs text-[#525252]">
            Statutory deductions (NSSF, SHIF, Housing Levy, and PAYE) will automatically recalculate upon saving.
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-[18px] bg-[#f5f5f5] hover:bg-[#ebebeb] text-[#0a0a0a] text-xs font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-[18px] bg-[#0a0a0a] hover:bg-[#262626] text-[#ffffff] text-xs font-medium transition-colors flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Apply & Recalculate</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
