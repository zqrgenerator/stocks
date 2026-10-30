import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  useSuppliers,
  useCreateSupplier,
  useUpdateSupplier,
  useDeleteSupplier,
} from '../../hooks/useInventory';
import { useAuth } from '../../context/AuthContext';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input, Textarea } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { TableSkeleton, EmptyState } from '../../components/ui/Skeleton';
import {
  Truck,
  Plus,
  Search,
  Phone,
  Mail,
  MapPin,
  Edit2,
  Trash2,
  Eye,
  Building,
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { supplierSchema } from '../../lib/schemas';
import { toast } from 'sonner';

export function Suppliers() {
  const { data: suppliers = [], isLoading } = useSuppliers();
  const { isManager, isAdmin } = useAuth();
  const createSupplierMutation = useCreateSupplier();
  const updateSupplierMutation = useUpdateSupplier();
  const deleteSupplierMutation = useDeleteSupplier();

  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(supplierSchema),
    defaultValues: {
      name: '',
      contact_person: '',
      phone: '',
      email: '',
      address: '',
      gstin: '',
      is_active: true,
    },
  });

  const filteredSuppliers = useMemo(() => {
    if (!search.trim()) return suppliers;
    const q = search.toLowerCase();
    return suppliers.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.contact_person?.toLowerCase().includes(q) ||
        s.phone?.includes(q) ||
        s.email?.toLowerCase().includes(q) ||
        s.gstin?.toLowerCase().includes(q)
    );
  }, [suppliers, search]);

  const handleOpenAdd = () => {
    setEditingSupplier(null);
    reset({
      name: '',
      contact_person: '',
      phone: '',
      email: '',
      address: '',
      gstin: '',
      is_active: true,
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (sup) => {
    setEditingSupplier(sup);
    reset({
      name: sup.name,
      contact_person: sup.contact_person || '',
      phone: sup.phone || '',
      email: sup.email || '',
      address: sup.address || '',
      gstin: sup.gstin || '',
      is_active: sup.is_active ?? true,
    });
    setModalOpen(true);
  };

  const onFormSubmit = async (data) => {
    try {
      if (editingSupplier) {
        await updateSupplierMutation.mutateAsync({ id: editingSupplier.id, data });
      } else {
        await createSupplierMutation.mutateAsync(data);
      }
      setModalOpen(false);
    } catch {
      // toast shown in hook
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    await deleteSupplierMutation.mutateAsync(deleteTarget.id);
    setDeleteTarget(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Truck className="w-6 h-6 text-indigo-600" />
            Suppliers & Vendors
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Maintain authorized supplier profiles, GSTIN details, and contact directory
          </p>
        </div>

        {isManager && (
          <Button
            variant="primary"
            size="sm"
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Add Supplier
          </Button>
        )}
      </div>

      {/* Search Bar */}
      <Card>
        <CardContent className="p-4">
          <Input
            placeholder="Search suppliers by name, contact person, phone, GSTIN..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
          />
        </CardContent>
      </Card>

      {/* Suppliers Table */}
      <Card className="overflow-hidden">
        {isLoading ? (
          <TableSkeleton rows={6} cols={6} />
        ) : filteredSuppliers.length === 0 ? (
          <EmptyState
            icon={Truck}
            title="No suppliers found"
            description="No vendors match your search. Add suppliers to associate with inbound inventory."
            action={
              isManager && (
                <Button size="sm" variant="primary" onClick={handleOpenAdd}>
                  Add Supplier
                </Button>
              )
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-semibold border-b border-slate-200/80 dark:border-slate-800">
                <tr>
                  <th className="px-4 py-3.5">Company Name</th>
                  <th className="px-4 py-3.5">Contact Person</th>
                  <th className="px-4 py-3.5">Phone & Email</th>
                  <th className="px-4 py-3.5">GSTIN</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredSuppliers.map((sup) => (
                  <tr
                    key={sup.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="px-4 py-3.5">
                      <Link
                        to={`/suppliers/${sup.id}`}
                        className="font-bold text-slate-900 dark:text-slate-100 hover:text-indigo-600 dark:hover:text-indigo-400 block"
                      >
                        {sup.name}
                      </Link>
                      {sup.address && (
                        <p className="text-[11px] text-slate-400 truncate max-w-xs flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 shrink-0" /> {sup.address}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-slate-700 dark:text-slate-300 font-medium">
                      {sup.contact_person || '-'}
                    </td>
                    <td className="px-4 py-3.5 text-slate-600 dark:text-slate-300 space-y-0.5">
                      {sup.phone && (
                        <p className="flex items-center gap-1.5 text-xs">
                          <Phone className="w-3 h-3 text-slate-400" /> {sup.phone}
                        </p>
                      )}
                      {sup.email && (
                        <p className="flex items-center gap-1.5 text-xs text-slate-400">
                          <Mail className="w-3 h-3 text-slate-400" /> {sup.email}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3.5 font-mono text-xs text-slate-600 dark:text-slate-300">
                      {sup.gstin || '-'}
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                          sup.is_active
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
                        }`}
                      >
                        {sup.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          to={`/suppliers/${sup.id}`}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          title="View supplier detail & products"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        {isManager && (
                          <button
                            onClick={() => handleOpenEdit(sup)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        )}
                        {isAdmin && (
                          <button
                            onClick={() => setDeleteTarget(sup)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Add / Edit Supplier Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingSupplier ? 'Edit Supplier' : 'Register New Supplier'}
        description="Fill in company credentials, contact person, and GSTIN information"
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
          <Input
            label="Supplier Company Name *"
            placeholder="e.g. Ultratech Mega Supplies"
            error={errors.name?.message}
            {...register('name')}
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Contact Person"
              placeholder="e.g. Rajesh Sharma"
              error={errors.contact_person?.message}
              {...register('contact_person')}
            />
            <Input
              label="GSTIN"
              placeholder="27AABCU9603R1ZM"
              error={errors.gstin?.message}
              {...register('gstin')}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Phone Number"
              placeholder="+91 98201 23456"
              error={errors.phone?.message}
              {...register('phone')}
            />
            <Input
              label="Email Address"
              placeholder="sales@company.in"
              error={errors.email?.message}
              {...register('email')}
            />
          </div>
          <Textarea
            label="Registered Address"
            placeholder="Plot number, industrial area, city, pin..."
            rows={2}
            error={errors.address?.message}
            {...register('address')}
          />
          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button variant="outline" size="sm" onClick={() => setModalOpen(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={isSubmitting}>
              {editingSupplier ? 'Update Supplier' : 'Save Supplier'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Supplier?"
        message={`Are you sure you want to remove "${deleteTarget?.name}"? Any products assigned to this supplier will have their supplier set to null.`}
        isLoading={deleteSupplierMutation.isPending}
      />
    </div>
  );
}
