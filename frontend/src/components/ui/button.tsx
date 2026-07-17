import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 cursor-pointer',
  {
    variants: {
      variant: {
        default: 'bg-forest-800 text-white hover:bg-forest-700 shadow-sm',
        brand: 'bg-brand-500 text-white hover:bg-brand-600 shadow-sm',
        outline: 'border border-forest-200 bg-white text-forest-800 hover:bg-forest-50',
        ghost: 'text-forest-700 hover:bg-forest-100/60',
        destructive: 'bg-red-600 text-white hover:bg-red-700',
      },
      size: {
        default: 'h-9 px-4 text-sm',
        sm: 'h-8 px-3 text-xs',
        lg: 'h-11 px-6 text-base',
        icon: 'size-9',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  },
);

export function Button({
  className,
  variant,
  size,
  ...props
}: React.ComponentProps<'button'> & VariantProps<typeof buttonVariants>) {
  return <button className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}
