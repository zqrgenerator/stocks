import React from 'react';
import { cn } from '../../lib/utils';
import { PackageOpen } from 'lucide-react';

export function Skeleton({ className, ...props }) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md bg-slate-200 dark:bg-slate-800',
        className
      )}
      {...props}
    />
  );
}

export function TableSkeleton({ rows = 5, cols = 6 }) {
  return (
    <div className="w-full space-y-3 p-4">
      <div className="flex gap-4">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} className="h-4 flex-1" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex gap-4 items-center py-2 border-t border-slate-100 dark:border-slate-800">
          {Array.from({ length: cols }).map((_, c) => (
            <Skeleton key={c} className="h-4 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="p-5 space-y-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
      <div className="flex justify-between items-center">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
      <Skeleton className="h-8 w-36" />
      <Skeleton className="h-3 w-20" />
    </div>
  );
}

export function EmptyState({
  icon: Icon = PackageOpen,
  title = 'No items found',
  description = 'There are no records matching your criteria.',
  action,
  className,
}) {
  return (
    <div className={cn('text-center py-12 px-4 flex flex-col items-center justify-center', className)}>
      <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4 shadow-sm">
        <Icon className="w-7 h-7" />
      </div>
      <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100 mb-1">{title}</h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mb-6">{description}</p>
      {action && <div>{action}</div>}
    </div>
  );
}
