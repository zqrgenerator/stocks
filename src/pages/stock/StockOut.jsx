import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { stockOutFormSchema } from '../../lib/schemas';
import {
  useProducts,
  useCreateStockMovements,
} from '../../hooks/useInventory';
import { useAuth } from '../../context/AuthContext';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input, Textarea } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Modal } from '../../components/ui/Modal';
import { BarcodeScannerModal } from '../../components/ui/BarcodeScannerModal';
import {
  Plus,
  Trash2,
  Scan,
  CheckCircle,
  ArrowUpRight,
  AlertTriangle,
  FileText,
} from 'lucide-react';
import { toast } from 'sonner';

export function StockOut() {
  const [searchParams] = useSearchParams();
  const prefillProductId = searchParams.get('productId') || '';
  const navigate = useNavigate();

  const { data: products = [] } = useProducts();
  const createMovementsMutation = useCreateStockMovements();
  const { user } = useAuth();

  const [activeScanIndex, setActiveScanIndex] = useState(null);
  const [successSummary, setSuccessSummary] = useState(null);
  const [serverError, setServerError] = useState(null);

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(stockOutFormSchema),
    defaultValues: {
      reference: '',
      date: new Date().toISOString().split('T')[0],
      reason_default: 'sale',
      note: '',
      lines: [
        {
          product_id: prefillProductId,
          quantity: 1,
          reason: 'sale',
          note: '',
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'lines',
  });

  const watchedLines = watch('lines');
  const watchedDefaultReason = watch('reason_default');

  // Compute live stock validations
  const lineStockErrors = {};
  let hasStockOverdraw = false;

  (watchedLines || []).forEach((line, idx) => {
    if (line.product_id) {
      const prod = products.find((p) => p.id === line.product_id);
      const available = Number(prod?.current_stock || 0);
      const req = Number(line.quantity || 0);
      if (req > available) {
        lineStockErrors[idx] = `Insufficient stock: only ${available} available (requested ${req})`;
        hasStockOverdraw = true;
      }
    }
  });

  const totalUnits = (watchedLines || []).reduce((acc, curr) => acc + (Number(curr?.quantity) || 0), 0);

  const onSubmit = async (data) => {
    setServerError(null);
    if (hasStockOverdraw) {
      toast.error('Cannot submit: One or more items exceed current available stock.');
      return;
    }

    try {
      const itemsToSubmit = data.lines.map((l) => ({
        product_id: l.product_id,
        type: 'OUT',
        quantity: -Math.abs(Number(l.quantity)), // signed negative for OUT
        reason: l.reason || data.reason_default,
        reference: data.reference,
        note: l.note || data.note || null,
        created_at: new Date(data.date).toISOString(),
      }));

      await createMovementsMutation.mutateAsync(itemsToSubmit);

      setSuccessSummary({
        reference: data.reference,
        lineCount: itemsToSubmit.length,
        totalUnits,
      });

      toast.success(`Successfully dispatched ${totalUnits} units!`);
    } catch (err) {
      const msg = err.message || 'Failed to dispatch stock';
      setServerError(msg);
      toast.error(msg);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
          <ArrowUpRight className="w-6 h-6 text-rose-600" />
          Dispatch Stock (Stock Out)
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Record customer dispatches, project deliveries, damaged stock write-offs, or internal usage
        </p>
      </div>

      {serverError && (
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-bold text-red-800 dark:text-red-300">
              Stock Dispatch Blocked
            </h4>
            <p className="text-xs text-red-700 dark:text-red-400 mt-0.5">{serverError}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Document Header Card */}
        <Card>
          <CardHeader title="Dispatch Document Header" />
          <CardContent className="p-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Reference / Invoice / Slip No. *"
              placeholder="e.g. INV-2026-104"
              error={errors.reference?.message}
              {...register('reference')}
            />

            <Select
              label="Primary Reason *"
              error={errors.reason_default?.message}
              {...register('reason_default')}
            >
              <option value="sale">Sale / Customer Order</option>
              <option value="damage">Damaged / Expired</option>
              <option value="return">Return to Supplier</option>
              <option value="internal use">Internal Project / Site Use</option>
              <option value="other">Other</option>
            </Select>

            <Input
              label="Dispatch Date *"
              type="date"
              error={errors.date?.message}
              {...register('date')}
            />
          </CardContent>
        </Card>

        {/* Multi-line Items Card */}
        <Card>
          <CardHeader
            title="Dispatch Items"
            subtitle="Add one or more products to dispatch in this batch"
            action={
              <Button
                type="button"
                variant="outline"
                size="xs"
                onClick={() =>
                  append({
                    product_id: '',
                    quantity: 1,
                    reason: watchedDefaultReason,
                    note: '',
                  })
                }
                className="flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Item Line
              </Button>
            }
          />
          <CardContent className="p-6 space-y-4">
            {errors.lines?.root && (
              <p className="text-xs text-red-500 font-semibold">{errors.lines.root.message}</p>
            )}

            <div className="space-y-3">
              {fields.map((field, index) => {
                const selectedProdId = watchedLines?.[index]?.product_id;
                const selectedProd = products.find((p) => p.id === selectedProdId);
                const availableStock = Number(selectedProd?.current_stock || 0);
                const hasLineError = Boolean(lineStockErrors[index]);

                return (
                  <div
                    key={field.id}
                    className={`p-4 rounded-xl border transition-colors space-y-3 relative ${
                      hasLineError
                        ? 'border-red-300 dark:border-red-900 bg-red-50/30 dark:bg-red-950/20'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-slate-500">Item #{index + 1}</span>
                        {selectedProd && (
                          <span
                            className={`text-xs font-semibold px-2 py-0.5 rounded ${
                              availableStock <= 0
                                ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400'
                                : availableStock <= (selectedProd.min_stock || 5)
                                ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400'
                                : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400'
                            }`}
                          >
                            Live Available: {availableStock} {selectedProd.unit}
                          </span>
                        )}
                      </div>
                      {fields.length > 1 && (
                        <button
                          type="button"
                          onClick={() => remove(index)}
                          className="text-slate-400 hover:text-red-500 p-1 rounded-md transition-colors"
                          title="Remove line"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                      {/* Product Selector */}
                      <div className="sm:col-span-5">
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Product *
                        </label>
                        <div className="flex gap-1.5">
                          <select
                            className="flex-1 text-xs h-9 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            {...register(`lines.${index}.product_id`)}
                          >
                            <option value="">Select product to dispatch</option>
                            {products.map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.name} ({p.sku}) — Available: {p.current_stock} {p.unit}
                              </option>
                            ))}
                          </select>
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => setActiveScanIndex(index)}
                            title="Scan barcode"
                            className="shrink-0 h-9 w-9"
                          >
                            <Scan className="w-4 h-4 text-indigo-600" />
                          </Button>
                        </div>
                        {errors.lines?.[index]?.product_id && (
                          <p className="text-[11px] text-red-500 mt-1">
                            {errors.lines[index].product_id.message}
                          </p>
                        )}
                      </div>

                      {/* Quantity */}
                      <div className="sm:col-span-3">
                        <Input
                          label={`Dispatch Qty (${selectedProd?.unit || 'units'}) *`}
                          type="number"
                          step="0.01"
                          placeholder="0"
                          error={errors.lines?.[index]?.quantity?.message}
                          {...register(`lines.${index}.quantity`)}
                        />
                      </div>

                      {/* Line Reason */}
                      <div className="sm:col-span-4">
                        <Select
                          label="Line Reason"
                          error={errors.lines?.[index]?.reason?.message}
                          {...register(`lines.${index}.reason`)}
                        >
                          <option value="sale">Sale</option>
                          <option value="damage">Damage</option>
                          <option value="return">Return</option>
                          <option value="internal use">Internal Use</option>
                          <option value="other">Other</option>
                        </Select>
                      </div>
                    </div>

                    {/* Overdraw stock warning message */}
                    {hasLineError && (
                      <div className="p-2.5 rounded-lg bg-red-100 dark:bg-red-950/60 border border-red-200 dark:border-red-800 flex items-center gap-2 text-xs text-red-700 dark:text-red-400 font-medium">
                        <AlertTriangle className="w-4 h-4 shrink-0" />
                        <span>{lineStockErrors[index]}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Note and Actions Summary */}
        <Card>
          <CardContent className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="w-full sm:w-1/2">
              <Textarea
                label="Dispatch Notes / Customer Info"
                placeholder="Client name, delivery address, carrier tracking..."
                rows={2}
                {...register('note')}
              />
            </div>

            <div className="w-full sm:w-auto text-right space-y-1">
              <div className="text-xs text-slate-500 font-medium">Dispatch Summary</div>
              <div className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Total Units to Deduct: <span className="text-rose-600 font-bold">-{totalUnits}</span>
              </div>
              <div className="pt-3">
                <Button
                  type="submit"
                  variant="destructive"
                  size="lg"
                  disabled={hasStockOverdraw}
                  isLoading={isSubmitting || createMovementsMutation.isPending}
                  className="w-full sm:w-auto"
                >
                  Confirm & Dispatch Stock
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </form>

      {/* Barcode Camera Scanner */}
      <BarcodeScannerModal
        isOpen={activeScanIndex !== null}
        onClose={() => setActiveScanIndex(null)}
        onScan={(code) => {
          if (activeScanIndex !== null) {
            const found = products.find(
              (p) =>
                p.barcode === code ||
                p.sku.toLowerCase() === code.toLowerCase()
            );
            if (found) {
              setValue(`lines.${activeScanIndex}.product_id`, found.id);
              toast.success(`Matched product: ${found.name}`);
            } else {
              toast.error(`No product found with barcode "${code}"`);
            }
          }
        }}
      />

      {/* Success Summary Modal */}
      {successSummary && (
        <Modal
          isOpen={true}
          onClose={() => {
            setSuccessSummary(null);
            reset();
            navigate('/products');
          }}
          title="Stock Dispatched Successfully"
          maxWidth="max-w-md"
        >
          <div className="space-y-4 text-center py-2">
            <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 mx-auto flex items-center justify-center">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Dispatch Order Recorded
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Reference: <strong>{successSummary.reference}</strong>
              </p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-left text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Lines Dispatched:</span>
                <span className="font-bold">{successSummary.lineCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Units Deducted from Ledger:</span>
                <span className="font-bold text-rose-600">-{successSummary.totalUnits}</span>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSuccessSummary(null);
                  reset();
                }}
              >
                New Dispatch
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  setSuccessSummary(null);
                  navigate('/products');
                }}
              >
                View Inventory
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
