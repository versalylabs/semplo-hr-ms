/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'super_admin' | 'hr_manager' | 'department_lead' | 'employee';

export type EmploymentType = 'full_time' | 'part_time' | 'contract' | 'intern';

export type EmployeeStatus = 'active' | 'on_leave' | 'probation' | 'terminated';

export interface Persona {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  roleLabel: string;
  avatar: string;
  employeeId: string;
  jobTitle: string;
  department: string;
}

export interface EmployeeDocument {
  id: string;
  name: string;
  type: 'contract' | 'tax' | 'id_proof' | 'education' | 'nda';
  status: 'verified' | 'pending' | 'missing';
  uploadedAt?: string;
  fileSize?: string;
}

export interface Employee {
  id: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  avatar: string;
  department: string;
  jobTitle: string;
  role: UserRole;
  employmentType: EmploymentType;
  status: EmployeeStatus;
  joiningDate: string;
  birthDate?: string;
  managerId?: string;
  managerName?: string;
  location: string; // e.g. "Nairobi HQ - Upper Hill", "Mombasa Branch", "Kisumu Hub"
  compensationTier: string;
  baseSalary: number; // in KES
  currency: string; // KES
  nationalId: string; // Kenyan National ID / Passport
  kraPin: string; // Kenya Revenue Authority PIN
  nssfNumber: string; // National Social Security Fund
  shifNumber: string; // Social Health Insurance Fund (formerly NHIF)
  emergencyContact: {
    name: string;
    relation: string;
    phone: string;
  };
  bankInfo: {
    bankName: string; // KCB, Equity, Standard Chartered, Co-op Bank, NCBA, Stanbic, Absa
    accountLast4: string;
    mpesaNumber?: string;
    branch?: string;
  };
  documents: EmployeeDocument[];
  notes?: string;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  leadEmployeeId: string;
  leadName: string;
  headcount: number;
  budget: number; // KES
  spentBudget: number; // KES
  openPositions: number;
  description: string;
}

export interface OnboardingTaskItem {
  id: string;
  title: string;
  category: 'compliance' | 'it_setup' | 'hr_orientation' | 'team_intro';
  isCompleted: boolean;
  completedAt?: string;
  assignedRole: string;
}

export type OnboardingTask = OnboardingTaskItem;

export interface OnboardingRecord {
  id: string;
  employeeId: string;
  startDate: string;
  targetDate: string;
  status: 'in_progress' | 'completed' | 'delayed';
  mentorName: string;
  tasks: OnboardingTaskItem[];
}

export interface OffboardingClearance {
  department: string;
  approved: boolean;
  approverName: string;
  updatedAt?: string;
}

export interface OffboardingAsset {
  id: string;
  item: string;
  serialNumber?: string;
  returned: boolean;
}

export interface OffboardingRecord {
  id: string;
  employeeId: string;
  resignationDate: string;
  lastWorkingDate: string;
  reason: string;
  status: 'notice_period' | 'handover' | 'clearance' | 'completed';
  exitInterviewNotes: string;
  assets: OffboardingAsset[];
  clearances: OffboardingClearance[];
}

/* =========================================================
   PHASE 3: ATTENDANCE, TIME TRACKING & LEAVE MANAGEMENT
   ========================================================= */

export type PunchType = 'clock_in' | 'clock_out' | 'break_start' | 'break_end';

export type AttendanceStatus = 'present' | 'late' | 'half_day' | 'absent' | 'on_leave' | 'holiday';

export interface AttendancePunch {
  id: string;
  timestamp: string; // HH:mm:ss
  type: PunchType;
  location: string;
  device: string;
  verified: boolean;
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  date: string; // YYYY-MM-DD
  status: AttendanceStatus;
  shiftName: string; // "Standard Nairobi (08:30 - 17:00)"
  clockIn?: string;
  clockOut?: string;
  totalWorkMinutes: number;
  breakMinutes: number;
  overtimeMinutes: number;
  isLate: boolean;
  lateMinutes: number;
  punches: AttendancePunch[];
  notes?: string;
}

export type LeaveType = 
  | 'annual' 
  | 'sick' 
  | 'maternity' 
  | 'paternity' 
  | 'compassionate' 
  | 'study' 
  | 'unpaid';

export type LeaveStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';

