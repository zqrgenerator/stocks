import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, parseISO, isValid } from 'date-fns';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount, currency = 'INR') {
  const num = Number(amount) || 0;
  if (currency === 'INR') {
    // Format according to Indian Numbering System (e.g. ₹ 1,23,456.00)
    return '₹ ' + num.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency,
  }).format(num);
}

export function formatNumber(num) {
  const n = Number(num) || 0;
  return n.toLocaleString('en-IN');
}

export function formatDate(date, pattern = 'dd MMM yyyy') {
  if (!date) return '-';
  try {
    const d = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(d)) return String(date);
    return format(d, pattern);
  } catch {
    return String(date);
  }
}

export function formatDateTime(date) {
  return formatDate(date, 'dd MMM yyyy, hh:mm a');
}

export function getStockStatus(currentStock, minStock = 5) {
  const stock = Number(currentStock) || 0;
  const min = Number(minStock) || 0;

  if (stock <= 0) {
    return {
      status: 'out',
      label: 'Out of Stock',
      badgeClass: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-900',
      dotClass: 'bg-red-500',
    };
  }
  if (stock <= min) {
    return {
      status: 'low',
      label: 'Low Stock',
      badgeClass: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900',
      dotClass: 'bg-amber-500',
    };
  }
  return {
    status: 'in',
    label: 'In Stock',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900',
    dotClass: 'bg-emerald-500',
  };
}

export function generateSKU(categoryName = '', productName = '') {
  const catPrefix = categoryName.trim().slice(0, 3).toUpperCase() || 'GEN';
  const prodPrefix = productName
    .trim()
    .replace(/[^a-zA-Z0-9]/g, '')
    .slice(0, 3)
    .toUpperCase() || 'PRD';
  const randomNum = Math.floor(100 + Math.random() * 900);
  return `${catPrefix}-${prodPrefix}-${randomNum}`;
}
