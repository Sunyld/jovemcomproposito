import { SelectHTMLAttributes, ReactNode } from 'react';

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
	label?: string;
	error?: string;
	helperText?: string;
	options: Array<{ value: string; label: string; disabled?: boolean }>;
	fullWidth?: boolean;
};

export default function Select({
	label,
	error,
	helperText,
	options,
	fullWidth = true,
	className = '',
	id,
	...props
}: SelectProps) {
	const selectId = id || (label ? `select-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);
	const hasError = !!error;
	const baseSelectClasses = 'w-full rounded-xl border bg-input px-4 py-2.5 text-sm text-text-primary outline-none transition-colors focus:border-purple focus:ring-2 focus:ring-purple/20 disabled:opacity-50 disabled:cursor-not-allowed appearance-none bg-no-repeat bg-right pr-10';
	const errorClasses = hasError ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : 'border-border';
	const widthClass = fullWidth ? 'w-full' : '';
	const selectStyle = {
		backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23BFC3D6' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
		backgroundPosition: 'right 0.75rem center',
		backgroundSize: '12px',
	};

	return (
		<div className={`space-y-1.5 ${widthClass}`}>
			{label && (
				<label htmlFor={selectId} className="block text-sm font-medium text-text-secondary">
					{label}
					{props.required && <span className="text-red-400 ml-1">*</span>}
				</label>
			)}
			<select
				id={selectId}
				className={`${baseSelectClasses} ${errorClasses} ${className}`}
				style={selectStyle}
				aria-invalid={hasError}
				aria-describedby={error ? `${selectId}-error` : helperText ? `${selectId}-helper` : undefined}
				{...props}
			>
				{options.map((option) => (
					<option key={option.value} value={option.value} disabled={option.disabled}>
						{option.label}
					</option>
				))}
			</select>
			{error && (
				<p id={`${selectId}-error`} className="text-xs text-red-400" role="alert">
					{error}
				</p>
			)}
			{helperText && !error && (
				<p id={`${selectId}-helper`} className="text-xs text-text-secondary">
					{helperText}
				</p>
			)}
		</div>
	);
}



