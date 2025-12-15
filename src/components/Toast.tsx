import { useState, useCallback, useEffect } from 'react';

type Toast = { id: number; title: string; description?: string; variant?: 'success' | 'error' | 'default' };

let listeners: Array<(t: Toast) => void> = [];
let idCounter = 1;

export function toast(t: Omit<Toast, 'id'>) {
	const toast: Toast = { id: idCounter++, ...t };
	listeners.forEach((l) => l(toast));
}

export function ToastViewport() {
	const [toasts, setToasts] = useState<Toast[]>([]);
	const onPush = useCallback((t: Toast) => {
		setToasts((prev) => [...prev, t]);
		setTimeout(() => {
			setToasts((prev) => prev.filter((x) => x.id !== t.id));
		}, 3500);
	}, []);
	useEffect(() => {
		listeners.push(onPush);
		return () => {
			listeners = listeners.filter((l) => l !== onPush);
		};
	}, [onPush]);

	return (
		<div className="fixed bottom-4 right-4 z-[60] space-y-3">
			{toasts.map((t) => {
				const icons = {
					success: '✓',
					error: '✕',
					default: 'ℹ',
				};
				const colors = {
					success: {
						bg: 'bg-green-500/10',
						border: 'border-green-500/30',
						text: 'text-green-400',
						iconBg: 'bg-green-500/20',
					},
					error: {
						bg: 'bg-red-500/10',
						border: 'border-red-500/30',
						text: 'text-red-400',
						iconBg: 'bg-red-500/20',
					},
					default: {
						bg: 'bg-blue-500/10',
						border: 'border-blue-500/30',
						text: 'text-blue-400',
						iconBg: 'bg-blue-500/20',
					},
				};
				const color = colors[t.variant || 'default'];
				return (
					<div
						key={t.id}
						className={`w-80 rounded-xl border ${color.border} ${color.bg} px-4 py-3 shadow-elevate backdrop-blur bg-surface animate-in slide-in-from-right-5 fade-in`}
					>
						<div className="flex items-start gap-3">
							<div className={`flex-shrink-0 w-6 h-6 rounded-full ${color.iconBg} flex items-center justify-center text-sm ${color.text}`}>
								{icons[t.variant || 'default']}
							</div>
							<div className="flex-1 min-w-0">
								<div className={`font-medium ${color.text}`}>{t.title}</div>
								{t.description && <div className="text-sm text-text-secondary mt-1">{t.description}</div>}
							</div>
						</div>
					</div>
				);
			})}
		</div>
	);
}


