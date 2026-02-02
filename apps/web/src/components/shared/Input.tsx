import { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ className, label, error, ...props }, ref) => {
        return (
            <div className="w-full">
                {label && (
                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
                        {label}
                    </label>
                )}
                <input
                    ref={ref}
                    className={cn(
                        'w-full bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] rounded-xl px-4 py-3 text-[var(--text-primary)]',
                        'placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-primary)] focus:ring-2 focus:ring-[var(--accent-glow)] transition-all',
                        error && 'border-[var(--status-error)] focus:ring-[var(--status-error)]',
                        className
                    )}
                    {...props}
                />
                {error && <p className="mt-1 text-sm text-[var(--status-error)]">{error}</p>}
            </div>
        );
    }
);

Input.displayName = 'Input';

export { Input };
