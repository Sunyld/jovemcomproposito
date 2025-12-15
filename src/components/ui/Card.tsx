import { HTMLAttributes, ReactNode } from 'react';

type CardProps = HTMLAttributes<HTMLDivElement> & {
	title?: string;
	subtitle?: string;
	action?: ReactNode;
	hover?: boolean;
	padding?: 'none' | 'sm' | 'md' | 'lg';
	variant?: 'default' | 'outlined' | 'elevated';
};

const paddingClasses = {
	none: '',
	sm: 'p-4',
	md: 'p-6',
	lg: 'p-8',
};

const variantClasses = {
	default: 'bg-surface border border-border',
	outlined: 'bg-transparent border-2 border-border',
	elevated: 'bg-surface border border-border shadow-elevate',
};

export default function Card({
	title,
	subtitle,
	action,
	hover = false,
	padding = 'md',
	variant = 'default',
	children,
	className = '',
	...props
}: CardProps) {
	const paddingClass = paddingClasses[padding];
	const variantClass = variantClasses[variant];
	const hoverClass = hover ? 'hover:bg-surface/80 transition-colors cursor-pointer' : '';
	const baseClasses = 'rounded-2xl';

	return (
		<div className={`${baseClasses} ${variantClass} ${hoverClass} ${className}`} {...props}>
			{(title || subtitle || action) && (
				<div className={`${paddingClass} ${padding !== 'none' ? 'border-b border-border' : ''} flex items-start justify-between gap-4`}>
					<div className="flex-1 min-w-0">
						{title && <h3 className="text-lg font-semibold text-text-primary">{title}</h3>}
						{subtitle && <p className="text-sm text-text-secondary mt-1">{subtitle}</p>}
					</div>
					{action && <div className="flex-shrink-0">{action}</div>}
				</div>
			)}
			<div className={padding !== 'none' ? paddingClass : ''}>{children}</div>
		</div>
	);
}



