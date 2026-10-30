import React from 'react';
import { cn } from '../../lib/utils';
import { Loader2 } from 'lucide-react';

export const Button = React.forwardRef(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      disabled,
      children,
      type = 'button',
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]';

    const variants = {
      primary:
        'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm focus:ring-indigo-500 shadow-indigo-500/20',
      secondary:
        'bg-slate-100 hover:bg-slate-200 text-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-100 focus:ring-slate-400',
      outline:
        'border border-slate-300 hover:bg-slate-50 text-slate-700 dark:border-slate-700 dark:hover:bg-slate-800 dark:text-slate-200 focus:ring-indigo-500',
      ghost:
        'hover:bg-slate-100 text-slate-600 hover:text-slate-900 dark:hover:bg-slate-800 dark:text-slate-300 dark:hover:text-slate-100 focus:ring-slate-400',
      destructive:
        'bg-red-600 hover:bg-red-700 text-white shadow-sm focus:ring-red-500 shadow-red-500/20',
      success:
        'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm focus:ring-emerald-500 shadow-emerald-500/20',
    };

    const sizes = {
      xs: 'text-xs px-2.5 py-1.5 h-7',
      sm: 'text-xs px-3 py-2 h-8',
      md: 'text-sm px-4 py-2 h-9',
      lg: 'text-base px-5 py-2.5 h-11',
      icon: 'h-9 w-9 p-0',
    };

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
