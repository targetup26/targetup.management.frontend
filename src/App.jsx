import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster, toast } from 'react-hot-toast';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import AttendancePage from './pages/AttendancePage';
import EmployeesPage from './pages/EmployeesPage';
import DepartmentsPage from './pages/DepartmentsPage';
import ReportsPage from './pages/ReportsPage';
import SettingsPage from './pages/SettingsPage';
import NetworkMonitorPage from './pages/NetworkMonitorPage';
import LoginPage from './pages/LoginPage';
import MobileApp from './pages/MobileApp';
import JoinFormPage from './pages/JoinFormPage';
import FormsPage from './pages/FormsPage';
import EmployeeFormPage from './pages/EmployeeFormPage';
import LeadsRequestPage from './pages/LeadsRequestPage';
import LeadsDashboardPage from './pages/LeadsDashboardPage';


import RequestHistoryPage from './pages/RequestHistoryPage';
import SalesLoginPage from './pages/sales/SalesLoginPage';
import SalesProfilePage from './pages/sales/SalesProfilePage';
import CategoryDashboard from './pages/CategoryDashboard';

// Admin Pages
import AdminLayout from './components/AdminLayout';
import DashboardPage from './pages/admin/DashboardPage';
import GlobalSettingsPage from './pages/admin/GlobalSettingsPage';
import AdminSalesSettings from './pages/admin/AdminSalesSettings';
// import IPRulesPage from './pages/admin/IPRulesPage';
import AuditLogsPage from './pages/admin/AuditLogsPage';
import UserManagementPage from './pages/admin/UserManagementPage';
import RoleManagementPage from './pages/admin/RoleManagementPage';
import FileManagerPage from './pages/admin/FileManagerPage';
import StorageSettingsPage from './pages/admin/StorageSettingsPage';
import ChatControlPage from './pages/admin/ChatControlPage';
import FormSubmissionsPage from './pages/admin/FormSubmissionsPage';
import FormTemplatesPage from './pages/admin/FormTemplatesPage';
import FormTemplateEditorPage from './pages/admin/FormTemplateEditorPage';
import FormAuditPage from './pages/admin/FormAuditPage';
import BreaksPage from './pages/admin/BreaksPage';
import EmployeeDetailsPage from './pages/admin/EmployeeDetailsPage';
import FormReviewPage from './pages/admin/FormReviewPage';
import PrintPage from './pages/admin/PrintPage';
import PrintSettingsPage from './pages/admin/PrintSettingsPage';
import OrganizationPage from './pages/admin/OrganizationPage';
import TaxonomyManagementPage from './pages/admin/TaxonomyManagementPage';
import MyFilesPage from './pages/MyFilesPage';
import SalesLayout from './components/SalesLayout';


function App() {
  const registerSW = useRegisterSW({
    onOfflineReady() {
      toast.success('Sales App is ready for offline use!', { duration: 5000 });
    },
    onNeedUpdate() {
      toast('Update available! Updating...', { icon: '🔄' });
      registerSW?.updateServiceWorker?.(true);
    },
  });

  const {
    offlineReady: [offlineReady, setOfflineReady] = [false, () => { }],
    needUpdate: [needUpdate, setNeedUpdate] = [false, () => { }],
    updateServiceWorker = () => { },
  } = registerSW || {};

  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/sales/login" element={<SalesLoginPage />} />
          <Route path="/join" element={<JoinFormPage />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            {/* Mobile Interface */}
            <Route path="/app" element={<MobileApp />} />

            {/* Admin Panel - Temporarily disabled until pages are restored */}
            <Route path="/admin/print/:id" element={<PrintPage />} />
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<DashboardPage />} />
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="settings" element={<GlobalSettingsPage />} />
              <Route path="sales" element={<AdminSalesSettings />} />
              <Route path="audit-logs" element={<AuditLogsPage />} />
              <Route path="users" element={<UserManagementPage />} />
              <Route path="users/:id" element={<EmployeeDetailsPage />} />
              <Route path="roles" element={<RoleManagementPage />} />
              <Route path="files" element={<FileManagerPage />} />
              <Route path="chat" element={<ChatControlPage />} />
              <Route path="forms" element={<FormSubmissionsPage />} />
              <Route path="forms/:id" element={<FormReviewPage />} />
              <Route path="forms/templates" element={<FormTemplatesPage />} />
              <Route path="forms/templates/new" element={<FormTemplateEditorPage />} />
              <Route path="forms/templates/:id" element={<FormTemplateEditorPage />} />
              <Route path="forms/audit" element={<FormAuditPage />} />
              <Route path="breaks" element={<BreaksPage />} />
              <Route path="storage-settings" element={<StorageSettingsPage />} />
              <Route path="network-monitor" element={<NetworkMonitorPage />} />
              <Route path="settings/print" element={<PrintSettingsPage />} />
              <Route path="organization" element={<OrganizationPage />} />
              <Route path="taxonomy" element={<TaxonomyManagementPage />} />
            </Route>

            {/* HR/Dashboard Routes */}
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="attendance" element={<AttendancePage />} />
              <Route path="employees" element={<EmployeesPage />} />
              <Route path="departments" element={<DepartmentsPage />} />
              <Route path="reports" element={<ReportsPage />} />
              <Route path="my-files" element={<MyFilesPage />} />
              <Route path="forms" element={<FormsPage />} />
              <Route path="forms/:templateId" element={<EmployeeFormPage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="network-monitor" element={<NetworkMonitorPage />} />
            </Route>

            {/* Sales Portal Gateway */}
            <Route path="/sales" element={<SalesLayout />}>
              <Route index element={<CategoryDashboard />} />
              <Route path="categories" element={<CategoryDashboard />} />
              <Route path="request" element={<LeadsRequestPage />} />
              <Route path="dashboard" element={<LeadsDashboardPage />} />
              <Route path="leads" element={<LeadsDashboardPage />} />
              <Route path="history" element={<RequestHistoryPage />} />
              <Route path="profile" element={<SalesProfilePage />} />
            </Route>
            {/* Fallback 404 Route */}
            <Route path="*" element={
              <div className="min-h-screen flex items-center justify-center bg-background text-white flex-col gap-4">
                <h1 className="text-4xl font-bold text-primary">404</h1>
                <p className="text-text-secondary">Page not found</p>
                <div className="glass-panel p-4 text-xs font-mono text-text-muted">
                  Path: {window.location.pathname}
                </div>
                <button
                  onClick={() => window.location.href = '/'}
                  className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/80 transition"
                >
                  Return Home
                </button>
              </div>
            } />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
