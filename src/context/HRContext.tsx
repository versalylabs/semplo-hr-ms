/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  AttendancePunch,
  AttendanceRecord,
  AttendanceStatus,
  AuditLogEntry,
  Department,
  Employee,
  EmployeeStatus,
  KenyanPublicHoliday,
  LeaveBalance,
  LeaveRequest,
  LeaveStatus,
  LeaveType,
  NavTab,
  OffboardingRecord,
  OffboardingAsset,
  OnboardingRecord,
  OnboardingTaskItem,
  OnboardingTask,
  PayrollCycle,
  Payslip,
  Persona,
  PunchType,
  ShiftSchedule,
  AppraisalRecord,
  NineBoxPosition,
  OKRGoal,
  ReviewCycle,
  Candidate,
  CandidateScorecard,
  JobOpening,
  SalaryAdvanceRequest,
  RepaymentInstallment,
  ExpenseClaim,
  DocumentLetterRequest,
  AssetRequest,
  ProfileUpdateRequest,
  Announcement,
  PolicyDocument,
  CompanyEvent,
  UserSession,
  RegisteredUserAccount,
} from '../types/hr';
import {
  generatePayrollCycle,
  generateEmployeePayslip,
  buildSalaryBreakdown,
  buildVoluntaryDeductions,
  calculateKenyanStatutoryDeductions,
  amountToKenyanWords,
} from '../utils/kenyanPayroll';
import {
  INITIAL_ATTENDANCE,
  INITIAL_AUDIT_LOGS,
  INITIAL_DEPARTMENTS,
  INITIAL_EMPLOYEES,
  INITIAL_LEAVE_REQUESTS,
  INITIAL_OFFBOARDING,
  INITIAL_ONBOARDING,
  INITIAL_PERSONAS,
  INITIAL_SHIFTS,
  INITIAL_REVIEW_CYCLES,
  INITIAL_OKRS,
  INITIAL_APPRAISALS,
  INITIAL_JOB_OPENINGS,
  INITIAL_CANDIDATES,
  INITIAL_SALARY_ADVANCES,
  INITIAL_EXPENSE_CLAIMS,
  INITIAL_DOCUMENT_LETTERS,
  INITIAL_ASSET_REQUESTS,
  INITIAL_PROFILE_UPDATES,
  INITIAL_ANNOUNCEMENTS,
  INITIAL_POLICY_DOCUMENTS,
  INITIAL_COMPANY_EVENTS,
  KENYAN_LEAVE_TYPES_CONFIG,
  KENYAN_PUBLIC_HOLIDAYS,
} from '../data/initialData';

interface HRContextType {
  // Session & Personas
  activePersona: Persona;
  setActivePersona: (p: Persona) => void;
  personas: Persona[];

  // Navigation & Search
  currentTab: NavTab;
  setCurrentTab: (tab: NavTab) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedEmployee: Employee | null;
  setSelectedEmployee: (emp: Employee | null) => void;

  // Modals & Drawers
  isAddModalOpen: boolean;
  setIsAddModalOpen: (open: boolean) => void;
  isCommandPaletteOpen: boolean;
  setIsCommandPaletteOpen: (open: boolean) => void;
  isMobileSidebarOpen: boolean;
  setIsMobileSidebarOpen: (open: boolean) => void;

  // Entities
  employees: Employee[];
  departments: Department[];
  onboardingRecords: OnboardingRecord[];
  offboardingRecords: OffboardingRecord[];
  auditLogs: AuditLogEntry[];

  // Attendance & Shifts
  attendanceRecords: AttendanceRecord[];
  shifts: ShiftSchedule[];
  holidays: KenyanPublicHoliday[];
  userTodayAttendance: AttendanceRecord | undefined;

  // Punch actions
  clockIn: (employeeId: string, location?: string) => void;
  clockOut: (employeeId: string, location?: string) => void;
  toggleBreak: (employeeId: string) => void;

  // Leave Management
  leaveRequests: LeaveRequest[];
  submitLeaveRequest: (req: Omit<LeaveRequest, 'id' | 'appliedDate' | 'status'>) => void;
  reviewLeaveRequest: (requestId: string, status: 'approved' | 'rejected', comments?: string) => void;
  getEmployeeLeaveBalances: (employeeId: string) => LeaveBalance[];

  // Core Employee Actions
  addEmployee: (employeeData: Omit<Employee, 'id' | 'employeeCode'>) => Employee;
  updateEmployee: (id: string, updates: Partial<Employee>) => void;
  deleteEmployee: (id: string) => void;
  updateEmployeeStatus: (id: string, status: EmployeeStatus) => void;

  // Department Management (CRUD)
  addDepartment: (dept: Omit<Department, 'id'>) => Department;
  updateDepartment: (id: string, updates: Partial<Department>) => void;
  deleteDepartment: (id: string) => void;

  // Lifecycle Pipelines (Onboarding & Offboarding CRUD)
  toggleOnboardingTask: (recordId: string, taskId: string) => void;
  addOnboardingRecord: (employeeId: string, mentorName: string) => void;
  updateOnboardingRecord: (id: string, updates: Partial<OnboardingRecord>) => void;
  deleteOnboardingRecord: (id: string) => void;
  addOnboardingTask: (recordId: string, task: Omit<OnboardingTask, 'id' | 'isCompleted'>) => void;
  deleteOnboardingTask: (recordId: string, taskId: string) => void;
  toggleOffboardingAsset: (recordId: string, assetId: string) => void;
  toggleOffboardingClearance: (recordId: string, department: string) => void;
  initiateOffboarding: (employeeId: string, reason: string, lastWorkingDate: string) => void;
  updateOffboardingRecord: (id: string, updates: Partial<OffboardingRecord>) => void;
  deleteOffboardingRecord: (id: string) => void;
  addOffboardingAsset: (recordId: string, assetName: string, category: string) => void;
  deleteOffboardingAsset: (recordId: string, assetId: string) => void;

  // Phase 4: Payroll & Kenyan Statutory Remittances
  payrollCycles: PayrollCycle[];
  selectedPayrollCycleId: string;
  setSelectedPayrollCycleId: (id: string) => void;
  selectedPayslip: Payslip | null;
  setSelectedPayslip: (payslip: Payslip | null) => void;
  isPayslipModalOpen: boolean;
  setIsPayslipModalOpen: (open: boolean) => void;
  runPayrollCalculation: (cycleId: string) => void;
  approvePayrollCycle: (cycleId: string) => void;
  disbursePayrollCycle: (cycleId: string) => void;
  updatePayslipEarnings: (payslipId: string, bonus: number, overtimePay: number) => void;
  getCurrentEmployeePayslip: (employeeId?: string) => Payslip | undefined;

  // Phase 5: Performance Appraisal, OKRs & Talent Matrix
  reviewCycles: ReviewCycle[];
  selectedReviewCycleId: string;
  setSelectedReviewCycleId: (id: string) => void;
  appraisals: AppraisalRecord[];
  okrGoals: OKRGoal[];
  submitSelfAppraisal: (
    appraisalId: string,
    competencyScores: { [id: string]: number },
    summary: string
  ) => void;
  submitManagerEvaluation: (
    appraisalId: string,
    competencyScores: { [id: string]: number },
    summary: string,
    nineBox: NineBoxPosition,
    salaryBumpPct?: number,
    promotion?: boolean,
    newTitle?: string
  ) => void;
  calibrateAppraisal: (
    appraisalId: string,
    finalGrade: AppraisalRecord['finalGrade']
  ) => void;
  addOKRGoal: (goal: Omit<OKRGoal, 'id'>) => void;
  updateOKRProgress: (goalId: string, progress: number, status: OKRGoal['status']) => void;

  // Phase 6: Recruitment & ATS
  jobOpenings: JobOpening[];
  candidates: Candidate[];
  selectedJobOpeningId: string | null;
  setSelectedJobOpeningId: (id: string | null) => void;
  selectedCandidate: Candidate | null;
  setSelectedCandidate: (candidate: Candidate | null) => void;
  addJobOpening: (job: Omit<JobOpening, 'id' | 'createdAt' | 'requisitionCode' | 'hiredCount'>) => void;
  updateJobOpeningStatus: (id: string, status: JobOpening['status']) => void;
  addCandidate: (candidate: Omit<Candidate, 'id' | 'appliedDate' | 'scorecards'>) => void;
  updateCandidateStage: (candidateId: string, newStage: Candidate['stage']) => void;
  addCandidateScorecard: (candidateId: string, scorecard: Omit<CandidateScorecard, 'id' | 'submittedAt'>) => void;
  hireCandidate: (
    candidateId: string,
    options?: { baseSalary?: number; joiningDate?: string; managerId?: string; bankName?: string }
  ) => Employee | undefined;

  // Phase 6: Employee Self-Service (ESS) & Communications
  salaryAdvances: SalaryAdvanceRequest[];
  expenseClaims: ExpenseClaim[];
  documentLetters: DocumentLetterRequest[];
  assetRequests: AssetRequest[];
  profileUpdates: ProfileUpdateRequest[];
  announcements: Announcement[];
  policyDocuments: PolicyDocument[];
  companyEvents: CompanyEvent[];
  submitSalaryAdvance: (advance: Omit<SalaryAdvanceRequest, 'id' | 'requestNumber' | 'status' | 'repaymentStatus' | 'submittedAt' | 'repaymentSchedule'>) => void;
  reviewSalaryAdvance: (id: string, status: SalaryAdvanceRequest['status'], comments?: string) => void;
  submitExpenseClaim: (claim: Omit<ExpenseClaim, 'id' | 'claimNumber' | 'status' | 'submittedAt'>) => void;
  reviewExpenseClaim: (id: string, status: ExpenseClaim['status'], reimbursementMethod?: ExpenseClaim['reimbursementMethod'], rejectionReason?: string) => void;
  submitDocumentLetter: (letter: Omit<DocumentLetterRequest, 'id' | 'letterNumber' | 'status' | 'submittedAt'>) => void;
  reviewDocumentLetter: (id: string, status: DocumentLetterRequest['status'], generatedContent?: string, rejectionReason?: string) => void;
  submitAssetRequest: (req: Omit<AssetRequest, 'id' | 'requestNumber' | 'status' | 'submittedAt'>) => void;
  reviewAssetRequest: (id: string, status: AssetRequest['status'], adminNotes?: string) => void;
  submitProfileUpdate: (req: Omit<ProfileUpdateRequest, 'id' | 'requestNumber' | 'status' | 'submittedAt'>) => void;
  reviewProfileUpdate: (id: string, status: ProfileUpdateRequest['status'], rejectionReason?: string) => void;
  addAnnouncement: (ann: Omit<Announcement, 'id' | 'publishedAt' | 'reactions'>) => void;
  deleteAnnouncement: (id: string) => void;
  toggleAnnouncementReaction: (id: string, emoji: string) => void;
  addCompanyEvent: (event: Omit<CompanyEvent, 'id'>) => void;

