import { useDevocional } from '../contexts/DevocionalContext';
import { Link } from 'react-router-dom';
import { BookOpen, Clock, ArrowRight } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';
import EmptyState from './EmptyState';

type Props = {
	compact?: boolean;
	showLink?: boolean;
};

export default function DevocionalCard({ compact = false, showLink = true }: Props) {
	const { activeDevocional, loading } = useDevocional();

	if (loading) {
		return compact ? (
			<div className="rounded-2xl border border-border bg-surface p-4 animate-pulse">
				<div className="h-4 bg-border rounded w-1/2 mb-2"></div>
				<div className="h-3 bg-border rounded w-full"></div>
			</div>
		) : (
			<div className="flex justify-center py-8">
				<LoadingSpinner size="md" />
			</div>
		);
	}

	if (!activeDevocional) {
		return compact ? null : (
			<EmptyState
				icon={BookOpen}
				title="Nenhum devocional ativo"
				description="Não há devocional disponível no momento."
			/>
		);
	}

	if (compact) {
		return (
			<Link
				to="/devocional"
				className="block rounded-2xl border border-border bg-surface p-4 hover:bg-surface/80 transition"
			>
				<div className="flex items-start gap-3">
					<div className="h-10 w-10 rounded-lg bg-purple/20 flex items-center justify-center text-purple flex-shrink-0">
						<BookOpen size={20} />
					</div>
					<div className="flex-1 min-w-0">
						<div className="flex items-center gap-2 mb-1">
							<span className="text-xs text-purple font-medium">
								{activeDevocional.tipo === 'series' ? `Dia ${activeDevocional.day_number}/7` : 'Hoje'}
							</span>
						</div>
						<h3 className="font-semibold text-text-primary truncate">{activeDevocional.title}</h3>
						<p className="text-sm text-text-secondary line-clamp-2 mt-1">{activeDevocional.content}</p>
						{showLink && (
							<div className="flex items-center gap-1 text-xs text-purple mt-2">
								<span>Ler completo</span>
								<ArrowRight size={12} />
							</div>
						)}
					</div>
				</div>
			</Link>
		);
	}

	return (
		<div className="rounded-2xl border border-border bg-surface p-6">
			<div className="flex items-start justify-between mb-4">
				<div className="flex items-center gap-3">
					<div className="h-12 w-12 rounded-lg bg-purple/20 flex items-center justify-center text-purple">
						<BookOpen size={24} />
					</div>
					<div>
						<h2 className="text-lg font-semibold text-text-primary">Devocional do Dia</h2>
						<div className="flex items-center gap-2 text-xs text-text-secondary mt-1">
							<span className="px-2 py-1 rounded-full bg-purple/20 text-purple">
								{activeDevocional.tipo === 'series' ? `Dia ${activeDevocional.day_number}/7` : 'Instantâneo'}
							</span>
							<div className="flex items-center gap-1">
								<Clock size={12} />
								<span>Expira em {new Date(activeDevocional.expires_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
							</div>
						</div>
					</div>
				</div>
			</div>
			<h3 className="text-xl font-semibold text-text-primary mb-3">{activeDevocional.title}</h3>
			<p className="text-text-secondary line-clamp-3 mb-4">{activeDevocional.content}</p>
			{showLink && (
				<Link
					to="/devocional"
					className="inline-flex items-center gap-2 text-sm text-purple hover:text-purple-light transition-colors"
				>
					Ler devocional completo <ArrowRight size={14} />
				</Link>
			)}
		</div>
	);
}




