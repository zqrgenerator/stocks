import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { settingsSchema } from '../../lib/schemas';
import { useSettings, useUpdateSettings } from '../../hooks/useInventory';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Settings as SettingsIcon, Building, Coins, ShieldAlert, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';

export function Settings() {
  const { data: settings, isLoading } = useSettings();
  const updateSettingsMutation = useUpdateSettings();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      company_name: 'BuildStaok Logistics Pvt Ltd',
      currency: 'INR',
      default_min_stock: 5,
    },
  });

  useEffect(() => {
    if (settings) {
      reset({
        company_name: settings.company_name || 'BuildStaok Logistics Pvt Ltd',
        currency: settings.currency || 'INR',
        default_min_stock: Number(settings.default_min_stock || 5),
      });
    }
  }, [settings, reset]);

  const onSubmit = async (data) => {
    try {
      await updateSettingsMutation.mutateAsync(data);
    } catch {
      // toast shown in mutation
    }
  };

  const handleResetData = () => {
    if (confirm('Reset mock database to initial seed data?')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
          <SettingsIcon className="w-6 h-6 text-indigo-600" />
          System Settings
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Configure business profile, currency format, and default threshold values
        </p>
      </div>

      <Card>
        <CardHeader
          title="Organization & Localization"
          subtitle="This information is used on official PDF reports and exported invoices"
        />
        <CardContent className="p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <Input
              label="Legal Company Name *"
              placeholder="e.g. BuildStaok Logistics Pvt Ltd"
              leftIcon={<Building className="w-4 h-4" />}
              error={errors.company_name?.message}
              {...register('company_name')}
            />

            <Select
              label="Primary Operational Currency *"
              error={errors.currency?.message}
              {...register('currency')}
            >
              <option value="INR">Indian Rupee (₹ INR)</option>
              <option value="USD">US Dollar ($ USD)</option>
              <option value="EUR">Euro (€ EUR)</option>
              <option value="GBP">British Pound (£ GBP)</option>
              <option value="AED">UAE Dirham (AED)</option>
            </Select>

            <Input
              label="Global Default Minimum Safety Stock *"
              type="number"
              placeholder="5"
              error={errors.default_min_stock?.message}
              helperText="Default threshold applied when creating new products"
              {...register('default_min_stock')}
            />

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <Button
                type="submit"
                variant="primary"
                size="md"
                isLoading={isSubmitting || updateSettingsMutation.isPending}
              >
                Save Settings
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Developer / Testing reset card */}
      <Card className="border-red-200 dark:border-red-950/60 bg-red-50/20 dark:bg-red-950/10">
        <CardHeader
          title="Factory Reset & Testing Utility"
          subtitle="Reset stored localStorage state back to the original seed data"
        />
        <CardContent className="p-6 flex items-center justify-between">
          <p className="text-xs text-slate-500 max-w-sm">
            Clears local modifications and reloads the initial 25 realistic products, 6 categories, and 4 suppliers.
          </p>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleResetData}
            className="flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Seed Data
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
