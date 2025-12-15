import { useState } from 'react';
import DashboardShell from '../../components/dashboard/DashboardShell';
import { useUserInscricoes } from '../../hooks/useInscritos';
import { useMentoria } from '../../hooks/useMentorias';
import { createFeedback, updateFeedback, useFeedback } from '../../hooks/useFeedback';
import { toast } from '../../components/Toast';
import { Star, Send, CheckCircle2 } from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';

export default function UserFeedback() {
	const { inscritos } = useUserInscricoes();
	const approvedInscritos = inscritos.filter((i) => i.has_access);

	return (
		<DashboardShell role="user" title="Avaliar Mentorias" subtitle="Deixe seu feedback sobre as mentorias que você participou.">
			{approvedInscritos.length === 0 ? (
				<EmptyState
					icon={Star}
					title="Nenhuma mentoria para avaliar"
					description="Você precisa ter acesso a uma mentoria antes de poder avaliá-la."
				/>
			) : (
				<div className="grid gap-6">
					{approvedInscritos.map((inscrito) => (
						<FeedbackForm key={inscrito.id} inscrito={inscrito} />
					))}
				</div>
			)}
		</DashboardShell>
	);
}

function FeedbackForm({ inscrito }: { inscrito: any }) {
	const { mentoria, loading: mentoriaLoading } = useMentoria(inscrito.mentoria_id);
	const { feedback } = useFeedback(inscrito.mentoria_id);
	const existingFeedback = feedback.find((f) => f.user_id === inscrito.user_id);

	const [rating, setRating] = useState(existingFeedback?.rating || 0);
	const [comment, setComment] = useState(existingFeedback?.comment || '');
	const [submitting, setSubmitting] = useState(false);

	if (mentoriaLoading) {
		return (
			<div className="rounded-2xl border border-border bg-surface p-6 sm:p-8">
				<LoadingSpinner size="md" />
			</div>
		);
	}

	if (!mentoria) return null;

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (rating === 0) {
			toast({ title: 'Avaliação obrigatória', description: 'Por favor, selecione uma avaliação.', variant: 'error' });
			return;
		}

		setSubmitting(true);
		try {
			if (existingFeedback) {
				await updateFeedback(existingFeedback.id, rating, comment);
			} else {
				await createFeedback(inscrito.mentoria_id, rating, comment);
			}
		} catch (err) {
			// Error already handled in hook
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<div className="rounded-2xl border border-white/10 dark:border-white/10 bg-surface/30 dark:bg-white/[0.03] p-4 sm:p-6">
			<div className="mb-4 sm:mb-6">
				<h3 className="font-semibold text-base sm:text-lg mb-1 text-text-primary">{mentoria.title}</h3>
				<p className="text-sm text-text-secondary line-clamp-2">{mentoria.description}</p>
			</div>

			<form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
				<div>
					<label className="text-sm text-text-secondary mb-2 sm:mb-3 block">Avaliação</label>
					<div className="flex items-center gap-1 sm:gap-2 justify-center sm:justify-start">
						{[1, 2, 3, 4, 5].map((i) => (
							<button
								key={i}
								type="button"
								onClick={() => setRating(i)}
								className="focus:outline-none transition-transform hover:scale-110 active:scale-95"
								aria-label={`Avaliar com ${i} estrela${i > 1 ? 's' : ''}`}
							>
								<Star
									size={28}
									className={`sm:w-8 sm:h-8 ${
										i <= rating 
											? 'fill-yellow-500 text-yellow-500 dark:fill-yellow-400 dark:text-yellow-400' 
											: 'text-text-secondary hover:text-yellow-500/50 dark:hover:text-yellow-400/50'
									}`}
								/>
							</button>
						))}
					</div>
				</div>

				<div>
					<label className="text-sm text-text-secondary mb-2 sm:mb-3 block">Comentário (opcional)</label>
					<textarea
						value={comment}
						onChange={(e) => setComment(e.target.value)}
						className="w-full min-h-24 sm:min-h-32 rounded-xl bg-surface/50 dark:bg-white/5 border border-white/10 dark:border-white/10 px-4 py-3 outline-none focus:border-purple text-text-primary placeholder:text-text-secondary/50 resize-y"
						placeholder="Compartilhe sua experiência com esta mentoria..."
					/>
				</div>

				<button
					type="submit"
					disabled={submitting || rating === 0}
					className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 sm:px-6 py-3 rounded-xl bg-purple text-background hover:bg-purple-light disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
				>
					{existingFeedback ? (
						<>
							<CheckCircle2 size={16} /> {submitting ? 'Atualizando...' : <><span className="hidden sm:inline">Atualizar avaliação</span><span className="sm:hidden">Atualizar</span></>}
						</>
					) : (
						<>
							<Send size={16} /> {submitting ? 'Enviando...' : <><span className="hidden sm:inline">Enviar avaliação</span><span className="sm:hidden">Enviar</span></>}
						</>
					)}
				</button>
			</form>
		</div>
	);
}

