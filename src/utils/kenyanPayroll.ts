/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  Employee,
  KenyanStatutoryDeductions,
  SalaryBreakdown,
  VoluntaryDeductions,
  EmployerStatutoryCosts,
  Payslip,
  PayrollCycle,
} from '../types/hr';

// Number to words converter for Kenyan Shillings
export function amountToKenyanWords(amount: number): string {
  const rounded = Math.round(amount);
  if (rounded === 0) return 'Zero Kenya Shillings Only';

  const units = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
  const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  const scales = ['', 'Thousand', 'Million', 'Billion'];

  function convertGroup(n: number): string {
    let result = '';
    const h = Math.floor(n / 100);
    const remainder = n % 100;

    if (h > 0) {
      result += `${units[h]} Hundred`;
      if (remainder > 0) result += ' and ';
    }

    if (remainder > 0) {
      if (remainder < 10) {
        result += units[remainder];
      } else if (remainder < 20) {
        result += teens[remainder - 10];
      } else {
        const t = Math.floor(remainder / 10);
        const u = remainder % 10;
        result += tens[t];
        if (u > 0) result += `-${units[u]}`;
      }
    }
    return result;
  }

  let num = rounded;
  let scaleIdx = 0;
  const parts: string[] = [];

  while (num > 0) {
    const chunk = num % 1000;
    if (chunk !== 0) {
      const groupStr = convertGroup(chunk);
      const scaleStr = scales[scaleIdx] ? ` ${scales[scaleIdx]}` : '';
      parts.unshift(`${groupStr}${scaleStr}`);
    }
    num = Math.floor(num / 1000);
    scaleIdx++;
  }

  return `${parts.join(', ')} Kenya Shillings Only`;
}

/**
 * Computes Kenyan Statutory Deductions (NSSF Act 2013, SHIF 2.75%, Housing Levy 1.5%, KRA PAYE bands)
 */
export function calculateKenyanStatutoryDeductions(
  grossPay: number,
  allowablePensionExtra: number = 0
): KenyanStatutoryDeductions {
  // 1. NSSF (Tiered Act 2013)
  // Lower Earnings Limit (LEL) = 7,000 KES (Tier 1: 6% = 420 KES)
  // Upper Earnings Limit (UEL) = 36,000 KES (Tier 2: 6% of (36,000 - 7,000) = 1,740 KES)
  const tier1Limit = 7000;
  const tier2Limit = 36000;

  const nssfTier1 = Math.min(grossPay, tier1Limit) * 0.06;
  const tier2Eligible = Math.max(0, Math.min(grossPay, tier2Limit) - tier1Limit);
  const nssfTier2 = tier2Eligible * 0.06;

  const nssfTotalEmployee = Math.min(2160, Math.round((nssfTier1 + nssfTier2) * 100) / 100);
  const nssfTotalEmployer = nssfTotalEmployee; // Matched by employer

  // 2. SHIF (Social Health Insurance Fund) - 2.75% of Gross
  const shif = Math.round(grossPay * 0.0275 * 100) / 100;

  // 3. Affordable Housing Levy (AHL) - 1.5% of Gross
  const housingLevyEmployee = Math.round(grossPay * 0.015 * 100) / 100;
  const housingLevyEmployer = housingLevyEmployee; // Matched by employer

  // 4. KRA PAYE Calculation
  // Taxable Pay: Gross Pay minus allowable statutory employee pension/NSSF (up to 20,000 max allowable under Kenyan law)
  const totalAllowablePension = Math.min(20000, nssfTotalEmployee + allowablePensionExtra);
  const taxablePay = Math.max(0, grossPay - totalAllowablePension);

  // KRA Monthly Individual Tax Bands
  // Band 1: First 24,000 @ 10%
  // Band 2: Next 8,333 (24,001 to 32,333) @ 25%
  // Band 3: Next 467,667 (32,334 to 500,000) @ 30%
  // Band 4: Next 300,000 (500,001 to 800,000) @ 32.5%
  // Band 5: Above 800,000 @ 35%
  let remainingTaxable = taxablePay;
  let grossTax = 0;

  // Band 1
  const b1 = Math.min(remainingTaxable, 24000);
  grossTax += b1 * 0.10;
  remainingTaxable = Math.max(0, remainingTaxable - 24000);

  // Band 2
  const b2 = Math.min(remainingTaxable, 8333.33);
  grossTax += b2 * 0.25;
  remainingTaxable = Math.max(0, remainingTaxable - 8333.33);

  // Band 3
  const b3 = Math.min(remainingTaxable, 467666.67);
  grossTax += b3 * 0.30;
  remainingTaxable = Math.max(0, remainingTaxable - 467666.67);

  // Band 4
  const b4 = Math.min(remainingTaxable, 300000);
  grossTax += b4 * 0.325;
  remainingTaxable = Math.max(0, remainingTaxable - 300000);

  // Band 5
  if (remainingTaxable > 0) {
    grossTax += remainingTaxable * 0.35;
  }

  const grossTaxPaye = Math.round(grossTax * 100) / 100;

  // Reliefs
  const personalRelief = 2400.00; // Monthly personal relief
  const insuranceRelief = Math.min(5000, Math.round(shif * 0.15 * 100) / 100); // 15% of SHIF
  const housingRelief = Math.min(750, Math.round(housingLevyEmployee * 0.15 * 100) / 100); // 15% of Housing Levy
  const totalTaxRelief = Math.round((personalRelief + insuranceRelief + housingRelief) * 100) / 100;

  const netPaye = Math.max(0, Math.round((grossTaxPaye - totalTaxRelief) * 100) / 100);

  return {
    nssfTier1: Math.round(nssfTier1 * 100) / 100,
    nssfTier2: Math.round(nssfTier2 * 100) / 100,
    nssfTotalEmployee,
    nssfTotalEmployer,
    shif,
    housingLevyEmployee,
    housingLevyEmployer,
    taxablePay: Math.round(taxablePay * 100) / 100,
    grossTaxPaye,
    personalRelief,
    insuranceRelief,
    housingRelief,
    totalTaxRelief,
    netPaye,
  };
}