export interface LeaveBalance {
  leaveType: LeaveType;
  label: string;
  totalEntitlement: number; // e.g. 21 working days for Kenyan statutory annual leave
  usedDays: number;
  pendingDays: number;
  availableDays: number;
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  daysCount: number;
  reason: string;
  status: LeaveStatus;
  handoverToEmployeeId?: string;
  handoverToEmployeeName?: string;
  appliedDate: string;
  reviewedBy?: string;
  reviewedDate?: string;
  reviewerComments?: string;
  medicalCertAttached?: boolean;
}

export interface ShiftSchedule {
  id: string;
  name: string;
  code: string;
  startTime: string; // "08:30"
  endTime: string; // "17:00"
  graceMinutes: number; // 15 mins
  workDays: string[]; // ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
  assignedEmployeesCount: number;
}

export interface KenyanPublicHoliday {
  date: string; // YYYY-MM-DD
  name: string;
  type: 'national' | 'gazetted' | 'religious';
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actorName: string;
  actorRole: UserRole;
  actionType: 'create' | 'update' | 'delete' | 'status_change' | 'onboarding' | 'offboarding' | 'attendance' | 'leave' | 'payroll' | 'appraisal' | 'recruitment';
  entityType: 'employee' | 'department' | 'lifecycle' | 'attendance' | 'leave' | 'payroll' | 'appraisal' | 'recruitment' | 'system';
  entityId?: string;
  description: string;
}

/* =========================================================
   PHASE 4: PAYROLL PROCESSING & KENYAN STATUTORY DEDUCTIONS
   ========================================================= */

export interface SalaryBreakdown {
  basicSalary: number;
  houseAllowance: number;
  transportAllowance: number;
  otherAllowances: number;
  overtimePay: number;
  bonus: number;
  grossPay: number;
}

export interface KenyanStatutoryDeductions {
  // NSSF (Tiered Act 2013)
  nssfTier1: number; // 6% up to 7,000, max 420 KES
  nssfTier2: number; // 6% from 7,001 to 36,000, max 1,740 KES
  nssfTotalEmployee: number; // max 2,160 KES
  nssfTotalEmployer: number; // matched contribution, max 2,160 KES

  // SHIF (Social Health Insurance Fund - replaces NHIF)
  shif: number; // 2.75% of Gross Pay

  // Affordable Housing Levy (AHL)
  housingLevyEmployee: number; // 1.5% of Gross Pay
  housingLevyEmployer: number; // 1.5% of Gross Pay

  // PAYE Tax Calculation (KRA)
  taxablePay: number; // Gross Pay minus tax-allowable NSSF employee contribution
  grossTaxPaye: number; // Tax before reliefs
  personalRelief: number; // 2,400 KES monthly
  insuranceRelief: number; // 15% of SHIF (max 5,000 KES/month)
  housingRelief: number; // 15% of Housing Levy (max 750 KES/month)
  totalTaxRelief: number; // sum of reliefs
  netPaye: number; // max(0, grossTaxPaye - totalTaxRelief)
}

export interface VoluntaryDeductions {
  saccoContribution: number;
  saccoLoanRepayment: number;
  helbLoan: number;
  pensionVoluntary: number;
  welfareContribution: number;
  totalVoluntary: number;
}

export interface EmployerStatutoryCosts {
  employerNssf: number;
  employerHousingLevy: number;
  totalEmployerCost: number; // grossPay + employerNssf + employerHousingLevy
}

export interface Payslip {
  id: string;
  payrollCycleId: string;
  employeeId: string;
  employeeCode: string;
  employeeName: string;
  department: string;
  jobTitle: string;
  kraPin: string;
  nssfNumber: string;
  shifNumber: string;
  nationalId: string;
  bankName: string;
  bankAccount: string;
  mpesaNumber?: string;
  paymentMethod: 'bank_transfer' | 'mpesa' | 'cheque';
  payPeriod: string; // e.g. "September 2026"
  payDate: string; // e.g. "2026-09-30"
  status: 'draft' | 'approved' | 'paid';
  earnings: SalaryBreakdown;
  statutory: KenyanStatutoryDeductions;
  voluntary: VoluntaryDeductions;
  employerCosts: EmployerStatutoryCosts;
  totalDeductions: number;
  netPay: number;
  netPayInWords: string;
  generatedAt: string;
  disbursedAt?: string;
}

