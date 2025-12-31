import Modal from './Modal';
import { Button } from './ui';

type ConfirmDialogProps = {
	open: boolean;
	onClose: () => void;
	onConfirm: () => void | Promise<void>;
	title: string;
	description: string;
	confirmText?: string;
	cancelText?: string;
	variant?: 'danger' | 'default' | 'info';
	loading?: boolean;
};

export default function ConfirmDialog({
	open,
	onClose,
	onConfirm,
	title,
	description,
	confirmText = 'Confirmar',
	cancelText = 'Cancelar',
	variant = 'default',
	loading = false,
}: ConfirmDialogProps) {
	const handleConfirm = async () => {
		await onConfirm();
	};

	return (
		<Modal title={title} open={open} onClose={onClose} size="sm">
			<div className="space-y-4">
				<p className="text-sm text-text-secondary">{description}</p>
				<div className="flex gap-3 pt-2">
					<Button
						type="button"
						variant="secondary"
						size="md"
						fullWidth
						onClick={onClose}
						disabled={loading}
					>
						{cancelText}
					</Button>
					<Button
						type="button"
						variant={variant === 'danger' ? 'danger' : variant === 'info' ? 'primary' : 'primary'}
						size="md"
						fullWidth
						onClick={handleConfirm}
						disabled={loading}
						loading={loading}
					>
						{confirmText}
					</Button>
				</div>
			</div>
		</Modal>
	);
}
