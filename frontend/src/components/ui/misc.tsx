import { Loader2, type LucideIcon } from 'lucide-react';
import * as React from 'react';
import { cn } from '@/lib/utils';

export function Spinner({ className }: { className?: string }) {
  return (
    <div className="flex justify-center py-10">
      <Loader2 className={cn('size-6 animate-spin text-brand-500', className)} />
    </div>
  );
}

export function EmptyState({
  icon: Icon,
  titulo,
  descripcion,
  children,
}: {
  icon: LucideIcon;
  titulo: string;
  descripcion?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-forest-200 bg-white/60 py-12 text-center">
      <div className="rounded-2xl bg-brand-50 p-3">
        <Icon className="size-7 text-brand-500" />
      </div>
      <p className="font-display font-semibold text-forest-800">{titulo}</p>
      {descripcion && <p className="max-w-sm text-sm text-forest-400">{descripcion}</p>}
      {children}
    </div>
  );
}

export function PageHeader({
  titulo,
  descripcion,
  children,
}: {
  titulo: string;
  descripcion?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="font-display text-2xl font-bold text-forest-900">{titulo}</h1>
        {descripcion && <p className="mt-0.5 text-sm text-forest-400">{descripcion}</p>}
      </div>
      {children && <div className="flex flex-wrap items-center gap-2">{children}</div>}
    </div>
  );
}
