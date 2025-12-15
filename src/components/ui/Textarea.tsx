import { TextareaHTMLAttributes, ReactNode } from 'react';

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
	label?: string;
	error?: string;
	helperText?: string;
	fullWidth?: boolean;
};

export default function Textarea({
	label,
	error,
	helperText,
	fullWidth = true,
	className = '',
	id,
	...props
}: TextareaProps) {
	const textareaId = id || (label ? `textarea-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);
	const hasError = !!error;
	const baseTextareaClasses = 'w-full rounded-xl border bg-input px-4 py-2.5 text-sm text-text-primary outline-none transition-colors placeholder:text-text-secondary focus:border-purple focus:ring-2 focus:ring-purple/20 disabled:opacity-50 disabled:cursor-not-allowed resize-y min-h-[100px]';
	const errorClasses = hasError ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : 'border-border';
	const widthClass = fullWidth ? 'w-full' : '';

	return (
		<div className={`space-y-1.5 ${widthClass}`}>
			{label && (
				<label htmlFor={textareaId} className="block text-sm font-medium text-text-secondary">
					{label}
					{props.required && <span className="text-red-400 ml-1">*</span>}
				</label>
			)}
			<textarea
				id={textareaId}
				className={`${baseTextareaClasses} ${errorClasses} ${className}`}
				aria-invalid={hasError}
				aria-describedby={error ? `${textareaId}-error` : helperText ? `${textareaId}-helper` : undefined}
				{...props}
			/>
			{error && (
				<p id={`${textareaId}-error`} className="text-xs text-red-400" role="alert">
					{error}
				</p>
			)}
			{helperText && !error && (
				<p id={`${textareaId}-helper`} className="text-xs text-text-secondary">
					{helperText}
				</p>
			)}
		</div>
	);
}



