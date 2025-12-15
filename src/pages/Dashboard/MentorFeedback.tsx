import DashboardShell from '../../components/dashboard/DashboardShell';
import { useMentorMentorias } from '../../hooks/useMentorias';
import { useFeedback } from '../../hooks/useFeedback';
import { useProfile } from '../../hooks/useProfiles';
import { Star, MessageSquare, TrendingUp } from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import { useState } from 'react';

export default function MentorFeedback() {
	const { mentorias } = useMentorMentorias();
	const [selectedMentoria, setSelectedMentoria] = useState<string>('all');

	return (
		<DashboardShell role="mentor" title="Feedback" subtitle="Veja avaliações e comentários dos seus alunos.">
			<div className="space-y-6">
				{/* Filter by mentoria */}
				<div className="flex flex-wrap gap-2 sm:gap-3">
					<button
						onClick={() => setSelectedMentoria('all')}
						className={`px-3 sm:px-4 py-2 rounded-xl border transition text-sm sm:text-base ${
							selectedMentoria === 'all'
								? 'bg-purple text-background border-purple'
								: 'border-border hover:border-purple text-text-primary bg-surface'
						}`}
					>
						Todas
					</button>
					{mentorias.map((m) => (
						<button
							key={m.id}
							onClick={() => setSelectedMentoria(m.id)}
							className={`px-3 sm:px-4 py-2 rounded-xl border transition text-sm sm:text-base truncate max-w-[200px] sm:max-w-none ${
								selectedMentoria === m.id
									? 'bg-purple text-background border-purple'
									: 'border-border hover:border-purple text-text-primary bg-surface'
							}`}
							title={m.title}
						>
							{m.title}
						</button>
					))}
				</div>

				{/* Feedback list */}
				{selectedMentoria === 'all' ? (
					<AllFeedbackView mentorias={mentorias} />
				) : (
					<MentoriaFeedbackView mentoriaId={selectedMentoria} />
				)}
			</div>
		</DashboardShell>
	);
}

function AllFeedbackView({ mentorias }: { mentorias: any[] }) {
	const allFeedback: any[] = [];
	mentorias.forEach((m) => {
		const { feedback } = useFeedback(m.id);
		allFeedback.push(...feedback);
	});

	if (allFeedback.length === 0) {
		return <EmptyState icon={MessageSquare} title="Nenhum feedback" description="Você ainda não recebeu feedback dos seus alunos." />;
	}

	const avgRating = allFeedback.reduce((acc, f) => acc + f.rating, 0) / allFeedback.length;

	return (
		<div className="space-y-6">
			<div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
				<div className="flex items-center gap-4">
					<div className="h-16 w-16 rounded-full bg-purple/20 flex items-center justify-center">
						<TrendingUp className="h-8 w-8 text-purple" />
					</div>
					<div>
						<div className="text-sm text-text-secondary">Avaliação média</div>
						<div className="text-3xl font-bold">{avgRating.toFixed(1)}</div>
						<div className="flex items-center gap-1 mt-1">
							{[1, 2, 3, 4, 5].map((i) => (
								<Star
									key={i}
									size={16}
									className={i <= Math.round(avgRating) ? 'fill-yellow-400 text-yellow-400' : 'text-text-secondary'}
								/>
							))}
						</div>
					</div>
				</div>
			</div>

			<div className="grid gap-4">
				{allFeedback.map((f) => (
					<FeedbackCard key={f.id} feedback={f} />
				))}
			</div>
		</div>
	);
}

function MentoriaFeedbackView({ mentoriaId }: { mentoriaId: string }) {
	const { feedback, loading } = useFeedback(mentoriaId);

	if (loading) {
		return <LoadingSpinner size="lg" className="py-12" />;
	}

	if (feedback.length === 0) {
		return <EmptyState icon={MessageSquare} title="Nenhum feedback" description="Esta mentoria ainda não recebeu feedback." />;
	}

	const avgRating = feedback.reduce((acc, f) => acc + f.rating, 0) / feedback.length;

	return (
		<div className="space-y-6">
			<div className="rounded-2xl border border-white/10 dark:border-white/10 bg-surface/30 dark:bg-white/[0.03] p-4 sm:p-6">
				<div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
					<div className="h-16 w-16 rounded-full bg-purple/20 dark:bg-purple/20 flex items-center justify-center flex-shrink-0">
						<Star className="h-8 w-8 text-purple" />
					</div>
					<div className="text-center sm:text-left">
						<div className="text-sm text-text-secondary">Avaliação média</div>
						<div className="text-2xl sm:text-3xl font-bold text-text-primary">{avgRating.toFixed(1)}</div>
						<div className="flex items-center justify-center sm:justify-start gap-1 mt-1">
							{[1, 2, 3, 4, 5].map((i) => (
								<Star
									key={i}
									size={16}
									className={i <= Math.round(avgRating) ? 'fill-yellow-500 text-yellow-500 dark:fill-yellow-400 dark:text-yellow-400' : 'text-text-secondary'}
								/>
							))}
						</div>
					</div>
				</div>
			</div>

			<div className="grid gap-4">
				{feedback.map((f) => (
					<FeedbackCard key={f.id} feedback={f} />
				))}
			</div>
		</div>
	);
}

function FeedbackCard({ feedback }: { feedback: any }) {
	const { profile, loading } = useProfile(feedback.user_id);

	if (loading) {
		return (
			<div className="rounded-2xl border border-white/10 dark:border-white/10 bg-surface/30 dark:bg-white/[0.03] p-6 sm:p-8">
				<LoadingSpinner size="md" />
			</div>
		);
	}

	return (
		<div className="rounded-2xl border border-white/10 dark:border-white/10 bg-surface/30 dark:bg-white/[0.03] p-4 sm:p-6">
			<div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
				<div className="flex items-center gap-3 flex-1 min-w-0">
					<div className="h-10 w-10 rounded-full bg-card-glow flex items-center justify-center text-sm font-medium uppercase flex-shrink-0">
						{profile?.full_name?.[0] || 'U'}
					</div>
					<div className="min-w-0">
						<div className="font-medium text-text-primary truncate">{profile?.full_name || 'Usuário'}</div>
						<div className="text-xs text-text-secondary">{new Date(feedback.created_at).toLocaleDateString('pt-BR')}</div>
					</div>
				</div>
				<div className="flex items-center gap-1 flex-shrink-0">
					{[1, 2, 3, 4, 5].map((i) => (
						<Star
							key={i}
							size={16}
							className={i <= feedback.rating ? 'fill-yellow-500 text-yellow-500 dark:fill-yellow-400 dark:text-yellow-400' : 'text-text-secondary'}
						/>
					))}
				</div>
			</div>
			{feedback.comment && (
				<div className="p-3 rounded-xl bg-surface/20 dark:bg-white/[0.02] border border-white/10 dark:border-white/5">
					<p className="text-sm text-text-secondary break-words">{feedback.comment}</p>
				</div>
			)}
		</div>
	);
}

