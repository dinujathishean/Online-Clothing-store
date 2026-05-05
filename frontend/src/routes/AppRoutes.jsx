import { Navigate, Route, Routes } from 'react-router-dom';
import ShopLayout from '../layouts/ShopLayout.jsx';
import AdminLayout from '../layouts/AdminLayout.jsx';
import AuthLayout from '../components/auth/AuthLayout.jsx';
import { RequireAdmin, RequireAuth } from '../components/Guard.jsx';

import RegisterPage from '../pages/RegisterPage.jsx';
import LoginPage from '../pages/LoginPage.jsx';
import AdminLoginPage from '../pages/AdminLoginPage.jsx';

import HomePage from '../pages/shop/HomePage.jsx';
import ProductsPage from '../pages/shop/ProductsPage.jsx';
import ProductDetailPage from '../pages/shop/ProductDetailPage.jsx';
import CartPage from '../pages/shop/CartPage.jsx';
import CheckoutPage from '../pages/user/CheckoutPage.jsx';
import { OrderDetailsPage, OrdersPage } from '../pages/user/OrdersPage.jsx';

import AdminDashboardPlaceholderPage from '../pages/admin/AdminDashboardPlaceholderPage.jsx';
import AdminProductsPage from '../pages/admin/AdminProductsPage.jsx';
import AdminProductEditPage from '../pages/admin/AdminProductEditPage.jsx';
import AdminOrdersPage from '../pages/admin/AdminOrdersPage.jsx';
import AdminOrderDetailPage from '../pages/admin/AdminOrderDetailPage.jsx';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<ShopLayout />}>
        <Route index element={<HomePage />} />
        <Route path="products" element={<ProductsPage />} />
        <Route path="products/:slug" element={<ProductDetailPage />} />
        <Route path="cart" element={<CartPage />} />
        <Route
          path="checkout"
          element={
            <RequireAuth>
              <CheckoutPage />
            </RequireAuth>
          }
        />
        <Route
          path="orders"
          element={
            <RequireAuth>
              <OrdersPage />
            </RequireAuth>
          }
        />
        <Route
          path="orders/:id"
          element={
            <RequireAuth>
              <OrderDetailsPage />
            </RequireAuth>
          }
        />
      </Route>

      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/register"
        element={
          <AuthLayout>
            <RegisterPage />
          </AuthLayout>
        }
      />
      <Route
        path="/admin/login"
        element={
          <AuthLayout variant="admin" title="Staff">
            <AdminLoginPage />
          </AuthLayout>
        }
      />

      <Route
        path="/admin"
        element={
          <RequireAdmin>
            <AdminLayout />
          </RequireAdmin>
        }
      >
        <Route index element={<AdminDashboardPlaceholderPage />} />
        <Route path="products" element={<AdminProductsPage />} />
        <Route path="products/:id/edit" element={<AdminProductEditPage />} />
        <Route path="orders" element={<AdminOrdersPage />} />
        <Route path="orders/:id" element={<AdminOrderDetailPage />} />
      </Route>

      <Route path="/home" element={<Navigate to="/" replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
