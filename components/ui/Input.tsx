import { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils/cn';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  label?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, label, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-400 mb-2">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={cn(
            'w-full px-4 py-3 rounded-xl bg-gray-950 border text-white',
            'focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent',
            'placeholder:text-gray-600 transition-all',
            error ? 'border-gray-500' : 'border-gray-800',
            className
          )}
          {...props}
        />
        {error && (
          <p className="mt-1 text-sm text-white">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
