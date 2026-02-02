import { HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
    glass?: boolean;
    glow?: boolean;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
    ({ className, glass = false, glow = false, children, ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={cn(
                    'rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)]',
                    glass && 'glass-card',
                    glow && 'neon-border shadow-[0_0_20px_rgba(99,102,241,0.1)]',
                    className
                )}
                {...props}
            >
                {children}
            </div>
        );
    }
);

Card.displayName = 'Card';

export { Card };
