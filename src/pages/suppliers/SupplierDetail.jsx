import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSupplier } from '../../hooks/useInventory';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { CardSkeleton } from '../../components/ui/Skeleton';
import { formatCurrency, formatDate } from '../../lib/utils';
import {
  ArrowLeft,
  Truck,
  Phone,
  Mail,
  MapPin,
  FileText,
  Package,
  Calendar,
  ArrowDownLeft,
} from 'lucide-react';

export function SupplierDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: supplier, isLoading, error } = useSupplier(id);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <CardSkeleton />
        <CardSkeleton />
      </div>
    );
  }

  if (error || !supplier) {
    return (
      <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-4">
        <h3 className="text-lg font-bold">Supplier Not Found</h3>
        <Button variant="outline" size="sm" onClick={() => navigate('/suppliers')}>
          Back to Suppliers
        </Button>
      </div>
    );
  }

  const products = supplier.products || [];
  const recentMovements = supplier.recent_movements || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/suppliers')}
            className="flex items-center gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" />
            Suppliers
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              {supplier.name}
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">GSTIN: {supplier.gstin || 'Not specified'}</p>
          </div>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => navigate(`/stock-in?supplierId=${supplier.id}`)}
          className="flex items-center gap-1.5"
        >
          <ArrowDownLeft className="w-4 h-4" />
          Stock In from this Supplier
        </Button>
      </div>

      {/* Supplier Info Profile */}
      <Card>
        <CardHeader title="Vendor Credentials & Contact Details" />
        <CardContent className="p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 text-xs sm:text-sm">
          <div>
            <span className="text-slate-400 block text-[11px] uppercase tracking-wider font-semibold">
              Contact Person
            </span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              {supplier.contact_person || 'N/A'}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px] uppercase tracking-wider font-semibold">
              Phone Number
            </span>
            <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 mt-0.5">
              <Phone className="w-3.5 h-3.5 text-slate-400" /> {supplier.phone || 'N/A'}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px] uppercase tracking-wider font-semibold">
              Email Address
            </span>
            <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 mt-0.5">
              <Mail className="w-3.5 h-3.5 text-slate-400" /> {supplier.email || 'N/A'}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px] uppercase tracking-wider font-semibold">
              Status
            </span>
            <Badge variant={supplier.is_active ? 'success' : 'neutral'} dot className="mt-1">
              {supplier.is_active ? 'Active Supplier' : 'Inactive'}
            </Badge>
          </div>
          {supplier.address && (
            <div className="col-span-full pt-3 border-t border-slate-100 dark:border-slate-800 flex items-start gap-2">
              <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
              <span className="text-slate-600 dark:text-slate-300">{supplier.address}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Grid: Supplied Products & Recent Stock Ins */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Supplied Products */}
        <Card>
          <CardHeader
            title="Supplied Products"
            subtitle={`${products.length} catalog items associated with this vendor`}
          />
          <CardContent className="p-0">
            {products.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">
                No products currently mapped to this supplier.
              </div>
            ) : (
              <div className="overflow-x-auto max-h-80 overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-semibold sticky top-0 border-b border-slate-100 dark:border-slate-800">
                    <tr>
                      <th className="px-4 py-3">Product</th>
                      <th className="px-4 py-3">SKU</th>
                      <th className="px-4 py-3">Cost Price</th>
                      <th className="px-4 py-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {products.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                        <td className="px-4 py-2.5 font-medium text-slate-900 dark:text-slate-100">
                          {p.name}
                        </td>
                        <td className="px-4 py-2.5 font-mono text-slate-500">{p.sku}</td>
                        <td className="px-4 py-2.5">{formatCurrency(p.cost_price)}</td>
                        <td className="px-4 py-2.5 text-right">
                          <Link
                            to={`/products/${p.id}`}
                            className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
                          >
                            View
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Inbound Stock Deliveries */}
        <Card>
          <CardHeader
            title="Recent Inbound Deliveries"
            subtitle="Latest purchase deliveries received from this vendor"
          />
          <CardContent className="p-0">
            {recentMovements.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">
                No delivery movements recorded from this supplier yet.
              </div>
            ) : (
              <div className="overflow-x-auto max-h-80 overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-semibold sticky top-0 border-b border-slate-100 dark:border-slate-800">
                    <tr>
                      <th className="px-4 py-3">Date</th>
                      <th className="px-4 py-3">Product</th>
                      <th className="px-4 py-3">Quantity</th>
                      <th className="px-4 py-3">PO / Bill</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {recentMovements.map((m) => (
                      <tr key={m.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                        <td className="px-4 py-2.5 text-slate-500 whitespace-nowrap">
                          {formatDate(m.created_at, 'dd MMM yyyy')}
                        </td>
                        <td className="px-4 py-2.5 font-medium text-slate-900 dark:text-slate-100">
                          {m.product_name}
                        </td>
                        <td className="px-4 py-2.5 font-bold text-emerald-600">
                          +{m.quantity}
                        </td>
                        <td className="px-4 py-2.5 font-mono text-slate-600 dark:text-slate-300">
                          {m.reference || '-'}
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
    </div>
  );
}
