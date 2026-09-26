/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  X,
  Receipt,
  FileText,
  UserCheck,
  CreditCard,
  Laptop,
  CheckCircle2,
  AlertCircle,
  UploadCloud,
  ArrowRight,
} from 'lucide-react';
import { useHR } from '../../context/HRContext';
import {
  ExpenseCategory,
  LetterType,
  ProfileUpdateType,
  AssetRequestType,
  SalaryAdvanceRequest,
} from '../../types/hr';

interface NewDigitalRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultType?: 'expense' | 'letter' | 'salary_advance' | 'asset' | 'profile_update';
}

export const NewDigitalRequestModal: React.FC<NewDigitalRequestModalProps> = ({
  isOpen,
  onClose,
  defaultType = 'expense',
}) => {
  const {
    activePersona,
    employees,
    submitExpenseClaim,
    submitDocumentLetter,
    submitSalaryAdvance,
    submitAssetRequest,
    submitProfileUpdate,
  } = useHR();

  const [activeType, setActiveType] = useState<
    'expense' | 'letter' | 'salary_advance' | 'asset' | 'profile_update'
  >(defaultType);

  const currentUser = employees.find((e) => e.id === activePersona.employeeId) || employees[0];
  const maxAdvanceAllowed = Math.round(currentUser.baseSalary * 0.5);

  // Form states
  // 1. Expense
  const [expenseForm, setExpenseForm] = useState({
    category: 'internet_airtime' as ExpenseCategory,
    title: '',
    expenseDate: new Date().toISOString().slice(0, 10),
    amountKES: 5000,
    merchantName: '',
    receiptFileName: 'receipt_invoice.pdf',
    receiptFileSize: '240 KB',
    justification: '',
  });

  // 2. Letter
  const [letterForm, setLetterForm] = useState({
    letterType: 'employment_verification' as LetterType,
    addressedTo: 'To Whom It May Concern',
    purpose: '',
    includeCompensationDetails: true,
    urgency: 'standard' as 'standard' | 'urgent',
  });

  // 3. Salary Advance
  const [advanceForm, setAdvanceForm] = useState({
    amountKES: 40000,
    reason: 'School Fees / Tuition' as SalaryAdvanceRequest['reason'],
    reasonDetails: '',
    deductionTenureMonths: 2 as 1 | 2 | 3,
    disbursementMethod: 'mpesa' as 'mpesa' | 'bank_transfer',
    disbursementAccount: currentUser.bankInfo.mpesaNumber || '+254 700 000 000',
  });

  // 4. Asset
  const [assetForm, setAssetForm] = useState({
    assetType: 'external_monitor' as AssetRequestType,
    itemName: 'Dell UltraSharp 27" 4K Monitor',
    reason: '',
    urgency: 'medium' as 'low' | 'medium' | 'high',
  });

  // 5. Profile Update
  const [profileForm, setProfileForm] = useState({
    updateType: 'emergency_contact' as ProfileUpdateType,
    contactName: currentUser.emergencyContact?.name || '',
    contactRelation: currentUser.emergencyContact?.relation || '',
    contactPhone: currentUser.emergencyContact?.phone || '',
    bankName: currentUser.bankInfo?.bankName || '',
    accountNumber: currentUser.bankInfo?.accountLast4 || '',
    mpesaNumber: currentUser.bankInfo?.mpesaNumber || '',
    residentialAddress: currentUser.location || '',
    reason: '',
  });

  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (activeType === 'expense') {
      submitExpenseClaim({
        employeeId: currentUser.id,
        employeeName: `${currentUser.firstName} ${currentUser.lastName}`,
        department: currentUser.department,
        category: expenseForm.category,
        title: expenseForm.title || `${expenseForm.category.replace('_', ' ').toUpperCase()} Claim`,
        expenseDate: expenseForm.expenseDate,
        amountKES: Number(expenseForm.amountKES),
        merchantName: expenseForm.merchantName || 'Authorized Vendor',
        receiptFileName: expenseForm.receiptFileName,
        receiptFileSize: expenseForm.receiptFileSize,
        justification: expenseForm.justification || 'Official business operational expense.',
      });
    } else if (activeType === 'letter') {
      submitDocumentLetter({
        employeeId: currentUser.id,
        employeeName: `${currentUser.firstName} ${currentUser.lastName}`,
        department: currentUser.department,
        letterType: letterForm.letterType,
        addressedTo: letterForm.addressedTo,
        purpose: letterForm.purpose || 'Official verification required for personal/travel affairs.',
        includeCompensationDetails: letterForm.includeCompensationDetails,
        urgency: letterForm.urgency,
      });
    } else if (activeType === 'salary_advance') {
      const tenure = advanceForm.deductionTenureMonths;
      const monthlyAmt = Math.round(Number(advanceForm.amountKES) / tenure);
      submitSalaryAdvance({
        employeeId: currentUser.id,
        employeeName: `${currentUser.firstName} ${currentUser.lastName}`,
        department: currentUser.department,
        amountKES: Number(advanceForm.amountKES),
        reason: advanceForm.reason,
        reasonDetails: advanceForm.reasonDetails || 'Emergency short-term advance facility.',
        deductionTenureMonths: tenure,
        monthlyDeductionAmount: monthlyAmt,
        disbursementMethod: advanceForm.disbursementMethod,
        disbursementAccount: advanceForm.disbursementAccount,
        maxAllowedAmount: maxAdvanceAllowed,
      });
    } else if (activeType === 'asset') {
      submitAssetRequest({
        employeeId: currentUser.id,
        employeeName: `${currentUser.firstName} ${currentUser.lastName}`,
        department: currentUser.department,
        assetType: assetForm.assetType,
        itemName: assetForm.itemName,
        reason: assetForm.reason || 'Required for role performance and productivity.',
        urgency: assetForm.urgency,
      });
    } else if (activeType === 'profile_update') {
      let proposed: Record<string, string> = {};
      let current: Record<string, string> = {};

      if (profileForm.updateType === 'emergency_contact') {
        current = {
          name: currentUser.emergencyContact.name,
          relation: currentUser.emergencyContact.relation,
          phone: currentUser.emergencyContact.phone,
        };
        proposed = {
          name: profileForm.contactName,
          relation: profileForm.contactRelation,
          phone: profileForm.contactPhone,
        };
      } else if (profileForm.updateType === 'bank_details') {
        current = {
          bankName: currentUser.bankInfo.bankName,
          accountLast4: currentUser.bankInfo.accountLast4,
          mpesaNumber: currentUser.bankInfo.mpesaNumber || '',
        };
        proposed = {
          bankName: profileForm.bankName,
          accountLast4: profileForm.accountNumber,
          mpesaNumber: profileForm.mpesaNumber,
        };
      } else {
        current = { residentialAddress: currentUser.location };
        proposed = { residentialAddress: profileForm.residentialAddress };
      }

      submitProfileUpdate({
        employeeId: currentUser.id,
        employeeName: `${currentUser.firstName} ${currentUser.lastName}`,
        department: currentUser.department,
        updateType: profileForm.updateType,
        proposedChanges: proposed,
        currentValues: current,
        reason: profileForm.reason || 'Personal information update.',
      });
    }

    setSubmittedSuccess(true);
    setTimeout(() => {
      setSubmittedSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in">
      <div className="bg-[#ffffff] rounded-[24px] border border-[#e5e5e5] w-full max-w-2xl max-h-[90vh] flex flex-col card-shadow overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#e5e5e5] flex items-center justify-between bg-[#fafafa]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#0a0a0a] text-[#ffffff] flex items-center justify-center font-bold text-xs">
              +
            </div>
            <div>
              <h2 className="text-base font-semibold text-[#0a0a0a] tracking-tight">
                Submit Employee Digital Request
              </h2>
              <p className="text-[12px] text-[#737373]">
                Filing as <span className="font-semibold text-[#0a0a0a]">{currentUser.firstName} {currentUser.lastName}</span> ({currentUser.employeeCode})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-[#e5e5e5] text-[#737373] hover:text-[#0a0a0a] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Request Category Selector Tabs */}
        <div className="px-6 pt-4 border-b border-[#e5e5e5] bg-[#ffffff] flex items-center gap-1.5 overflow-x-auto pb-3">
          {[
            { id: 'expense', label: 'Expense Claim', icon: Receipt },
            { id: 'letter', label: 'Official Letter', icon: FileText },
            { id: 'salary_advance', label: 'Salary Advance', icon: CreditCard },
            { id: 'asset', label: 'IT Equipment', icon: Laptop },
            { id: 'profile_update', label: 'Profile Update', icon: UserCheck },
          ].map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeType === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveType(tab.id as any)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-[16px] text-xs font-medium transition-all shrink-0 ${
                  isSelected
                    ? 'bg-[#0a0a0a] text-[#fafafa] shadow-xs'
                    : 'text-[#737373] hover:bg-[#f5f5f5] hover:text-[#0a0a0a]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Form Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {submittedSuccess ? (
            <div className="py-12 flex flex-col items-center justify-center text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-3">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-semibold text-[#0a0a0a]">
                Request Submitted Successfully!
              </h3>
              <p className="text-[13px] text-[#737373] mt-1 max-w-sm">
                Your request has been registered in the Semplo workflow and queued for HR / Department Lead review.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {/* 1. EXPENSE CLAIM */}
              {activeType === 'expense' && (
                <>
                  <div className="p-3 bg-amber-50/60 border border-amber-200/80 rounded-[18px] text-[12px] text-amber-800 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <span>
                      Standard reimbursement cycle is processed every Friday via M-Pesa or next monthly payroll run. Keep official tax invoices/ETR receipts for KRA verification.
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-medium text-[#737373] uppercase tracking-wider mb-1">
                        Category
                      </label>
                      <select
                        value={expenseForm.category}
                        onChange={(e) =>
                          setExpenseForm({ ...expenseForm, category: e.target.value as ExpenseCategory })
                        }
                        className="w-full bg-[#f5f5f5] border border-[#e5e5e5] rounded-[14px] px-3 py-2 text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0a0a0a]"
                      >
                        <option value="internet_airtime">Internet & Airtime (Remote)</option>
                        <option value="travel_mileage">Travel & Client Mileage</option>
                        <option value="training_certifications">Training & Professional Exams</option>
                        <option value="client_entertainment">Client Meals & Meeting Hospitality</option>
                        <option value="office_supplies">Office Supplies & Stationery</option>
                        <option value="other">Other Operational Expense</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-[#737373] uppercase tracking-wider mb-1">
                        Amount (KES)
                      </label>
                      <input
                        type="number"
                        required
                        min={100}
                        max={500000}
                        value={expenseForm.amountKES}
                        onChange={(e) =>
                          setExpenseForm({ ...expenseForm, amountKES: Number(e.target.value) })
                        }
                        className="w-full bg-[#f5f5f5] border border-[#e5e5e5] rounded-[14px] px-3 py-2 text-[13px] font-mono focus:outline-none focus:ring-1 focus:ring-[#0a0a0a]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-[#737373] uppercase tracking-wider mb-1">
                      Expense Title / Summary
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. September Fiber Home Internet Connection"
                      value={expenseForm.title}
                      onChange={(e) => setExpenseForm({ ...expenseForm, title: e.target.value })}
                      className="w-full bg-[#f5f5f5] border border-[#e5e5e5] rounded-[14px] px-3 py-2 text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0a0a0a]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-medium text-[#737373] uppercase tracking-wider mb-1">
                        Merchant / Vendor Name
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Safaricom PLC"
                        value={expenseForm.merchantName}
                        onChange={(e) =>
                          setExpenseForm({ ...expenseForm, merchantName: e.target.value })
                        }
                        className="w-full bg-[#f5f5f5] border border-[#e5e5e5] rounded-[14px] px-3 py-2 text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0a0a0a]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-[#737373] uppercase tracking-wider mb-1">
                        Expense Date
                      </label>
                      <input
                        type="date"
                        value={expenseForm.expenseDate}
                        onChange={(e) =>
                          setExpenseForm({ ...expenseForm, expenseDate: e.target.value })
                        }
                        className="w-full bg-[#f5f5f5] border border-[#e5e5e5] rounded-[14px] px-3 py-2 text-[13px] font-mono focus:outline-none focus:ring-1 focus:ring-[#0a0a0a]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-[#737373] uppercase tracking-wider mb-1">
                      Receipt Upload (PDF / Image)
                    </label>
                    <div className="border border-dashed border-[#d4d4d4] rounded-[18px] p-3.5 bg-[#fafafa] flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <UploadCloud className="w-5 h-5 text-[#737373]" />
                        <div>
                          <div className="text-[12px] font-medium text-[#0a0a0a]">
                            {expenseForm.receiptFileName}
                          </div>
                          <div className="text-[10px] text-[#737373]">
                            Ready for attachment ({expenseForm.receiptFileSize})
                          </div>
                        </div>
                      </div>
                      <span className="text-[11px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        Attached
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-[#737373] uppercase tracking-wider mb-1">
                      Business Justification
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Explain why this expense was required for business duties..."
                      value={expenseForm.justification}
                      onChange={(e) =>
                        setExpenseForm({ ...expenseForm, justification: e.target.value })
                      }
                      className="w-full bg-[#f5f5f5] border border-[#e5e5e5] rounded-[14px] p-2.5 text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0a0a0a]"
                    />
                  </div>
                </>
              )}

              {/* 2. OFFICIAL LETTER */}
              {activeType === 'letter' && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-medium text-[#737373] uppercase tracking-wider mb-1">
                        Document Type
                      </label>
                      <select
                        value={letterForm.letterType}
                        onChange={(e) =>
                          setLetterForm({ ...letterForm, letterType: e.target.value as LetterType })
                        }
                        className="w-full bg-[#f5f5f5] border border-[#e5e5e5] rounded-[14px] px-3 py-2 text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0a0a0a]"
                      >
                        <option value="employment_verification">Employment Verification</option>
                        <option value="visa_support">Visa / Embassy Support Letter</option>
                        <option value="salary_certificate">Salary Certificate (Consulate / Landlord)</option>
                        <option value="bank_loan_support">Bank Loan / Mortgage Support</option>
                        <option value="kra_p9_card">Certified KRA P9 Tax Deduction Card</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-[#737373] uppercase tracking-wider mb-1">
                        Turnaround Urgency
                      </label>
                      <select
                        value={letterForm.urgency}
                        onChange={(e) =>
                          setLetterForm({
                            ...letterForm,
                            urgency: e.target.value as 'standard' | 'urgent',
                          })
                        }
                        className="w-full bg-[#f5f5f5] border border-[#e5e5e5] rounded-[14px] px-3 py-2 text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0a0a0a]"
                      >
                        <option value="standard">Standard (2 - 3 business days)</option>
                        <option value="urgent">Urgent Priority (24 hours turnaround)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-[#737373] uppercase tracking-wider mb-1">
                      Addressed To (Official Title & Entity)
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. The Consular Officer, Embassy of Kenya or Bank Manager"
                      value={letterForm.addressedTo}
                      onChange={(e) => setLetterForm({ ...letterForm, addressedTo: e.target.value })}
                      className="w-full bg-[#f5f5f5] border border-[#e5e5e5] rounded-[14px] px-3 py-2 text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0a0a0a]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-[#737373] uppercase tracking-wider mb-1">
                      Purpose & Destination Details
                    </label>
                    <textarea
                      rows={3}
                      required
                      placeholder="State specific purpose (e.g. applying for UK conference visitor visa Oct 2026)..."
                      value={letterForm.purpose}
                      onChange={(e) => setLetterForm({ ...letterForm, purpose: e.target.value })}
                      className="w-full bg-[#f5f5f5] border border-[#e5e5e5] rounded-[14px] p-2.5 text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0a0a0a]"
                    />
                  </div>

                  <label className="flex items-center gap-2.5 cursor-pointer p-3 bg-[#fafafa] border border-[#e5e5e5] rounded-[14px]">
                    <input
                      type="checkbox"
                      checked={letterForm.includeCompensationDetails}
                      onChange={(e) =>
                        setLetterForm({
                          ...letterForm,
                          includeCompensationDetails: e.target.checked,
                        })
                      }
                      className="rounded text-[#0a0a0a] focus:ring-0"
                    />
                    <div>
                      <div className="text-[12px] font-medium text-[#0a0a0a]">
                        Include Gross Monthly Remuneration (KES {currentUser.baseSalary.toLocaleString()})
                      </div>
                      <div className="text-[10px] text-[#737373]">
                        Required by most embassies, mortgage lenders, and financial institutions.
                      </div>
                    </div>
                  </label>
                </>
              )}

              {/* 3. SALARY ADVANCE */}
              {activeType === 'salary_advance' && (
                <>
                  <div className="p-3 bg-blue-50/70 border border-blue-200/80 rounded-[18px] text-[12px] text-blue-900">
                    <div className="font-semibold flex items-center justify-between">
                      <span>Statutory Salary Advance Facility</span>
                      <span className="font-mono">
                        Max Allowed: KES {maxAdvanceAllowed.toLocaleString()}
                      </span>
                    </div>
                    <p className="mt-1 text-[11px] text-blue-800">
                      Employees may access up to 50% of monthly basic pay for genuine emergencies. Disbursed via M-Pesa or bank transfer, recovered interest-free across 1 to 3 payroll cycles.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-medium text-[#737373] uppercase tracking-wider mb-1">
                        Requested Amount (KES)
                      </label>
                      <input
                        type="number"
                        required
                        min={5000}
                        max={maxAdvanceAllowed}
                        value={advanceForm.amountKES}
                        onChange={(e) =>
                          setAdvanceForm({ ...advanceForm, amountKES: Number(e.target.value) })
                        }
                        className="w-full bg-[#f5f5f5] border border-[#e5e5e5] rounded-[14px] px-3 py-2 text-[13px] font-mono focus:outline-none focus:ring-1 focus:ring-[#0a0a0a]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-[#737373] uppercase tracking-wider mb-1">
                        Repayment Tenure
                      </label>
                      <select
                        value={advanceForm.deductionTenureMonths}
                        onChange={(e) =>
                          setAdvanceForm({
                            ...advanceForm,
                            deductionTenureMonths: Number(e.target.value) as any,
                          })
                        }
                        className="w-full bg-[#f5f5f5] border border-[#e5e5e5] rounded-[14px] px-3 py-2 text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0a0a0a]"
                      >
                        <option value={1}>1 Month (Deducted next cycle)</option>
                        <option value={2}>2 Months (50% each cycle)</option>
                        <option value={3}>3 Months (33% each cycle)</option>
                      </select>
                    </div>
                  </div>

                  <div className="p-3 bg-[#fafafa] border border-[#e5e5e5] rounded-[16px] flex items-center justify-between text-[12px]">
                    <span className="text-[#737373]">Estimated Monthly Deduction:</span>
                    <span className="font-mono font-bold text-[#0a0a0a]">
                      KES {Math.round(advanceForm.amountKES / advanceForm.deductionTenureMonths).toLocaleString()} / month
                    </span>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-[#737373] uppercase tracking-wider mb-1">
                      Emergency Reason
                    </label>
                    <select
                      value={advanceForm.reason}
                      onChange={(e) =>
                        setAdvanceForm({ ...advanceForm, reason: e.target.value as any })
                      }
                      className="w-full bg-[#f5f5f5] border border-[#e5e5e5] rounded-[14px] px-3 py-2 text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0a0a0a]"
                    >
                      <option value="School Fees / Tuition">School Fees / Tuition</option>
                      <option value="Medical Emergency">Medical Emergency</option>
                      <option value="Home Relocation">Home Relocation / Rent Deposit</option>
                      <option value="Vehicle Repair">Vehicle Repair / Field Transit</option>
                      <option value="Family Emergency">Family Emergency</option>
                      <option value="Other">Other Emergency</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-[#737373] uppercase tracking-wider mb-1">
                      Disbursement Channel & Account
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <select
                        value={advanceForm.disbursementMethod}
                        onChange={(e) =>
                          setAdvanceForm({
                            ...advanceForm,
                            disbursementMethod: e.target.value as any,
                          })
                        }
                        className="bg-[#f5f5f5] border border-[#e5e5e5] rounded-[14px] px-3 py-2 text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0a0a0a]"
                      >
                        <option value="mpesa">Direct M-Pesa Disbursal</option>
                        <option value="bank_transfer">Bank Account Transfer</option>
                      </select>
                      <input
                        type="text"
                        placeholder="Phone or Bank account"
                        value={advanceForm.disbursementAccount}
                        onChange={(e) =>
                          setAdvanceForm({ ...advanceForm, disbursementAccount: e.target.value })
                        }
                        className="bg-[#f5f5f5] border border-[#e5e5e5] rounded-[14px] px-3 py-2 text-[13px] font-mono focus:outline-none focus:ring-1 focus:ring-[#0a0a0a]"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* 4. IT ASSET / EQUIPMENT */}
              {activeType === 'asset' && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-medium text-[#737373] uppercase tracking-wider mb-1">
                        Equipment Category
                      </label>
                      <select
                        value={assetForm.assetType}
                        onChange={(e) =>
                          setAssetForm({ ...assetForm, assetType: e.target.value as AssetRequestType })
                        }
                        className="w-full bg-[#f5f5f5] border border-[#e5e5e5] rounded-[14px] px-3 py-2 text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0a0a0a]"
                      >
                        <option value="external_monitor">External 4K / USB-C Monitor</option>
                        <option value="laptop">Workstation Laptop (Mac / ThinkPad)</option>
                        <option value="noise_cancelling_headset">Noise Cancelling Headset</option>
                        <option value="ergonomic_chair">Ergonomic Office Chair</option>
                        <option value="software_license">Development / Creative Software License</option>
                        <option value="mobile_device">Mobile Test Device</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-[#737373] uppercase tracking-wider mb-1">
                        Urgency Level
                      </label>
                      <select
                        value={assetForm.urgency}
                        onChange={(e) =>
                          setAssetForm({ ...assetForm, urgency: e.target.value as any })
                        }
                        className="w-full bg-[#f5f5f5] border border-[#e5e5e5] rounded-[14px] px-3 py-2 text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0a0a0a]"
                      >
                        <option value="low">Low (Standard inventory turnaround)</option>
                        <option value="medium">Medium (Within 5 business days)</option>
                        <option value="high">High (Required for active sprint/critical blocker)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-[#737373] uppercase tracking-wider mb-1">
                      Preferred Make / Model / Specification
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Dell UltraSharp 27-inch 4K or MacBook Pro 14-inch"
                      value={assetForm.itemName}
                      onChange={(e) => setAssetForm({ ...assetForm, itemName: e.target.value })}
                      className="w-full bg-[#f5f5f5] border border-[#e5e5e5] rounded-[14px] px-3 py-2 text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0a0a0a]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-[#737373] uppercase tracking-wider mb-1">
                      Role Justification
                    </label>
                    <textarea
                      rows={3}
                      required
                      placeholder="State technical requirements or ergonomics justification..."
                      value={assetForm.reason}
                      onChange={(e) => setAssetForm({ ...assetForm, reason: e.target.value })}
                      className="w-full bg-[#f5f5f5] border border-[#e5e5e5] rounded-[14px] p-2.5 text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0a0a0a]"
                    />
                  </div>
                </>
              )}

              {/* 5. PROFILE UPDATE */}
              {activeType === 'profile_update' && (
                <>
                  <div>
                    <label className="block text-[11px] font-medium text-[#737373] uppercase tracking-wider mb-1">
                      Information to Update
                    </label>
                    <select
                      value={profileForm.updateType}
                      onChange={(e) =>
                        setProfileForm({
                          ...profileForm,
                          updateType: e.target.value as ProfileUpdateType,
                        })
                      }
                      className="w-full bg-[#f5f5f5] border border-[#e5e5e5] rounded-[14px] px-3 py-2 text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0a0a0a]"
                    >
                      <option value="emergency_contact">Emergency Contact Person & Phone</option>
                      <option value="bank_details">Bank Name, Account & M-Pesa</option>
                      <option value="residential_address">Residential Address / City</option>
                    </select>
                  </div>

                  {profileForm.updateType === 'emergency_contact' && (
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] text-[#737373] mb-1">Contact Name</label>
                        <input
                          type="text"
                          required
                          value={profileForm.contactName}
                          onChange={(e) =>
                            setProfileForm({ ...profileForm, contactName: e.target.value })
                          }
                          className="w-full bg-[#f5f5f5] border border-[#e5e5e5] rounded-[14px] px-3 py-2 text-[13px]"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-[#737373] mb-1">Relationship</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Spouse / Sibling"
                          value={profileForm.contactRelation}
                          onChange={(e) =>
                            setProfileForm({ ...profileForm, contactRelation: e.target.value })
                          }
                          className="w-full bg-[#f5f5f5] border border-[#e5e5e5] rounded-[14px] px-3 py-2 text-[13px]"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-[#737373] mb-1">Phone (+254)</label>
                        <input
                          type="text"
                          required
                          value={profileForm.contactPhone}
                          onChange={(e) =>
                            setProfileForm({ ...profileForm, contactPhone: e.target.value })
                          }
                          className="w-full bg-[#f5f5f5] border border-[#e5e5e5] rounded-[14px] px-3 py-2 text-[13px] font-mono"
                        />
                      </div>
                    </div>
                  )}

                  {profileForm.updateType === 'bank_details' && (
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] text-[#737373] mb-1">Bank Name</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. KCB or Equity"
                          value={profileForm.bankName}
                          onChange={(e) =>
                            setProfileForm({ ...profileForm, bankName: e.target.value })
                          }
                          className="w-full bg-[#f5f5f5] border border-[#e5e5e5] rounded-[14px] px-3 py-2 text-[13px]"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-[#737373] mb-1">Account Last 4</label>
                        <input
                          type="text"
                          required
                          maxLength={4}
                          value={profileForm.accountNumber}
                          onChange={(e) =>
                            setProfileForm({ ...profileForm, accountNumber: e.target.value })
                          }
                          className="w-full bg-[#f5f5f5] border border-[#e5e5e5] rounded-[14px] px-3 py-2 text-[13px] font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-[#737373] mb-1">M-Pesa Phone</label>
                        <input
                          type="text"
                          required
                          value={profileForm.mpesaNumber}
                          onChange={(e) =>
                            setProfileForm({ ...profileForm, mpesaNumber: e.target.value })
                          }
                          className="w-full bg-[#f5f5f5] border border-[#e5e5e5] rounded-[14px] px-3 py-2 text-[13px] font-mono"
                        />
                      </div>
                    </div>
                  )}

                  {profileForm.updateType === 'residential_address' && (
                    <div>
                      <label className="block text-[11px] text-[#737373] mb-1">
                        New Residential Address / Estate
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Silver Oak Apartments, Dennis Pritt Rd, Kilimani, Nairobi"
                        value={profileForm.residentialAddress}
                        onChange={(e) =>
                          setProfileForm({ ...profileForm, residentialAddress: e.target.value })
                        }
                        className="w-full bg-[#f5f5f5] border border-[#e5e5e5] rounded-[14px] px-3 py-2 text-[13px]"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-[11px] font-medium text-[#737373] uppercase tracking-wider mb-1">
                      Reason for Change
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Brief note explaining why this profile record changed..."
                      value={profileForm.reason}
                      onChange={(e) => setProfileForm({ ...profileForm, reason: e.target.value })}
                      className="w-full bg-[#f5f5f5] border border-[#e5e5e5] rounded-[14px] p-2.5 text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0a0a0a]"
                    />
                  </div>
                </>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-[#e5e5e5]">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-[18px] bg-[#f5f5f5] text-[#171717] text-[13px] font-medium hover:bg-[#ebebeb] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-[18px] bg-[#0a0a0a] text-[#ffffff] text-[13px] font-medium hover:bg-[#262626] transition-all flex items-center gap-1.5 shadow-sm"
                >
                  <span>Submit Request</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
