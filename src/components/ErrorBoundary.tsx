import { Component, ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';

type Props = {
	children: ReactNode;
	fallback?: ReactNode;
};

type State = {
	hasError: boolean;
	error: Error | null;
};

export default class ErrorBoundary extends Component<Props, State> {
	constructor(props: Props) {
		super(props);
		this.state = { hasError: false, error: null };
	}

	static getDerivedStateFromError(error: Error): State {
		return { hasError: true, error };
	}

	componentDidCatch(error: Error, errorInfo: any) {
		console.error('ErrorBoundary caught an error:', error, errorInfo);
	}

	render() {
		if (this.state.hasError) {
			if (this.props.fallback) {
				return this.props.fallback;
			}

			return (
				<div className="min-h-screen bg-background text-text-primary flex items-center justify-center px-4 py-8">
					<div className="max-w-md w-full rounded-2xl border border-red-500/30 dark:border-red-500/30 bg-red-500/5 dark:bg-red-500/5 p-6 sm:p-8">
						<div className="flex items-center gap-3 mb-4">
							<AlertTriangle className="h-6 w-6 text-red-400 dark:text-red-400 flex-shrink-0" />
							<h2 className="text-xl sm:text-2xl font-semibold text-text-primary">Algo deu errado</h2>
						</div>
						<p className="text-sm sm:text-base text-text-secondary mb-6">
							{this.state.error?.message || 'Ocorreu um erro inesperado. Por favor, recarregue a página.'}
						</p>
						<button
							onClick={() => window.location.reload()}
							className="w-full px-4 py-2 rounded-xl bg-purple text-background hover:bg-purple-light transition-colors font-medium"
						>
							Recarregar página
						</button>
					</div>
				</div>
			);
		}

		return this.props.children;
	}
}

