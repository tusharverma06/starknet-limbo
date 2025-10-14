import { cn } from '@/lib/utils/cn';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function LoadingSpinner({ size = 'md', className }: LoadingSpinnerProps) {
  return (
    <div
      className={cn(
        'animate-spin rounded-full border-t-2 border-r-2 border-blue-500',
        {
          'h-4 w-4 border-2': size === 'sm',
          'h-8 w-8 border-2': size === 'md',
          'h-12 w-12 border-4': size === 'lg',
        },
        className
      )}
    />
  );
}