export interface PayrollCycle {
  id: string;
  cycleMonth: string; // "September 2026"
  startDate: string;
  endDate: string;
  payDate: string;
  status: 'draft' | 'calculated' | 'approved' | 'disbursed';
  employeeCount: number;
  totalGross: number;
  totalBasic: number;
  totalAllowances: number;
  totalNetPay: number;
  totalPaye: number;
  totalNssfEmployee: number;
  totalNssfEmployer: number;
  totalShif: number;
  totalHousingLevyEmployee: number;
  totalHousingLevyEmployer: number;
  totalVoluntary: number;
  totalStatutoryRemittance: number; // PAYE + Employee/Employer NSSF + SHIF + Housing Levy (Employee & Employer)
  approvedBy?: string;
  approvedAt?: string;
  disbursedBy?: string;
  disbursedAt?: string;
  payslips: Payslip[];
}

export interface StatutoryRemittanceSummary {
  period: string;
  kraPaye: {
    totalPaye: number;
    kraPinCount: number;
    remittanceDeadline: string; // "9th of following month"
    kraAccountReference: string;
  };
  nssf: {
    tier1Employee: number;
    tier1Employer: number;
    tier2Employee: number;
    tier2Employer: number;
    totalRemittance: number;
    employerNo: string;
    remittanceDeadline: string; // "9th of following month"
  };
  shif: {
    totalContribution: number;
    employerNo: string;
    remittanceDeadline: string; // "9th of following month"
  };
  housingLevy: {
    employeeContribution: number;
    employerContribution: number;
    totalRemittance: number;
    remittanceDeadline: string; // "9th of following month"
  };
}

/* =========================================================
   PHASE 5: PERFORMANCE APPRAISAL, OKRs & TALENT MATRIX
   ========================================================= */

export type CompetencyCategory = 
  | 'technical_execution'
  | 'delivery_quality'
  | 'collaboration_leadership'
  | 'innovation_problem_solving'
  | 'company_values';

export interface CompetencyRating {
  id: string;
  category: CompetencyCategory;
  name: string;
  description: string;
  selfScore: number; // 1 to 5
  managerScore: number; // 1 to 5
  comments?: string;
}

export type AppraisalStatus = 
  | 'pending_self' 
  | 'pending_manager' 
  | 'pending_calibration' 
  | 'completed';

export type NineBoxPosition = 
  | 'Star'
  | 'High Performer'
  | 'High Potential'
  | 'Core Contributor'
  | 'Solid Performer'
  | 'Inconsistent'
  | 'Underperformer';

export interface OKRGoal {
  id: string;
  title: string;
  description: string;
  departmentId?: string;
  ownerEmployeeId: string;
  ownerName: string;
  ownerAvatar?: string;
  quarter: string; // e.g. "Q3 2026"
  progress: number; // 0 - 100
  status: 'on_track' | 'at_risk' | 'behind' | 'achieved';
  metric: string; // e.g. "99.98% uptime", "KES 48M revenue", "40 net promoter score"
  weight: number; // e.g. 25%
}

export interface AppraisalRecord {
  id: string;
  cycleId: string;
  cycleName: string;
  employeeId: string;
  employeeName: string;
  employeeCode: string;
  employeeAvatar: string;
  department: string;
  jobTitle: string;
  reviewerId: string;
  reviewerName: string;
  status: AppraisalStatus;
  competencies: CompetencyRating[];
  selfOverallScore: number;
  selfSummary: string;
  managerOverallScore: number;
  managerSummary: string;
  finalGrade?: 'Exceptional (5.0)' | 'Exceeds Expectations (4.0 - 4.9)' | 'Meets Expectations (3.0 - 3.9)' | 'Needs Improvement (2.0 - 2.9)' | 'Unsatisfactory (1.0 - 1.9)';
  nineBoxPosition: NineBoxPosition;
  recommendedSalaryIncrementPct?: number; // e.g. 12%
  promotionRecommended?: boolean;
  recommendedNewTitle?: string;
  completedAt?: string;
}

export interface ReviewCycle {
  id: string;
  name: string;
  quarter: string;
  startDate: string;
  endDate: string;
  status: 'self_review' | 'manager_review' | 'calibration' | 'completed';
  totalAppraisals: number;
  completedAppraisals: number;
  averageScore: number;
}

export type NavTab = 
  | 'self_service'
  | 'company_hub'
  | 'dashboard'
  | 'employees'
  | 'attendance'
  | 'leaves'
  | 'payroll'
  | 'appraisals'
  | 'recruitment'
  | 'onboarding'
  | 'departments'
  | 'org_chart'
  | 'audit';

/* =========================================================
   PHASE 6: RECRUITMENT, TALENT ACQUISITION & ATS
   ========================================================= */

export type JobOpeningStatus = 'draft' | 'active' | 'on_hold' | 'closed';