/**
 * Builds standard Kenyan allowances breakdown based on employee base salary
 */
export function buildSalaryBreakdown(
  baseSalary: number,
  overtimePay: number = 0,
  bonus: number = 0
): SalaryBreakdown {
  // Standard Kenyan compensation structuring:
  // Base salary is 70-75% of total package, with 15% house allowance, 10% commuter/transport allowance
  const houseAllowance = Math.round(baseSalary * 0.15);
  const transportAllowance = Math.round(baseSalary * 0.08);
  const otherAllowances = Math.round(baseSalary * 0.04); // e.g. airtime / utility allowance
  const grossPay = baseSalary + houseAllowance + transportAllowance + otherAllowances + overtimePay + bonus;

  return {
    basicSalary: baseSalary,
    houseAllowance,
    transportAllowance,
    otherAllowances,
    overtimePay,
    bonus,
    grossPay,
  };
}

/**
 * Builds realistic Kenyan voluntary deductions (SACCO, HELB, Staff Welfare)
 */
export function buildVoluntaryDeductions(
  grossPay: number,
  employeeCode: string
): VoluntaryDeductions {
  // Deterministic seed based on employee code to keep mock data consistent and authentic
  const codeNum = parseInt(employeeCode.replace(/\D/g, ''), 10) || 1000;
  const hasSacco = codeNum % 2 === 0 || codeNum % 3 === 0;
  const hasHelb = codeNum % 4 === 1; // e.g. junior/mid engineers repaying HELB
  const hasPension = grossPay > 150000;

  const saccoContribution = hasSacco ? Math.round(Math.min(25000, grossPay * 0.05)) : 0;
  const saccoLoanRepayment = hasSacco && codeNum % 5 === 0 ? 12500 : 0;
  const helbLoan = hasHelb ? 3500 : 0;
  const pensionVoluntary = hasPension ? Math.round(grossPay * 0.03) : 0;
  const welfareContribution = 1000; // Standard Nairobi staff welfare fund

  const totalVoluntary = saccoContribution + saccoLoanRepayment + helbLoan + pensionVoluntary + welfareContribution;

  return {
    saccoContribution,
    saccoLoanRepayment,
    helbLoan,
    pensionVoluntary,
    welfareContribution,
    totalVoluntary,
  };
}

/**
 * Generates a full Kenyan Payslip for an Employee
 */
