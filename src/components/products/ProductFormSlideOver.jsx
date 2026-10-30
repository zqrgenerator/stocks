import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { productSchema } from '../../lib/schemas';
import { dataService } from '../../lib/dataService';
import { useCategories, useSuppliers } from '../../hooks/useInventory';
import { generateSKU } from '../../lib/utils';
import { SlideOver } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input, Textarea } from '../ui/Input';
import { Select } from '../ui/Select';
import { BarcodeScannerModal } from '../ui/BarcodeScannerModal';
import { Upload, Sparkles, Scan, Plus, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';

export function ProductFormSlideOver({
  isOpen,
  onClose,
  product = null, // null for create, object for edit
  onSubmitSuccess,
  onOpenQuickCategory,
}) {
  const isEditing = Boolean(product);
  const { data: categories = [] } = useCategories();
  const { data: suppliers = [] } = useSuppliers();

  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: {
      sku: '',
      name: '',
      description: '',
      category_id: '',
      supplier_id: '',
      unit: 'pcs',
      cost_price: 0,
      sell_price: 0,
      min_stock: 5,
      barcode: '',
      image_url: null,
      is_active: true,
    },
  });

  const selectedCatId = watch('category_id');
  const productName = watch('name');

  useEffect(() => {
    if (product) {
      reset({
        sku: product.sku || '',
        name: product.name || '',
        description: product.description || '',
        category_id: product.category_id || '',
        supplier_id: product.supplier_id || '',
        unit: product.unit || 'pcs',
        cost_price: Number(product.cost_price || 0),
        sell_price: Number(product.sell_price || 0),
        min_stock: Number(product.min_stock || 5),
        barcode: product.barcode || '',
        image_url: product.image_url || null,
        is_active: product.is_active ?? true,
      });
      setImagePreview(product.image_url || null);
    } else {
      reset({
        sku: '',
        name: '',
        description: '',
        category_id: '',
        supplier_id: '',
        unit: 'pcs',
        cost_price: 0,
        sell_price: 0,
        min_stock: 5,
        barcode: '',
        image_url: null,
        is_active: true,
      });
      setImagePreview(null);
    }
    setImageFile(null);
  }, [product, reset, isOpen]);

  // Auto suggest SKU
  const handleAutoSuggestSKU = () => {
    const selectedCat = categories.find((c) => c.id === selectedCatId);
    const catName = selectedCat ? selectedCat.name : 'GEN';
    const newSku = generateSKU(catName, productName || 'PRD');
    setValue('sku', newSku, { shouldValidate: true });
    toast.info(`Suggested SKU: ${newSku}`);
  };

  // Image file select & validation
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file (JPG, PNG, WebP)');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    setImageFile(file);
    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
  };

  const onFormSubmit = async (data) => {
    try {
      let finalImageUrl = data.image_url;

      if (imageFile) {
        setIsUploading(true);
        finalImageUrl = await dataService.uploadProductImage(imageFile);
        setIsUploading(false);
      }

      const payload = {
        ...data,
        category_id: data.category_id ? data.category_id : null,
        supplier_id: data.supplier_id ? data.supplier_id : null,
        image_url: finalImageUrl,
      };

      await onSubmitSuccess(payload, product?.id);
      onClose();
    } catch (err) {
      toast.error(err.message || 'Error saving product');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <>
      <SlideOver
        isOpen={isOpen}
        onClose={onClose}
        title={isEditing ? 'Edit Product' : 'Add New Product'}
        description={
          isEditing
            ? 'Update product details, pricing, and thresholds'
            : 'Fill in details to register a new inventory item'
        }
      >
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-5 pb-6">
          {/* Image Upload Box */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Product Image
            </label>
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 overflow-hidden bg-slate-50 dark:bg-slate-800 flex items-center justify-center shrink-0">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Product preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <ImageIcon className="w-8 h-8 text-slate-400" />
                )}
              </div>
              <div className="flex-1">
                <label className="cursor-pointer">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 transition-colors">
                    <Upload className="w-3.5 h-3.5" />
                    Choose Photo
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
                <p className="text-[11px] text-slate-400 mt-1">PNG, JPG, or WebP up to 5MB</p>
                {imagePreview && (
                  <button
                    type="button"
                    onClick={() => {
                      setImagePreview(null);
                      setImageFile(null);
                      setValue('image_url', null);
                    }}
                    className="text-[11px] text-red-500 hover:underline mt-1 block"
                  >
                    Remove image
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Product Name */}
          <Input
            label="Product Name *"
            placeholder="e.g. Ultratech Super Cement (50kg)"
            error={errors.name?.message}
            {...register('name')}
          />

          {/* SKU with Auto-Suggest */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                SKU (Stock Keeping Unit) *
              </label>
              <button
                type="button"
                onClick={handleAutoSuggestSKU}
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium inline-flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3" />
                Auto-generate
              </button>
            </div>
            <Input
              placeholder="e.g. CEM-ULT-50K"
              error={errors.sku?.message}
              {...register('sku')}
            />
          </div>

          {/* Category with Quick Create */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Category
              </label>
              <button
                type="button"
                onClick={onOpenQuickCategory}
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium inline-flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                New Category
              </button>
            </div>
            <Select error={errors.category_id?.message} {...register('category_id')}>
              <option value="">Select a category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
          </div>

          {/* Supplier */}
          <Select
            label="Preferred Supplier"
            error={errors.supplier_id?.message}
            {...register('supplier_id')}
          >
            <option value="">Select a supplier</option>
            {suppliers.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </Select>

          {/* Barcode with Scanner Trigger */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Barcode / EAN
              </label>
              <button
                type="button"
                onClick={() => setScannerOpen(true)}
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium inline-flex items-center gap-1"
              >
                <Scan className="w-3 h-3" />
                Scan with Camera
              </button>
            </div>
            <Input
              placeholder="e.g. 890123456701"
              rightIcon={<Scan className="w-4 h-4 cursor-pointer" onClick={() => setScannerOpen(true)} />}
              error={errors.barcode?.message}
              {...register('barcode')}
            />
          </div>

          {/* Cost Price & Sell Price */}
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Cost Price (₹) *"
              type="number"
              step="0.01"
              placeholder="0.00"
              error={errors.cost_price?.message}
              {...register('cost_price')}
            />
            <Input
              label="Sell Price (₹) *"
              type="number"
              step="0.01"
              placeholder="0.00"
              error={errors.sell_price?.message}
              {...register('sell_price')}
            />
          </div>

          {/* Unit & Minimum Safety Stock */}
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Unit of Measurement *"
              placeholder="pcs, bags, kg, m, boxes"
              error={errors.unit?.message}
              {...register('unit')}
            />
            <Input
              label="Min Stock Threshold *"
              type="number"
              placeholder="5"
              error={errors.min_stock?.message}
              {...register('min_stock')}
            />
          </div>

          {/* Description */}
          <Textarea
            label="Description & Specifications"
            placeholder="Add detailed specs, dimensions, material grade..."
            error={errors.description?.message}
            {...register('description')}
          />

          {/* Active status */}
          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="is_active_toggle"
              className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
              {...register('is_active')}
            />
            <label htmlFor="is_active_toggle" className="text-xs font-medium text-slate-700 dark:text-slate-300">
              Product is Active (available for stock operations)
            </label>
          </div>

          {/* Submit Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button variant="outline" size="sm" onClick={onClose} disabled={isSubmitting || isUploading}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isSubmitting || isUploading}
            >
              {isEditing ? 'Save Changes' : 'Create Product'}
            </Button>
          </div>
        </form>
      </SlideOver>

      {/* Barcode scanner dialog */}
      <BarcodeScannerModal
        isOpen={scannerOpen}
        onClose={() => setScannerOpen(false)}
        onScan={(code) => {
          setValue('barcode', code, { shouldValidate: true });
          toast.success(`Barcode detected: ${code}`);
        }}
      />
    </>
  );
}
