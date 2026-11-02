import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { StoreProvider } from './context/StoreContext.jsx';
import { ToastProvider } from './context/ToastContext.jsx';
import AdminLayout from './layouts/AdminLayout.jsx';
import StoreLayout from './layouts/StoreLayout.jsx';
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
import AboutPage from './pages/public/AboutPage.jsx';
import BlogPage from './pages/public/BlogPage.jsx';
import CartPage from './pages/public/CartPage.jsx';
import CategoryPage from './pages/public/CategoryPage.jsx';
import CheckoutPage from './pages/public/CheckoutPage.jsx';
import ContactPage from './pages/public/ContactPage.jsx';
import HomePage from './pages/public/HomePage.jsx';
import OrderDetailsPage from './pages/public/OrderDetailsPage.jsx';
import OrdersPage from './pages/public/OrdersPage.jsx';
import ProductPage from './pages/public/ProductPage.jsx';
import SearchPage from './pages/public/SearchPage.jsx';
import ShopPage from './pages/public/ShopPage.jsx';
import WishlistPage from './pages/public/WishlistPage.jsx';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <StoreProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/admin/login" element={<AdminLoginPage />} />

            <Route element={<StoreLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/shop" element={<ShopPage />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/category/:slug" element={<CategoryPage />} />
              <Route path="/product/:slug" element={<ProductPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/blog" element={<BlogPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route element={<ProtectedRoute role="CUSTOMER" loginPath="/login" />}>
                <Route path="/account" element={<AccountPage />} />
                <Route path="/wishlist" element={<WishlistPage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/orders" element={<OrdersPage />} />
                <Route path="/orders/:id" element={<OrderDetailsPage />} />
              </Route>
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
          </StoreProvider>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
