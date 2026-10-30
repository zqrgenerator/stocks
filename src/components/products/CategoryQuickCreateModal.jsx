import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useCreateCategory } from '../../hooks/useInventory';

export function CategoryQuickCreateModal({ isOpen, onClose, onCreated }) {
  const [name, setName] = useState('');
  const createCategory = useCreateCategory();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      const cat = await createCategory.mutateAsync(name.trim());
      setName('');
      if (onCreated) onCreated(cat);
      onClose();
    } catch {
      // Error handled by mutation toast
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Category"
      description="Add a new product category to organize your inventory"
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Category Name *"
          placeholder="e.g. Sanitary & Plumbing"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
        />
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="outline" size="sm" onClick={onClose} disabled={createCategory.isPending}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            isLoading={createCategory.isPending}
            disabled={!name.trim()}
          >
            Create Category
          </Button>
        </div>
      </form>
    </Modal>
  );
}
