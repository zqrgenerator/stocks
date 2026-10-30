import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProducts } from '../../hooks/useInventory';
import {
  Search,
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
  ExternalLink,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { Badge } from './Badge';

export function CommandPalette({ isOpen, onClose }) {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const { data: products = [] } = useProducts();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        onClose(); // toggle or open
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const staticNavItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, group: 'Navigation' },
    { name: 'Products & Inventory', path: '/products', icon: Package, group: 'Navigation' },
    { name: 'Stock In (Receive)', path: '/stock-in', icon: ArrowDownLeft, group: 'Actions' },
    { name: 'Stock Out (Dispatch)', path: '/stock-out', icon: ArrowUpRight, group: 'Actions' },
    { name: 'Stock Adjustments (Audit)', path: '/adjustments', icon: Sliders, group: 'Actions' },
    { name: 'Movement Ledger', path: '/movements', icon: History, group: 'Navigation' },
    { name: 'Suppliers', path: '/suppliers', icon: Truck, group: 'Navigation' },
    { name: 'Categories', path: '/categories', icon: Tags, group: 'Navigation' },
    { name: 'Reports & Analytics', path: '/reports', icon: FileBarChart2, group: 'Navigation' },
    { name: 'User Management', path: '/users', icon: Users, group: 'Admin' },
    { name: 'Settings', path: '/settings', icon: Settings, group: 'Admin' },
    { name: 'Audit Log', path: '/audit-log', icon: ShieldAlert, group: 'Admin' },
  ];

  const filteredNav = staticNavItems.filter((item) =>
    item.name.toLowerCase().includes(query.toLowerCase())
  );

  const filteredProducts = query.trim()
    ? products
        .filter(
          (p) =>
            p.name.toLowerCase().includes(query.toLowerCase()) ||
            p.sku.toLowerCase().includes(query.toLowerCase()) ||
            (p.barcode && p.barcode.includes(query))
        )
        .slice(0, 5)
    : [];

  const handleSelect = (path) => {
    navigate(path);
    onClose();
    setQuery('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4">
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl shadow-elevated border border-slate-200 dark:border-slate-800 z-10 overflow-hidden transform transition-all">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 border-b border-slate-100 dark:border-slate-800">
          <Search className="w-5 h-5 text-slate-400 shrink-0 mr-3" />
          <input
            autoFocus
            type="text"
            placeholder="Search pages, products, SKU, or actions... (ESC to close)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full py-4 bg-transparent text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none"
          />
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-2 space-y-3">
          {/* Products match section */}
          {filteredProducts.length > 0 && (
            <div>
              <p className="px-3 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Matching Products
              </p>
              <div className="space-y-1">
                {filteredProducts.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => handleSelect(`/products/${p.id}`)}
                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left text-sm text-slate-700 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-slate-800 group transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs">
                        {p.sku.slice(0, 3)}
                      </div>
                      <div>
                        <p className="font-medium group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                          {p.name}
                        </p>
                        <p className="text-xs text-slate-400">
                          SKU: {p.sku} • Stock: {p.current_stock} {p.unit}
                        </p>
                      </div>
                    </div>
                    <Badge variant={p.current_stock > 0 ? 'success' : 'danger'}>
                      {p.current_stock > 0 ? 'In Stock' : 'Out'}
                    </Badge>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Navigation matches */}
          {filteredNav.length > 0 && (
            <div>
              <p className="px-3 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Quick Navigation & Commands
              </p>
              <div className="space-y-0.5">
                {filteredNav.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.path}
                      onClick={() => handleSelect(item.path)}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-left text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-4 h-4 text-slate-400 group-hover:text-indigo-600" />
                        <span>{item.name}</span>
                      </div>
                      <span className="text-xs text-slate-400">{item.group}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {filteredNav.length === 0 && filteredProducts.length === 0 && (
            <div className="p-8 text-center text-slate-400 text-sm">
              No matching pages or products found for "{query}".
            </div>
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-950/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>Navigate with mouse or keyboard</span>
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono text-[10px]">
              ESC
            </kbd>{' '}
            to close
          </span>
        </div>
      </div>
    </div>
  );
}
