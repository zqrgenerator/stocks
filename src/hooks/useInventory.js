import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dataService } from '../lib/dataService';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';

export function useDashboard() {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: () => dataService.getDashboardData(),
    staleTime: 1000 * 30, // 30 seconds
  });
}

export function useProducts() {
  return useQuery({
    queryKey: ['products'],
    queryFn: () => dataService.getProducts(),
    staleTime: 1000 * 30,
  });
}

export function useProduct(id) {
  return useQuery({
    queryKey: ['product', id],
    queryFn: () => dataService.getProductById(id),
    enabled: Boolean(id),
  });
}

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => dataService.getCategories(),
    staleTime: 1000 * 60 * 5,
  });
}

export function useSuppliers() {
  return useQuery({
    queryKey: ['suppliers'],
    queryFn: () => dataService.getSuppliers(),
    staleTime: 1000 * 60 * 5,
  });
}

export function useSupplier(id) {
  return useQuery({
    queryKey: ['supplier', id],
    queryFn: () => dataService.getSupplierById(id),
    enabled: Boolean(id),
  });
}

export function useMovements(filters = {}) {
  return useQuery({
    queryKey: ['movements', filters],
    queryFn: () => dataService.getMovements(filters),
    staleTime: 1000 * 15,
  });
}

export function useSettings() {
  return useQuery({
    queryKey: ['settings'],
    queryFn: () => dataService.getSettings(),
    staleTime: 1000 * 60 * 10,
  });
}

export function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: () => dataService.getUsers(),
  });
}

export function useAuditLogs() {
  return useQuery({
    queryKey: ['audit-logs'],
    queryFn: () => dataService.getAuditLogs(),
    staleTime: 1000 * 15,
  });
}

// ==========================================
// MUTATIONS WITH QUERY INVALIDATION
// ==========================================

export function useCreateProduct() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: (data) => dataService.createProduct(data, user?.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Product created successfully');
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to create product');
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: ({ id, data }) => dataService.updateProduct(id, data, user?.id),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['product', updated.id] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Product updated successfully');
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to update product');
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: ({ id, hard }) => dataService.deleteProduct(id, hard, user?.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Product deleted successfully');
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to delete product');
    },
  });
}

export function useBulkImportProducts() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: (records) => dataService.bulkImportProducts(records, user?.id),
    onSuccess: (imported) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success(`Successfully imported ${imported.length} products`);
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to import products');
    },
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: (name) => dataService.createCategory(name, user?.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Category created successfully');
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to create category');
    },
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: ({ id, name }) => dataService.updateCategory(id, name, user?.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Category updated successfully');
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to update category');
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: (id) => dataService.deleteCategory(id, user?.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Category deleted successfully');
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to delete category');
    },
  });
}

export function useCreateSupplier() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: (data) => dataService.createSupplier(data, user?.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      toast.success('Supplier added successfully');
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to create supplier');
    },
  });
}

export function useUpdateSupplier() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: ({ id, data }) => dataService.updateSupplier(id, data, user?.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Supplier updated successfully');
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to update supplier');
    },
  });
}

export function useDeleteSupplier() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: (id) => dataService.deleteSupplier(id, user?.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      toast.success('Supplier deleted successfully');
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to delete supplier');
    },
  });
}

export function useCreateStockMovements() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: (items) => dataService.createStockMovements(items, user?.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['movements'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['product'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
    },
    onError: (err) => {
      // Toast displayed in caller form or caught here
    },
  });
}

export function useUpdateSettings() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: (data) => dataService.updateSettings(data, user?.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      toast.success('Settings updated successfully');
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to update settings');
    },
  });
}

export function useUpdateUserRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, role }) => dataService.updateUserRole(userId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User role updated');
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to update user role');
    },
  });
}
