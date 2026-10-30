import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useProducts } from '../../hooks/useInventory';
import {
  Menu,
  Search,
  Bell,
  Sun,
  Moon,
  User,
  LogOut,
  ChevronDown,
  AlertTriangle,
  ArrowRight,
  Shield,
  Layers,
} from 'lucide-react';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

export function TopBar({ onOpenMobile, onOpenCommandPalette }) {
  const { user, profile, role, logout, switchRole } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { data: products = [] } = useProducts();
  const navigate = useNavigate();

  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const notifRef = useRef(null);
  const userRef = useRef(null);

  // Filter low stock and out of stock items
  const lowStockProducts = products.filter(
    (p) => Number(p.current_stock || 0) <= Number(p.min_stock || 0)
  );

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotificationsOpen(false);
      }
      if (userRef.current && !userRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 px-4 sm:px-6 flex items-center justify-between transition-colors">
      {/* Left: Mobile hamburger & Global Search Button */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobile}
          className="lg:hidden p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Command Palette search trigger */}
        <button
          onClick={onOpenCommandPalette}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800/80 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 text-xs sm:text-sm border border-transparent dark:border-slate-700/60 transition-all shadow-sm w-44 sm:w-64 md:w-80 justify-between group"
        >
          <div className="flex items-center gap-2 truncate">
            <Search className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-colors shrink-0" />
            <span className="truncate">Search products, SKU, actions...</span>
          </div>
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 rounded bg-white dark:bg-slate-700 text-slate-500 dark:text-slate-300 font-mono text-[10px] border border-slate-200 dark:border-slate-600 shadow-2xs">
            Ctrl K
          </kbd>
        </button>
      </div>

      {/* Right: Notifications, Theme Toggle, User Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Low-stock Notification Bell */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="relative p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Low stock alerts"
          >
            <Bell className="w-5 h-5" />
            {lowStockProducts.length > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-white shadow-sm animate-pulse">
                {lowStockProducts.length > 9 ? '9+' : lowStockProducts.length}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-elevated z-50 overflow-hidden">
              <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    Stock Alerts
                  </h4>
                  <p className="text-xs text-slate-500">
                    {lowStockProducts.length} item(s) require reordering
                  </p>
                </div>
                <Badge variant={lowStockProducts.length > 0 ? 'warning' : 'success'}>
                  {lowStockProducts.length} Alert{lowStockProducts.length !== 1 ? 's' : ''}
                </Badge>
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                {lowStockProducts.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-500">
                    All inventory stock levels are healthy!
                  </div>
                ) : (
                  lowStockProducts.slice(0, 5).map((p) => (
                    <div
                      key={p.id}
                      className="p-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors flex items-start gap-3"
                    >
                      <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 shrink-0">
                        <AlertTriangle className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">
                          {p.name}
                        </p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          SKU: {p.sku} • Current: <span className="font-bold text-amber-600 dark:text-amber-400">{p.current_stock}</span> / Min: {p.min_stock} {p.unit}
                        </p>
                      </div>
                      <Button
                        size="xs"
                        variant="outline"
                        onClick={() => {
                          setNotificationsOpen(false);
                          navigate(`/stock-in?productId=${p.id}`);
                        }}
                      >
                        Restock
                      </Button>
                    </div>
                  ))
                )}
              </div>

              {lowStockProducts.length > 0 && (
                <div className="p-2.5 bg-slate-50 dark:bg-slate-950/60 border-t border-slate-100 dark:border-slate-800 text-center">
                  <Link
                    to="/reports"
                    onClick={() => setNotificationsOpen(false)}
                    className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1"
                  >
                    View Low Stock & Reorder Report <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Dark/Light mode toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
        >
          {isDark ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-600" />}
        </button>

        {/* User Menu */}
        <div className="relative" ref={userRef}>
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 to-indigo-700 text-white flex items-center justify-center font-semibold text-xs shadow-sm">
              {(profile?.full_name || user?.email || 'U')[0].toUpperCase()}
            </div>
            <div className="hidden md:block">
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-tight">
                {profile?.full_name || 'BuildStaok User'}
              </p>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">
                {role}
              </p>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400 hidden sm:block" />
          </button>

          {/* User Menu Dropdown */}
          {userMenuOpen && (
            <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-elevated z-50 p-2 space-y-1">
              <div className="p-3 border-b border-slate-100 dark:border-slate-800">
                <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                  {profile?.full_name || 'User'}
                </p>
                <p className="text-xs text-slate-400 truncate">{user?.email}</p>
                <div className="mt-2 flex items-center gap-1.5">
                  <Badge variant="primary" className="text-[10px] uppercase font-bold">
                    {role}
                  </Badge>
                </div>
              </div>

              {/* Fast Role Switcher (for effortless testing between Admin / Manager / Staff) */}
              <div className="p-2 border-b border-slate-100 dark:border-slate-800">
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <Shield className="w-3 h-3" /> Quick Switch Role
                </p>
                <div className="grid grid-cols-3 gap-1">
                  {['admin', 'manager', 'staff'].map((r) => (
                    <button
                      key={r}
                      onClick={() => {
                        switchRole(r);
                        setUserMenuOpen(false);
                      }}
                      className={`text-xs py-1 px-1.5 rounded font-medium capitalize text-center transition-colors ${
                        role === r
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              <Link
                to="/profile"
                onClick={() => setUserMenuOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <User className="w-4 h-4 text-slate-400" />
                Profile & Account
              </Link>

              <button
                onClick={() => {
                  setUserMenuOpen(false);
                  logout();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
