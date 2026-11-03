import { lazy, Suspense } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import ErrorBoundary from './components/ui/ErrorBoundary.jsx';
import { PageSkeleton } from './components/ui/LoadingSkeleton.jsx';
import MotionProvider from './components/ui/MotionProvider.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { StoreProvider } from './context/StoreContext.jsx';
import { ToastProvider } from './context/ToastContext.jsx';
import StoreLayout from './layouts/StoreLayout.jsx';
import HomePage from './pages/public/HomePage.jsx';

// Pages load when first visited, so customers never download the admin dashboard and its charts.
const AdminLayout = lazy(() => import('./layouts/AdminLayout.jsx'));
const AdminBannersPage = lazy(() => import('./pages/admin/AdminBannersPage.jsx'));
const AdminBrandsPage = lazy(() => import('./pages/admin/AdminBrandsPage.jsx'));
const AdminCategoriesPage = lazy(() => import('./pages/admin/AdminCategoriesPage.jsx'));
const AdminDashboardPage = lazy(() => import('./pages/admin/AdminDashboardPage.jsx'));
const AdminInventoryPage = lazy(() => import('./pages/admin/AdminInventoryPage.jsx'));
const AdminLoginPage = lazy(() => import('./pages/admin/AdminLoginPage.jsx'));
const AdminLogsPage = lazy(() => import('./pages/admin/AdminLogsPage.jsx'));
const AdminOrdersPage = lazy(() => import('./pages/admin/AdminOrdersPage.jsx'));
const AdminPaymentsPage = lazy(() => import('./pages/admin/AdminPaymentsPage.jsx'));
const AdminProductsPage = lazy(() => import('./pages/admin/AdminProductsPage.jsx'));
const AdminProfilePage = lazy(() => import('./pages/admin/AdminProfilePage.jsx'));
const AdminSettingsPage = lazy(() => import('./pages/admin/AdminSettingsPage.jsx'));
const AdminUsersPage = lazy(() => import('./pages/admin/AdminUsersPage.jsx'));
const AboutPage = lazy(() => import('./pages/public/AboutPage.jsx'));
const AccountPage = lazy(() => import('./pages/public/AccountPage.jsx'));
const BlogPage = lazy(() => import('./pages/public/BlogPage.jsx'));
const CartPage = lazy(() => import('./pages/public/CartPage.jsx'));
const CategoryPage = lazy(() => import('./pages/public/CategoryPage.jsx'));
const CheckoutPage = lazy(() => import('./pages/public/CheckoutPage.jsx'));
const ContactPage = lazy(() => import('./pages/public/ContactPage.jsx'));
const ForgotPasswordPage = lazy(() => import('./pages/public/ForgotPasswordPage.jsx'));
const LoginPage = lazy(() => import('./pages/public/LoginPage.jsx'));
const OrderDetailsPage = lazy(() => import('./pages/public/OrderDetailsPage.jsx'));
const OrdersPage = lazy(() => import('./pages/public/OrdersPage.jsx'));
const ProductPage = lazy(() => import('./pages/public/ProductPage.jsx'));
const RegisterPage = lazy(() => import('./pages/public/RegisterPage.jsx'));
const ResetPasswordPage = lazy(() => import('./pages/public/ResetPasswordPage.jsx'));
const SearchPage = lazy(() => import('./pages/public/SearchPage.jsx'));
const ShopPage = lazy(() => import('./pages/public/ShopPage.jsx'));
const WishlistPage = lazy(() => import('./pages/public/WishlistPage.jsx'));

export default function App() {
  return (
    <BrowserRouter>
      <MotionProvider>
        <AuthProvider>
          <ToastProvider>
            <StoreProvider>
              <ErrorBoundary>
                <Suspense fallback={<PageSkeleton />}>
                  <Routes>
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                    <Route path="/reset-password" element={<ResetPasswordPage />} />
                    <Route path="/admin/login" element={<AuthProvider admin><AdminLoginPage /></AuthProvider>} />
    
                    <Route element={<StoreLayout />}>
                      <Route path="/" element={<HomePage />} />
                      <Route path="/shop" element={<ShopPage />} />
                      <Route path="/search" element={<SearchPage />} />
                      <Route path="/category/:slug" element={<CategoryPage />} />
                      <Route path="/product/:slug" element={<ProductPage />} />
                      <Route path="/about" element={<AboutPage />} />
                      <Route path="/blog" element={<BlogPage />} />
                      <Route path="/contact" element={<ContactPage />} />
                      <Route element={<ProtectedRoute loginPath="/login" />}>
                        <Route path="/account" element={<AccountPage />} />
                        <Route path="/wishlist" element={<WishlistPage />} />
                        <Route path="/cart" element={<CartPage />} />
                        <Route path="/checkout" element={<CheckoutPage />} />
                        <Route path="/orders" element={<OrdersPage />} />
                        <Route path="/orders/:id" element={<OrderDetailsPage />} />
                      </Route>
                    </Route>
    
                    <Route element={<AuthProvider admin><ProtectedRoute role="ADMIN" loginPath="/admin/login" /></AuthProvider>}>
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
                </Suspense>
              </ErrorBoundary>
            </StoreProvider>
          </ToastProvider>
        </AuthProvider>
      </MotionProvider>
    </BrowserRouter>
  );
}
