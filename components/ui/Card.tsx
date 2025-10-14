import { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils/cn';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  glow?: boolean;
}

export function Card({ className, glow, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl bg-gray-950 border border-gray-800 p-6',
        glow && 'shadow-2xl shadow-white/10',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
