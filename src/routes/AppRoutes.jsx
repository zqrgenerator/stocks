import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute, RoleGuard, PublicOnlyRoute } from './RouteGuards';
import { AppLayout } from '../components/layout/AppLayout';

// Pages
import { Login } from '../pages/auth/Login';
import { Signup } from '../pages/auth/Signup';
import { Dashboard } from '../pages/Dashboard';
import { Products } from '../pages/products/Products';
import { ProductDetail } from '../pages/products/ProductDetail';
import { StockIn } from '../pages/stock/StockIn';
import { StockOut } from '../pages/stock/StockOut';
import { Adjustments } from '../pages/stock/Adjustments';
import { Movements } from '../pages/movements/Movements';
import { Suppliers } from '../pages/suppliers/Suppliers';
import { SupplierDetail } from '../pages/suppliers/SupplierDetail';
import { Categories } from '../pages/categories/Categories';
import { Reports } from '../pages/reports/Reports';
import { Users } from '../pages/users/Users';
import { Settings } from '../pages/settings/Settings';
import { AuditLog } from '../pages/audit/AuditLog';
import { Profile } from '../pages/profile/Profile';
import { NotFound } from '../pages/NotFound';

export function AppRoutes() {
  return (
    <Routes>
      {/* Public Auth Routes */}
      <Route
        path="/login"
        element={
          <PublicOnlyRoute>
            <Login />
          </PublicOnlyRoute>
        }
      />
      <Route
        path="/signup"
        element={
          <PublicOnlyRoute>
            <Signup />
          </PublicOnlyRoute>
        }
      />

      {/* Protected App Routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="products" element={<Products />} />
        <Route path="products/:id" element={<ProductDetail />} />
        <Route path="stock-in" element={<StockIn />} />
        <Route path="stock-out" element={<StockOut />} />
        
        {/* Admin and Manager Only */}
        <Route
          path="adjustments"
          element={
            <RoleGuard allowedRoles={['admin', 'manager']}>
              <Adjustments />
            </RoleGuard>
          }
        />
        
        <Route path="movements" element={<Movements />} />
        <Route path="suppliers" element={<Suppliers />} />
        <Route path="suppliers/:id" element={<SupplierDetail />} />
        <Route path="categories" element={<Categories />} />
        <Route path="reports" element={<Reports />} />

        {/* Admin Only */}
        <Route
          path="users"
          element={
            <RoleGuard allowedRoles={['admin']}>
              <Users />
            </RoleGuard>
          }
        />
        <Route
          path="settings"
          element={
            <RoleGuard allowedRoles={['admin']}>
              <Settings />
            </RoleGuard>
          }
        />

        {/* Admin and Manager Only */}
        <Route
          path="audit-log"
          element={
            <RoleGuard allowedRoles={['admin', 'manager']}>
              <AuditLog />
            </RoleGuard>
          }
        />

        <Route path="profile" element={<Profile />} />
      </Route>

      {/* 404 Catch-All */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