export type CandidateStage =
  | 'applied'
  | 'screening'
  | 'interviewing'
  | 'offer'
  | 'hired'
  | 'rejected';

export interface CandidateScorecard {
  id: string;
  interviewerName: string;
  interviewerRole: string;
  stageName: string;
  rating: number; // 1 to 5
  recommendation: 'strong_hire' | 'hire' | 'neutral' | 'no_hire';
  technicalCompetency: number;
  culturalAlignment: number;
  communicationSkills: number;
  notes: string;
  submittedAt: string;
}

export interface Candidate {
  id: string;
  jobOpeningId: string;
  jobTitle: string;
  department: string;
  fullName: string;
  email: string;
  phone: string; // Kenyan +254 format
  location: string;
  currentCompany?: string;
  currentRole?: string;
  yearsOfExperience: number;
  education: string;
  expectedSalaryKES: number;
  noticePeriodDays: number;
  source: 'LinkedIn Kenya' | 'BrighterMonday' | 'Employee Referral' | 'Company Careers' | 'Direct Outreach';
  stage: CandidateStage;
  rating: number; // 1 - 5
  resumeUrl?: string;
  appliedDate: string;
  scorecards: CandidateScorecard[];
  notes?: string;
  hiredEmployeeId?: string;
}

export interface JobOpening {
  id: string;
  requisitionCode: string;
  title: string;
  department: string;
  location: string;
  employmentType: EmploymentType;
  experienceLevel: 'Entry-Level' | 'Mid-Level' | 'Senior' | 'Lead / Director';
  minSalaryKES: number;
  maxSalaryKES: number;
  targetHireDate: string;
  openingsCount: number;
  hiredCount: number;
  status: JobOpeningStatus;
  hiringManagerId: string;
  hiringManagerName: string;
  description: string;
  requirements: string[];
  skills: string[];
  createdAt: string;
}

/* =========================================================
   PHASE 7: EMPLOYEE SELF-SERVICE (ESS) & DIGITAL REQUESTS
   ========================================================= */

export type SalaryAdvanceStatus =
  | 'pending'
  | 'manager_approved'
  | 'hr_approved'
  | 'disbursed'
  | 'rejected';

export interface RepaymentInstallment {
  month: string; // e.g. 'October 2026'
  amountKES: number;
  status: 'pending' | 'deducted';
  deductedAt?: string;
  payslipId?: string;
}

export interface SalaryAdvanceRequest {
  id: string;
  requestNumber: string; // e.g. 'ADV-2026-001'
  employeeId: string;
  employeeName: string;
  department: string;
  amountKES: number;
  reason: 'Medical Emergency' | 'School Fees / Tuition' | 'Home Relocation' | 'Vehicle Repair' | 'Family Emergency' | 'Other';
  reasonDetails: string;
  deductionTenureMonths: 1 | 2 | 3;
  monthlyDeductionAmount: number;
  disbursementMethod: 'mpesa' | 'bank_transfer';
  disbursementAccount: string; // Phone number or bank account last 4
  status: SalaryAdvanceStatus;
  maxAllowedAmount: number; // up to 50% of basic salary
  repaymentStatus: 'unpaid' | 'in_repayment' | 'cleared';
  repaymentSchedule: RepaymentInstallment[];
  submittedAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
  rejectionReason?: string;
  comments?: string;
}

export type ExpenseCategory =
  | 'travel_mileage'
  | 'client_entertainment'
  | 'office_supplies'
  | 'training_certifications'
  | 'internet_airtime'
  | 'other';

export type ExpenseStatus = 'pending' | 'approved' | 'reimbursed' | 'rejected';

export interface ExpenseClaim {
  id: string;
  claimNumber: string; // e.g. 'EXP-2026-101'
  employeeId: string;
  employeeName: string;
  department: string;
  category: ExpenseCategory;
  title: string;
  expenseDate: string;
  amountKES: number;
  merchantName: string;
  receiptFileName?: string;
  receiptFileSize?: string;
  justification: string;
  status: ExpenseStatus;
  submittedAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
  rejectionReason?: string;
  reimbursementDate?: string;
  reimbursementMethod?: 'mpesa' | 'bank_transfer' | 'payroll_addition';
}

export type LetterType =
  | 'employment_verification'
  | 'visa_support'
  | 'salary_certificate'
  | 'kra_p9_card'
  | 'bank_loan_support';

export type DocumentLetterStatus = 'pending' | 'ready_for_download' | 'rejected';

