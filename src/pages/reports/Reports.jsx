import React, { useState, useMemo } from 'react';
import {
  useProducts,
  useCategories,
  useSuppliers,
  useMovements,
  useSettings,
} from '../../hooks/useInventory';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { TableSkeleton } from '../../components/ui/Skeleton';
import { formatCurrency, formatDate, getStockStatus } from '../../lib/utils';
import { exportToExcel, exportToPDF } from '../../lib/exporters';
import {
  FileBarChart2,
  Download,
  FileSpreadsheet,
  FileText,
  Calendar,
  Layers,
  AlertTriangle,
  TrendingUp,
  Truck,
  IndianRupee,
} from 'lucide-react';

export function Reports() {
  const { data: settings } = useSettings();
  const { data: products = [], isLoading: prodsLoading } = useProducts();
  const { data: categories = [] } = useCategories();
  const { data: suppliers = [] } = useSuppliers();
  const { data: movements = [], isLoading: movsLoading } = useMovements();

  const [activeTab, setActiveTab] = useState('current-stock'); // 'current-stock' | 'valuation' | 'low-stock' | 'movements' | 'movers' | 'supplier'
  const [moverDays, setMoverDays] = useState(30); // 30 | 60 | 90
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const companyName = settings?.company_name || 'BuildStaok Logistics Pvt Ltd';

  // 1. Current Stock Data
  const currentStockData = useMemo(() => {
    return products.map((p) => {
      const status = getStockStatus(p.current_stock, p.min_stock);
      return {
        ...p,
        statusLabel: status.label,
      };
    });
  }, [products]);

  // 2. Stock Valuation by Category
  const valuationData = useMemo(() => {
    const map = {};
    for (const c of categories) {
      map[c.id] = {
        name: c.name,
        productCount: 0,
        totalUnits: 0,
        totalValuation: 0,
      };
    }
    for (const p of products) {
      const cId = p.category_id || 'other';
      if (!map[cId]) {
        map[cId] = {
          name: p.category_name || 'Uncategorized',
          productCount: 0,
          totalUnits: 0,
          totalValuation: 0,
        };
      }
      map[cId].productCount += 1;
      map[cId].totalUnits += Number(p.current_stock || 0);
      map[cId].totalValuation += Number(p.stock_value || 0);
    }
    return Object.values(map);
  }, [categories, products]);

  // 3. Low Stock / Reorder Data
  const lowStockData = useMemo(() => {
    return products
      .filter((p) => Number(p.current_stock || 0) <= Number(p.min_stock || 0))
      .map((p) => {
        const deficit = Math.max(0, Number(p.min_stock || 0) * 2 - Number(p.current_stock || 0));
        const estCost = deficit * Number(p.cost_price || 0);
        return {
          ...p,
          deficit,
          estCost,
        };
      });
  }, [products]);

  // 4. Movement Report with date filters
  const filteredMovementData = useMemo(() => {
    let result = movements;
    if (startDate) {
      result = result.filter((m) => new Date(m.created_at) >= new Date(startDate));
    }
    if (endDate) {
      const end = new Date(endDate + 'T23:59:59');
      result = result.filter((m) => new Date(m.created_at) <= end);
    }
    return result;
  }, [movements, startDate, endDate]);

  // 5. Fast vs Slow Movers (last 30/60/90 days)
  const moversData = useMemo(() => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - moverDays);

    const outMap = {};
    for (const m of movements) {
      if (m.type === 'OUT' && new Date(m.created_at) >= cutoff) {
        const qty = Math.abs(Number(m.quantity || 0));
        outMap[m.product_id] = (outMap[m.product_id] || 0) + qty;
      }
    }

    return products
      .map((p) => ({
        id: p.id,
        name: p.name,
        sku: p.sku,
        category: p.category_name,
        current_stock: p.current_stock,
        unit: p.unit,
        dispatchedQty: outMap[p.id] || 0,
        velocity: (outMap[p.id] || 0) > 20 ? 'Fast' : (outMap[p.id] || 0) > 0 ? 'Moderate' : 'Slow/Dormant',
      }))
      .sort((a, b) => b.dispatchedQty - a.dispatchedQty);
  }, [products, movements, moverDays]);

  // 6. Supplier Purchase Report
  const supplierPurchaseData = useMemo(() => {
    const supMap = {};
    for (const s of suppliers) {
      supMap[s.id] = {
        name: s.name,
        gstin: s.gstin || '-',
        inwardBatches: 0,
        totalUnits: 0,
        totalSpend: 0,
      };
    }

    for (const m of movements) {
      if (m.type === 'IN' && m.supplier_id) {
        if (!supMap[m.supplier_id]) {
          supMap[m.supplier_id] = {
            name: m.supplier_name || 'Vendor',
            gstin: '-',
            inwardBatches: 0,
            totalUnits: 0,
            totalSpend: 0,
          };
        }
        supMap[m.supplier_id].inwardBatches += 1;
        supMap[m.supplier_id].totalUnits += Number(m.quantity || 0);
        supMap[m.supplier_id].totalSpend +=
          Number(m.quantity || 0) * (Number(m.unit_cost) || 0);
      }
    }

    return Object.values(supMap);
  }, [suppliers, movements]);

  // EXPORTERS DISPATCHER
  const handleExport = (format) => {
    switch (activeTab) {
      case 'current-stock': {
        const headers = ['SKU', 'Product Name', 'Category', 'Current Stock', 'Unit', 'Cost (INR)', 'Sell (INR)', 'Valuation (INR)', 'Status'];
        const excelRows = currentStockData.map((p) => ({
          SKU: p.sku,
          Name: p.name,
          Category: p.category_name,
          Stock: p.current_stock,
          Unit: p.unit,
          CostPrice: p.cost_price,
          SellPrice: p.sell_price,
          Valuation: p.stock_value,
          Status: p.statusLabel,
        }));
        if (format === 'excel') {
          exportToExcel(excelRows, 'Current_Stock_Report', 'Stock');
        } else {
          const pdfRows = currentStockData.map((p) => [
            p.sku,
            p.name,
            p.category_name,
            `${p.current_stock} ${p.unit}`,
            p.cost_price,
            p.sell_price,
            p.stock_value,
            p.statusLabel,
          ]);
          exportToPDF({
            title: 'Current Stock Inventory Report',
            companyName,
            headers,
            rows: pdfRows,
            fileName: 'Current_Stock_Report',
            orientation: 'landscape',
          });
        }
        break;
      }

      case 'valuation': {
        const headers = ['Category', 'Product Count', 'Total Units', 'Total Valuation (INR)'];
        const excelRows = valuationData.map((v) => ({
          Category: v.name,
          'Product Count': v.productCount,
          'Total Units': v.totalUnits,
          'Valuation (INR)': v.totalValuation,
        }));
        if (format === 'excel') {
          exportToExcel(excelRows, 'Stock_Valuation_Report', 'Valuation');
        } else {
          const pdfRows = valuationData.map((v) => [
            v.name,
            v.productCount,
            v.totalUnits,
            formatCurrency(v.totalValuation),
          ]);
          exportToPDF({
            title: 'Inventory Valuation by Category',
            companyName,
            headers,
            rows: pdfRows,
            fileName: 'Valuation_Report',
          });
        }
        break;
      }

      case 'low-stock': {
        const headers = ['SKU', 'Product Name', 'Current Stock', 'Min Safety', 'Reorder Qty', 'Est Reorder Cost (INR)'];
        const excelRows = lowStockData.map((p) => ({
          SKU: p.sku,
          Name: p.name,
          'Current Stock': p.current_stock,
          'Min Stock': p.min_stock,
          'Suggested Reorder': p.deficit,
          'Est Cost': p.estCost,
        }));
        if (format === 'excel') {
          exportToExcel(excelRows, 'Low_Stock_Reorder_Report', 'LowStock');
        } else {
          const pdfRows = lowStockData.map((p) => [
            p.sku,
            p.name,
            `${p.current_stock} ${p.unit}`,
            `${p.min_stock} ${p.unit}`,
            `${p.deficit} ${p.unit}`,
            formatCurrency(p.estCost),
          ]);
          exportToPDF({
            title: 'Low Stock & Replenishment Reorder Report',
            companyName,
            headers,
            rows: pdfRows,
            fileName: 'Low_Stock_Report',
          });
        }
        break;
      }

      case 'movements': {
        const headers = ['Date', 'Type', 'Product', 'SKU', 'Quantity', 'Reference', 'Reason'];
        const excelRows = filteredMovementData.map((m) => ({
          Date: formatDate(m.created_at, 'yyyy-MM-dd HH:mm'),
          Type: m.type,
          Product: m.product_name,
          SKU: m.product_sku,
          Quantity: m.quantity,
          Reference: m.reference || '-',
          Reason: m.reason || '-',
        }));
        if (format === 'excel') {
          exportToExcel(excelRows, 'Stock_Movement_Report', 'Movements');
        } else {
          const pdfRows = filteredMovementData.map((m) => [
            formatDate(m.created_at, 'dd MMM yyyy'),
            m.type,
            m.product_name,
            m.product_sku,
            `${m.quantity > 0 ? '+' : ''}${m.quantity} ${m.product_unit}`,
            m.reference || '-',
            m.reason || '-',
          ]);
          exportToPDF({
            title: 'Stock Movement Audit Report',
            companyName,
            headers,
            rows: pdfRows,
            fileName: 'Movement_Report',
            orientation: 'landscape',
          });
        }
        break;
      }

      case 'movers': {
        const headers = ['Product', 'SKU', 'Category', 'Dispatched Qty', 'Current Stock', 'Velocity'];
        const excelRows = moversData.map((m) => ({
          Product: m.name,
          SKU: m.sku,
          Category: m.category,
          'Dispatched Qty': m.dispatchedQty,
          'Current Stock': m.current_stock,
          Velocity: m.velocity,
        }));
        if (format === 'excel') {
          exportToExcel(excelRows, `Movers_${moverDays}Days_Report`, 'Movers');
        } else {
          const pdfRows = moversData.map((m) => [
            m.name,
            m.sku,
            m.category,
            `${m.dispatchedQty} ${m.unit}`,
            `${m.current_stock} ${m.unit}`,
            m.velocity,
          ]);
          exportToPDF({
            title: `Fast vs Slow Movers Analysis (Past ${moverDays} Days)`,
            companyName,
            headers,
            rows: pdfRows,
            fileName: `Movers_${moverDays}D_Report`,
          });
        }
        break;
      }

      case 'supplier': {
        const headers = ['Supplier Name', 'GSTIN', 'Inbound Shipments', 'Units Received', 'Total Spend (INR)'];
        const excelRows = supplierPurchaseData.map((s) => ({
          Supplier: s.name,
          GSTIN: s.gstin,
          'Inbound Shipments': s.inwardBatches,
          'Units Received': s.totalUnits,
          'Total Spend (INR)': s.totalSpend,
        }));
        if (format === 'excel') {
          exportToExcel(excelRows, 'Supplier_Purchase_Report', 'Suppliers');
        } else {
          const pdfRows = supplierPurchaseData.map((s) => [
            s.name,
            s.gstin,
            s.inwardBatches,
            s.totalUnits,
            formatCurrency(s.totalSpend),
          ]);
          exportToPDF({
            title: 'Supplier Purchase & Procurement Report',
            companyName,
            headers,
            rows: pdfRows,
            fileName: 'Supplier_Purchase_Report',
          });
        }
        break;
      }
    }
  };

  const tabs = [
    { id: 'current-stock', name: 'Current Stock' },
    { id: 'valuation', name: 'Stock Valuation' },
    { id: 'low-stock', name: 'Low Stock & Reorder' },
    { id: 'movements', name: 'Movement Ledger' },
    { id: 'movers', name: 'Fast vs Slow Movers' },
    { id: 'supplier', name: 'Supplier Purchases' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <FileBarChart2 className="w-6 h-6 text-indigo-600" />
            Inventory Reports & Analytics
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Export official SaaS-styled PDF and Excel reports for accounting, auditing, and procurement
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExport('excel')}
            className="flex items-center gap-1.5 shadow-xs"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            Export Excel
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => handleExport('pdf')}
            className="flex items-center gap-1.5 shadow-sm"
          >
            <FileText className="w-4 h-4" />
            Download PDF
          </Button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex overflow-x-auto gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {tab.name}
          </button>
        ))}
      </div>

      {/* Specific Tab Filter Bars */}
      {activeTab === 'movements' && (
        <Card>
          <CardContent className="p-4 flex flex-wrap items-center gap-4 text-xs">
            <span className="font-semibold text-slate-500">Date Range Filter:</span>
            <div className="flex items-center gap-2">
              <span>From:</span>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-40 text-xs"
              />
            </div>
            <div className="flex items-center gap-2">
              <span>To:</span>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-40 text-xs"
              />
            </div>
            {(startDate || endDate) && (
              <Button
                variant="ghost"
                size="xs"
                onClick={() => {
                  setStartDate('');
                  setEndDate('');
                }}
              >
                Clear
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === 'movers' && (
        <Card>
          <CardContent className="p-4 flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-500">Evaluation Window:</span>
            <div className="flex gap-2">
              {[30, 60, 90].map((d) => (
                <button
                  key={d}
                  onClick={() => setMoverDays(d)}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                    moverDays === d
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  Last {d} Days
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Report Tables Container */}
      <Card className="overflow-hidden">
        {/* TAB 1: Current Stock */}
        {activeTab === 'current-stock' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-semibold border-b border-slate-200/80 dark:border-slate-800">
                <tr>
                  <th className="px-4 py-3">SKU</th>
                  <th className="px-4 py-3">Product Name</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Current Stock</th>
                  <th className="px-4 py-3">Cost Price</th>
                  <th className="px-4 py-3">Valuation</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {currentStockData.map((p) => {
                  const status = getStockStatus(p.current_stock, p.min_stock);
                  return (
                    <tr key={p.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                      <td className="px-4 py-3 font-mono text-xs">{p.sku}</td>
                      <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">
                        {p.name}
                      </td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                        {p.category_name}
                      </td>
                      <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">
                        {p.current_stock} {p.unit}
                      </td>
                      <td className="px-4 py-3">{formatCurrency(p.cost_price)}</td>
                      <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">
                        {formatCurrency(p.stock_value)}
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          variant={
                            status.status === 'in'
                              ? 'success'
                              : status.status === 'low'
                              ? 'warning'
                              : 'danger'
                          }
                          dot
                        >
                          {status.label}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 2: Valuation by Category */}
        {activeTab === 'valuation' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-semibold border-b border-slate-200/80 dark:border-slate-800">
                <tr>
                  <th className="px-4 py-3.5">Category Name</th>
                  <th className="px-4 py-3.5">Products Count</th>
                  <th className="px-4 py-3.5">Total Physical Units</th>
                  <th className="px-4 py-3.5">Total Asset Valuation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {valuationData.map((v, i) => (
                  <tr key={i} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                    <td className="px-4 py-3.5 font-bold text-slate-900 dark:text-slate-100">
                      {v.name}
                    </td>
                    <td className="px-4 py-3.5">{v.productCount} SKUs</td>
                    <td className="px-4 py-3.5">{v.totalUnits} units</td>
                    <td className="px-4 py-3.5 font-bold text-indigo-600 dark:text-indigo-400">
                      {formatCurrency(v.totalValuation)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 3: Low Stock & Reorder */}
        {activeTab === 'low-stock' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-semibold border-b border-slate-200/80 dark:border-slate-800">
                <tr>
                  <th className="px-4 py-3.5">SKU</th>
                  <th className="px-4 py-3.5">Product Name</th>
                  <th className="px-4 py-3.5">Current Stock</th>
                  <th className="px-4 py-3.5">Min Safety Threshold</th>
                  <th className="px-4 py-3.5">Suggested Reorder Qty</th>
                  <th className="px-4 py-3.5">Est. Replenishment Cost</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {lowStockData.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                    <td className="px-4 py-3.5 font-mono text-xs">{p.sku}</td>
                    <td className="px-4 py-3.5 font-semibold text-slate-900 dark:text-slate-100">
                      {p.name}
                    </td>
                    <td className="px-4 py-3.5 font-bold text-amber-600 dark:text-amber-400">
                      {p.current_stock} {p.unit}
                    </td>
                    <td className="px-4 py-3.5 text-slate-500">
                      {p.min_stock} {p.unit}
                    </td>
                    <td className="px-4 py-3.5 font-bold text-indigo-600">
                      +{p.deficit} {p.unit}
                    </td>
                    <td className="px-4 py-3.5 font-semibold">{formatCurrency(p.estCost)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 4: Movement Ledger Report */}
        {activeTab === 'movements' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-semibold border-b border-slate-200/80 dark:border-slate-800">
                <tr>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Product (SKU)</th>
                  <th className="px-4 py-3">Quantity</th>
                  <th className="px-4 py-3">Reference</th>
                  <th className="px-4 py-3">Reason / Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredMovementData.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                    <td className="px-4 py-2.5 text-slate-500 whitespace-nowrap">
                      {formatDate(m.created_at, 'dd MMM yyyy, hh:mm a')}
                    </td>
                    <td className="px-4 py-2.5">
                      <Badge
                        variant={m.type === 'IN' ? 'success' : m.type === 'OUT' ? 'danger' : 'primary'}
                      >
                        {m.type}
                      </Badge>
                    </td>
                    <td className="px-4 py-2.5">
                      <span className="font-semibold text-slate-900 dark:text-slate-100">
                        {m.product_name}
                      </span>
                      <span className="font-mono text-slate-400 text-xs ml-2">({m.product_sku})</span>
                    </td>
                    <td
                      className={`px-4 py-2.5 font-bold ${
                        m.quantity > 0 ? 'text-emerald-600' : 'text-rose-600'
                      }`}
                    >
                      {m.quantity > 0 ? `+${m.quantity}` : m.quantity} {m.product_unit}
                    </td>
                    <td className="px-4 py-2.5 font-mono text-xs">{m.reference || '-'}</td>
                    <td className="px-4 py-2.5 text-slate-600 dark:text-slate-300">
                      {m.reason || m.note || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 5: Fast vs Slow Movers */}
        {activeTab === 'movers' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-semibold border-b border-slate-200/80 dark:border-slate-800">
                <tr>
                  <th className="px-4 py-3.5">Product Name</th>
                  <th className="px-4 py-3.5">SKU</th>
                  <th className="px-4 py-3.5">Category</th>
                  <th className="px-4 py-3.5">Dispatched Volume</th>
                  <th className="px-4 py-3.5">Current Stock</th>
                  <th className="px-4 py-3.5">Movement Classification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {moversData.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                    <td className="px-4 py-3.5 font-bold text-slate-900 dark:text-slate-100">
                      {m.name}
                    </td>
                    <td className="px-4 py-3.5 font-mono text-xs">{m.sku}</td>
                    <td className="px-4 py-3.5 text-slate-600 dark:text-slate-300">{m.category}</td>
                    <td className="px-4 py-3.5 font-bold text-rose-600">
                      -{m.dispatchedQty} {m.unit}
                    </td>
                    <td className="px-4 py-3.5">{m.current_stock} {m.unit}</td>
                    <td className="px-4 py-3.5">
                      <Badge
                        variant={
                          m.velocity === 'Fast'
                            ? 'success'
                            : m.velocity === 'Moderate'
                            ? 'primary'
                            : 'neutral'
                        }
                      >
                        {m.velocity}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 6: Supplier Purchases */}
        {activeTab === 'supplier' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-semibold border-b border-slate-200/80 dark:border-slate-800">
                <tr>
                  <th className="px-4 py-3.5">Supplier Name</th>
                  <th className="px-4 py-3.5">GSTIN</th>
                  <th className="px-4 py-3.5">Inbound Consignments</th>
                  <th className="px-4 py-3.5">Units Purchased</th>
                  <th className="px-4 py-3.5">Cumulative Spend</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {supplierPurchaseData.map((s, i) => (
                  <tr key={i} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                    <td className="px-4 py-3.5 font-bold text-slate-900 dark:text-slate-100">
                      {s.name}
                    </td>
                    <td className="px-4 py-3.5 font-mono text-xs">{s.gstin}</td>
                    <td className="px-4 py-3.5">{s.inwardBatches} batches</td>
                    <td className="px-4 py-3.5 font-semibold text-emerald-600">
                      +{s.totalUnits} units
                    </td>
                    <td className="px-4 py-3.5 font-bold text-slate-900 dark:text-white">
                      {formatCurrency(s.totalSpend)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
