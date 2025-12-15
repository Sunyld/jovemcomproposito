import { X, CheckCircle2, AlertCircle, Info, AlertTriangle } from 'lucide-react';

type AlertProps = {
	open: boolean;
	onClose: () => void;
	title: string;
	message?: string;
	type?: 'success' | 'error' | 'warning' | 'info';
	confirmText?: string;
	cancelText?: string;
	onConfirm?: () => void;
	onCancel?: () => void;
	showCancel?: boolean;
};

export default function Alert({
	open,
	onClose,
	title,
	message,
	type = 'info',
	confirmText = 'Confirmar',
	cancelText = 'Cancelar',
	onConfirm,
	onCancel,
	showCancel = true,
}: AlertProps) {
	if (!open) return null;

	const icons = {
		success: CheckCircle2,
		error: AlertCircle,
		warning: AlertTriangle,
		info: Info,
	};

	const colors = {
		success: {
			bg: 'bg-green-500/10',
			border: 'border-green-500/30',
			icon: 'text-green-400',
			button: 'bg-green-500 hover:bg-green-600',
		},
		error: {
			bg: 'bg-red-500/10',
			border: 'border-red-500/30',
			icon: 'text-red-400',
			button: 'bg-red-500 hover:bg-red-600',
		},
		warning: {
			bg: 'bg-yellow-500/10',
			border: 'border-yellow-500/30',
			icon: 'text-yellow-400',
			button: 'bg-yellow-500 hover:bg-yellow-600',
		},
		info: {
			bg: 'bg-blue-500/10',
			border: 'border-blue-500/30',
			icon: 'text-blue-400',
			button: 'bg-blue-500 hover:bg-blue-600',
		},
	};

	const Icon = icons[type];
	const colorScheme = colors[type];

	const handleConfirm = () => {
		if (onConfirm) onConfirm();
		onClose();
	};

	const handleCancel = () => {
		if (onCancel) onCancel();
		onClose();
	};

	return (
		<div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
			<div className={`rounded-2xl border ${colorScheme.border} ${colorScheme.bg} bg-surface p-6 max-w-md w-full shadow-elevate animate-in fade-in zoom-in-95`}>
				<div className="flex items-start gap-4">
					<div className={`flex-shrink-0 ${colorScheme.icon}`}>
						<Icon size={24} />
					</div>
					<div className="flex-1 min-w-0">
						<h3 className="text-lg font-semibold text-text-primary mb-1">{title}</h3>
						{message && <p className="text-sm text-text-secondary">{message}</p>}
					</div>
					<button
						onClick={onClose}
						className="flex-shrink-0 p-1 rounded-lg hover:bg-surface/80 transition-colors text-text-secondary hover:text-text-primary"
					>
						<X size={18} />
					</button>
				</div>
				<div className="flex gap-3 mt-6">
					{showCancel && (
						<button
							onClick={handleCancel}
							className="flex-1 px-4 py-2 rounded-xl border border-border text-text-primary hover:bg-surface/80 transition-colors"
						>
							{cancelText}
						</button>
					)}
					<button
						onClick={handleConfirm}
						className={`flex-1 px-4 py-2 rounded-xl text-white transition-colors ${colorScheme.button}`}
					>
						{confirmText}
					</button>
				</div>
			</div>
		</div>
	);
}

// Helper functions for easy use
export function confirmAlert(options: Omit<AlertProps, 'open' | 'onClose' | 'type' | 'showCancel'>): Promise<boolean> {
	return new Promise((resolve) => {
		const alert = document.createElement('div');
		document.body.appendChild(alert);
		// This will be handled by a global alert manager
		// For now, we'll use a simpler approach
		const result = window.confirm(options.title + (options.message ? '\n\n' + options.message : ''));
		document.body.removeChild(alert);
		resolve(result);
	});
}