  // Authentication & Multi-Tenancy
  isAuthenticated: boolean;
  currentUser: UserSession | null;
  login: (email: string, password: string) => { success: boolean; error?: string };
  register: (name: string, companyName: string, email: string, password: string) => { success: boolean; error?: string };
  logout: () => void;

  // Utilities
  resetAllData: () => void;
  canPerformAction: (requiredRole: 'super_admin' | 'hr_manager' | 'department_lead') => boolean;
}

const HRContext = createContext<HRContextType | undefined>(undefined);

const STORAGE_KEYS = {
  EMPLOYEES_KENYA: 'semplo_kenya_employees_v2',
  DEPARTMENTS_KENYA: 'semplo_kenya_departments_v2',
  ONBOARDING_KENYA: 'semplo_kenya_onboarding_v2',
  OFFBOARDING_KENYA: 'semplo_kenya_offboarding_v2',
  AUDIT_KENYA: 'semplo_kenya_audit_v2',
  PERSONA_KENYA: 'semplo_kenya_persona_v2',
  ATTENDANCE_KENYA: 'semplo_kenya_attendance_v2',
  LEAVE_KENYA: 'semplo_kenya_leaves_v2',
  PAYROLL_KENYA: 'semplo_kenya_payroll_v2',
  APPRAISALS_KENYA: 'semplo_kenya_appraisals_v2',
  OKRS_KENYA: 'semplo_kenya_okrs_v2',
  CYCLES_KENYA: 'semplo_kenya_cycles_v2',
  JOB_OPENINGS_KENYA: 'semplo_kenya_job_openings_v2',
  CANDIDATES_KENYA: 'semplo_kenya_candidates_v2',
  SALARY_ADVANCES_KENYA: 'semplo_kenya_advances_v2',
  EXPENSE_CLAIMS_KENYA: 'semplo_kenya_expenses_v2',
  DOCUMENT_LETTERS_KENYA: 'semplo_kenya_letters_v2',
  ASSET_REQUESTS_KENYA: 'semplo_kenya_assets_v2',
  PROFILE_UPDATES_KENYA: 'semplo_kenya_profile_updates_v2',
  ANNOUNCEMENTS_KENYA: 'semplo_kenya_announcements_v2',
  POLICY_DOCUMENTS_KENYA: 'semplo_kenya_policies_v2',
  COMPANY_EVENTS_KENYA: 'semplo_kenya_events_v2',
};

