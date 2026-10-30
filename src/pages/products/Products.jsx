import React, { useState, useMemo } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
  useProducts,
  useCategories,
  useSuppliers,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
  useBulkImportProducts,
} from '../../hooks/useInventory';
import { useAuth } from '../../context/AuthContext';
import { ProductFormSlideOver } from '../../components/products/ProductFormSlideOver';
import { BulkImportModal } from '../../components/products/BulkImportModal';
import { CategoryQuickCreateModal } from '../../components/products/CategoryQuickCreateModal';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { BarcodeScannerModal } from '../../components/ui/BarcodeScannerModal';
import { Card, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { TableSkeleton, EmptyState } from '../../components/ui/Skeleton';
import { formatCurrency, getStockStatus } from '../../lib/utils';
import { exportToExcel } from '../../lib/exporters';
import {
  Search,
  Plus,
  Filter,
  Download,
  Upload,
  Scan,
  MoreVertical,
  Edit2,
  Trash2,
  Eye,
  SlidersHorizontal,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Package,
  Layers,
} from 'lucide-react';

export function Products() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialStatus = searchParams.get('status') || 'all';

  const { data: products = [], isLoading } = useProducts();
  const { data: categories = [] } = useCategories();
  const { data: suppliers = [] } = useSuppliers();
  const { isAdmin, isManager } = useAuth();

  const createProductMutation = useCreateProduct();
  const updateProductMutation = useUpdateProduct();
  const deleteProductMutation = useDeleteProduct();
  const bulkImportMutation = useBulkImportProducts();

  // Search & Filter state
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSupplier, setSelectedSupplier] = useState('all');
  const [statusFilter, setStatusFilter] = useState(initialStatus); // all | in | low | out
  const [activeFilter, setActiveFilter] = useState('all'); // all | active | inactive

  // Sorting state
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc'); // asc | desc

  // Pagination state
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // Column visibility
  const [columnsVisible, setColumnsVisible] = useState({
    sku: true,
    category: true,
    supplier: true,
    cost: true,
    sell: true,
    value: true,
  });
  const [colMenuOpen, setColMenuOpen] = useState(false);

  // Modals state
  const [formOpen, setFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [importOpen, setImportOpen] = useState(false);
  const [quickCatOpen, setQuickCatOpen] = useState(false);
  const [scannerOpen, setScannerOpen] = useState(false);

  // Deletion confirm state
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isHardDelete, setIsHardDelete] = useState(false);

  // Filtered & Sorted products computation
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        // Search query
        if (search.trim()) {
          const q = search.toLowerCase();
          const matchName = p.name.toLowerCase().includes(q);
          const matchSku = p.sku.toLowerCase().includes(q);
          const matchBarcode = p.barcode ? p.barcode.toLowerCase().includes(q) : false;
          if (!matchName && !matchSku && !matchBarcode) return false;
        }
        // Category
        if (selectedCategory !== 'all' && p.category_id !== selectedCategory) {
          return false;
        }
        // Supplier
        if (selectedSupplier !== 'all' && p.supplier_id !== selectedSupplier) {
          return false;
        }
        // Active status
        if (activeFilter === 'active' && !p.is_active) return false;
        if (activeFilter === 'inactive' && p.is_active) return false;

        // Stock status
        const stock = Number(p.current_stock || 0);
        const min = Number(p.min_stock || 0);
        if (statusFilter === 'in' && stock <= min) return false;
        if (statusFilter === 'low' && (stock <= 0 || stock > min)) return false;
        if (statusFilter === 'out' && stock > 0) return false;

        return true;
      })
      .sort((a, b) => {
        let valA = a[sortField];
        let valB = b[sortField];

        if (sortField === 'stock') {
          valA = Number(a.current_stock || 0);
          valB = Number(b.current_stock || 0);
        } else if (sortField === 'cost') {
          valA = Number(a.cost_price || 0);
          valB = Number(b.cost_price || 0);
        } else if (sortField === 'sell') {
          valA = Number(a.sell_price || 0);
          valB = Number(b.sell_price || 0);
        } else if (sortField === 'value') {
          valA = Number(a.stock_value || 0);
          valB = Number(b.stock_value || 0);
        } else {
          valA = String(valA || '').toLowerCase();
          valB = String(valB || '').toLowerCase();
        }

        if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
        if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
  }, [
    products,
    search,
    selectedCategory,
    selectedSupplier,
    statusFilter,
    activeFilter,
    sortField,
    sortDirection,
  ]);

  // Paginated records
  const totalPages = Math.ceil(filteredProducts.length / pageSize) || 1;
  const paginatedProducts = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredProducts.slice(start, start + pageSize);
  }, [filteredProducts, page, pageSize]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleSaveProduct = async (formData, prodId) => {
    if (prodId) {
      await updateProductMutation.mutateAsync({ id: prodId, data: formData });
    } else {
      await createProductMutation.mutateAsync(formData);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    await deleteProductMutation.mutateAsync({ id: deleteTarget.id, hard: isHardDelete });
    setDeleteTarget(null);
  };

  const handleExportExcel = () => {
    const dataToExport = filteredProducts.map((p) => ({
      SKU: p.sku,
      Name: p.name,
      Category: p.category_name,
      Supplier: p.supplier_name,
      'Current Stock': p.current_stock,
      Unit: p.unit,
      'Cost Price (INR)': p.cost_price,
      'Sell Price (INR)': p.sell_price,
      'Min Stock': p.min_stock,
      'Stock Value (INR)': p.stock_value,
      Status: p.is_active ? 'Active' : 'Inactive',
      Barcode: p.barcode || '',
    }));
    exportToExcel(dataToExport, 'BuildStaok_Products_Export', 'Products');
  };

  return (
    <div className="space-y-6">
      {/* Page Title & Main Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Products & Inventory
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage your full product catalog, SKUs, barcode tracking, and live stock values
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Barcode Camera Scan button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setScannerOpen(true)}
            className="flex items-center gap-1.5"
            title="Scan barcode with camera"
          >
            <Scan className="w-4 h-4 text-indigo-600" />
            <span className="hidden sm:inline">Scan</span>
          </Button>

          {/* Bulk Import */}
          {isManager && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setImportOpen(true)}
              className="flex items-center gap-1.5"
            >
              <Upload className="w-4 h-4 text-slate-500" />
              <span className="hidden sm:inline">Import</span>
            </Button>
          )}

          {/* Bulk Export */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportExcel}
            className="flex items-center gap-1.5"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span className="hidden sm:inline">Export</span>
          </Button>

          {/* Add Product button (Manager / Admin) */}
          {isManager && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setEditingProduct(null);
                setFormOpen(true);
              }}
              className="flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Add Product
            </Button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {/* Search Input */}
            <div className="lg:col-span-2">
              <Input
                placeholder="Search by name, SKU, or barcode..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                leftIcon={<Search className="w-4 h-4" />}
              />
            </div>

            {/* Category Filter */}
            <div>
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setPage(1);
                }}
                className="w-full text-xs sm:text-sm h-9 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="all">All Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Supplier Filter */}
            <div>
              <select
                value={selectedSupplier}
                onChange={(e) => {
                  setSelectedSupplier(e.target.value);
                  setPage(1);
                }}
                className="w-full text-xs sm:text-sm h-9 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="all">All Suppliers</option>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Stock Status Filter */}
            <div>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                className="w-full text-xs sm:text-sm h-9 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="all">All Stock Statuses</option>
                <option value="in">In Stock Only</option>
                <option value="low">Low Stock Only</option>
                <option value="out">Out of Stock Only</option>
              </select>
            </div>
          </div>

          {/* Quick status pills and column visibility */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-medium">Active Status:</span>
              {['all', 'active', 'inactive'].map((st) => (
                <button
                  key={st}
                  onClick={() => {
                    setActiveFilter(st);
                    setPage(1);
                  }}
                  className={`px-2.5 py-1 rounded-md capitalize font-medium transition-colors ${
                    activeFilter === st
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>

            {/* Column toggle dropdown */}
            <div className="relative">
              <button
                onClick={() => setColMenuOpen(!colMenuOpen)}
                className="flex items-center gap-1.5 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 font-medium px-2 py-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                Columns Visibility
              </button>
              {colMenuOpen && (
                <div className="absolute right-0 mt-1 w-48 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-elevated p-2 z-20 space-y-1">
                  {Object.keys(columnsVisible).map((col) => (
                    <label
                      key={col}
                      className="flex items-center gap-2 px-2 py-1.5 text-xs text-slate-700 dark:text-slate-300 rounded hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer capitalize"
                    >
                      <input
                        type="checkbox"
                        checked={columnsVisible[col]}
                        onChange={(e) =>
                          setColumnsVisible((prev) => ({ ...prev, [col]: e.target.checked }))
                        }
                        className="rounded text-indigo-600"
                      />
                      {col}
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Products Data Grid */}
      <Card className="overflow-hidden">
        {isLoading ? (
          <TableSkeleton rows={8} cols={7} />
        ) : filteredProducts.length === 0 ? (
          <EmptyState
            icon={Package}
            title="No products found"
            description="No items match your search or active filter criteria."
            action={
              isManager && (
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => {
                    setEditingProduct(null);
                    setFormOpen(true);
                  }}
                >
                  Add Your First Product
                </Button>
              )
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-semibold border-b border-slate-200/80 dark:border-slate-800 select-none">
                <tr>
                  <th className="px-4 py-3.5">Product</th>
                  {columnsVisible.sku && (
                    <th
                      className="px-4 py-3.5 cursor-pointer hover:text-slate-800 dark:hover:text-slate-200"
                      onClick={() => handleSort('sku')}
                    >
                      <div className="flex items-center gap-1">
                        SKU <ArrowUpDown className="w-3 h-3 text-slate-400" />
                      </div>
                    </th>
                  )}
                  {columnsVisible.category && (
                    <th
                      className="px-4 py-3.5 cursor-pointer hover:text-slate-800 dark:hover:text-slate-200"
                      onClick={() => handleSort('category_name')}
                    >
                      <div className="flex items-center gap-1">
                        Category <ArrowUpDown className="w-3 h-3 text-slate-400" />
                      </div>
                    </th>
                  )}
                  <th
                    className="px-4 py-3.5 cursor-pointer hover:text-slate-800 dark:hover:text-slate-200"
                    onClick={() => handleSort('stock')}
                  >
                    <div className="flex items-center gap-1">
                      Current Stock <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                  {columnsVisible.cost && (
                    <th
                      className="px-4 py-3.5 cursor-pointer hover:text-slate-800 dark:hover:text-slate-200"
                      onClick={() => handleSort('cost')}
                    >
                      <div className="flex items-center gap-1">
                        Cost Price <ArrowUpDown className="w-3 h-3 text-slate-400" />
                      </div>
                    </th>
                  )}
                  {columnsVisible.sell && (
                    <th
                      className="px-4 py-3.5 cursor-pointer hover:text-slate-800 dark:hover:text-slate-200"
                      onClick={() => handleSort('sell')}
                    >
                      <div className="flex items-center gap-1">
                        Sell Price <ArrowUpDown className="w-3 h-3 text-slate-400" />
                      </div>
                    </th>
                  )}
                  {columnsVisible.value && (
                    <th
                      className="px-4 py-3.5 cursor-pointer hover:text-slate-800 dark:hover:text-slate-200"
                      onClick={() => handleSort('value')}
                    >
                      <div className="flex items-center gap-1">
                        Stock Value <ArrowUpDown className="w-3 h-3 text-slate-400" />
                      </div>
                    </th>
                  )}
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {paginatedProducts.map((p) => {
                  const status = getStockStatus(p.current_stock, p.min_stock);
                  return (
                    <tr
                      key={p.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      {/* Product image & name */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 overflow-hidden shrink-0 border border-slate-200 dark:border-slate-700 flex items-center justify-center">
                            {p.image_url ? (
                              <img
                                src={p.image_url}
                                alt={p.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Package className="w-5 h-5 text-slate-400" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <Link
                              to={`/products/${p.id}`}
                              className="font-semibold text-slate-900 dark:text-slate-100 hover:text-indigo-600 dark:hover:text-indigo-400 truncate block max-w-xs"
                            >
                              {p.name}
                            </Link>
                            {!p.is_active && (
                              <span className="inline-block px-1.5 py-0.2 rounded text-[10px] bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium">
                                Inactive
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* SKU */}
                      {columnsVisible.sku && (
                        <td className="px-4 py-3 font-mono text-xs text-slate-600 dark:text-slate-300">
                          {p.sku}
                        </td>
                      )}

                      {/* Category */}
                      {columnsVisible.category && (
                        <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                          {p.category_name}
                        </td>
                      )}

                      {/* Stock level badge */}
                      <td className="px-4 py-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 dark:text-white">
                              {p.current_stock}
                            </span>
                            <span className="text-slate-400 text-xs">{p.unit}</span>
                          </div>
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
                        </div>
                      </td>

                      {/* Cost Price */}
                      {columnsVisible.cost && (
                        <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                          {formatCurrency(p.cost_price)}
                        </td>
                      )}

                      {/* Sell Price */}
                      {columnsVisible.sell && (
                        <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                          {formatCurrency(p.sell_price)}
                        </td>
                      )}

                      {/* Stock Value */}
                      {columnsVisible.value && (
                        <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">
                          {formatCurrency(p.stock_value)}
                        </td>
                      )}

                      {/* Actions */}
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            to={`/products/${p.id}`}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            title="View details"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>

                          {isManager && (
                            <button
                              onClick={() => {
                                setEditingProduct(p);
                                setFormOpen(true);
                              }}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                              title="Edit product"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                          )}

                          {isManager && (
                            <button
                              onClick={() => {
                                setDeleteTarget(p);
                                setIsHardDelete(false);
                              }}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                              title="Delete or deactivate"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination bar */}
        {filteredProducts.length > pageSize && (
          <div className="px-4 py-3 bg-slate-50 dark:bg-slate-850 border-t border-slate-200/80 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
            <span>
              Showing {(page - 1) * pageSize + 1} to{' '}
              {Math.min(page * pageSize, filteredProducts.length)} of {filteredProducts.length}{' '}
              products
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

      {/* Add / Edit Slide-Over */}
      <ProductFormSlideOver
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        product={editingProduct}
        onSubmitSuccess={handleSaveProduct}
        onOpenQuickCategory={() => setQuickCatOpen(true)}
      />

      {/* Bulk Import Modal */}
      <BulkImportModal
        isOpen={importOpen}
        onClose={() => setImportOpen(false)}
        onImportSuccess={async (rows) => {
          await bulkImportMutation.mutateAsync(rows);
        }}
      />

      {/* Quick Category Modal */}
      <CategoryQuickCreateModal
        isOpen={quickCatOpen}
        onClose={() => setQuickCatOpen(false)}
      />

      {/* Barcode Camera Scanner */}
      <BarcodeScannerModal
        isOpen={scannerOpen}
        onClose={() => setScannerOpen(false)}
        onScan={(code) => {
          setSearch(code);
          toast.info(`Filtered product list by barcode: ${code}`);
        }}
      />

      {/* Deletion confirmation dialog */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title={isHardDelete ? 'Permanently Delete Product?' : 'Deactivate Product?'}
        message={
          isHardDelete
            ? `Are you sure you want to completely erase "${deleteTarget?.name}"? This requires that the product has NO stock movements.`
            : `Deactivating "${deleteTarget?.name}" will mark it as inactive. It will still be preserved in historical reports and ledger.`
        }
        confirmText={isHardDelete ? 'Hard Delete' : 'Deactivate'}
        isLoading={deleteProductMutation.isPending}
      />
    </div>
  );
}
