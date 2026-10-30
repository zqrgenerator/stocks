import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { PackageX, Home, ArrowLeft } from 'lucide-react';

export function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-6 text-center">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-elevated border border-slate-200 dark:border-slate-800 space-y-5">
        <div className="w-16 h-16 rounded-3xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 mx-auto flex items-center justify-center">
          <PackageX className="w-8 h-8" />
        </div>
        <div>
          <span className="text-4xl font-extrabold text-indigo-600">404</span>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
            Page Not Found
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
            The page you are looking for doesn't exist or has been moved to another location.
          </p>
        </div>
        <div className="pt-2 flex items-center justify-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.history.back()}
            className="flex items-center gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </Button>
          <Link to="/dashboard">
            <Button variant="primary" size="sm" className="flex items-center gap-1.5">
              <Home className="w-4 h-4" />
              Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
