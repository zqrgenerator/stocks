import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert } from 'lucide-react';
import { Button } from '../components/ui/Button';

export function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-500 font-medium">Loading BuildStaok...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

export function RoleGuard({ allowedRoles = ['admin'], children }) {
  const { role, loading } = useAuth();

  if (loading) {
    return null;
  }

  if (!allowedRoles.includes(role)) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6">
        <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-4">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">
          Access Restricted
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mb-6">
          This section is restricted to <strong>{allowedRoles.join(' or ')}</strong> roles. Your current role is <strong>{role}</strong>.
        </p>
        <Button variant="outline" size="sm" onClick={() => window.history.back()}>
          Go Back
        </Button>
      </div>
    );
  }

  return children;
}

export function PublicOnlyRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return null;
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
