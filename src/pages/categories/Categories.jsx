import React, { useState, useMemo } from 'react';
import {
  useCategories,
  useProducts,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
} from '../../hooks/useInventory';
import { useAuth } from '../../context/AuthContext';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { TableSkeleton, EmptyState } from '../../components/ui/Skeleton';
import { formatDate } from '../../lib/utils';
import { Tags, Plus, Search, Edit2, Trash2, Package } from 'lucide-react';
import { toast } from 'sonner';

export function Categories() {
  const { data: categories = [], isLoading } = useCategories();
  const { data: products = [] } = useProducts();
  const { isManager, isAdmin } = useAuth();

  const createCategoryMutation = useCreateCategory();
  const updateCategoryMutation = useUpdateCategory();
  const deleteCategoryMutation = useDeleteCategory();

  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [nameInput, setNameInput] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Map product counts
  const countMap = useMemo(() => {
    const map = {};
    for (const p of products) {
      if (p.category_id) {
        map[p.category_id] = (map[p.category_id] || 0) + 1;
      }
    }
    return map;
  }, [products]);

  const filteredCategories = useMemo(() => {
    if (!search.trim()) return categories;
    return categories.filter((c) =>
      c.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [categories, search]);

  const handleOpenAdd = () => {
    setEditingCategory(null);
    setNameInput('');
    setModalOpen(true);
  };

  const handleOpenEdit = (cat) => {
    setEditingCategory(cat);
    setNameInput(cat.name);
    setModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!nameInput.trim()) return;

    try {
      if (editingCategory) {
        await updateCategoryMutation.mutateAsync({
          id: editingCategory.id,
          name: nameInput.trim(),
        });
      } else {
        await createCategoryMutation.mutateAsync(nameInput.trim());
      }
      setModalOpen(false);
    } catch {
      // toast shown in mutation hook
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    await deleteCategoryMutation.mutateAsync(deleteTarget.id);
    setDeleteTarget(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Tags className="w-6 h-6 text-indigo-600" />
            Product Categories
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Organize inventory items into structural categories for valuation and reporting
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
            Add Category
          </Button>
        )}
      </div>

      {/* Search Bar */}
      <Card>
        <CardContent className="p-4">
          <Input
            placeholder="Search categories by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
          />
        </CardContent>
      </Card>

      {/* Categories Table */}
      <Card className="overflow-hidden">
        {isLoading ? (
          <TableSkeleton rows={5} cols={4} />
        ) : filteredCategories.length === 0 ? (
          <EmptyState
            icon={Tags}
            title="No categories found"
            description="Create categories to organize your products."
            action={
              isManager && (
                <Button size="sm" variant="primary" onClick={handleOpenAdd}>
                  Add Category
                </Button>
              )
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-semibold border-b border-slate-200/80 dark:border-slate-800">
                <tr>
                  <th className="px-4 py-3.5">Category Name</th>
                  <th className="px-4 py-3.5">Associated Products</th>
                  <th className="px-4 py-3.5">Created Date</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredCategories.map((cat) => (
                  <tr
                    key={cat.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="px-4 py-3.5 font-semibold text-slate-900 dark:text-slate-100">
                      {cat.name}
                    </td>
                    <td className="px-4 py-3.5 text-slate-600 dark:text-slate-300">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300">
                        <Package className="w-3.5 h-3.5" />
                        {countMap[cat.id] || 0} Products
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-slate-500 text-xs">
                      {formatDate(cat.created_at, 'dd MMM yyyy')}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {isManager && (
                          <button
                            onClick={() => handleOpenEdit(cat)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            title="Edit category"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        )}
                        {isAdmin && (
                          <button
                            onClick={() => setDeleteTarget(cat)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                            title="Delete category"
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

      {/* Add / Edit Category Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingCategory ? 'Edit Category' : 'Create Category'}
        description="Specify the name for this inventory classification"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <Input
            label="Category Name *"
            placeholder="e.g. Electrical & Wiring"
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            autoFocus
            required
          />
          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button variant="outline" size="sm" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={!nameInput.trim()}
              isLoading={createCategoryMutation.isPending || updateCategoryMutation.isPending}
            >
              {editingCategory ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Category?"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? Products currently in this category will become uncategorized.`}
        isLoading={deleteCategoryMutation.isPending}
      />
    </div>
  );
}
