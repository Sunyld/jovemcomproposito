import { Check, X } from 'lucide-react';

type PasswordStrengthProps = {
	password: string;
};

type Requirement = {
	label: string;
	test: (p: string) => boolean;
};

const requirements: Requirement[] = [
	{ label: 'Mínimo 8 caracteres', test: (p) => p.length >= 8 },
	{ label: 'Pelo menos uma letra maiúscula', test: (p) => /[A-Z]/.test(p) },
	{ label: 'Pelo menos uma letra minúscula', test: (p) => /[a-z]/.test(p) },
	{ label: 'Pelo menos um número', test: (p) => /[0-9]/.test(p) },
	{ label: 'Pelo menos um caractere especial', test: (p) => /[!@#$%^&*(),.?":{}|<>]/.test(p) },
];

export default function PasswordStrength({ password }: PasswordStrengthProps) {
	if (!password) return null;

	const metRequirements = requirements.filter((req) => req.test(password));
	const strength = metRequirements.length;
	
	// Calcular força da senha baseado nos requisitos atendidos
	const getStrengthLabel = (count: number): string => {
		if (count === 5) return 'Muito forte';
		if (count === 4) return 'Forte';
		if (count === 3) return 'Média';
		if (count === 2) return 'Fraca';
		return 'Muito fraca';
	};
	
	const getStrengthColor = (count: number): string => {
		if (count === 5) return 'bg-green-500';
		if (count === 4) return 'bg-blue-500';
		if (count === 3) return 'bg-yellow-500';
		if (count === 2) return 'bg-orange-500';
		return 'bg-red-500';
	};
	
	const getTextColor = (count: number): string => {
		if (count === 5) return 'text-green-400';
		if (count === 4) return 'text-blue-400';
		if (count === 3) return 'text-yellow-400';
		if (count === 2) return 'text-orange-400';
		return 'text-red-400';
	};

	const strengthLabel = getStrengthLabel(strength);
	const strengthColor = getStrengthColor(strength);
	const textColor = getTextColor(strength);
	const percentage = (strength / requirements.length) * 100;

	return (
		<div className="mt-2 p-3 rounded-xl border border-border bg-surface">
			<div className="flex items-center justify-between mb-2">
				<span className="text-xs text-text-secondary">Força da senha:</span>
				<span className={`text-xs font-medium ${textColor}`}>
					{strengthLabel}
				</span>
			</div>
			<div className="h-1.5 bg-surface rounded-full overflow-hidden mb-3">
				<div
					className={`h-full transition-all ${strengthColor}`}
					style={{ width: `${percentage}%` }}
				/>
			</div>
			<div className="space-y-1.5">
				{requirements.map((req, index) => {
					const met = req.test(password);
					return (
						<div key={index} className="flex items-center gap-2 text-xs">
							{met ? (
								<Check size={14} className="text-green-400 flex-shrink-0" />
							) : (
								<X size={14} className="text-red-400 flex-shrink-0" />
							)}
							<span className={met ? 'text-green-400' : 'text-text-secondary'}>{req.label}</span>
						</div>
					);
				})}
			</div>
		</div>
	);
}

export function validatePassword(password: string): { valid: boolean; errors: string[] } {
	const errors: string[] = [];
	
	if (password.length < 8) errors.push('A senha deve ter pelo menos 8 caracteres');
	if (!/[A-Z]/.test(password)) errors.push('A senha deve conter pelo menos uma letra maiúscula');
	if (!/[a-z]/.test(password)) errors.push('A senha deve conter pelo menos uma letra minúscula');
	if (!/[0-9]/.test(password)) errors.push('A senha deve conter pelo menos um número');
	if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) errors.push('A senha deve conter pelo menos um caractere especial');

	return {
		valid: errors.length === 0,
		errors,
	};
}

