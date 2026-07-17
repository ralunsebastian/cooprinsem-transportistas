import * as React from 'react';
import { cn } from '@/lib/utils';

export function Input({ className, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      className={cn(
        'h-9 w-full rounded-lg border border-forest-200 bg-white px-3 text-sm text-forest-900 placeholder:text-forest-300 focus:border-brand-400 focus:outline-2 focus:outline-brand-200 disabled:opacity-50',
        className,
      )}
      {...props}
    />
  );
}

export function Textarea({ className, ...props }: React.ComponentProps<'textarea'>) {
  return (
    <textarea
      className={cn(
        'w-full rounded-lg border border-forest-200 bg-white px-3 py-2 text-sm text-forest-900 placeholder:text-forest-300 focus:border-brand-400 focus:outline-2 focus:outline-brand-200 disabled:opacity-50',
        className,
      )}
      {...props}
    />
  );
}

export function Select({ className, ...props }: React.ComponentProps<'select'>) {
  return (
    <select
      className={cn(
        'h-9 w-full rounded-lg border border-forest-200 bg-white px-3 text-sm text-forest-900 focus:border-brand-400 focus:outline-2 focus:outline-brand-200 disabled:opacity-50',
        className,
      )}
      {...props}
    />
  );
}

export function Label({ className, ...props }: React.ComponentProps<'label'>) {
  return (
    <label
      className={cn('mb-1 block text-xs font-semibold text-forest-600', className)}
      {...props}
    />
  );
}

export function FieldError({ mensaje }: { mensaje?: string }) {
  if (!mensaje) return null;
  return <p className="mt-1 text-xs text-red-600">{mensaje}</p>;
}