export const HRProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserSession | null>(() => {
    try {
      const saved = localStorage.getItem('semplo_auth_session');
      if (saved) return JSON.parse(saved);
    } catch {}
    return null;
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      return !!localStorage.getItem('semplo_auth_session');
    } catch {
      return false;
    }
  });

  const isDemo = !currentUser || currentUser.isDemoAdmin;
  const tenantRawData: Record<string, any> = (() => {
    if (!isDemo && currentUser?.tenantId) {
      try {
        const raw = localStorage.getItem(`semplo_tenant_data_${currentUser.tenantId}`);
        if (raw) return JSON.parse(raw);
      } catch {}
    }
    return {};
  })();

  const getEntity = <T,>(storageKey: string, tenantKey: string, demoDefault: T, tenantFallback: T = [] as unknown as T): T => {
    if (!isDemo) {
      if (tenantRawData[tenantKey] !== undefined) {
        return tenantRawData[tenantKey];
      }
      return tenantFallback;
    }
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) return JSON.parse(saved);
    } catch {}
    return demoDefault;
  };

  const defaultAdminPersona: Persona = currentUser && !currentUser.isDemoAdmin
    ? {
        id: `persona_${currentUser.tenantId || 'admin'}`,
        name: currentUser.name,
        email: currentUser.email,
        role: 'super_admin',
        roleLabel: 'Super Admin',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        employeeId: 'emp_admin',
        jobTitle: 'Super Admin',
        department: 'Administration',
      }
    : INITIAL_PERSONAS[0];

  const [personas, setPersonas] = useState<Persona[]>(() => {
    if (!isDemo) return [defaultAdminPersona];
    return INITIAL_PERSONAS;
  });

  const [shifts] = useState<ShiftSchedule[]>(INITIAL_SHIFTS);
  const [holidays] = useState<KenyanPublicHoliday[]>(KENYAN_PUBLIC_HOLIDAYS);

  const [activePersona, setActivePersonaState] = useState<Persona>(() => {
    if (!isDemo) return defaultAdminPersona;
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PERSONA_KENYA);
      if (saved) {
        const parsed = JSON.parse(saved);
        const match = INITIAL_PERSONAS.find((p) => p.id === parsed.id);
        if (match) return match;
      }
    } catch {}
    return INITIAL_PERSONAS[0];
  });

  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Entities state - Clean empty slate for custom users, rich initial data for demo admin
  const [employees, setEmployees] = useState<Employee[]>(() =>
    getEntity(STORAGE_KEYS.EMPLOYEES_KENYA, 'employees', INITIAL_EMPLOYEES, [])
  );

  const [departments, setDepartments] = useState<Department[]>(() =>
    getEntity(STORAGE_KEYS.DEPARTMENTS_KENYA, 'departments', INITIAL_DEPARTMENTS, [])
  );

  const [onboardingRecords, setOnboardingRecords] = useState<OnboardingRecord[]>(() =>
    getEntity(STORAGE_KEYS.ONBOARDING_KENYA, 'onboardingRecords', INITIAL_ONBOARDING, [])
  );

  const [offboardingRecords, setOffboardingRecords] = useState<OffboardingRecord[]>(() =>
    getEntity(STORAGE_KEYS.OFFBOARDING_KENYA, 'offboardingRecords', INITIAL_OFFBOARDING, [])
  );

  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(() =>
    getEntity(STORAGE_KEYS.ATTENDANCE_KENYA, 'attendanceRecords', INITIAL_ATTENDANCE, [])
  );

  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>(() =>
    getEntity(STORAGE_KEYS.LEAVE_KENYA, 'leaveRequests', INITIAL_LEAVE_REQUESTS, [])
  );

  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(() =>
    getEntity(STORAGE_KEYS.AUDIT_KENYA, 'auditLogs', INITIAL_AUDIT_LOGS, [])
  );

  // Phase 4: Kenyan Payroll state
  const [payrollCycles, setPayrollCycles] = useState<PayrollCycle[]>(() => {
    if (!isDemo) {
      return tenantRawData.payrollCycles !== undefined ? tenantRawData.payrollCycles : [];
    }
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PAYROLL_KENYA);
      if (saved) return JSON.parse(saved);
    } catch {}
    const initialEmployees = INITIAL_EMPLOYEES;
    const sepCycle = generatePayrollCycle('cycle_2026_09', 'September 2026', initialEmployees, 'calculated');
    const augCycle = generatePayrollCycle('cycle_2026_08', 'August 2026', initialEmployees, 'disbursed');
    return [sepCycle, augCycle];
  });

  const [selectedPayrollCycleId, setSelectedPayrollCycleId] = useState<string>('cycle_2026_09');
  const [selectedPayslip, setSelectedPayslip] = useState<Payslip | null>(null);
  const [isPayslipModalOpen, setIsPayslipModalOpen] = useState<boolean>(false);

  // Phase 5: Appraisals, OKRs & Review Cycles state
  const [reviewCycles, setReviewCycles] = useState<ReviewCycle[]>(() =>
    getEntity(STORAGE_KEYS.CYCLES_KENYA, 'reviewCycles', INITIAL_REVIEW_CYCLES, [])
  );

  const [selectedReviewCycleId, setSelectedReviewCycleId] = useState<string>('cycle_q3_2026');

  const [appraisals, setAppraisals] = useState<AppraisalRecord[]>(() =>
    getEntity(STORAGE_KEYS.APPRAISALS_KENYA, 'appraisals', INITIAL_APPRAISALS, [])
  );

  const [okrGoals, setOkrGoals] = useState<OKRGoal[]>(() =>
    getEntity(STORAGE_KEYS.OKRS_KENYA, 'okrGoals', INITIAL_OKRS, [])
  );

  // Phase 6: Recruitment & ATS state
  const [jobOpenings, setJobOpenings] = useState<JobOpening[]>(() =>
    getEntity(STORAGE_KEYS.JOB_OPENINGS_KENYA, 'jobOpenings', INITIAL_JOB_OPENINGS, [])
  );

  const [candidates, setCandidates] = useState<Candidate[]>(() =>
    getEntity(STORAGE_KEYS.CANDIDATES_KENYA, 'candidates', INITIAL_CANDIDATES, [])
  );

  const [selectedJobOpeningId, setSelectedJobOpeningId] = useState<string | null>(null);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);

  // Phase 6: ESS & Communications state
  const [salaryAdvances, setSalaryAdvances] = useState<SalaryAdvanceRequest[]>(() =>
    getEntity(STORAGE_KEYS.SALARY_ADVANCES_KENYA, 'salaryAdvances', INITIAL_SALARY_ADVANCES, [])
  );

  const [expenseClaims, setExpenseClaims] = useState<ExpenseClaim[]>(() =>
    getEntity(STORAGE_KEYS.EXPENSE_CLAIMS_KENYA, 'expenseClaims', INITIAL_EXPENSE_CLAIMS, [])
  );

  const [documentLetters, setDocumentLetters] = useState<DocumentLetterRequest[]>(() =>
    getEntity(STORAGE_KEYS.DOCUMENT_LETTERS_KENYA, 'documentLetters', INITIAL_DOCUMENT_LETTERS, [])
  );

  const [assetRequests, setAssetRequests] = useState<AssetRequest[]>(() =>
    getEntity(STORAGE_KEYS.ASSET_REQUESTS_KENYA, 'assetRequests', INITIAL_ASSET_REQUESTS, [])
  );

  const [profileUpdates, setProfileUpdates] = useState<ProfileUpdateRequest[]>(() =>
    getEntity(STORAGE_KEYS.PROFILE_UPDATES_KENYA, 'profileUpdates', INITIAL_PROFILE_UPDATES, [])
  );

  const [announcements, setAnnouncements] = useState<Announcement[]>(() =>
    getEntity(STORAGE_KEYS.ANNOUNCEMENTS_KENYA, 'announcements', INITIAL_ANNOUNCEMENTS, [])
  );

  const [policyDocuments, setPolicyDocuments] = useState<PolicyDocument[]>(() =>
    getEntity(STORAGE_KEYS.POLICY_DOCUMENTS_KENYA, 'policyDocuments', INITIAL_POLICY_DOCUMENTS, [])
  );

  const [companyEvents, setCompanyEvents] = useState<CompanyEvent[]>(() =>
    getEntity(STORAGE_KEYS.COMPANY_EVENTS_KENYA, 'companyEvents', INITIAL_COMPANY_EVENTS, [])
  );

  // Local storage persistence: separate custom tenant storage from demo admin storage
  useEffect(() => {
    if (currentUser && !currentUser.isDemoAdmin && currentUser.tenantId) {
      const tenantPayload = {
        employees,
        departments,
        onboardingRecords,
        offboardingRecords,
        attendanceRecords,
        leaveRequests,
        auditLogs,
        payrollCycles,
        reviewCycles,
        appraisals,
        okrGoals,
        jobOpenings,
        candidates,
        salaryAdvances,
        expenseClaims,
        documentLetters,
        assetRequests,
        profileUpdates,
        announcements,
        policyDocuments,
        companyEvents,
        activePersona,
      };
      localStorage.setItem(`semplo_tenant_data_${currentUser.tenantId}`, JSON.stringify(tenantPayload));
    } else if (isDemo) {
      localStorage.setItem(STORAGE_KEYS.EMPLOYEES_KENYA, JSON.stringify(employees));
      localStorage.setItem(STORAGE_KEYS.DEPARTMENTS_KENYA, JSON.stringify(departments));
      localStorage.setItem(STORAGE_KEYS.ONBOARDING_KENYA, JSON.stringify(onboardingRecords));
      localStorage.setItem(STORAGE_KEYS.OFFBOARDING_KENYA, JSON.stringify(offboardingRecords));
      localStorage.setItem(STORAGE_KEYS.ATTENDANCE_KENYA, JSON.stringify(attendanceRecords));
      localStorage.setItem(STORAGE_KEYS.LEAVE_KENYA, JSON.stringify(leaveRequests));
      localStorage.setItem(STORAGE_KEYS.AUDIT_KENYA, JSON.stringify(auditLogs));
      localStorage.setItem(STORAGE_KEYS.PAYROLL_KENYA, JSON.stringify(payrollCycles));
      localStorage.setItem(STORAGE_KEYS.CYCLES_KENYA, JSON.stringify(reviewCycles));
      localStorage.setItem(STORAGE_KEYS.APPRAISALS_KENYA, JSON.stringify(appraisals));
      localStorage.setItem(STORAGE_KEYS.OKRS_KENYA, JSON.stringify(okrGoals));
      localStorage.setItem(STORAGE_KEYS.JOB_OPENINGS_KENYA, JSON.stringify(jobOpenings));
      localStorage.setItem(STORAGE_KEYS.CANDIDATES_KENYA, JSON.stringify(candidates));
      localStorage.setItem(STORAGE_KEYS.SALARY_ADVANCES_KENYA, JSON.stringify(salaryAdvances));
      localStorage.setItem(STORAGE_KEYS.EXPENSE_CLAIMS_KENYA, JSON.stringify(expenseClaims));
      localStorage.setItem(STORAGE_KEYS.DOCUMENT_LETTERS_KENYA, JSON.stringify(documentLetters));
      localStorage.setItem(STORAGE_KEYS.ASSET_REQUESTS_KENYA, JSON.stringify(assetRequests));
      localStorage.setItem(STORAGE_KEYS.PROFILE_UPDATES_KENYA, JSON.stringify(profileUpdates));
      localStorage.setItem(STORAGE_KEYS.ANNOUNCEMENTS_KENYA, JSON.stringify(announcements));
      localStorage.setItem(STORAGE_KEYS.POLICY_DOCUMENTS_KENYA, JSON.stringify(policyDocuments));
      localStorage.setItem(STORAGE_KEYS.COMPANY_EVENTS_KENYA, JSON.stringify(companyEvents));
      localStorage.setItem(STORAGE_KEYS.PERSONA_KENYA, JSON.stringify(activePersona));
    }
  }, [
    currentUser,
    isDemo,
    employees,
    departments,
    onboardingRecords,
    offboardingRecords,
    attendanceRecords,
    leaveRequests,
    auditLogs,
    payrollCycles,
    reviewCycles,
    appraisals,
    okrGoals,
    jobOpenings,
    candidates,
    salaryAdvances,
    expenseClaims,
    documentLetters,
    assetRequests,
    profileUpdates,
    announcements,
    policyDocuments,
    companyEvents,
    activePersona,
  ]);

  // Global shortcut for Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const setActivePersona = (p: Persona) => {
    setActivePersonaState(p);
  };

  const addAuditEntry = (
    actionType: AuditLogEntry['actionType'],
    entityType: AuditLogEntry['entityType'],
    description: string
  ) => {
    const now = new Date();
    const formatted = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
      now.getDate()
    ).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const newLog: AuditLogEntry = {
      id: `log_${Date.now()}`,
      timestamp: formatted,
      actorName: activePersona.name,
      actorRole: activePersona.role,
      actionType,
      entityType,
      description,
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  const canPerformAction = (requiredRole: 'super_admin' | 'hr_manager' | 'department_lead'): boolean => {
    if (activePersona.role === 'super_admin') return true;
    if (requiredRole === 'hr_manager' && activePersona.role === 'hr_manager') return true;
    if (
      requiredRole === 'department_lead' &&
      (activePersona.role === 'hr_manager' || activePersona.role === 'department_lead')
    ) {
      return true;
    }
    return false;
  };

  /* =========================================================
     ATTENDANCE ACTIONS
     ========================================================= */

  const todayStr = '2026-09-25'; // Fixed context date matching the system local time

  const userTodayAttendance = attendanceRecords.find(
    (att) => att.employeeId === activePersona.employeeId && att.date === todayStr
  );

  const clockIn = (employeeId: string, location: string = 'Nairobi HQ - Upper Hill Turnstile') => {
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(
      2,
      '0'
    )}:${String(now.getSeconds()).padStart(2, '0')}`;

    const emp = employees.find((e) => e.id === employeeId);

    setAttendanceRecords((prev) => {
      const existing = prev.find((a) => a.employeeId === employeeId && a.date === todayStr);
      if (existing) {
        if (existing.clockIn && !existing.clockOut) return prev; // already actively clocked in
        return prev.map((a) =>
          a.id === existing.id
            ? {
                ...a,
                clockIn: timeStr,
                clockOut: undefined,
                status: 'present',
                punches: [
                  ...a.punches,
                  {
                    id: `p_${Date.now()}`,
                    timestamp: timeStr,
                    type: 'clock_in',
                    location,
                    device: 'Web App / Terminal',
                    verified: true,
                  },
                ],
              }
            : a
        );
      }

      const newRecord: AttendanceRecord = {
        id: `att_${Date.now()}`,
        employeeId,
        date: todayStr,
        status: 'present',
        shiftName: 'Nairobi Standard (HQ)',
        clockIn: timeStr,
        totalWorkMinutes: 480,
        breakMinutes: 0,
        overtimeMinutes: 0,
        isLate: false,
        lateMinutes: 0,
        punches: [
          {
            id: `p_${Date.now()}`,
            timestamp: timeStr,
            type: 'clock_in',
            location,
            device: 'Web App / Terminal',
            verified: true,
          },
        ],
      };
      return [newRecord, ...prev];
    });

    addAuditEntry(
      'attendance',
      'attendance',
      `${emp?.firstName || 'Employee'} clocked in at ${timeStr} (${location})`
    );
  };

  const clockOut = (employeeId: string, location: string = 'Nairobi HQ - Upper Hill Turnstile') => {
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(
      2,
      '0'
    )}:${String(now.getSeconds()).padStart(2, '0')}`;

    const emp = employees.find((e) => e.id === employeeId);

    setAttendanceRecords((prev) =>
      prev.map((a) => {
        if (a.employeeId === employeeId && a.date === todayStr) {
          return {
            ...a,
            clockOut: timeStr,
            punches: [
              ...a.punches,
              {
                id: `p_${Date.now()}`,
                timestamp: timeStr,
                type: 'clock_out',
                location,
                device: 'Web App / Terminal',
                verified: true,
              },
            ],
          };
        }
        return a;
      })
    );

    addAuditEntry(
      'attendance',
      'attendance',
      `${emp?.firstName || 'Employee'} clocked out at ${timeStr} (${location})`
    );
  };

  const toggleBreak = (employeeId: string) => {
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(
      2,
      '0'
    )}:${String(now.getSeconds()).padStart(2, '0')}`;

    setAttendanceRecords((prev) =>
      prev.map((a) => {
        if (a.employeeId === employeeId && a.date === todayStr) {
          const lastPunch = a.punches[a.punches.length - 1];
          const isCurrentlyOnBreak = lastPunch?.type === 'break_start';
          const punchType: PunchType = isCurrentlyOnBreak ? 'break_end' : 'break_start';

          return {
            ...a,
            breakMinutes: isCurrentlyOnBreak ? a.breakMinutes + 30 : a.breakMinutes,
            punches: [
              ...a.punches,
              {
                id: `p_${Date.now()}`,
                timestamp: timeStr,
                type: punchType,
                location: 'Staff Break Lounge',
                device: 'Web App',
                verified: true,
              },
            ],
          };
        }
        return a;
      })
    );
  };

  /* =========================================================
     LEAVE ACTIONS (KENYAN LABOR ACT COMPLIANCE)
     ========================================================= */

  const submitLeaveRequest = (req: Omit<LeaveRequest, 'id' | 'appliedDate' | 'status'>) => {
    const newReq: LeaveRequest = {
      ...req,
      id: `leave_${Date.now()}`,
      appliedDate: todayStr,
      status: 'pending',
    };

    setLeaveRequests((prev) => [newReq, ...prev]);

    addAuditEntry(
      'leave',
      'leave',
      `Submitted ${req.leaveType} leave request for ${req.employeeName} (${req.daysCount} days: ${req.startDate} to ${req.endDate})`
    );
  };

  const reviewLeaveRequest = (
    requestId: string,
    status: 'approved' | 'rejected',
    comments?: string
  ) => {
    const target = leaveRequests.find((r) => r.id === requestId);
    if (!target) return;

    setLeaveRequests((prev) =>
      prev.map((r) =>
        r.id === requestId
          ? {
              ...r,
              status,
              reviewedBy: activePersona.name,
              reviewedDate: todayStr,
              reviewerComments: comments || (status === 'approved' ? 'Approved by HR Lead' : 'Declined'),
            }
          : r
      )
    );

    // If approved, sync with employee status if starting today
    if (status === 'approved' && target.startDate <= todayStr && target.endDate >= todayStr) {
      updateEmployeeStatus(target.employeeId, 'on_leave');
    }

    addAuditEntry(
      'leave',
      'leave',
      `${status === 'approved' ? 'Approved' : 'Rejected'} leave application for ${target.employeeName} by ${activePersona.name}`
    );
  };

  const getEmployeeLeaveBalances = (employeeId: string): LeaveBalance[] => {
    return KENYAN_LEAVE_TYPES_CONFIG.map((conf) => {
      const approvedDays = leaveRequests
        .filter((r) => r.employeeId === employeeId && r.leaveType === conf.type && r.status === 'approved')
        .reduce((sum, r) => sum + r.daysCount, 0);

      const pendingDays = leaveRequests
        .filter((r) => r.employeeId === employeeId && r.leaveType === conf.type && r.status === 'pending')
        .reduce((sum, r) => sum + r.daysCount, 0);

      const available = Math.max(0, conf.defaultEntitlement - approvedDays);

      return {
        leaveType: conf.type,
        label: conf.label,
        totalEntitlement: conf.defaultEntitlement,
        usedDays: approvedDays,
        pendingDays,
        availableDays: available,
      };
    });
  };

  /* =========================================================
     EMPLOYEE LIFECYCLE MANAGEMENT
     ========================================================= */

  const addEmployee = (employeeData: Omit<Employee, 'id' | 'employeeCode'>): Employee => {
    const nextNum = employees.length + 1001;
    const newId = `emp_${Date.now()}`;
    const code = `EMP-${nextNum}`;

    const newEmp: Employee = {
      ...employeeData,
      id: newId,
      employeeCode: code,
    };

    setEmployees((prev) => [newEmp, ...prev]);

    setDepartments((prev) =>
      prev.map((d) => (d.name === newEmp.department ? { ...d, headcount: d.headcount + 1 } : d))
    );

    addAuditEntry(
      'create',
      'employee',
      `Registered employee ${newEmp.firstName} ${newEmp.lastName} (${code}) in ${newEmp.department}`
    );

    return newEmp;
  };

  const updateEmployee = (id: string, updates: Partial<Employee>) => {
    setEmployees((prev) =>
      prev.map((emp) => {
        if (emp.id === id) {
          return { ...emp, ...updates };
        }
        return emp;
      })
    );

    const emp = employees.find((e) => e.id === id);
    if (emp) {
      addAuditEntry(
        'update',
        'employee',
        `Updated profile details for ${emp.firstName} ${emp.lastName} (${emp.employeeCode})`
      );
      if (selectedEmployee?.id === id) {
        setSelectedEmployee({ ...emp, ...updates });
      }
    }
  };

  const updateEmployeeStatus = (id: string, status: EmployeeStatus) => {
    const emp = employees.find((e) => e.id === id);
    if (!emp) return;

    setEmployees((prev) => prev.map((item) => (item.id === id ? { ...item, status } : item)));

    if (selectedEmployee?.id === id) {
      setSelectedEmployee((prev) => (prev ? { ...prev, status } : null));
    }

    addAuditEntry(
      'status_change',
      'employee',
      `Changed status of ${emp.firstName} ${emp.lastName} (${emp.employeeCode}) from '${emp.status}' to '${status}'`
    );
  };

  const deleteEmployee = (id: string) => {
    const emp = employees.find((e) => e.id === id);
    if (!emp) return;

    setEmployees((prev) => prev.filter((item) => item.id !== id));
    setOnboardingRecords((prev) => prev.filter((r) => r.employeeId !== id));
    setOffboardingRecords((prev) => prev.filter((r) => r.employeeId !== id));
    setAttendanceRecords((prev) => prev.filter((a) => a.employeeId !== id));
    setLeaveRequests((prev) => prev.filter((l) => l.employeeId !== id));

    // Update department headcounts
    setDepartments((prev) =>
      prev.map((d) => (d.name === emp.department ? { ...d, headcount: Math.max(0, d.headcount - 1) } : d))
    );

    if (selectedEmployee?.id === id) {
      setSelectedEmployee(null);
    }

    addAuditEntry(
      'delete',
      'employee',
      `Permanently removed employee record: ${emp.firstName} ${emp.lastName} (${emp.employeeCode})`
    );
  };

  const addDepartment = (deptData: Omit<Department, 'id'>): Department => {
    const newDept: Department = {
      id: `dept_${Date.now()}`,
      ...deptData,
    };
    setDepartments((prev) => [...prev, newDept]);
    addAuditEntry('create', 'department', `Created department ${newDept.name} (${newDept.code})`);
    return newDept;
  };

  const updateDepartment = (id: string, updates: Partial<Department>) => {
    setDepartments((prev) =>
      prev.map((d) => (d.id === id ? { ...d, ...updates } : d))
    );
    addAuditEntry('update', 'department', `Updated department details for ID ${id}`);
  };

  const deleteDepartment = (id: string) => {
    const dept = departments.find((d) => d.id === id);
    if (!dept) return;
    setDepartments((prev) => prev.filter((d) => d.id !== id));
    addAuditEntry('delete', 'department', `Deleted department ${dept.name} (${dept.code})`);
  };

  const toggleOnboardingTask = (recordId: string, taskId: string) => {
    setOnboardingRecords((prev) =>
      prev.map((record) => {
        if (record.id !== recordId) return record;

        const updatedTasks = record.tasks.map((task) => {
          if (task.id === taskId) {
            const nextCompleted = !task.isCompleted;
            return {
              ...task,
              isCompleted: nextCompleted,
              completedAt: nextCompleted ? todayStr : undefined,
            };
          }
          return task;
        });

        const allCompleted = updatedTasks.every((t) => t.isCompleted);

        return {
          ...record,
          tasks: updatedTasks,
          status: allCompleted ? 'completed' : 'in_progress',
        };
      })
    );
  };

  const addOnboardingRecord = (employeeId: string, mentorName: string) => {
    const emp = employees.find((e) => e.id === employeeId);
    const target = '2026-10-25';

    const newRecord: OnboardingRecord = {
      id: `onb_${Date.now()}`,
      employeeId,
      startDate: todayStr,
      targetDate: target,
      status: 'in_progress',
      mentorName,
      tasks: [
        { id: `t_${Date.now()}_1`, title: 'Sign Kenyan Employment Contract & IP agreement', category: 'compliance', isCompleted: true, completedAt: todayStr, assignedRole: 'Employee' },
        { id: `t_${Date.now()}_2`, title: 'Provide National ID, KRA PIN & NSSF/SHIF numbers', category: 'compliance', isCompleted: false, assignedRole: 'Employee' },
        { id: `t_${Date.now()}_3`, title: 'Bank account / M-Pesa direct deposit documentation', category: 'compliance', isCompleted: false, assignedRole: 'Employee' },
        { id: `t_${Date.now()}_4`, title: 'IT hardware setup & Nairobi Upper Hill badge issuance', category: 'it_setup', isCompleted: false, assignedRole: 'IT Support' },
        { id: `t_${Date.now()}_5`, title: 'IHRM-aligned HR Handbook & private medical cover briefing', category: 'hr_orientation', isCompleted: false, assignedRole: 'HR Team' },
        { id: `t_${Date.now()}_6`, title: 'First 1-on-1 performance goals & Q4 milestone briefing', category: 'team_intro', isCompleted: false, assignedRole: 'Manager' },
      ],
    };

    setOnboardingRecords((prev) => [newRecord, ...prev]);

    addAuditEntry(
      'onboarding',
      'lifecycle',
      `Initialized 30-day onboarding roadmap for ${emp?.firstName} ${emp?.lastName} with mentor ${mentorName}`
    );
  };

  const toggleOffboardingAsset = (recordId: string, assetId: string) => {
    setOffboardingRecords((prev) =>
      prev.map((rec) => {
        if (rec.id !== recordId) return rec;
        return {
          ...rec,
          assets: rec.assets.map((ast) =>
            ast.id === assetId ? { ...ast, returned: !ast.returned } : ast
          ),
        };
      })
    );
  };

  const toggleOffboardingClearance = (recordId: string, department: string) => {
    setOffboardingRecords((prev) =>
      prev.map((rec) => {
        if (rec.id !== recordId) return rec;
        return {
          ...rec,
          clearances: rec.clearances.map((c) =>
            c.department === department
              ? {
                  ...c,
                  approved: !c.approved,
                  approverName: activePersona.name,
                  updatedAt: todayStr,
                }
              : c
          ),
        };
      })
    );

    addAuditEntry(
      'offboarding',
      'lifecycle',
      `Updated offboarding clearance for ${department} by ${activePersona.name}`
    );
  };

  const initiateOffboarding = (employeeId: string, reason: string, lastWorkingDate: string) => {
    const emp = employees.find((e) => e.id === employeeId);
    if (!emp) return;

    const newOffboarding: OffboardingRecord = {
      id: `off_${Date.now()}`,
      employeeId,
      resignationDate: todayStr,
      lastWorkingDate,
      reason,
      status: 'notice_period',
      exitInterviewNotes: 'Exit interview scheduled with People Operations.',
      assets: [
        { id: `ast_${Date.now()}_1`, item: 'Company Laptop & Charger', returned: false },
        { id: `ast_${Date.now()}_2`, item: 'Security YubiKey 5C Token', returned: false },
        { id: `ast_${Date.now()}_3`, item: 'Nairobi Office Access Smartcard', returned: false },
      ],
      clearances: [
        { department: 'Department Lead / Technical Handover', approved: false, approverName: emp.managerName || 'Manager' },
        { department: 'IT Systems / Google Workspace & IAM Revocation', approved: false, approverName: 'IT Operations' },
        { department: 'Finance / Sacco Loans & Travel Expense Clearance', approved: false, approverName: 'Esther Chebet' },
        { department: 'HR / Final Severance, Gratuity & Certificate of Service', approved: false, approverName: 'Brian Otieno' },
      ],
    };

    setOffboardingRecords((prev) => [newOffboarding, ...prev]);

    addAuditEntry(
      'offboarding',
      'lifecycle',
      `Initiated exit clearance protocol for ${emp.firstName} ${emp.lastName} (${emp.employeeCode}). Last day: ${lastWorkingDate}`
    );
  };

  const updateOnboardingRecord = (id: string, updates: Partial<OnboardingRecord>) => {
    setOnboardingRecords((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...updates } : r))
    );
    addAuditEntry('update', 'lifecycle', `Updated onboarding pipeline ID ${id}`);
  };

  const deleteOnboardingRecord = (id: string) => {
    setOnboardingRecords((prev) => prev.filter((r) => r.id !== id));
    addAuditEntry('delete', 'lifecycle', `Removed onboarding record ID ${id}`);
  };

  const addOnboardingTask = (recordId: string, task: Omit<OnboardingTaskItem, 'id' | 'isCompleted'>) => {
    const newTask: OnboardingTaskItem = {
      id: `t_${Date.now()}`,
      ...task,
      isCompleted: false,
    };
    setOnboardingRecords((prev) =>
      prev.map((r) => (r.id === recordId ? { ...r, tasks: [...r.tasks, newTask] } : r))
    );
  };

  const deleteOnboardingTask = (recordId: string, taskId: string) => {
    setOnboardingRecords((prev) =>
      prev.map((r) =>
        r.id === recordId ? { ...r, tasks: r.tasks.filter((t) => t.id !== taskId) } : r
      )
    );
  };

  const updateOffboardingRecord = (id: string, updates: Partial<OffboardingRecord>) => {
    setOffboardingRecords((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...updates } : r))
    );
    addAuditEntry('update', 'lifecycle', `Updated offboarding record ID ${id}`);
  };

  const deleteOffboardingRecord = (id: string) => {
    setOffboardingRecords((prev) => prev.filter((r) => r.id !== id));
    addAuditEntry('delete', 'lifecycle', `Removed offboarding record ID ${id}`);
  };

  const addOffboardingAsset = (recordId: string, assetName: string, category: string) => {
    const newAsset: OffboardingAsset = {
      id: `ast_${Date.now()}`,
      item: assetName,
      returned: false,
    };
    setOffboardingRecords((prev) =>
      prev.map((r) =>
        r.id === recordId ? { ...r, assets: [...r.assets, newAsset] } : r
      )
    );
  };

  const deleteOffboardingAsset = (recordId: string, assetId: string) => {
    setOffboardingRecords((prev) =>
      prev.map((r) =>
        r.id === recordId ? { ...r, assets: r.assets.filter((a) => a.id !== assetId) } : r
      )
    );
  };

  // Phase 4 Payroll Action Handlers
  const runPayrollCalculation = (cycleId: string) => {
    setPayrollCycles((prev) =>
      prev.map((c) => {
        if (c.id !== cycleId) return c;
        return generatePayrollCycle(c.id, c.cycleMonth, employees, 'calculated');
      })
    );
    addAuditEntry(
      'payroll',
      'payroll',
      `Recalculated Kenyan payroll statutory deductions (PAYE, NSSF Tier I & II, SHIF, Housing Levy) for cycle ${cycleId}`
    );
  };

  const approvePayrollCycle = (cycleId: string) => {
    const now = new Date().toISOString();
    setPayrollCycles((prev) =>
      prev.map((c) => {
        if (c.id !== cycleId) return c;
        return {
          ...c,
          status: 'approved',
          approvedBy: `${activePersona.name} (${activePersona.roleLabel})`,
          approvedAt: now,
          payslips: c.payslips.map((p) => ({ ...p, status: 'approved' })),
        };
      })
    );
    addAuditEntry(
      'payroll',
      'payroll',
      `Approved payroll run & statutory schedules for cycle ${cycleId} by ${activePersona.name}`
    );
  };

  const disbursePayrollCycle = (cycleId: string) => {
    const now = new Date().toISOString();
    setPayrollCycles((prev) =>
      prev.map((c) => {
        if (c.id !== cycleId) return c;
        return {
          ...c,
          status: 'disbursed',
          disbursedBy: `${activePersona.name} (${activePersona.roleLabel})`,
          disbursedAt: now,
          payslips: c.payslips.map((p) => ({
            ...p,
            status: 'paid',
            disbursedAt: now,
          })),
        };
      })
    );
    addAuditEntry(
      'payroll',
      'payroll',
      `Disbursed net salary payments via Bank EFT & M-Pesa for cycle ${cycleId} by ${activePersona.name}`
    );
  };

  const updatePayslipEarnings = (payslipId: string, bonus: number, overtimePay: number) => {
    setPayrollCycles((prev) =>
      prev.map((cycle) => {
        const pIndex = cycle.payslips.findIndex((p) => p.id === payslipId);
        if (pIndex === -1) return cycle;

        const targetPayslip = cycle.payslips[pIndex];
        const emp = employees.find((e) => e.id === targetPayslip.employeeId);
        if (!emp) return cycle;

        const updatedPayslip = generateEmployeePayslip(
          emp,
          cycle.id,
          cycle.cycleMonth,
          cycle.payDate,
          overtimePay,
          bonus,
          targetPayslip.status
        );
        updatedPayslip.id = targetPayslip.id;

        const newPayslips = [...cycle.payslips];
        newPayslips[pIndex] = updatedPayslip;

        if (selectedPayslip?.id === payslipId) {
          setSelectedPayslip(updatedPayslip);
        }

        const totalGross = Math.round(newPayslips.reduce((sum, p) => sum + p.earnings.grossPay, 0));
        const totalBasic = Math.round(newPayslips.reduce((sum, p) => sum + p.earnings.basicSalary, 0));
        const totalAllowances = totalGross - totalBasic;
        const totalNetPay = Math.round(newPayslips.reduce((sum, p) => sum + p.netPay, 0));
        const totalPaye = Math.round(newPayslips.reduce((sum, p) => sum + p.statutory.netPaye, 0));
        const totalNssfEmployee = Math.round(newPayslips.reduce((sum, p) => sum + p.statutory.nssfTotalEmployee, 0));
        const totalNssfEmployer = Math.round(newPayslips.reduce((sum, p) => sum + p.statutory.nssfTotalEmployer, 0));
        const totalShif = Math.round(newPayslips.reduce((sum, p) => sum + p.statutory.shif, 0));
        const totalHousingLevyEmployee = Math.round(newPayslips.reduce((sum, p) => sum + p.statutory.housingLevyEmployee, 0));
        const totalHousingLevyEmployer = Math.round(newPayslips.reduce((sum, p) => sum + p.statutory.housingLevyEmployer, 0));
        const totalVoluntary = Math.round(newPayslips.reduce((sum, p) => sum + p.voluntary.totalVoluntary, 0));
        const totalStatutoryRemittance =
          totalPaye +
          totalNssfEmployee +
          totalNssfEmployer +
          totalShif +
          totalHousingLevyEmployee +
          totalHousingLevyEmployer;

        return {
          ...cycle,
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
          payslips: newPayslips,
        };
      })
    );
  };

  const getCurrentEmployeePayslip = (employeeId?: string) => {
    const targetId = employeeId || activePersona.employeeId;
    const currentCycle = payrollCycles.find((c) => c.id === selectedPayrollCycleId) || payrollCycles[0];
    if (!currentCycle) return undefined;
    return currentCycle.payslips.find((p) => p.employeeId === targetId);
  };

  // Phase 5 Performance & Appraisal Handlers
  const submitSelfAppraisal = (
    appraisalId: string,
    competencyScores: { [id: string]: number },
    summary: string
  ) => {
    setAppraisals((prev) =>
      prev.map((app) => {
        if (app.id !== appraisalId) return app;
        const updatedCompetencies = app.competencies.map((comp) => {
          if (competencyScores[comp.id] !== undefined) {
            return { ...comp, selfScore: competencyScores[comp.id] };
          }
          return comp;
        });
        const scores = updatedCompetencies.map((c) => c.selfScore);
        const avg = Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10;

        return {
          ...app,
          competencies: updatedCompetencies,
          selfOverallScore: avg,
          selfSummary: summary,
          status: 'pending_manager' as const,
        };
      })
    );

    addAuditEntry(
      'appraisal',
      'appraisal',
      `Submitted self-appraisal ratings and growth narrative for ${appraisalId} by ${activePersona.name}`
    );
  };

  const submitManagerEvaluation = (
    appraisalId: string,
    competencyScores: { [id: string]: number },
    summary: string,
    nineBox: NineBoxPosition,
    salaryBumpPct?: number,
    promotion?: boolean,
    newTitle?: string
  ) => {
    setAppraisals((prev) =>
      prev.map((app) => {
        if (app.id !== appraisalId) return app;
        const updatedCompetencies = app.competencies.map((comp) => {
          if (competencyScores[comp.id] !== undefined) {
            return { ...comp, managerScore: competencyScores[comp.id] };
          }
          return comp;
        });
        const scores = updatedCompetencies.map((c) => c.managerScore);
        const avg = Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10;

        let finalGrade: AppraisalRecord['finalGrade'] = 'Meets Expectations (3.0 - 3.9)';
        if (avg >= 4.9) finalGrade = 'Exceptional (5.0)';
        else if (avg >= 4.0) finalGrade = 'Exceeds Expectations (4.0 - 4.9)';
        else if (avg >= 3.0) finalGrade = 'Meets Expectations (3.0 - 3.9)';
        else if (avg >= 2.0) finalGrade = 'Needs Improvement (2.0 - 2.9)';
        else finalGrade = 'Unsatisfactory (1.0 - 1.9)';

        return {
          ...app,
          competencies: updatedCompetencies,
          managerOverallScore: avg,
          managerSummary: summary,
          nineBoxPosition: nineBox,
          recommendedSalaryIncrementPct: salaryBumpPct,
          promotionRecommended: promotion,
          recommendedNewTitle: newTitle,
          finalGrade,
          status: 'pending_calibration' as const,
        };
      })
    );

    addAuditEntry(
      'appraisal',
      'appraisal',
      `Submitted manager assessment & 9-box talent rating (${nineBox}) for ${appraisalId} by ${activePersona.name}`
    );
  };

  const calibrateAppraisal = (
    appraisalId: string,
    finalGrade: AppraisalRecord['finalGrade']
  ) => {
    const now = new Date().toISOString();
    setAppraisals((prev) =>
      prev.map((app) => {
        if (app.id !== appraisalId) return app;
        return {
          ...app,
          finalGrade,
          status: 'completed' as const,
          completedAt: now,
        };
      })
    );

    addAuditEntry(
      'appraisal',
      'appraisal',
      `Finalized performance calibration sign-off: Grade ${finalGrade} for ${appraisalId} by ${activePersona.name}`
    );
  };

  const addOKRGoal = (goal: Omit<OKRGoal, 'id'>) => {
    const newGoal: OKRGoal = {
      ...goal,
      id: `okr_${Date.now()}`,
    };
    setOkrGoals((prev) => [newGoal, ...prev]);
    addAuditEntry(
      'appraisal',
      'appraisal',
      `Created company OKR objective: "${goal.title}" owned by ${goal.ownerName}`
    );
  };

  const updateOKRProgress = (goalId: string, progress: number, status: OKRGoal['status']) => {
    setOkrGoals((prev) =>
      prev.map((g) => {
        if (g.id !== goalId) return g;
        return {
          ...g,
          progress: Math.min(100, Math.max(0, progress)),
          status,
        };
      })
    );
  };

  // Phase 6: Recruitment & ATS Action Handlers
  const addJobOpening = (job: Omit<JobOpening, 'id' | 'createdAt' | 'requisitionCode' | 'hiredCount'>) => {
    const codeNumber = jobOpenings.length + 31;
    const newOpening: JobOpening = {
      ...job,
      id: `job_${Date.now()}`,
      requisitionCode: `REQ-2026-0${codeNumber}`,
      hiredCount: 0,
      createdAt: new Date().toISOString(),
    };
    setJobOpenings((prev) => [newOpening, ...prev]);
    addAuditEntry(
      'recruitment',
      'recruitment',
      `Opened requisition ${newOpening.requisitionCode}: "${newOpening.title}" in ${newOpening.department}`
    );
  };

  const updateJobOpeningStatus = (id: string, status: JobOpening['status']) => {
    setJobOpenings((prev) =>
      prev.map((j) => (j.id === id ? { ...j, status } : j))
    );
    const opening = jobOpenings.find((j) => j.id === id);
    if (opening) {
      addAuditEntry(
        'recruitment',
        'recruitment',
        `Updated job status for ${opening.requisitionCode} (${opening.title}) to "${status}"`
      );
    }
  };

  const addCandidate = (cand: Omit<Candidate, 'id' | 'appliedDate' | 'scorecards'>) => {
    const newCandidate: Candidate = {
      ...cand,
      id: `cand_${Date.now()}`,
      appliedDate: new Date().toISOString().split('T')[0],
      scorecards: [],
    };
    setCandidates((prev) => [newCandidate, ...prev]);
    addAuditEntry(
      'recruitment',
      'recruitment',
      `Registered candidate ${newCandidate.fullName} for ${newCandidate.jobTitle}`
    );
  };

  const updateCandidateStage = (candidateId: string, newStage: Candidate['stage']) => {
    setCandidates((prev) =>
      prev.map((c) => (c.id === candidateId ? { ...c, stage: newStage } : c))
    );
    const cand = candidates.find((c) => c.id === candidateId);
    if (cand) {
      addAuditEntry(
        'recruitment',
        'recruitment',
        `Advanced candidate ${cand.fullName} to pipeline stage: "${newStage}"`
      );
    }
  };

  const addCandidateScorecard = (
    candidateId: string,
    scorecard: Omit<CandidateScorecard, 'id' | 'submittedAt'>
  ) => {
    const newScorecard: CandidateScorecard = {
      ...scorecard,
      id: `sc_${Date.now()}`,
      submittedAt: new Date().toISOString(),
    };

    setCandidates((prev) =>
      prev.map((c) => {
        if (c.id !== candidateId) return c;
        const allScorecards = [...c.scorecards, newScorecard];
        const avgRating =
          allScorecards.reduce((sum, s) => sum + s.rating, 0) / allScorecards.length;
        return {
          ...c,
          scorecards: allScorecards,
          rating: Number(avgRating.toFixed(1)),
        };
      })
    );

    const cand = candidates.find((c) => c.id === candidateId);
    if (cand) {
      addAuditEntry(
        'recruitment',
        'recruitment',
        `Submitted interview scorecard for ${cand.fullName} (${scorecard.stageName}): Rating ${scorecard.rating}/5`
      );
    }
  };

  const hireCandidate = (
    candidateId: string,
    options?: { baseSalary?: number; joiningDate?: string; managerId?: string; bankName?: string }
  ): Employee | undefined => {
    const candidate = candidates.find((c) => c.id === candidateId);
    if (!candidate) return undefined;

    const names = candidate.fullName.trim().split(' ');
    const firstName = names[0] || 'Employee';
    const lastName = names.slice(1).join(' ') || '';
    const newCodeNumber = 1000 + employees.length + 1;
    const employeeCode = `EMP-${newCodeNumber}`;
    const employeeId = `emp_${Date.now()}`;
    const joiningDate = options?.joiningDate || '2026-10-01';
    const finalSalary = options?.baseSalary || candidate.expectedSalaryKES || 280000;

    const deptLead = employees.find(
      (e) =>
        e.department === candidate.department &&
        (e.role === 'department_lead' || e.role === 'hr_manager')
    );
    const managerId = options?.managerId || deptLead?.id || 'emp_001';
    const managerName = deptLead ? `${deptLead.firstName} ${deptLead.lastName}` : 'Wanjiku Mwangi';

    const newEmployee: Employee = {
      id: employeeId,
      employeeCode,
      firstName,
      lastName,
      email: candidate.email,
      phone: candidate.phone,
      avatar: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80`,
      department: candidate.department,
      jobTitle: candidate.jobTitle,
      role: 'employee',
      employmentType: 'full_time',
      status: 'probation',
      joiningDate,
      managerId,
      managerName,
      location: candidate.location.includes('Mombasa') ? 'Mombasa Branch' : 'Nairobi HQ - Upper Hill',
      compensationTier: 'Tier 3 - Professional',
      baseSalary: finalSalary,
      currency: 'KES',
      nationalId: String(Math.floor(28000000 + Math.random() * 9000000)),
      kraPin: 'P05' + Math.floor(10000000 + Math.random() * 90000000) + 'A',
      nssfNumber: 'NSSF' + Math.floor(1000000 + Math.random() * 9000000),
      shifNumber: 'SHIF' + Math.floor(1000000 + Math.random() * 9000000),
      emergencyContact: {
        name: 'Family Primary Contact',
        relation: 'Spouse/Next of Kin',
        phone: candidate.phone,
      },
      bankInfo: {
        bankName: options?.bankName || 'KCB Bank Kenya',
        accountLast4: String(Math.floor(1000 + Math.random() * 9000)),
        mpesaNumber: candidate.phone,
        branch: 'Upper Hill Corporate Branch',
      },
      documents: [
        {
          id: `doc_${Date.now()}_1`,
          name: 'Employment Offer Letter & Contract',
          type: 'contract',
          status: 'verified',
          uploadedAt: new Date().toISOString(),
          fileSize: '1.4 MB',
        },
        {
          id: `doc_${Date.now()}_2`,
          name: 'Kenya Revenue Authority PIN Certificate',
          type: 'tax',
          status: 'verified',
          uploadedAt: new Date().toISOString(),
          fileSize: '420 KB',
        },
      ],
      notes: `Hired via Semplo Talent Acquisition Pipeline. Source: ${candidate.source}. Notice period: ${candidate.noticePeriodDays} days.`,
    };

    // 1. Add to employees
    setEmployees((prev) => [newEmployee, ...prev]);

    // 2. Mark candidate as hired
    setCandidates((prev) =>
      prev.map((c) =>
        c.id === candidateId
          ? { ...c, stage: 'hired', hiredEmployeeId: employeeId }
          : c
      )
    );

    // 3. Increment hiredCount on job opening
    setJobOpenings((prev) =>
      prev.map((j) =>
        j.id === candidate.jobOpeningId
          ? { ...j, hiredCount: j.hiredCount + 1 }
          : j
      )
    );

    // 4. Auto-initialize 30-Day Onboarding Roadmap!
    addOnboardingRecord(newEmployee.id, managerName);

    // 5. Audit Log
    addAuditEntry(
      'recruitment',
      'recruitment',
      `Officially hired candidate ${candidate.fullName} as ${candidate.jobTitle} (${newEmployee.employeeCode}). Automatically initiated 30-Day Onboarding Roadmap!`
    );

    return newEmployee;
  };

  // Phase 6: ESS & Communications Action Handlers
  const submitSalaryAdvance = (
    advanceData: Omit<SalaryAdvanceRequest, 'id' | 'requestNumber' | 'status' | 'repaymentStatus' | 'submittedAt' | 'repaymentSchedule'>
  ) => {
    const id = `adv_${Date.now()}`;
    const count = salaryAdvances.length + 1;
    const requestNumber = `ADV-2026-${String(count).padStart(3, '0')}`;
    const schedule: RepaymentInstallment[] = [];
    const tenure = advanceData.deductionTenureMonths;
    const monthlyAmt = Math.round(advanceData.amountKES / tenure);
    const months = ['October 2026', 'November 2026', 'December 2026'];
    for (let i = 0; i < tenure; i++) {
      schedule.push({
        month: months[i] || `Month +${i + 1}`,
        amountKES: monthlyAmt,
        status: 'pending',
      });
    }

    const newRequest: SalaryAdvanceRequest = {
      ...advanceData,
      id,
      requestNumber,
      status: 'pending',
      repaymentStatus: 'unpaid',
      repaymentSchedule: schedule,
      submittedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
    };

    setSalaryAdvances((prev) => [newRequest, ...prev]);
    addAuditEntry(
      'update',
      'employee',
      `${advanceData.employeeName} submitted a Salary Advance request for KES ${advanceData.amountKES.toLocaleString()} (${requestNumber}).`
    );
  };

  const reviewSalaryAdvance = (
    id: string,
    status: SalaryAdvanceRequest['status'],
    comments?: string
  ) => {
    setSalaryAdvances((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              status,
              comments: comments || item.comments,
              reviewedBy: activePersona.name,
              reviewedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
            }
          : item
      )
    );
    addAuditEntry(
      'status_change',
      'payroll',
      `${activePersona.name} updated Salary Advance #${id} status to ${status}.`
    );
  };

  const submitExpenseClaim = (
    claimData: Omit<ExpenseClaim, 'id' | 'claimNumber' | 'status' | 'submittedAt'>
  ) => {
    const id = `exp_${Date.now()}`;
    const count = expenseClaims.length + 1;
    const claimNumber = `EXP-2026-${String(100 + count)}`;
    const newClaim: ExpenseClaim = {
      ...claimData,
      id,
      claimNumber,
      status: 'pending',
      submittedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
    };
    setExpenseClaims((prev) => [newClaim, ...prev]);
    addAuditEntry(
      'update',
      'payroll',
      `${claimData.employeeName} filed Expense Claim ${claimNumber} for KES ${claimData.amountKES.toLocaleString()} (${claimData.title}).`
    );
  };

  const reviewExpenseClaim = (
    id: string,
    status: ExpenseClaim['status'],
    reimbursementMethod?: ExpenseClaim['reimbursementMethod'],
    rejectionReason?: string
  ) => {
    setExpenseClaims((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              status,
              reimbursementMethod: reimbursementMethod || item.reimbursementMethod,
              rejectionReason,
              reviewedBy: activePersona.name,
              reviewedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
              reimbursementDate: status === 'reimbursed' ? new Date().toISOString().slice(0, 10) : item.reimbursementDate,
            }
          : item
      )
    );
    addAuditEntry(
      'status_change',
      'payroll',
      `${activePersona.name} set Expense Claim #${id} to ${status}.`
    );
  };

  const submitDocumentLetter = (
    letterData: Omit<DocumentLetterRequest, 'id' | 'letterNumber' | 'status' | 'submittedAt'>
  ) => {
    const id = `ltr_${Date.now()}`;
    const count = documentLetters.length + 1;
    const letterNumber = `LTR-2026-${String(count).padStart(3, '0')}`;
    const newReq: DocumentLetterRequest = {
      ...letterData,
      id,
      letterNumber,
      status: 'pending',
      submittedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
    };
    setDocumentLetters((prev) => [newReq, ...prev]);
    addAuditEntry(
      'create',
      'lifecycle',
      `${letterData.employeeName} requested official letter ${letterNumber} (${letterData.letterType}).`
    );
  };

  const reviewDocumentLetter = (
    id: string,
    status: DocumentLetterRequest['status'],
    generatedContent?: string,
    rejectionReason?: string
  ) => {
    setDocumentLetters((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        return {
          ...item,
          status,
          generatedDocumentContent: generatedContent || item.generatedDocumentContent,
          rejectionReason,
          reviewedBy: activePersona.name,
          completedAt: status === 'ready_for_download' ? new Date().toISOString().replace('T', ' ').slice(0, 16) : item.completedAt,
        };
      })
    );
    addAuditEntry(
      'status_change',
      'lifecycle',
      `${activePersona.name} marked Letter Request #${id} as ${status}.`
    );
  };

  const submitAssetRequest = (
    reqData: Omit<AssetRequest, 'id' | 'requestNumber' | 'status' | 'submittedAt'>
  ) => {
    const id = `ast_${Date.now()}`;
    const count = assetRequests.length + 1;
    const requestNumber = `AST-2026-${String(count).padStart(3, '0')}`;
    const newReq: AssetRequest = {
      ...reqData,
      id,
      requestNumber,
      status: 'pending',
      submittedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
    };
    setAssetRequests((prev) => [newReq, ...prev]);
    addAuditEntry(
      'create',
      'system',
      `${reqData.employeeName} submitted IT Equipment Request ${requestNumber} for ${reqData.itemName}.`
    );
  };

  const reviewAssetRequest = (
    id: string,
    status: AssetRequest['status'],
    adminNotes?: string
  ) => {
    setAssetRequests((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        return {
          ...item,
          status,
          adminNotes: adminNotes || item.adminNotes,
          reviewedBy: activePersona.name,
          reviewedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
          fulfilledDate: status === 'fulfilled' ? new Date().toISOString().slice(0, 10) : item.fulfilledDate,
        };
      })
    );
    addAuditEntry(
      'status_change',
      'system',
      `${activePersona.name} set Asset Request #${id} status to ${status}.`
    );
  };

  const submitProfileUpdate = (
    reqData: Omit<ProfileUpdateRequest, 'id' | 'requestNumber' | 'status' | 'submittedAt'>
  ) => {
    const id = `prf_${Date.now()}`;
    const count = profileUpdates.length + 1;
    const requestNumber = `PRF-2026-${String(count).padStart(3, '0')}`;
    const newReq: ProfileUpdateRequest = {
      ...reqData,
      id,
      requestNumber,
      status: 'pending',
      submittedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
    };
    setProfileUpdates((prev) => [newReq, ...prev]);
    addAuditEntry(
      'update',
      'employee',
      `${reqData.employeeName} submitted profile change request ${requestNumber} (${reqData.updateType}).`
    );
  };

  const reviewProfileUpdate = (
    id: string,
    status: ProfileUpdateRequest['status'],
    rejectionReason?: string
  ) => {
    const req = profileUpdates.find((r) => r.id === id);
    if (!req) return;

    if (status === 'approved') {
      const emp = employees.find((e) => e.id === req.employeeId);
      if (emp) {
        if (req.updateType === 'emergency_contact') {
          updateEmployee(emp.id, {
            emergencyContact: {
              name: req.proposedChanges.name || emp.emergencyContact.name,
              relation: req.proposedChanges.relation || emp.emergencyContact.relation,
              phone: req.proposedChanges.phone || emp.emergencyContact.phone,
            },
          });
        } else if (req.updateType === 'bank_details') {
          updateEmployee(emp.id, {
            bankInfo: {
              ...emp.bankInfo,
              bankName: req.proposedChanges.bankName || emp.bankInfo.bankName,
              accountLast4: req.proposedChanges.accountLast4 || emp.bankInfo.accountLast4,
              mpesaNumber: req.proposedChanges.mpesaNumber || emp.bankInfo.mpesaNumber,
            },
          });
        } else if (req.updateType === 'residential_address') {
          updateEmployee(emp.id, {
            location: req.proposedChanges.residentialAddress || emp.location,
          });
        }
      }
    }

    setProfileUpdates((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              status,
              rejectionReason,
              reviewedBy: activePersona.name,
              reviewedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
            }
          : item
      )
    );
    addAuditEntry(
      'status_change',
      'employee',
      `${activePersona.name} ${status} Profile Update Request ${req.requestNumber} for ${req.employeeName}.`
    );
  };

  const addAnnouncement = (
    annData: Omit<Announcement, 'id' | 'publishedAt' | 'reactions'>
  ) => {
    const id = `ann_${Date.now()}`;
    const newAnn: Announcement = {
      ...annData,
      id,
      publishedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      reactions: { '👍': 1 },
    };
    setAnnouncements((prev) => [newAnn, ...prev]);
    addAuditEntry(
      'create',
      'system',
      `${activePersona.name} posted company bulletin notice: "${annData.title}".`
    );
  };

  const deleteAnnouncement = (id: string) => {
    setAnnouncements((prev) => prev.filter((a) => a.id !== id));
    addAuditEntry('status_change', 'system', `${activePersona.name} removed announcement #${id}.`);
  };

  const toggleAnnouncementReaction = (id: string, emoji: string) => {
    setAnnouncements((prev) =>
      prev.map((ann) => {
        if (ann.id !== id) return ann;
        const currentReactions = { ...ann.reactions };
        const userReacted = { ...(ann.userReacted || {}) };
        const hasReacted = userReacted[emoji];

        if (hasReacted) {
          currentReactions[emoji] = Math.max(0, (currentReactions[emoji] || 1) - 1);
          userReacted[emoji] = false;
        } else {
          currentReactions[emoji] = (currentReactions[emoji] || 0) + 1;
          userReacted[emoji] = true;
        }

        return {
          ...ann,
          reactions: currentReactions,
          userReacted,
        };
      })
    );
  };

  const addCompanyEvent = (eventData: Omit<CompanyEvent, 'id'>) => {
    const id = `evt_${Date.now()}`;
    const newEvt: CompanyEvent = {
      ...eventData,
      id,
    };
    setCompanyEvents((prev) => [...prev, newEvt]);
    addAuditEntry('create', 'system', `${activePersona.name} scheduled company event "${eventData.title}" on ${eventData.date}.`);
  };

  const resetAllData = () => {
    localStorage.removeItem(STORAGE_KEYS.EMPLOYEES_KENYA);
    localStorage.removeItem(STORAGE_KEYS.DEPARTMENTS_KENYA);
    localStorage.removeItem(STORAGE_KEYS.ONBOARDING_KENYA);
    localStorage.removeItem(STORAGE_KEYS.OFFBOARDING_KENYA);
    localStorage.removeItem(STORAGE_KEYS.AUDIT_KENYA);
    localStorage.removeItem(STORAGE_KEYS.PERSONA_KENYA);
    localStorage.removeItem(STORAGE_KEYS.ATTENDANCE_KENYA);
    localStorage.removeItem(STORAGE_KEYS.LEAVE_KENYA);
    localStorage.removeItem(STORAGE_KEYS.PAYROLL_KENYA);
    localStorage.removeItem(STORAGE_KEYS.APPRAISALS_KENYA);
    localStorage.removeItem(STORAGE_KEYS.OKRS_KENYA);
    localStorage.removeItem(STORAGE_KEYS.CYCLES_KENYA);
    localStorage.removeItem(STORAGE_KEYS.JOB_OPENINGS_KENYA);
    localStorage.removeItem(STORAGE_KEYS.CANDIDATES_KENYA);
    localStorage.removeItem(STORAGE_KEYS.SALARY_ADVANCES_KENYA);
    localStorage.removeItem(STORAGE_KEYS.EXPENSE_CLAIMS_KENYA);
    localStorage.removeItem(STORAGE_KEYS.DOCUMENT_LETTERS_KENYA);
    localStorage.removeItem(STORAGE_KEYS.ASSET_REQUESTS_KENYA);
    localStorage.removeItem(STORAGE_KEYS.PROFILE_UPDATES_KENYA);
    localStorage.removeItem(STORAGE_KEYS.ANNOUNCEMENTS_KENYA);
    localStorage.removeItem(STORAGE_KEYS.POLICY_DOCUMENTS_KENYA);
    localStorage.removeItem(STORAGE_KEYS.COMPANY_EVENTS_KENYA);

    setEmployees(INITIAL_EMPLOYEES);
    setDepartments(INITIAL_DEPARTMENTS);
    setOnboardingRecords(INITIAL_ONBOARDING);
    setOffboardingRecords(INITIAL_OFFBOARDING);
    setAttendanceRecords(INITIAL_ATTENDANCE);
    setLeaveRequests(INITIAL_LEAVE_REQUESTS);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    const resetSep = generatePayrollCycle('cycle_2026_09', 'September 2026', INITIAL_EMPLOYEES, 'calculated');
    const resetAug = generatePayrollCycle('cycle_2026_08', 'August 2026', INITIAL_EMPLOYEES, 'disbursed');
    setPayrollCycles([resetSep, resetAug]);
    setSelectedPayrollCycleId('cycle_2026_09');
    setSelectedPayslip(null);
    setIsPayslipModalOpen(false);
    setReviewCycles(INITIAL_REVIEW_CYCLES);
    setSelectedReviewCycleId('cycle_q3_2026');
    setAppraisals(INITIAL_APPRAISALS);
    setOkrGoals(INITIAL_OKRS);
    setJobOpenings(INITIAL_JOB_OPENINGS);
    setCandidates(INITIAL_CANDIDATES);
    setSelectedJobOpeningId(null);
    setSelectedCandidate(null);
    setSalaryAdvances(INITIAL_SALARY_ADVANCES);
    setExpenseClaims(INITIAL_EXPENSE_CLAIMS);
    setDocumentLetters(INITIAL_DOCUMENT_LETTERS);
    setAssetRequests(INITIAL_ASSET_REQUESTS);
    setProfileUpdates(INITIAL_PROFILE_UPDATES);
    setAnnouncements(INITIAL_ANNOUNCEMENTS);
    setPolicyDocuments(INITIAL_POLICY_DOCUMENTS);
    setCompanyEvents(INITIAL_COMPANY_EVENTS);
    setActivePersonaState(INITIAL_PERSONAS[0]);
    setSelectedEmployee(null);
  };

  const login = (email: string, password: string): { success: boolean; error?: string } => {
    const normalizedEmail = email.trim().toLowerCase();

    // 1. Admin Demo Credentials check
    if (normalizedEmail === 'versalylabs@gmail.com') {
      if (password === 'labversaly-16') {
        const adminSession: UserSession = {
          email: 'versalylabs@gmail.com',
          name: 'Wanjiku Karanja',
          companyName: 'Semplo Kenya Ltd',
          role: 'super_admin',
          isDemoAdmin: true,
          tenantId: 'demo',
        };
        setCurrentUser(adminSession);
        setIsAuthenticated(true);
        localStorage.setItem('semplo_auth_session', JSON.stringify(adminSession));

        // Reload the complete demo data
        setEmployees(INITIAL_EMPLOYEES);
        setDepartments(INITIAL_DEPARTMENTS);
        setOnboardingRecords(INITIAL_ONBOARDING);
        setOffboardingRecords(INITIAL_OFFBOARDING);
        setAttendanceRecords(INITIAL_ATTENDANCE);
        setLeaveRequests(INITIAL_LEAVE_REQUESTS);
        setAuditLogs(INITIAL_AUDIT_LOGS);
        const sepCycle = generatePayrollCycle('cycle_2026_09', 'September 2026', INITIAL_EMPLOYEES, 'calculated');
        const augCycle = generatePayrollCycle('cycle_2026_08', 'August 2026', INITIAL_EMPLOYEES, 'disbursed');
        setPayrollCycles([sepCycle, augCycle]);
        setSelectedPayrollCycleId('cycle_2026_09');
        setReviewCycles(INITIAL_REVIEW_CYCLES);
        setSelectedReviewCycleId('cycle_q3_2026');
        setAppraisals(INITIAL_APPRAISALS);
        setOkrGoals(INITIAL_OKRS);
        setJobOpenings(INITIAL_JOB_OPENINGS);
        setCandidates(INITIAL_CANDIDATES);
        setSalaryAdvances(INITIAL_SALARY_ADVANCES);
        setExpenseClaims(INITIAL_EXPENSE_CLAIMS);
        setDocumentLetters(INITIAL_DOCUMENT_LETTERS);
        setAssetRequests(INITIAL_ASSET_REQUESTS);
        setProfileUpdates(INITIAL_PROFILE_UPDATES);
        setAnnouncements(INITIAL_ANNOUNCEMENTS);
        setPolicyDocuments(INITIAL_POLICY_DOCUMENTS);
        setCompanyEvents(INITIAL_COMPANY_EVENTS);
        setActivePersonaState(INITIAL_PERSONAS[0]);
        setCurrentTab('dashboard');

        return { success: true };
      } else {
        return { success: false, error: 'Incorrect password for Admin Demo.' };
      }
    }

    // 2. Custom Registered User Accounts check
    try {
      const registeredRaw = localStorage.getItem('semplo_registered_users');
      const registeredList: RegisteredUserAccount[] = registeredRaw ? JSON.parse(registeredRaw) : [];
      const user = registeredList.find(
        (u) => u.email.toLowerCase() === normalizedEmail && u.password === password
      );

      if (user) {
        const userSession: UserSession = {
          email: user.email,
          name: user.name,
          companyName: user.companyName,
          role: 'super_admin',
          isDemoAdmin: false,
          tenantId: user.tenantId,
        };
        setCurrentUser(userSession);
        setIsAuthenticated(true);
        localStorage.setItem('semplo_auth_session', JSON.stringify(userSession));

        // Load custom tenant clean data
        const userPersona: Persona = {
          id: `persona_${user.tenantId || 'admin'}`,
          name: user.name,
          email: user.email,
          role: 'super_admin',
          roleLabel: 'Super Admin',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
          employeeId: 'emp_admin',
          jobTitle: 'Super Admin',
          department: 'Administration',
        };

        const tenantDataRaw = localStorage.getItem(`semplo_tenant_data_${user.tenantId}`);
        const tenantData = tenantDataRaw ? JSON.parse(tenantDataRaw) : {};
        setEmployees(tenantData.employees || []);
        setDepartments(tenantData.departments || []);
        setOnboardingRecords(tenantData.onboardingRecords || []);
        setOffboardingRecords(tenantData.offboardingRecords || []);
        setAttendanceRecords(tenantData.attendanceRecords || []);
        setLeaveRequests(tenantData.leaveRequests || []);
        setPayrollCycles(tenantData.payrollCycles || []);
        setReviewCycles(tenantData.reviewCycles || []);
        setAppraisals(tenantData.appraisals || []);
        setOkrGoals(tenantData.okrGoals || []);
        setCandidates(tenantData.candidates || []);
        setJobOpenings(tenantData.jobOpenings || []);
        setSalaryAdvances(tenantData.salaryAdvances || []);
        setExpenseClaims(tenantData.expenseClaims || []);
        setDocumentLetters(tenantData.documentLetters || []);
        setAssetRequests(tenantData.assetRequests || []);
        setProfileUpdates(tenantData.profileUpdates || []);
        setAnnouncements(tenantData.announcements || []);
        setPolicyDocuments(tenantData.policyDocuments || []);
        setCompanyEvents(tenantData.companyEvents || []);
        setAuditLogs(tenantData.auditLogs || []);
        setPersonas([userPersona]);
        setActivePersonaState(userPersona);

        setCurrentTab('dashboard');
        return { success: true };
      }
    } catch (err) {
      console.error('Error reading registered users', err);
    }

    return {
      success: false,
      error: 'Invalid credentials. Use versalylabs@gmail.com / labversaly-16 for Demo Admin, or register a new workspace.',
    };
  };

  const register = (
    name: string,
    companyName: string,
    email: string,
    password: string
  ): { success: boolean; error?: string } => {
    const normalizedEmail = email.trim().toLowerCase();

    if (normalizedEmail === 'versalylabs@gmail.com') {
      return { success: false, error: 'This email is reserved for demo admin.' };
    }

    let registeredList: RegisteredUserAccount[] = [];
    try {
      const registeredRaw = localStorage.getItem('semplo_registered_users');
      if (registeredRaw) registeredList = JSON.parse(registeredRaw);
    } catch {}

    if (registeredList.some((u) => u.email.toLowerCase() === normalizedEmail)) {
      return { success: false, error: 'An account with this email already exists. Please sign in.' };
    }

    const tenantId = `tenant_${Date.now()}`;
    const newAccount: RegisteredUserAccount = {
      id: `usr_${Date.now()}`,
      name,
      companyName,
      email: normalizedEmail,
      password,
      role: 'super_admin',
      tenantId,
      createdAt: new Date().toISOString(),
    };

    registeredList.push(newAccount);
    localStorage.setItem('semplo_registered_users', JSON.stringify(registeredList));

    const userPersona: Persona = {
      id: `persona_${tenantId}`,
      name,
      email: normalizedEmail,
      role: 'super_admin',
      roleLabel: 'Super Admin',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      employeeId: 'emp_admin',
      jobTitle: 'Super Admin',
      department: 'Administration',
    };

    // Completely empty slate - ZERO dummy data for new account
    setEmployees([]);
    setDepartments([]);
    setOnboardingRecords([]);
    setOffboardingRecords([]);
    setAttendanceRecords([]);
    setLeaveRequests([]);
    setPayrollCycles([]);
    setReviewCycles([]);
    setAppraisals([]);
    setOkrGoals([]);
    setCandidates([]);
    setJobOpenings([]);
    setSalaryAdvances([]);
    setExpenseClaims([]);
    setDocumentLetters([]);
    setAssetRequests([]);
    setProfileUpdates([]);
    setAnnouncements([]);
    setPolicyDocuments([]);
    setCompanyEvents([]);
    setAuditLogs([]);
    setPersonas([userPersona]);
    setActivePersonaState(userPersona);

    // Save clean empty tenant data
    const tenantPayload = {
      employees: [],
      departments: [],
      onboardingRecords: [],
      offboardingRecords: [],
      attendanceRecords: [],
      leaveRequests: [],
      payrollCycles: [],
      reviewCycles: [],
      appraisals: [],
      okrGoals: [],
      candidates: [],
      jobOpenings: [],
      salaryAdvances: [],
      expenseClaims: [],
      documentLetters: [],
      assetRequests: [],
      profileUpdates: [],
      announcements: [],
      policyDocuments: [],
      companyEvents: [],
      auditLogs: [],
      activePersona: userPersona,
    };
    localStorage.setItem(`semplo_tenant_data_${tenantId}`, JSON.stringify(tenantPayload));

    // Save session
    const userSession: UserSession = {
      email: normalizedEmail,
      name,
      companyName,
      role: 'super_admin',
      isDemoAdmin: false,
      tenantId,
    };
    setCurrentUser(userSession);
    setIsAuthenticated(true);
    localStorage.setItem('semplo_auth_session', JSON.stringify(userSession));

    setCurrentTab('dashboard');
    return { success: true };
  };

  const logout = () => {
    localStorage.removeItem('semplo_auth_session');
    setCurrentUser(null);
    setIsAuthenticated(false);
  };

  return (
    <HRContext.Provider
      value={{
        activePersona,
        setActivePersona,
        personas,
        currentTab,
        setCurrentTab,
        employees,
        departments,
        onboardingRecords,
        offboardingRecords,
        auditLogs,
        attendanceRecords,
        shifts,
        holidays,
        userTodayAttendance,
        clockIn,
        clockOut,
        toggleBreak,
        leaveRequests,
        submitLeaveRequest,
        reviewLeaveRequest,
        getEmployeeLeaveBalances,
        searchQuery,
        setSearchQuery,
        selectedEmployee,
        setSelectedEmployee,
        isAddModalOpen,
        setIsAddModalOpen,
        isCommandPaletteOpen,
        setIsCommandPaletteOpen,
        isMobileSidebarOpen,
        setIsMobileSidebarOpen,
        addEmployee,
        updateEmployee,
        deleteEmployee,
        updateEmployeeStatus,
        addDepartment,
        updateDepartment,
        deleteDepartment,
        toggleOnboardingTask,
        addOnboardingRecord,
        updateOnboardingRecord,
        deleteOnboardingRecord,
        addOnboardingTask,
        deleteOnboardingTask,
        toggleOffboardingAsset,
        toggleOffboardingClearance,
        initiateOffboarding,
        updateOffboardingRecord,
        deleteOffboardingRecord,
        addOffboardingAsset,
        deleteOffboardingAsset,
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
        updatePayslipEarnings,
        getCurrentEmployeePayslip,
        reviewCycles,
        selectedReviewCycleId,
        setSelectedReviewCycleId,
        appraisals,
        okrGoals,
        submitSelfAppraisal,
        submitManagerEvaluation,
        calibrateAppraisal,
        addOKRGoal,
        updateOKRProgress,
        jobOpenings,
        candidates,
        selectedJobOpeningId,
        setSelectedJobOpeningId,
        selectedCandidate,
        setSelectedCandidate,
        addJobOpening,
        updateJobOpeningStatus,
        addCandidate,
        updateCandidateStage,
        addCandidateScorecard,
        hireCandidate,
        // Phase 6: ESS & Communications
        salaryAdvances,
        expenseClaims,
        documentLetters,
        assetRequests,
        profileUpdates,
        announcements,
        policyDocuments,
        companyEvents,
        submitSalaryAdvance,
        reviewSalaryAdvance,
        submitExpenseClaim,
        reviewExpenseClaim,
        submitDocumentLetter,
        reviewDocumentLetter,
        submitAssetRequest,
        reviewAssetRequest,
        submitProfileUpdate,
        reviewProfileUpdate,
        addAnnouncement,
        deleteAnnouncement,
        toggleAnnouncementReaction,
        addCompanyEvent,
        isAuthenticated,
        currentUser,
        login,
        register,
        logout,
        resetAllData,
        canPerformAction,
      }}
    >
      {children}
    </HRContext.Provider>
  );
};

export const useHR = (): HRContextType => {
  const context = useContext(HRContext);
  if (!context) {
    throw new Error('useHR must be used within an HRProvider');
  }
  return context;
};
