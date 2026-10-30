import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDashboard } from '../hooks/useInventory';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { TableSkeleton, CardSkeleton } from '../components/ui/Skeleton';
import { formatCurrency, formatNumber, formatDate, getStockStatus } from '../lib/utils';
import {
  Package,
  IndianRupee,
  AlertTriangle,
  XCircle,
  ArrowDownLeft,
  ArrowUpRight,
  TrendingUp,
  ArrowRight,
  Plus,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

const DONUT_COLORS = ['#4f46e5', '#06b6d4', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];

export function Dashboard() {
  const { data, isLoading, error } = useDashboard();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <CardSkeleton />
          </div>
          <CardSkeleton />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-xl">
        <p className="text-red-600 dark:text-red-400 font-semibold">
          Failed to load dashboard data: {error.message}
        </p>
      </div>
    );
  }

  const {
    kpis,
    movementTrends,
    categoryValuation,
    topMovers,
    lowStockItems,
    recentMovements,
  } = data;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Inventory Dashboard
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time stock valuation, movements ledger, and threshold alerts
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/stock-out')}
            className="flex items-center gap-1.5"
          >
            <ArrowUpRight className="w-4 h-4 text-rose-500" />
            Stock Out
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/stock-in')}
            className="flex items-center gap-1.5"
          >
            <ArrowDownLeft className="w-4 h-4 text-white" />
            Stock In
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Stock Value */}
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Total Stock Value
              </p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                {formatCurrency(kpis.totalStockValue)}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Across {kpis.totalProducts} active products
              </p>
            </div>
            <div className="p-3 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-2xl">
              <IndianRupee className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        {/* Low Stock Items */}
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Low Stock Items
              </p>
              <h3 className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">
                {kpis.lowStockCount}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Requires replenishment
              </p>
            </div>
            <div className="p-3 bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 rounded-2xl">
              <AlertTriangle className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        {/* Out of Stock Items */}
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Out of Stock
              </p>
              <h3 className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">
                {kpis.outOfStockCount}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Zero inventory available
              </p>
            </div>
            <div className="p-3 bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 rounded-2xl">
              <XCircle className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        {/* Today's In / Out */}
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Today's Activity
              </p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                  +{kpis.todayIn}
                </span>
                <span className="text-slate-300">/</span>
                <span className="text-xl font-bold text-rose-600 dark:text-rose-400">
                  -{kpis.todayOut}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Received / Dispatched units
              </p>
            </div>
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-2xl">
              <TrendingUp className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Stock Movements Area Chart (30 Days) */}
        <Card className="lg:col-span-2">
          <CardHeader
            title="Stock Movement Trends (Last 30 Days)"
            subtitle="Daily comparison of incoming (IN) vs outgoing (OUT) units"
            action={
              <Link
                to="/movements"
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium inline-flex items-center gap-1"
              >
                Full Ledger <ArrowRight className="w-3 h-3" />
              </Link>
            }
          />
          <CardContent className="p-5">
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={movementTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorIn" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorOut" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} />
                  <YAxis tick={{ fontSize: 11 }} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderRadius: '0.75rem',
                      border: 'none',
                      color: '#ffffff',
                      fontSize: '12px',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="IN"
                    name="Stock In"
                    stroke="#4f46e5"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorIn)"
                  />
                  <Area
                    type="monotone"
                    dataKey="OUT"
                    name="Stock Out"
                    stroke="#f43f5e"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorOut)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Stock Value by Category (Donut) */}
        <Card>
          <CardHeader
            title="Stock Value by Category"
            subtitle="Valuation distribution"
          />
          <CardContent className="p-5 flex flex-col items-center">
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryValuation}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {categoryValuation.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={DONUT_COLORS[index % DONUT_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val) => formatCurrency(val)}
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderRadius: '0.75rem',
                      border: 'none',
                      color: '#ffffff',
                      fontSize: '12px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="w-full mt-2 space-y-1.5 max-h-32 overflow-y-auto pr-1">
              {categoryValuation.map((cat, idx) => (
                <div key={cat.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 truncate">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: DONUT_COLORS[idx % DONUT_COLORS.length] }}
                    />
                    <span className="text-slate-600 dark:text-slate-300 truncate">
                      {cat.name}
                    </span>
                  </div>
                  <span className="font-semibold text-slate-800 dark:text-slate-100">
                    {formatCurrency(cat.value)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tables Section: Low Stock Items & Recent Movements */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Low Stock Items with Restock Quick Action */}
        <Card>
          <CardHeader
            title="Low Stock Items"
            subtitle="Items below configured minimum safety threshold"
            action={
              <Link
                to="/products?status=low"
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium inline-flex items-center gap-1"
              >
                View All <ArrowRight className="w-3 h-3" />
              </Link>
            }
          />
          <CardContent className="p-0">
            {lowStockItems.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">
                All items have sufficient stock levels!
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 font-semibold border-b border-slate-100 dark:border-slate-800">
                    <tr>
                      <th className="px-4 py-3">Product</th>
                      <th className="px-4 py-3">Stock</th>
                      <th className="px-4 py-3">Min</th>
                      <th className="px-4 py-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {lowStockItems.map((item) => {
                      const status = getStockStatus(item.current_stock, item.min_stock);
                      return (
                        <tr key={item.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                          <td className="px-4 py-3">
                            <p className="font-semibold text-slate-900 dark:text-slate-100 truncate max-w-[180px]">
                              {item.name}
                            </p>
                            <p className="text-[11px] text-slate-400">SKU: {item.sku}</p>
                          </td>
                          <td className="px-4 py-3 font-bold text-amber-600 dark:text-amber-400">
                            {item.current_stock} {item.unit}
                          </td>
                          <td className="px-4 py-3 text-slate-500">
                            {item.min_stock} {item.unit}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <Button
                              variant="outline"
                              size="xs"
                              onClick={() => navigate(`/stock-in?productId=${item.id}`)}
                            >
                              Restock
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 10 Most Recent Movements */}
        <Card>
          <CardHeader
            title="Recent Stock Movements"
            subtitle="Latest incoming, dispatch, and adjustment ledger events"
            action={
              <Link
                to="/movements"
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium inline-flex items-center gap-1"
              >
                Full History <ArrowRight className="w-3 h-3" />
              </Link>
            }
          />
          <CardContent className="p-0">
            {recentMovements.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">
                No movements recorded yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 font-semibold border-b border-slate-100 dark:border-slate-800">
                    <tr>
                      <th className="px-4 py-3">Type</th>
                      <th className="px-4 py-3">Product</th>
                      <th className="px-4 py-3">Qty</th>
                      <th className="px-4 py-3">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {recentMovements.map((m) => (
                      <tr key={m.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                        <td className="px-4 py-3">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                              m.type === 'IN'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                : m.type === 'OUT'
                                ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                                : 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300'
                            }`}
                          >
                            {m.type}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-medium text-slate-900 dark:text-slate-100 truncate max-w-[170px]">
                            {m.product_name}
                          </p>
                          <p className="text-[10px] text-slate-400">{m.reason || m.reference || '-'}</p>
                        </td>
                        <td
                          className={`px-4 py-3 font-semibold ${
                            m.quantity > 0
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : 'text-rose-600 dark:text-rose-400'
                          }`}
                        >
                          {m.quantity > 0 ? `+${m.quantity}` : m.quantity} {m.product_unit}
                        </td>
                        <td className="px-4 py-3 text-slate-400">
                          {formatDate(m.created_at, 'dd MMM, hh:mm a')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top 5 Fast Moving Items Banner */}
      {topMovers.length > 0 && (
        <Card className="bg-gradient-to-r from-indigo-50/50 to-slate-50 dark:from-slate-900 dark:to-slate-900/80">
          <CardHeader
            title="Fast-Moving Products"
            subtitle="Top products by dispatch / sales volume"
          />
          <CardContent className="p-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
              {topMovers.map((item, index) => (
                <div
                  key={item.id}
                  className="bg-white dark:bg-slate-800/80 p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-700 shadow-2xs"
                >
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                    <span className="font-bold text-indigo-600">#{index + 1}</span>
                    <span className="text-[11px] font-semibold text-rose-500">
                      -{item.totalOut} {item.unit}
                    </span>
                  </div>
                  <h4 className="font-semibold text-sm text-slate-900 dark:text-white truncate">
                    {item.name}
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">SKU: {item.sku}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
