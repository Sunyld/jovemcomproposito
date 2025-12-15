import { ButtonHTMLAttributes, ReactNode } from 'react';
import LoadingSpinner from '../LoadingSpinner';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'success';
type ButtonSize = 'sm' | 'md' | 'lg';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
	variant?: ButtonVariant;
	size?: ButtonSize;
	loading?: boolean;
	icon?: ReactNode;
	fullWidth?: boolean;
};

const variantClasses: Record<ButtonVariant, string> = {
	primary: 'bg-purple text-white hover:bg-purple-light disabled:opacity-50 disabled:cursor-not-allowed shadow-soft-3d',
	secondary: 'border border-border bg-surface text-text-primary hover:border-purple hover:bg-surface/80 disabled:opacity-50 disabled:cursor-not-allowed',
	danger: 'bg-red-500 text-white hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed',
	ghost: 'text-text-secondary hover:text-text-primary hover:bg-surface/50 disabled:opacity-50 disabled:cursor-not-allowed',
	success: 'bg-success text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed',
};

const sizeClasses: Record<ButtonSize, string> = {
	sm: 'px-3 py-1.5 text-sm',
	md: 'px-4 py-2 text-sm',
	lg: 'px-6 py-3 text-base',
};

export default function Button({
	variant = 'primary',
	size = 'md',
	loading = false,
	icon,
	fullWidth = false,
	children,
	className = '',
	disabled,
	...props
}: ButtonProps) {
	const baseClasses = 'inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple focus:ring-offset-2 focus:ring-offset-background';
	const variantClass = variantClasses[variant];
	const sizeClass = sizeClasses[size];
	const widthClass = fullWidth ? 'w-full' : '';

	return (
		<button
			className={`${baseClasses} ${variantClass} ${sizeClass} ${widthClass} ${className}`}
			disabled={disabled || loading}
			{...props}
		>
			{loading ? (
				<>
					<LoadingSpinner size="sm" variant="spinner" />
					<span>{children}</span>
				</>
			) : (
				<>
					{icon && <span className="flex-shrink-0">{icon}</span>}
					{children}
				</>
			)}
		</button>
	);
}



