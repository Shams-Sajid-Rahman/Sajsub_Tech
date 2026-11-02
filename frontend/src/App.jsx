import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { ToastProvider } from './context/ToastContext.jsx';
import AdminLayout from './layouts/AdminLayout.jsx';
import AdminBannersPage from './pages/admin/AdminBannersPage.jsx';
import AdminBrandsPage from './pages/admin/AdminBrandsPage.jsx';
import AdminCategoriesPage from './pages/admin/AdminCategoriesPage.jsx';
import AdminDashboardPage from './pages/admin/AdminDashboardPage.jsx';
import AdminInventoryPage from './pages/admin/AdminInventoryPage.jsx';
import AdminLoginPage from './pages/admin/AdminLoginPage.jsx';
import AdminLogsPage from './pages/admin/AdminLogsPage.jsx';
import AdminOrdersPage from './pages/admin/AdminOrdersPage.jsx';
import AdminPaymentsPage from './pages/admin/AdminPaymentsPage.jsx';
import AdminProductsPage from './pages/admin/AdminProductsPage.jsx';
import AdminProfilePage from './pages/admin/AdminProfilePage.jsx';
import AdminSettingsPage from './pages/admin/AdminSettingsPage.jsx';
import AdminUsersPage from './pages/admin/AdminUsersPage.jsx';
import AccountPage from './pages/public/AccountPage.jsx';
import ForgotPasswordPage from './pages/public/ForgotPasswordPage.jsx';
import LoginPage from './pages/public/LoginPage.jsx';
import RegisterPage from './pages/public/RegisterPage.jsx';
import ResetPasswordPage from './pages/public/ResetPasswordPage.jsx';
import SetupStatusPage from './pages/public/SetupStatusPage.jsx';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            {/* Temporary home: replaced by the storefront homepage in a later phase. */}
            <Route path="/" element={<SetupStatusPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/admin/login" element={<AdminLoginPage />} />

            <Route element={<ProtectedRoute role="CUSTOMER" loginPath="/login" />}>
              <Route path="/account" element={<AccountPage />} />
            </Route>

            <Route element={<ProtectedRoute role="ADMIN" loginPath="/admin/login" />}>
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminDashboardPage />} />
                <Route path="users" element={<AdminUsersPage />} />
                <Route path="products" element={<AdminProductsPage />} />
                <Route path="categories" element={<AdminCategoriesPage />} />
                <Route path="brands" element={<AdminBrandsPage />} />
                <Route path="inventory" element={<AdminInventoryPage />} />
                <Route path="orders" element={<AdminOrdersPage />} />
                <Route path="payments" element={<AdminPaymentsPage />} />
                <Route path="banners" element={<AdminBannersPage />} />
                <Route path="settings" element={<AdminSettingsPage />} />
                <Route path="logs" element={<AdminLogsPage />} />
                <Route path="profile" element={<AdminProfilePage />} />
              </Route>
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
