import { useDevocional } from '../contexts/DevocionalContext';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import { BookOpen, Calendar, Clock } from 'lucide-react';

export default function Devocional() {
	const { activeDevocional, loading } = useDevocional();

	return (
		<div className="min-h-screen bg-background text-text-primary">
			<section className="relative overflow-hidden py-16">
				<div className="absolute inset-0 pointer-events-none"
					style={{ background: 'radial-gradient(circle at 50% 20%, rgba(124,92,255,0.3), rgba(15,17,22,0) 70%)' }} />
				<div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 relative">
					<div className="flex items-center gap-3 mb-4">
						<BookOpen className="text-purple" size={32} />
						<div>
							<p className="text-sm uppercase tracking-widest text-purple">Devocional Diário</p>
							<h1 className="font-display text-3xl sm:text-4xl mt-2">Palavra para hoje</h1>
						</div>
					</div>
					<p className="text-text-secondary text-lg">
						Receba diariamente uma palavra de encorajamento e reflexão para fortalecer sua jornada de fé.
					</p>
				</div>
			</section>
			<section className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 pb-20">
				{loading ? (
					<div className="flex justify-center py-12">
						<LoadingSpinner size="lg" />
					</div>
				) : !activeDevocional ? (
					<EmptyState
						icon={BookOpen}
						title="Nenhum devocional disponível"
						description="Não há devocional ativo no momento. Em breve teremos uma palavra para você."
					/>
				) : (
					<article className="rounded-[26px] border border-border bg-surface p-6 sm:p-8">
						<div className="flex items-start justify-between mb-4">
							<div className="flex items-center gap-3">
								<div className="h-10 w-10 rounded-lg bg-purple/20 flex items-center justify-center text-purple font-semibold">
									{activeDevocional.tipo === 'series' ? `Dia ${activeDevocional.day_number}/7` : 'Hoje'}
								</div>
								<div>
									<h2 className="text-xl font-semibold text-text-primary">{activeDevocional.title}</h2>
									<div className="flex items-center gap-4 text-sm text-text-secondary mt-1">
										<div className="flex items-center gap-2">
											<Calendar size={14} />
											<span>{new Date(activeDevocional.start_at).toLocaleDateString('pt-BR')}</span>
										</div>
										<div className="flex items-center gap-2">
											<Clock size={14} />
											<span>Expira em {new Date(activeDevocional.expires_at).toLocaleString('pt-BR')}</span>
										</div>
									</div>
								</div>
							</div>
						</div>
						<div className="prose prose-invert max-w-none">
							<div className="text-text-secondary whitespace-pre-line leading-relaxed">
								{activeDevocional.content}
							</div>
						</div>
					</article>
				)}
			</section>
		</div>
	);
}

