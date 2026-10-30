import React, { useState, useMemo } from 'react';
import { useMovements, useProducts, useSuppliers, useSettings } from '../../hooks/useInventory';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { TableSkeleton, EmptyState } from '../../components/ui/Skeleton';
import { formatCurrency, formatDate, formatDateTime } from '../../lib/utils';
import { exportToExcel, exportToPDF } from '../../lib/exporters';
import {
  History,
  Download,
  Search,
  Filter,
  FileSpreadsheet,
  FileText,
  ChevronLeft,
  ChevronRight,
  ArrowDownLeft,
  ArrowUpRight,
  Sliders,
} from 'lucide-react';

export function Movements() {
  const { data: settings } = useSettings();
  const { data: products = [] } = useProducts();
  const { data: suppliers = [] } = useSuppliers();

  // Filter state
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL'); // ALL | IN | OUT | ADJUST
  const [selectedProduct, setSelectedProduct] = useState('');
  const [selectedSupplier, setSelectedSupplier] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const { data: movements = [], isLoading } = useMovements({
    type: typeFilter,
    productId: selectedProduct || undefined,
    supplierId: selectedSupplier || undefined,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
  });

  // Client-side text search
  const filteredMovements = useMemo(() => {
    if (!search.trim()) return movements;
    const q = search.toLowerCase();
    return movements.filter(
      (m) =>
        m.product_name?.toLowerCase().includes(q) ||
        m.product_sku?.toLowerCase().includes(q) ||
        m.reference?.toLowerCase().includes(q) ||
        m.reason?.toLowerCase().includes(q) ||
        m.note?.toLowerCase().includes(q) ||
        m.user_name?.toLowerCase().includes(q)
    );
  }, [movements, search]);

  // Pagination
  const [page, setPage] = useState(1);
  const pageSize = 12;
  const totalPages = Math.ceil(filteredMovements.length / pageSize) || 1;
  const paginatedMovements = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredMovements.slice(start, start + pageSize);
  }, [filteredMovements, page, pageSize]);

  const handleExportExcel = () => {
    const dataToExport = filteredMovements.map((m) => ({
      'Date & Time': formatDateTime(m.created_at),
      Type: m.type,
      Product: m.product_name,
      SKU: m.product_sku,
      Quantity: m.quantity,
      Unit: m.product_unit,
      'Unit Cost (INR)': m.unit_cost || '',
      Supplier: m.supplier_name || '-',
      'Reference / Bill': m.reference || '-',
      Reason: m.reason || '-',
      Note: m.note || '',
      'Created By': m.user_name || 'System',
    }));
    exportToExcel(dataToExport, 'BuildStaok_Movement_Ledger', 'Movements');
  };

  const handleExportPDF = () => {
    const headers = [
      'Date',
      'Type',
      'Product (SKU)',
      'Qty',
      'Ref / Bill',
      'Reason',
      'Recorded By',
    ];
    const rows = filteredMovements.map((m) => [
      formatDate(m.created_at, 'dd/MM/yy HH:mm'),
      m.type,
      `${m.product_name} (${m.product_sku})`,
      `${m.quantity > 0 ? '+' : ''}${m.quantity} ${m.product_unit}`,
      m.reference || '-',
      m.reason || '-',
      m.user_name || 'Admin',
    ]);

    exportToPDF({
      title: 'Stock Movement Ledger Report',
      companyName: settings?.company_name || 'BuildStaok Logistics Pvt Ltd',
      headers,
      rows,
      fileName: 'Stock_Movement_Ledger',
      orientation: 'landscape',
    });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <History className="w-6 h-6 text-indigo-600" />
            Stock Movement Ledger
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Immutable audit record of all incoming batches, dispatches, and inventory adjustments
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportExcel}
            className="flex items-center gap-1.5"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            Excel
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportPDF}
            className="flex items-center gap-1.5"
          >
            <FileText className="w-4 h-4 text-rose-600" />
            PDF
          </Button>
        </div>
      </div>

      {/* Filters Card */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
            {/* Search */}
            <div className="lg:col-span-2">
              <Input
                placeholder="Search reference, reason, note, user..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                leftIcon={<Search className="w-4 h-4" />}
              />
            </div>

            {/* Type */}
            <div>
              <select
                value={typeFilter}
                onChange={(e) => {
                  setTypeFilter(e.target.value);
                  setPage(1);
                }}
                className="w-full text-xs sm:text-sm h-9 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="ALL">All Movement Types</option>
                <option value="IN">IN (Received)</option>
                <option value="OUT">OUT (Dispatched)</option>
                <option value="ADJUST">ADJUST (Stocktake)</option>
              </select>
            </div>

            {/* Product */}
            <div>
              <select
                value={selectedProduct}
                onChange={(e) => {
                  setSelectedProduct(e.target.value);
                  setPage(1);
                }}
                className="w-full text-xs sm:text-sm h-9 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="">All Products</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Start Date */}
            <div>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setPage(1);
                }}
                title="Start Date"
              />
            </div>

            {/* End Date */}
            <div>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setPage(1);
                }}
                title="End Date"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ledger Table */}
      <Card className="overflow-hidden">
        {isLoading ? (
          <TableSkeleton rows={8} cols={7} />
        ) : filteredMovements.length === 0 ? (
          <EmptyState
            icon={History}
            title="No movements recorded"
            description="No transaction rows match your active date or ledger filters."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-semibold border-b border-slate-200/80 dark:border-slate-800">
                <tr>
                  <th className="px-4 py-3.5">Timestamp</th>
                  <th className="px-4 py-3.5">Type</th>
                  <th className="px-4 py-3.5">Product</th>
                  <th className="px-4 py-3.5">Quantity</th>
                  <th className="px-4 py-3.5">Reference</th>
                  <th className="px-4 py-3.5">Reason / Notes</th>
                  <th className="px-4 py-3.5">Supplier</th>
                  <th className="px-4 py-3.5">Recorded By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {paginatedMovements.map((m) => (
                  <tr
                    key={m.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="px-4 py-3 text-slate-500 whitespace-nowrap text-xs">
                      {formatDateTime(m.created_at)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
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
                      <p className="font-semibold text-slate-900 dark:text-slate-100 truncate max-w-xs">
                        {m.product_name}
                      </p>
                      <p className="text-[11px] font-mono text-slate-400">{m.product_sku}</p>
                    </td>
                    <td
                      className={`px-4 py-3 font-bold whitespace-nowrap ${
                        m.quantity > 0
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-rose-600 dark:text-rose-400'
                      }`}
                    >
                      {m.quantity > 0 ? `+${m.quantity}` : m.quantity} {m.product_unit}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-700 dark:text-slate-300">
                      {m.reference || '-'}
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                      <p className="capitalize font-medium">{m.reason || '-'}</p>
                      {m.note && <p className="text-[11px] text-slate-400 truncate max-w-xs">{m.note}</p>}
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                      {m.supplier_name || '-'}
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-xs">
                      {m.user_name || 'System Admin'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        {filteredMovements.length > pageSize && (
          <div className="px-4 py-3 bg-slate-50 dark:bg-slate-850 border-t border-slate-200/80 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
            <span>
              Showing {(page - 1) * pageSize + 1} to{' '}
              {Math.min(page * pageSize, filteredMovements.length)} of {filteredMovements.length} rows
            </span>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="xs"
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </Button>
              <span className="px-2 font-medium text-slate-700 dark:text-slate-300">
                {page} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="xs"
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
