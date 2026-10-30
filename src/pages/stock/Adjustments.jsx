import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useProducts, useCreateStockMovements } from '../../hooks/useInventory';
import { useAuth } from '../../context/AuthContext';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input, Textarea } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Badge } from '../../components/ui/Badge';
import {
  Sliders,
  CheckCircle,
  AlertCircle,
  Plus,
  Trash2,
  Calculator,
  RotateCcw,
} from 'lucide-react';
import { toast } from 'sonner';

export function Adjustments() {
  const [searchParams] = useSearchParams();
  const prefillProductId = searchParams.get('productId') || '';
  const navigate = useNavigate();

  const { data: products = [] } = useProducts();
  const createMovementsMutation = useCreateStockMovements();
  const { user } = useAuth();

  const [lines, setLines] = useState([
    {
      productId: prefillProductId,
      countedQty: '',
      reason: 'Physical Stocktake Count',
      note: '',
    },
  ]);
  const [reference, setReference] = useState(`AUDIT-${new Date().toISOString().slice(0, 10)}`);

  const handleProductSelect = (index, prodId) => {
    const updated = [...lines];
    updated[index].productId = prodId;
    const prod = products.find((p) => p.id === prodId);
    if (prod && updated[index].countedQty === '') {
      updated[index].countedQty = prod.current_stock;
    }
    setLines(updated);
  };

  const handleCountedChange = (index, val) => {
    const updated = [...lines];
    updated[index].countedQty = val;
    setLines(updated);
  };

  const handleReasonChange = (index, val) => {
    const updated = [...lines];
    updated[index].reason = val;
    setLines(updated);
  };

  const handleAddLine = () => {
    setLines((prev) => [
      ...prev,
      {
        productId: '',
        countedQty: '',
        reason: 'Physical Stocktake Count',
        note: '',
      },
    ]);
  };

  const handleRemoveLine = (index) => {
    setLines((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate
    const itemsToSubmit = [];
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (!line.productId) {
        toast.error(`Please select a product for Line #${i + 1}`);
        return;
      }
      if (line.countedQty === '' || isNaN(Number(line.countedQty)) || Number(line.countedQty) < 0) {
        toast.error(`Please enter a valid non-negative counted quantity for Line #${i + 1}`);
        return;
      }

      const prod = products.find((p) => p.id === line.productId);
      const systemQty = Number(prod?.current_stock || 0);
      const counted = Number(line.countedQty);
      const diff = counted - systemQty;

      if (diff === 0) {
        toast.info(`Item ${prod.name} has no difference (Counted: ${counted}, System: ${systemQty}). Skipped.`);
        continue;
      }

      itemsToSubmit.push({
        product_id: line.productId,
        type: 'ADJUST',
        quantity: diff, // signed difference
        reason: line.reason || 'Stocktake Discrepancy Adjustment',
        reference: reference,
        note: `System: ${systemQty}, Counted: ${counted}. Diff: ${diff > 0 ? '+' : ''}${diff}`,
        created_at: new Date().toISOString(),
      });
    }

    if (itemsToSubmit.length === 0) {
      toast.warning('No adjustments were needed. System stock matches physical counts.');
      return;
    }

    try {
      await createMovementsMutation.mutateAsync(itemsToSubmit);
      toast.success(`Successfully recorded ${itemsToSubmit.length} stock adjustment(s)!`);
      navigate('/movements');
    } catch (err) {
      toast.error(err.message || 'Failed to apply adjustments');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
          <Sliders className="w-6 h-6 text-amber-500" />
          Stocktake Adjustments
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Reconcile system records with physical stock counts and generate audited ADJUST entries
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Audit Session Header */}
        <Card>
          <CardHeader title="Stocktake Session Details" />
          <CardContent className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Audit Session Reference *"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="e.g. AUDIT-2026-Q1"
              required
            />
            <div className="flex items-center gap-3 pt-6 text-xs text-slate-500">
              <Calculator className="w-5 h-5 text-indigo-600 shrink-0" />
              <span>
                Enter the verified count. The system will automatically compute the signed adjustment difference.
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Lines */}
        <Card>
          <CardHeader
            title="Reconciliation Items"
            subtitle="Select inventory items being audited"
            action={
              <Button
                type="button"
                variant="outline"
                size="xs"
                onClick={handleAddLine}
                className="flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Audit Line
              </Button>
            }
          />
          <CardContent className="p-6 space-y-4">
            {lines.map((line, index) => {
              const prod = products.find((p) => p.id === line.productId);
              const systemQty = Number(prod?.current_stock || 0);
              const countedNum = line.countedQty !== '' ? Number(line.countedQty) : null;
              const diff = countedNum !== null ? countedNum - systemQty : null;

              return (
                <div
                  key={index}
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500">Item #{index + 1}</span>
                    {lines.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveLine(index)}
                        className="text-slate-400 hover:text-red-500 p-1 rounded-md transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                    {/* Product */}
                    <div className="sm:col-span-5">
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Product *
                      </label>
                      <select
                        className="w-full text-xs h-9 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        value={line.productId}
                        onChange={(e) => handleProductSelect(index, e.target.value)}
                        required
                      >
                        <option value="">Select product to reconcile</option>
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} ({p.sku}) — System: {p.current_stock} {p.unit}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* System Quantity (Read-only) */}
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-slate-500 mb-1">
                        System Qty
                      </label>
                      <div className="h-9 px-3 flex items-center bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-300">
                        {prod ? `${systemQty} ${prod.unit}` : '-'}
                      </div>
                    </div>

                    {/* Counted Physical Quantity */}
                    <div className="sm:col-span-2">
                      <Input
                        label="Physical Count *"
                        type="number"
                        step="0.01"
                        placeholder="0"
                        value={line.countedQty}
                        onChange={(e) => handleCountedChange(index, e.target.value)}
                        required
                      />
                    </div>

                    {/* Calculated Difference */}
                    <div className="sm:col-span-3">
                      <label className="block text-xs font-semibold text-slate-500 mb-1">
                        Discrepancy (Diff)
                      </label>
                      <div className="h-9 px-3 flex items-center justify-between rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold">
                        {diff === null ? (
                          <span className="text-slate-400">-</span>
                        ) : diff === 0 ? (
                          <span className="text-slate-500">0 (Match)</span>
                        ) : diff > 0 ? (
                          <span className="text-emerald-600">+{diff} (Surplus)</span>
                        ) : (
                          <span className="text-red-600">{diff} (Deficit)</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Reason */}
                  <div className="pt-1">
                    <Input
                      label="Adjustment Reason"
                      placeholder="e.g. Broken tiles found in bay B, stocktake correction..."
                      value={line.reason}
                      onChange={(e) => handleReasonChange(index, e.target.value)}
                    />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex justify-end gap-3">
          <Button variant="outline" size="sm" onClick={() => navigate('/products')}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="md"
            isLoading={createMovementsMutation.isPending}
          >
            Apply Reconciliation Adjustments
          </Button>
        </div>
      </form>
    </div>
  );
}
