import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { HRProvider, useHR } from './context/HRContext';
import { LoginPage } from './components/auth/LoginPage';

const PAGE_TITLES: Record<string, string> = {
  dashboard: 'Overview Dashboard',
  self_service: 'Employee Self-Service',
  company_hub: 'Company Hub & Notices',
  employees: 'Employee Directory',
  attendance: 'Time & Attendance Terminal',
  leaves: 'Leave Management & Balances',
  payroll: 'Payroll & Statutory Deductions',
  appraisals: 'Performance Reviews & OKRs',
  recruitment: 'Recruitment & ATS',
  onboarding: 'Lifecycle & Transitions',
  departments: 'Department Allocations',
  org_chart: 'Organizational Hierarchy',
  audit: 'Audit & Compliance Trail',
};
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { OverviewDashboard } from './components/dashboard/OverviewDashboard';
import { EmployeeDirectory } from './components/employees/EmployeeDirectory';
import { AttendanceTrackingView } from './components/attendance/AttendanceTrackingView';
import { LeaveManagementView } from './components/leaves/LeaveManagementView';
import { OnboardingOffboardingView } from './components/lifecycle/OnboardingOffboardingView';
import { OrgChartAndDepartments } from './components/org/OrgChartAndDepartments';
import { AuditLogView } from './components/audit/AuditLogView';
import { PayrollProcessingView } from './components/payroll/PayrollProcessingView';
import { PerformanceAppraisalView } from './components/appraisals/PerformanceAppraisalView';
import { RecruitmentATSView } from './components/recruitment/RecruitmentATSView';
import { EmployeeSelfServiceView } from './components/selfservice/EmployeeSelfServiceView';
import { CompanyHubView } from './components/communications/CompanyHubView';
import { EmployeeDetailDrawer } from './components/employees/EmployeeDetailDrawer';
import { AddEmployeeModal } from './components/employees/AddEmployeeModal';
import { CommandPalette } from './components/common/CommandPalette';
import { DigitalPayslipModal } from './components/payroll/DigitalPayslipModal';

const MainContent: React.FC = () => {
  const { currentTab } = useHR();

  return (
    <main className="flex-1 bg-[#f4f7f6] min-h-screen overflow-y-auto">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentTab}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
          className="w-full"
        >
          {currentTab === 'dashboard' && <OverviewDashboard />}
          {currentTab === 'self_service' && <EmployeeSelfServiceView />}
          {currentTab === 'company_hub' && <CompanyHubView />}
          {currentTab === 'employees' && <EmployeeDirectory />}
          {currentTab === 'attendance' && <AttendanceTrackingView />}
          {currentTab === 'leaves' && <LeaveManagementView />}
          {currentTab === 'payroll' && <PayrollProcessingView />}
          {currentTab === 'appraisals' && <PerformanceAppraisalView />}
          {currentTab === 'recruitment' && <RecruitmentATSView />}
          {currentTab === 'onboarding' && <OnboardingOffboardingView />}
          {currentTab === 'departments' && <OrgChartAndDepartments initialTab="departments" />}
          {currentTab === 'org_chart' && <OrgChartAndDepartments initialTab="org_chart" />}
          {currentTab === 'audit' && <AuditLogView />}
        </motion.div>
      </AnimatePresence>
    </main>
  );
};

const GlobalOverlays: React.FC = () => {
  const { selectedPayslip, isPayslipModalOpen, setIsPayslipModalOpen } = useHR();

  return (
    <>
      <EmployeeDetailDrawer />
      <AddEmployeeModal />
      <CommandPalette />
      <DigitalPayslipModal
        payslip={selectedPayslip}
        isOpen={isPayslipModalOpen}
        onClose={() => setIsPayslipModalOpen(false)}
      />
    </>
  );
};

const AppShell: React.FC = () => {
  const { isAuthenticated, currentTab, currentUser } = useHR();

  useEffect(() => {
    if (!isAuthenticated) {
      document.title = 'Sign In — Semplo HR & Payroll';
    } else {
      const pageTitle = PAGE_TITLES[currentTab] || 'Dashboard';
      const company = currentUser?.companyName || 'Semplo';
      document.title = `${pageTitle} — ${company} HR`;
    }
  }, [isAuthenticated, currentTab, currentUser]);

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <div className="flex min-h-screen bg-[#f4f7f6] text-slate-900 selection:bg-emerald-600 selection:text-white font-sans animate-in fade-in duration-200">
      {/* Left Sidebar */}
      <Sidebar />

      {/* Right Application Frame */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <MainContent />
      </div>

      {/* Global Overlays & Modals */}
      <GlobalOverlays />
    </div>
  );
};

export default function App() {
  return (
    <HRProvider>
      <AppShell />
    </HRProvider>
  );
}
