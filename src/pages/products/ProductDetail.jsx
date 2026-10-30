import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useProduct } from '../../hooks/useInventory';
import { useAuth } from '../../context/AuthContext';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { TableSkeleton, CardSkeleton } from '../../components/ui/Skeleton';
import { formatCurrency, formatDate, getStockStatus } from '../../lib/utils';
import {
  ArrowLeft,
  ArrowDownLeft,
  ArrowUpRight,
  Sliders,
  Package,
  Layers,
  Truck,
  Calendar,
  Barcode,
  TrendingUp,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

export function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: product, isLoading, error } = useProduct(id);
  const { isManager } = useAuth();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <CardSkeleton />
        <CardSkeleton />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-4">
        <h3 className="text-lg font-bold">Product Not Found</h3>
        <p className="text-sm text-slate-500">
          The requested product could not be located in your inventory.
        </p>
        <Button variant="outline" size="sm" onClick={() => navigate('/products')}>
          Back to Products
        </Button>
      </div>
    );
  }

  const status = getStockStatus(product.current_stock, product.min_stock);
  const movements = product.movements || [];

  // Cumulative stock trend calculation for mini chart
  const reversedMovements = [...movements].reverse();
  let runningStock = 0;
  const chartData = reversedMovements.map((m) => {
    runningStock += Number(m.quantity || 0);
    return {
      date: formatDate(m.created_at, 'dd MMM'),
      stock: runningStock,
      change: m.quantity,
    };
  });

  const percentageToMin = product.min_stock > 0
    ? Math.min(100, Math.round((product.current_stock / (product.min_stock * 2)) * 100))
    : 100;

  return (
    <div className="space-y-6">
      {/* Back button and page actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/products')}
            className="flex items-center gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" />
            Products
          </Button>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              {product.name}
            </h1>
            <p className="text-xs text-slate-400 mt-0.5 font-mono">SKU: {product.sku}</p>
          </div>
        </div>

        {/* Quick Stock Action Buttons */}
        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate(`/stock-in?productId=${product.id}`)}
            className="flex items-center gap-1.5 shadow-sm"
          >
            <ArrowDownLeft className="w-4 h-4" />
            Stock In
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/stock-out?productId=${product.id}`)}
            className="flex items-center gap-1.5"
          >
            <ArrowUpRight className="w-4 h-4 text-rose-500" />
            Stock Out
          </Button>
          {isManager && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/adjustments?productId=${product.id}`)}
              className="flex items-center gap-1.5"
            >
              <Sliders className="w-4 h-4 text-amber-500" />
              Adjust
            </Button>
          )}
        </div>
      </div>

      {/* Main Stats and Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Product Information Card */}
        <Card className="lg:col-span-2">
          <CardHeader title="Product Details & Pricing" />
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-6">
              {/* Product Image */}
              <div className="w-full sm:w-44 h-44 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-hidden flex items-center justify-center shrink-0">
                {product.image_url ? (
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Package className="w-12 h-12 text-slate-400" />
                )}
              </div>

              {/* Specs & Attributes */}
              <div className="flex-1 grid grid-cols-2 gap-4 text-xs sm:text-sm">
                <div>
                  <span className="text-slate-400 block text-[11px] uppercase tracking-wider font-semibold">
                    Category
                  </span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {product.category_name || 'Uncategorized'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px] uppercase tracking-wider font-semibold">
                    Preferred Supplier
                  </span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {product.supplier_name || 'Direct / None'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px] uppercase tracking-wider font-semibold">
                    Cost Price
                  </span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {formatCurrency(product.cost_price)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px] uppercase tracking-wider font-semibold">
                    Selling Price
                  </span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {formatCurrency(product.sell_price)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px] uppercase tracking-wider font-semibold">
                    Barcode / EAN
                  </span>
                  <span className="font-mono text-slate-800 dark:text-slate-200">
                    {product.barcode || 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px] uppercase tracking-wider font-semibold">
                    Measurement Unit
                  </span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {product.unit}
                  </span>
                </div>
              </div>
            </div>

            {product.description && (
              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                <span className="text-slate-400 block text-[11px] uppercase tracking-wider font-semibold mb-1">
                  Description
                </span>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {product.description}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stock Level Gauge & Health Card */}
        <Card>
          <CardHeader title="Stock Health Gauge" />
          <CardContent className="p-6 space-y-5">
            <div className="text-center space-y-1">
              <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">
                Current Available Quantity
              </span>
              <div className="text-4xl font-extrabold text-slate-900 dark:text-white">
                {product.current_stock}{' '}
                <span className="text-base font-normal text-slate-400">{product.unit}</span>
              </div>
              <div className="pt-1">
                <Badge
                  variant={
                    status.status === 'in'
                      ? 'success'
                      : status.status === 'low'
                      ? 'warning'
                      : 'danger'
                  }
                  dot
                  className="text-xs px-3 py-1"
                >
                  {status.label}
                </Badge>
              </div>
            </div>

            {/* Gauge progress bar */}
            <div className="space-y-1.5 pt-2">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-500">Threshold: {product.min_stock} {product.unit}</span>
                <span className="text-slate-800 dark:text-slate-200">
                  {product.current_stock > product.min_stock ? 'Safe Capacity' : 'Low Buffer'}
                </span>
              </div>
              <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    product.current_stock <= 0
                      ? 'bg-red-500 w-2'
                      : product.current_stock <= product.min_stock
                      ? 'bg-amber-500'
                      : 'bg-emerald-500'
                  }`}
                  style={{ width: `${Math.max(5, percentageToMin)}%` }}
                />
              </div>
            </div>

            {/* Total value callout */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-xs">
              <span className="text-slate-500">Total Asset Value:</span>
              <span className="font-bold text-slate-900 dark:text-white">
                {formatCurrency(product.stock_value)}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Mini Trend Chart */}
      {chartData.length > 0 && (
        <Card>
          <CardHeader
            title="Stock Inventory Curve"
            subtitle="Historical stock balance trajectory based on ledger events"
          />
          <CardContent className="p-5">
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                    dataKey="stock"
                    name="Stock Units"
                    stroke="#4f46e5"
                    strokeWidth={2}
                    fill="#e0e7ff"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Product Movements Ledger Table */}
      <Card>
        <CardHeader
          title="Stock Movement Ledger"
          subtitle={`All recorded transaction entries for ${product.name}`}
        />
        <CardContent className="p-0">
          {movements.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">
              No transactions recorded for this item yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-semibold border-b border-slate-200/80 dark:border-slate-800">
                  <tr>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Quantity</th>
                    <th className="px-4 py-3">Reference / Bill</th>
                    <th className="px-4 py-3">Reason / Note</th>
                    <th className="px-4 py-3">Unit Cost</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {movements.map((m) => (
                    <tr key={m.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                      <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                        {formatDate(m.created_at, 'dd MMM yyyy, hh:mm a')}
                      </td>
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
                      <td
                        className={`px-4 py-3 font-semibold ${
                          m.quantity > 0
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-rose-600 dark:text-rose-400'
                        }`}
                      >
                        {m.quantity > 0 ? `+${m.quantity}` : m.quantity} {product.unit}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-slate-600 dark:text-slate-300">
                        {m.reference || '-'}
                      </td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                        {m.reason || m.note || '-'}
                      </td>
                      <td className="px-4 py-3 text-slate-500">
                        {m.unit_cost ? formatCurrency(m.unit_cost) : '-'}
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
  );
}
