import * as React from 'react';
import { cn } from '@/lib/utils';
import { type CardVariant, type CardPadding, tokens } from '@/theme/design-tokens';

interface UniversalCardProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: CardVariant;
    padding?: CardPadding;
    as?: React.ElementType;
}

interface CardHeaderProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
    title: React.ReactNode;
    action?: React.ReactNode;
    icon?: React.ReactNode;
}

interface CardBodyProps extends React.HTMLAttributes<HTMLDivElement> {
    // Just a wrapper for consistent spacing
}

interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
    // Just a wrapper
}

const variantStyles: Record<CardVariant, string> = {
    default: 'bg-surface-1 border border-border-subtle shadow-sm',
    subtle: 'bg-transparent border border-border-subtle',
    highlight: 'bg-surface-2 border border-border-subtle',
    danger: 'bg-signal-bear/5 border border-signal-bear/20',
};

const paddingStyles: Record<CardPadding, string> = {
    s: 'p-3',
    m: 'p-4 md:p-6',
};

function UniversalCard({
    variant = 'default',
    padding = 'm',
    as: Component = 'div',
    className,
    children,
    ...props
}: UniversalCardProps) {
    return (
        <Component
            className={cn(
                'rounded-lg overflow-hidden transition-all duration-200',
                'text-text-primary',
                variantStyles[variant],
                paddingStyles[padding],
                className
            )}
            {...props}
        >
            <div className="flex flex-col h-full gap-3">
                {children}
            </div>
        </Component>
    );
}

function CardHeader({ title, action, icon, className, ...props }: CardHeaderProps) {
    return (
        <div className={cn('flex items-center justify-between mb-1', className)} {...props}>
            <div className="flex items-center gap-2 text-text-primary font-medium">
                {icon && <span className="text-text-secondary">{icon}</span>}
                <h3 className="text-sm md:text-base leading-tight">{title}</h3>
            </div>
            {action && <div>{action}</div>}
        </div>
    );
}

function CardBody({ className, children, ...props }: CardBodyProps) {
    return (
        <div className={cn('flex-1', className)} {...props}>
            {children}
        </div>
    );
}

function CardFooter({ className, children, ...props }: CardFooterProps) {
    return (
        <div
            className={cn(
                'mt-auto pt-3 border-t border-border-subtle flex items-center justify-between text-xs text-text-tertiary',
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
}

// Export subcomponents for composition
export const Card = Object.assign(UniversalCard, {
    Header: CardHeader,
    Body: CardBody,
    Footer: CardFooter,
});
