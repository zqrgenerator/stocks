import React from 'react';
import { cn } from '../../lib/utils';

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
