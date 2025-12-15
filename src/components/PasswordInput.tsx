import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

type PasswordInputProps = {
	value: string;
	onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
	placeholder?: string;
	className?: string;
	required?: boolean;
	minLength?: number;
	onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
	name?: string;
	id?: string;
};

export default function PasswordInput({ value, onChange, placeholder, className = '', required, minLength, onBlur, name, id }: PasswordInputProps) {
	const [showPassword, setShowPassword] = useState(false);

	return (
		<div className="relative">
			<input
				type={showPassword ? 'text' : 'password'}
				value={value}
				onChange={onChange}
				onBlur={onBlur}
				placeholder={placeholder}
				required={required}
				minLength={minLength}
				name={name}
				id={id}
				className={`w-full rounded-xl border border-border bg-input px-4 py-2 pr-10 text-text-primary outline-none focus:border-purple placeholder:text-text-secondary ${className}`}
			/>
			<button
				type="button"
				onClick={() => setShowPassword(!showPassword)}
				className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg hover:bg-surface/80 transition-colors text-text-secondary hover:text-text-primary"
				tabIndex={-1}
			>
				{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
			</button>
		</div>
	);
}





