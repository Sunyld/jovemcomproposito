import { InputHTMLAttributes, ReactNode } from 'react';

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
	label?: string;
	error?: string;
	helperText?: string;
	leftIcon?: ReactNode;
	rightIcon?: ReactNode;
	fullWidth?: boolean;
};

export default function Input({
	label,
	error,
	helperText,
	leftIcon,
	rightIcon,
	fullWidth = true,
	className = '',
	id,
	...props
}: InputProps) {
	const inputId = id || (label ? `input-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);
	const hasError = !!error;
	const baseInputClasses = 'w-full rounded-xl border bg-input px-4 py-2.5 text-sm text-text-primary outline-none transition-colors placeholder:text-text-secondary focus:border-purple focus:ring-2 focus:ring-purple/20 disabled:opacity-50 disabled:cursor-not-allowed';
	const errorClasses = hasError ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : 'border-border';
	const iconPaddingLeft = leftIcon ? 'pl-10' : '';
	const iconPaddingRight = rightIcon ? 'pr-10' : '';
	const widthClass = fullWidth ? 'w-full' : '';

	return (
		<div className={`space-y-1.5 ${widthClass}`}>
			{label && (
				<label htmlFor={inputId} className="block text-sm font-medium text-text-secondary">
					{label}
					{props.required && <span className="text-red-400 ml-1">*</span>}
				</label>
			)}
			<div className="relative">
				{leftIcon && (
					<div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none z-10">
						{leftIcon}
					</div>
				)}
				<input
					id={inputId}
					className={`${baseInputClasses} ${errorClasses} ${iconPaddingLeft} ${iconPaddingRight} ${className}`}
					aria-invalid={hasError}
					aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
					{...props}
				/>
				{rightIcon && (
					<div className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none z-10">
						{rightIcon}
					</div>
				)}
			</div>
			{error && (
				<p id={`${inputId}-error`} className="text-xs text-red-400" role="alert">
					{error}
				</p>
			)}
			{helperText && !error && (
				<p id={`${inputId}-helper`} className="text-xs text-text-secondary">
					{helperText}
				</p>
			)}
		</div>
	);
}



