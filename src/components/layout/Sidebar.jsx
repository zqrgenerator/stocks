import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Package,
  ArrowDownLeft,
  ArrowUpRight,
  Sliders,
  History,
  Truck,
  Tags,
  FileBarChart2,
  Users,
  Settings,
  ShieldAlert,
  X,
  Layers,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { Badge } from '../ui/Badge';

export function Sidebar({ mobileOpen, onCloseMobile }) {
  const { role, isAdmin, isManager } = useAuth();

  const mainNavigation = [
    { name: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
    { name: 'Products', to: '/products', icon: Package },
    { name: 'Stock In', to: '/stock-in', icon: ArrowDownLeft },
    { name: 'Stock Out', to: '/stock-out', icon: ArrowUpRight },
    ...(isManager ? [{ name: 'Adjustments', to: '/adjustments', icon: Sliders }] : []),
    { name: 'Movements', to: '/movements', icon: History },
    { name: 'Suppliers', to: '/suppliers', icon: Truck },
    { name: 'Categories', to: '/categories', icon: Tags },
    { name: 'Reports', to: '/reports', icon: FileBarChart2 },
  ];

  const adminNavigation = [
    ...(isAdmin ? [{ name: 'Users & Roles', to: '/users', icon: Users }] : []),
    ...(isAdmin ? [{ name: 'Settings', to: '/settings', icon: Settings }] : []),
    ...(isManager ? [{ name: 'Audit Log', to: '/audit-log', icon: ShieldAlert }] : []),
  ];

  const NavItem = ({ item }) => {
    const Icon = item.icon;
    return (
      <NavLink
        to={item.to}
        onClick={onCloseMobile}
        className={({ isActive }) =>
          cn(
            'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group',
            isActive
              ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/80'
          )
        }
      >
        {({ isActive }) => (
          <>
            <Icon
              className={cn(
                'w-5 h-5 transition-transform group-hover:scale-105',
                isActive ? 'text-white' : 'text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400'
              )}
            />
            <span className="truncate">{item.name}</span>
          </>
        )}
      </NavLink>
    );
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 w-64 bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0',
          mobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        )}
      >
        {/* Brand Logo header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-800 flex items-center justify-center text-white shadow-md shadow-indigo-500/30">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5">
                BuildStaok
              </h1>
              <span className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold block -mt-1">
                Stock & Inventory
              </span>
            </div>
          </div>
          <button
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation items */}
        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-6">
          <div>
            <p className="px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Operations
            </p>
            <nav className="space-y-1">
              {mainNavigation.map((item) => (
                <NavItem key={item.to} item={item} />
              ))}
            </nav>
          </div>

          {adminNavigation.length > 0 && (
            <div>
              <p className="px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Administration
              </p>
              <nav className="space-y-1">
                {adminNavigation.map((item) => (
                  <NavItem key={item.to} item={item} />
                ))}
              </nav>
            </div>
          )}
        </div>

        {/* Current user badge & role in sidebar footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40">
          <div className="flex items-center justify-between">
            <div className="text-xs">
              <span className="text-slate-400">Current Role</span>
              <div className="font-semibold capitalize text-slate-700 dark:text-slate-200">
                {role}
              </div>
            </div>
            <Badge
              variant={isAdmin ? 'primary' : isManager ? 'warning' : 'neutral'}
              className="text-[10px] uppercase font-bold"
            >
              {role}
            </Badge>
          </div>
        </div>
      </aside>
    </>
  );
}
