import * as React from 'react';
import { cn } from '@/lib/utils';

export function Card({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={cn('rounded-2xl bg-white p-5 shadow-card', className)} {...props} />;
}

export function CardTitle({ className, ...props }: React.ComponentProps<'h3'>) {
  return (
    <h3
      className={cn('font-display text-base font-semibold text-forest-900', className)}
      {...props}
    />
  );
}