export function generateEmployeePayslip(
  employee: Employee,
  cycleId: string,
  payPeriod: string = 'September 2026',
  payDate: string = '2026-09-30',
  overtimePay: number = 0,
  bonus: number = 0,
  status: 'draft' | 'approved' | 'paid' = 'approved'
): Payslip {
  const earnings = buildSalaryBreakdown(employee.baseSalary, overtimePay, bonus);
  const voluntary = buildVoluntaryDeductions(earnings.grossPay, employee.employeeCode);
  const statutory = calculateKenyanStatutoryDeductions(earnings.grossPay, voluntary.pensionVoluntary);

  const employerCosts: EmployerStatutoryCosts = {
    employerNssf: statutory.nssfTotalEmployer,
    employerHousingLevy: statutory.housingLevyEmployer,
    totalEmployerCost: earnings.grossPay + statutory.nssfTotalEmployer + statutory.housingLevyEmployer,
  };

  const totalDeductions = Math.round(
    (statutory.nssfTotalEmployee +
      statutory.shif +
      statutory.housingLevyEmployee +
      statutory.netPaye +
      voluntary.totalVoluntary) *
      100
  ) / 100;

  const netPay = Math.round((earnings.grossPay - totalDeductions) * 100) / 100;
  const netPayInWords = amountToKenyanWords(netPay);

  return {
    id: `ps_${cycleId}_${employee.id}`,
    payrollCycleId: cycleId,
    employeeId: employee.id,
    employeeCode: employee.employeeCode,
    employeeName: `${employee.firstName} ${employee.lastName}`,
    department: employee.department,
    jobTitle: employee.jobTitle,
    kraPin: employee.kraPin || 'A009182345K',
    nssfNumber: employee.nssfNumber || 'NSSF/1049281',
    shifNumber: employee.shifNumber || 'SHIF/2948102',
    nationalId: employee.nationalId || '28491029',
    bankName: employee.bankInfo?.bankName || 'KCB Bank Kenya',
    bankAccount: employee.bankInfo?.accountLast4 ? `••••••••${employee.bankInfo.accountLast4}` : '••••••••4819',
    mpesaNumber: employee.bankInfo?.mpesaNumber,
    paymentMethod: employee.bankInfo?.mpesaNumber ? 'mpesa' : 'bank_transfer',
    payPeriod,
    payDate,
    status,
    earnings,
    statutory,
    voluntary,
    employerCosts,
    totalDeductions,
    netPay,
    netPayInWords,
    generatedAt: new Date().toISOString(),
    disbursedAt: status === 'paid' ? '2026-09-30T10:00:00Z' : undefined,
  };
}

/**
 * Calculates a complete monthly Payroll Cycle across all employees
 */
export function generatePayrollCycle(
  cycleId: string,
  cycleMonth: string,
  employees: Employee[],
  status: 'draft' | 'calculated' | 'approved' | 'disbursed' = 'approved'
): PayrollCycle {
  const payslipStatus = status === 'disbursed' ? 'paid' : status === 'approved' ? 'approved' : 'draft';
  
  // Active employees only
  const activeEmployees = employees.filter((e) => e.status === 'active' || e.status === 'probation');
  
  const payslips = activeEmployees.map((emp) =>
    generateEmployeePayslip(emp, cycleId, cycleMonth, '2026-09-30', 0, 0, payslipStatus)
  );

  const totalGross = Math.round(payslips.reduce((sum, p) => sum + p.earnings.grossPay, 0));
  const totalBasic = Math.round(payslips.reduce((sum, p) => sum + p.earnings.basicSalary, 0));
  const totalAllowances = totalGross - totalBasic;
  const totalNetPay = Math.round(payslips.reduce((sum, p) => sum + p.netPay, 0));
  const totalPaye = Math.round(payslips.reduce((sum, p) => sum + p.statutory.netPaye, 0));
  const totalNssfEmployee = Math.round(payslips.reduce((sum, p) => sum + p.statutory.nssfTotalEmployee, 0));
  const totalNssfEmployer = Math.round(payslips.reduce((sum, p) => sum + p.statutory.nssfTotalEmployer, 0));
  const totalShif = Math.round(payslips.reduce((sum, p) => sum + p.statutory.shif, 0));
  const totalHousingLevyEmployee = Math.round(payslips.reduce((sum, p) => sum + p.statutory.housingLevyEmployee, 0));
  const totalHousingLevyEmployer = Math.round(payslips.reduce((sum, p) => sum + p.statutory.housingLevyEmployer, 0));
  const totalVoluntary = Math.round(payslips.reduce((sum, p) => sum + p.voluntary.totalVoluntary, 0));

  // Statutory Remittance to State Agencies:
  // KRA: PAYE + Housing Levy (Employee & Employer)
  // NSSF: NSSF Employee & Employer
  // SHA: SHIF
  const totalStatutoryRemittance =
    totalPaye +
    totalNssfEmployee +
    totalNssfEmployer +
    totalShif +
    totalHousingLevyEmployee +
    totalHousingLevyEmployer;

  return {
    id: cycleId,
    cycleMonth,
    startDate: '2026-09-01',
    endDate: '2026-09-30',
    payDate: '2026-09-30',
    status,
    employeeCount: payslips.length,
    totalGross,
    totalBasic,
    totalAllowances,
    totalNetPay,
    totalPaye,
    totalNssfEmployee,
    totalNssfEmployer,
    totalShif,
    totalHousingLevyEmployee,
    totalHousingLevyEmployer,
    totalVoluntary,
    totalStatutoryRemittance,
    approvedBy: status === 'approved' || status === 'disbursed' ? 'Wanjiku Mwangi (MD)' : undefined,
    approvedAt: status === 'approved' || status === 'disbursed' ? '2026-09-28T14:30:00Z' : undefined,
    disbursedBy: status === 'disbursed' ? 'Esther Chebet (Finance)' : undefined,
    disbursedAt: status === 'disbursed' ? '2026-09-30T09:45:00Z' : undefined,
    payslips,
  };
}
