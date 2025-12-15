import { ReactNode, useEffect, useRef } from 'react';
import { X } from 'lucide-react';

type Props = {
	title: string;
	children: ReactNode;
	open: boolean;
	onClose: () => void;
	size?: 'sm' | 'md' | 'lg' | 'xl';
};

const sizeClasses = {
	sm: 'max-w-md',
	md: 'max-w-2xl',
	lg: 'max-w-4xl',
	xl: 'max-w-6xl',
};

export default function Modal({ title, children, open, onClose, size = 'lg' }: Props) {
	const modalRef = useRef<HTMLDivElement>(null);
	const previousFocusRef = useRef<HTMLElement | null>(null);

	useEffect(() => {
		if (open) {
			// Store the previously focused element
			previousFocusRef.current = document.activeElement as HTMLElement;
			// Focus the modal
			modalRef.current?.focus();
			// Prevent body scroll
			document.body.style.overflow = 'hidden';
		} else {
			// Restore body scroll
			document.body.style.overflow = '';
			// Restore focus to previous element
			previousFocusRef.current?.focus();
		}

		return () => {
			document.body.style.overflow = '';
		};
	}, [open]);

	useEffect(() => {
		const handleEscape = (e: KeyboardEvent) => {
			if (e.key === 'Escape' && open) {
				onClose();
			}
		};

		document.addEventListener('keydown', handleEscape);
		return () => document.removeEventListener('keydown', handleEscape);
	}, [open, onClose]);

	if (!open) return null;

	return (
		<div 
			className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
			role="dialog"
			aria-modal="true"
			aria-labelledby="modal-title"
		>
			<div 
				className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" 
				onClick={(e) => {
					e.preventDefault();
					e.stopPropagation();
					onClose();
				}}
				aria-hidden="true"
			/>
			<div 
				ref={modalRef}
				className={`relative w-full ${sizeClasses[size]} max-h-[90vh] rounded-2xl border border-border bg-background shadow-elevate flex flex-col overflow-hidden animate-in zoom-in-95 duration-200`}
				onClick={(e) => {
					e.stopPropagation();
				}}
				tabIndex={-1}
			>
				<div className="flex items-center justify-between p-6 border-b border-border flex-shrink-0">
					<h3 id="modal-title" className="text-lg font-semibold text-text-primary">{title}</h3>
					<button 
						type="button"
						onClick={(e) => {
							e.preventDefault();
							e.stopPropagation();
							onClose();
						}}
						className="p-2 rounded-lg border border-border hover:border-purple hover:bg-surface transition-colors text-text-secondary hover:text-text-primary"
						aria-label="Fechar modal"
					>
						<X size={18} />
					</button>
				</div>
				<div className="flex-1 overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
					{children}
				</div>
			</div>
		</div>
	);
}