export interface DocumentLetterRequest {
  id: string;
  letterNumber: string; // e.g. 'LTR-2026-042'
  employeeId: string;
  employeeName: string;
  department: string;
  letterType: LetterType;
  addressedTo: string; // e.g. 'The Visa Officer, British High Commission Nairobi'
  purpose: string;
  includeCompensationDetails: boolean;
  urgency: 'standard' | 'urgent';
  status: DocumentLetterStatus;
  generatedDocumentContent?: string;
  submittedAt: string;
  completedAt?: string;
  reviewedBy?: string;
  rejectionReason?: string;
}

export type AssetRequestType =
  | 'laptop'
  | 'ergonomic_chair'
  | 'external_monitor'
  | 'noise_cancelling_headset'
  | 'mobile_device'
  | 'software_license';

export type AssetRequestStatus = 'pending' | 'approved' | 'fulfilled' | 'rejected';

export interface AssetRequest {
  id: string;
  requestNumber: string; // e.g. 'AST-2026-088'
  employeeId: string;
  employeeName: string;
  department: string;
  assetType: AssetRequestType;
  itemName: string;
  reason: string;
  urgency: 'low' | 'medium' | 'high';
  status: AssetRequestStatus;
  submittedAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
  adminNotes?: string;
  fulfilledDate?: string;
}

export type ProfileUpdateType =
  | 'emergency_contact'
  | 'bank_details'
  | 'residential_address'
  | 'phone_mpesa';

export type ProfileUpdateStatus = 'pending' | 'approved' | 'rejected';

export interface ProfileUpdateRequest {
  id: string;
  requestNumber: string; // e.g. 'PRF-2026-019'
  employeeId: string;
  employeeName: string;
  department: string;
  updateType: ProfileUpdateType;
  proposedChanges: Record<string, string>;
  currentValues: Record<string, string>;
  reason: string;
  status: ProfileUpdateStatus;
  submittedAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
  rejectionReason?: string;
}

export type DigitalRequestType = 'salary_advance' | 'expense' | 'letter' | 'asset' | 'profile_update';

export interface UnifiedDigitalRequest {
  id: string;
  requestNumber: string;
  type: DigitalRequestType;
  categoryLabel: string;
  employeeId: string;
  employeeName: string;
  department: string;
  title: string;
  amountKES?: number;
  status: string; // unified display status
  badgeVariant: 'warning' | 'success' | 'danger' | 'info';
  submittedAt: string;
  details: string;
  rawRequest: SalaryAdvanceRequest | ExpenseClaim | DocumentLetterRequest | AssetRequest | ProfileUpdateRequest;
}

/* =========================================================
   COMMUNICATIONS & COMPANY HUB
   ========================================================= */

export type AnnouncementCategory = 'company_update' | 'event' | 'policy' | 'celebration' | 'alert';

export interface Announcement {
  id: string;
  title: string;
  category: AnnouncementCategory;
  content: string;
  authorName: string;
  authorRole: string;
  authorAvatar: string;
  department?: string;
  publishedAt: string;
  isPinned: boolean;
  priority: 'normal' | 'important' | 'urgent';
  reactions: { [emoji: string]: number };
  userReacted?: { [emoji: string]: boolean };
}

export type PolicyCategory = 'hr_policy' | 'code_of_conduct' | 'it_security' | 'compensation' | 'health_safety';

export interface PolicyDocument {
  id: string;
  title: string;
  category: PolicyCategory;
  categoryLabel: string;
  description: string;
  version: string;
  effectiveDate: string;
  lastUpdated: string;
  fileSize: string;
  format: 'PDF' | 'DOCX';
  readTime: string;
  mandatoryAcknowledgement: boolean;
  contentSections: { title: string; content: string }[];
}

export interface CompanyEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  time: string; // e.g. "14:00 - 16:30 EAT"
  location: string; // e.g. "Main Boardroom / Google Meet"
  organizer: string;
  description: string;
  type: 'town_hall' | 'social' | 'training' | 'wellness';
  attendeeCount: number;
}

/* =========================================================
   AUTHENTICATION & MULTI-TENANCY TYPES
   ========================================================= */

export interface UserSession {
  email: string;
  name: string;
  companyName: string;
  role: 'super_admin' | 'hr_manager' | 'department_lead' | 'employee';
  isDemoAdmin: boolean;
  tenantId: string;
}

export interface RegisteredUserAccount {
  id: string;
  name: string;
  email: string;
  password: string;
  companyName: string;
  role: 'super_admin';
  tenantId: string;
  createdAt: string;
}



