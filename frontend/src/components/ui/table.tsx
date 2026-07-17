import * as React from 'react';
import { cn } from '@/lib/utils';

export function Table({ className, ...props }: React.ComponentProps<'table'>) {
  return (
    <div className="overflow-x-auto rounded-2xl bg-white shadow-card">
      <table className={cn('w-full text-sm', className)} {...props} />
    </div>
  );
}

export function THead({ className, ...props }: React.ComponentProps<'thead'>) {
  return (
    <thead
      className={cn(
        'border-b border-forest-100 text-left text-xs font-semibold tracking-wide text-forest-500 uppercase',
        className,
      )}
      {...props}
    />
  );
}

export function Th({ className, ...props }: React.ComponentProps<'th'>) {
  return <th className={cn('px-4 py-3', className)} {...props} />;
}

export function Td({ className, ...props }: React.ComponentProps<'td'>) {
  return <td className={cn('px-4 py-3 text-forest-800', className)} {...props} />;
}

export function Tr({ className, ...props }: React.ComponentProps<'tr'>) {
  return (
    <tr
      className={cn('border-b border-forest-50 last:border-0 hover:bg-forest-50/40', className)}
      {...props}
    />
  );
}
