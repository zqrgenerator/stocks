import React from 'react';
import { cn } from '../../lib/utils';

export function Badge({ children, variant = 'neutral', dot = false, className }) {
  const variants = {
    neutral: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
    primary: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-900',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900',
    warning: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900',
    danger: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-900',
  };

  const dots = {
    neutral: 'bg-slate-400',
    primary: 'bg-indigo-500',
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    danger: 'bg-red-500',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border transition-colors',
        variants[variant] || variants.neutral,
        className
      )}
    >
      {dot && <span className={cn('w-1.5 h-1.5 rounded-full', dots[variant] || dots.neutral)} />}
      {children}
    </span>
  );
}

export function Card({ className, children, ...props }) {
  return (
    <div
      className={cn(
        'bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl shadow-soft transition-all duration-200',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className, title, subtitle, action, children }) {
  return (
    <div className={cn('p-5 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between', className)}>
      <div>
        {title && <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">{title}</h3>}
        {subtitle && <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{subtitle}</p>}
        {children}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

export function CardContent({ className, children }) {
  return <div className={cn('p-5', className)}>{children}</div>;
}
