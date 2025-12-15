import Modal from './Modal';
import { AlertTriangle } from 'lucide-react';

type Props = {
	open: boolean;
	onClose: () => void;
	onConfirm: () => void | Promise<void>;
	title: string;
	message: string;
	confirmText?: string;
	cancelText?: string;
	variant?: 'danger' | 'warning' | 'info';
	disabled?: boolean;
};

export default function ConfirmDialog({
	open,
	onClose,
	onConfirm,
	title,
	message,
	confirmText = 'Confirmar',
	cancelText = 'Cancelar',
	variant = 'danger',
	disabled = false,
}: Props) {
	const variantColors = {
		danger: 'bg-red-500 hover:bg-red-600',
		warning: 'bg-yellow-500 hover:bg-yellow-600',
		info: 'bg-blue-500 hover:bg-blue-600',
	};

	async function handleConfirm() {
		if (disabled) return;
		try {
			await onConfirm();
			// Don't close automatically - let the caller handle it
		} catch (err) {
			// Error handling is done by the caller
		}
	}

	return (
		<Modal open={open} onClose={onClose} title={title}>
			<div className="space-y-4">
				<div className="flex items-start gap-4">
					<div className={`p-2 rounded-lg ${variant === 'danger' ? 'bg-red-500/20' : variant === 'warning' ? 'bg-yellow-500/20' : 'bg-blue-500/20'}`}>
						<AlertTriangle
							size={24}
							className={variant === 'danger' ? 'text-red-400' : variant === 'warning' ? 'text-yellow-400' : 'text-blue-400'}
						/>
					</div>
					<p className="text-text-secondary flex-1">{message}</p>
				</div>
				<div className="flex gap-3">
					<button
						onClick={onClose}
						disabled={disabled}
						className="flex-1 px-4 py-2 rounded-lg border border-border hover:border-purple transition-colors text-text-primary disabled:opacity-50 disabled:cursor-not-allowed"
					>
						{cancelText}
					</button>
					<button
						type="button"
						onClick={(e) => {
							e.preventDefault();
							e.stopPropagation();
							handleConfirm();
						}}
						disabled={disabled}
						className={`flex-1 px-4 py-2 rounded-lg text-white transition-colors ${variantColors[variant]} disabled:opacity-50 disabled:cursor-not-allowed`}
					>
						{confirmText}
					</button>
				</div>
			</div>
		</Modal>
	);
}

