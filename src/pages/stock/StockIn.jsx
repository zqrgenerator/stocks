import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { stockInFormSchema } from '../../lib/schemas';
import {
  useProducts,
  useSuppliers,
  useCreateStockMovements,
} from '../../hooks/useInventory';
import { useAuth } from '../../context/AuthContext';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input, Textarea } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Modal } from '../../components/ui/Modal';
import { BarcodeScannerModal } from '../../components/ui/BarcodeScannerModal';
import { formatCurrency } from '../../lib/utils';
import {
  Plus,
  Trash2,
  Scan,
  CheckCircle,
  ArrowDownLeft,
  Calendar,
  FileText,
  Truck,
  IndianRupee,
} from 'lucide-react';
import { toast } from 'sonner';

export function StockIn() {
  const [searchParams] = useSearchParams();
  const prefillProductId = searchParams.get('productId') || '';
  const navigate = useNavigate();

  const { data: products = [] } = useProducts();
  const { data: suppliers = [] } = useSuppliers();
  const createMovementsMutation = useCreateStockMovements();
  const { user } = useAuth();

  const [activeScanIndex, setActiveScanIndex] = useState(null);
  const [successSummary, setSuccessSummary] = useState(null);

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(stockInFormSchema),
    defaultValues: {
      supplier_id: '',
      reference: '',
      date: new Date().toISOString().split('T')[0],
      note: '',
      lines: [
        {
          product_id: prefillProductId,
          quantity: 1,
          unit_cost: 0,
          update_cost_price: false,
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

  // Auto-fill unit_cost when a product is selected in a line
  const handleProductChange = (index, prodId) => {
    const prod = products.find((p) => p.id === prodId);
    if (prod) {
      setValue(`lines.${index}.unit_cost`, Number(prod.cost_price || 0));
      if (prod.supplier_id && !watch('supplier_id')) {
        setValue('supplier_id', prod.supplier_id);
      }
    }
  };

  // If prefilled product ID exists, set its initial cost price
  useEffect(() => {
    if (prefillProductId && products.length > 0) {
      const prod = products.find((p) => p.id === prefillProductId);
      if (prod) {
        setValue('lines.0.unit_cost', Number(prod.cost_price || 0));
        if (prod.supplier_id) setValue('supplier_id', prod.supplier_id);
      }
    }
  }, [prefillProductId, products, setValue]);

  // Compute live totals
  const totalUnits = (watchedLines || []).reduce((acc, curr) => acc + (Number(curr?.quantity) || 0), 0);
  const totalCost = (watchedLines || []).reduce(
    (acc, curr) => acc + (Number(curr?.quantity) || 0) * (Number(curr?.unit_cost) || 0),
    0
  );

  const onSubmit = async (data) => {
    try {
      const itemsToSubmit = data.lines.map((l) => ({
        product_id: l.product_id,
        type: 'IN',
        quantity: Math.abs(Number(l.quantity)),
        unit_cost: Number(l.unit_cost) || 0,
        supplier_id: data.supplier_id || null,
        reason: 'purchase / received',
        reference: data.reference,
        note: l.note || data.note || null,
        update_cost_price: l.update_cost_price,
        created_at: new Date(data.date).toISOString(),
      }));

      await createMovementsMutation.mutateAsync(itemsToSubmit);

      setSuccessSummary({
        reference: data.reference,
        lineCount: itemsToSubmit.length,
        totalUnits,
        totalCost,
      });

      toast.success(`Successfully received ${totalUnits} units into stock!`);
    } catch (err) {
      toast.error(err.message || 'Failed to submit stock intake');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <ArrowDownLeft className="w-6 h-6 text-emerald-600" />
            Receive Stock (Stock In)
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Record supplier deliveries, inbound purchase orders, or warehouse intake batches
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Document Header Card */}
        <Card>
          <CardHeader title="Intake Document Header" />
          <CardContent className="p-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Reference / PO / Bill No. *"
              placeholder="e.g. PO-2026-089"
              error={errors.reference?.message}
              {...register('reference')}
            />

            <Select
              label="Supplier"
              error={errors.supplier_id?.message}
              {...register('supplier_id')}
            >
              <option value="">Select supplier (optional)</option>
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </Select>

            <Input
              label="Transaction Date *"
              type="date"
              error={errors.date?.message}
              {...register('date')}
            />
          </CardContent>
        </Card>

        {/* Multi-line Items Card */}
        <Card>
          <CardHeader
            title="Received Items"
            subtitle="Add one or more products to receive in this batch"
            action={
              <Button
                type="button"
                variant="outline"
                size="xs"
                onClick={() =>
                  append({
                    product_id: '',
                    quantity: 1,
                    unit_cost: 0,
                    update_cost_price: false,
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

                return (
                  <div
                    key={field.id}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60 space-y-3 relative group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-500">Item #{index + 1}</span>
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
                      {/* Product Selector with scan trigger */}
                      <div className="sm:col-span-5">
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Product *
                        </label>
                        <div className="flex gap-1.5">
                          <select
                            className="flex-1 text-xs h-9 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            {...register(`lines.${index}.product_id`, {
                              onChange: (e) => handleProductChange(index, e.target.value),
                            })}
                          >
                            <option value="">Select product to receive</option>
                            {products.map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.name} ({p.sku}) — Curr: {p.current_stock} {p.unit}
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
                          label={`Quantity (${selectedProd?.unit || 'units'}) *`}
                          type="number"
                          step="0.01"
                          placeholder="0"
                          error={errors.lines?.[index]?.quantity?.message}
                          {...register(`lines.${index}.quantity`)}
                        />
                      </div>

                      {/* Unit Cost */}
                      <div className="sm:col-span-4">
                        <Input
                          label="Unit Purchase Cost (₹)"
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          error={errors.lines?.[index]?.unit_cost?.message}
                          {...register(`lines.${index}.unit_cost`)}
                        />
                      </div>
                    </div>

                    {/* Cost Update Checkbox & Line Note */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 text-xs">
                      <label className="flex items-center gap-2 cursor-pointer text-slate-700 dark:text-slate-300">
                        <input
                          type="checkbox"
                          className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                          {...register(`lines.${index}.update_cost_price`)}
                        />
                        <span>Update product's master cost price with this latest unit cost</span>
                      </label>
                      <div className="w-full sm:w-64">
                        <input
                          type="text"
                          placeholder="Line note / batch no..."
                          className="w-full text-xs py-1 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 placeholder-slate-400"
                          {...register(`lines.${index}.note`)}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Global Note & Totals Summary Card */}
        <Card>
          <CardContent className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="w-full sm:w-1/2">
              <Textarea
                label="Overall Receiving Note"
                placeholder="Remarks, vehicle number, delivery condition..."
                rows={2}
                {...register('note')}
              />
            </div>

            <div className="w-full sm:w-auto text-right space-y-1">
              <div className="text-xs text-slate-500 font-medium">Batch Summary</div>
              <div className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Total Units: <span className="text-slate-900 dark:text-white font-bold">{totalUnits}</span>
              </div>
              <div className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
                Total Cost: {formatCurrency(totalCost)}
              </div>
              <div className="pt-3">
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  isLoading={isSubmitting || createMovementsMutation.isPending}
                  className="w-full sm:w-auto"
                >
                  Confirm & Receive Stock
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
              handleProductChange(activeScanIndex, found.id);
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
          title="Stock Intake Confirmed"
          maxWidth="max-w-md"
        >
          <div className="space-y-4 text-center py-2">
            <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Goods Received Successfully
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Reference PO/Bill: <strong>{successSummary.reference}</strong>
              </p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-left text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Lines Processed:</span>
                <span className="font-bold">{successSummary.lineCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Total Units Added:</span>
                <span className="font-bold text-emerald-600">+{successSummary.totalUnits}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Total Purchase Value:</span>
                <span className="font-bold">{formatCurrency(successSummary.totalCost)}</span>
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
                Receive More
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
