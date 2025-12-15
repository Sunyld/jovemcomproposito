import DashboardShell from '../../components/dashboard/DashboardShell';
import { useUserInscricoes, cancelInscricao } from '../../hooks/useInscritos';
import { useMentoria } from '../../hooks/useMentorias';
import { toast } from '../../components/Toast';
import { Card, Button } from '../../components/ui';
import { X, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import { useState } from 'react';

export default function UserInscricoes() {
	const { inscritos, loading } = useUserInscricoes();
	const [cancelling, setCancelling] = useState<string | null>(null);

	const handleCancel = async (id: string) => {
		if (!confirm('Tem certeza que deseja cancelar esta inscrição?')) return;

		setCancelling(id);
		try {
			await cancelInscricao(id);
		} catch (err) {
			// Error already handled in hook
		} finally {
			setCancelling(null);
		}
	};

	if (loading) {
		return (
			<DashboardShell role="user" title="Minhas Inscrições" subtitle="Acompanhe o status das suas inscrições.">
				<LoadingSpinner size="lg" className="py-12" />
			</DashboardShell>
		);
	}

	return (
		<DashboardShell role="user" title="Minhas Inscrições" subtitle="Acompanhe o status das suas inscrições.">
			{inscritos.length === 0 ? (
				<EmptyState
					icon={AlertCircle}
					title="Nenhuma inscrição"
					description="Você ainda não se inscreveu em nenhuma mentoria. Explore as mentorias disponíveis e faça sua primeira inscrição."
				/>
			) : (
				<div className="grid gap-4">
					{inscritos.map((inscrito) => (
						<InscricaoCard
							key={inscrito.id}
							inscrito={inscrito}
							onCancel={() => handleCancel(inscrito.id)}
							cancelling={cancelling === inscrito.id}
						/>
					))}
				</div>
			)}
		</DashboardShell>
	);
}

function InscricaoCard({ inscrito, onCancel, cancelling }: { inscrito: any; onCancel: () => void; cancelling: boolean }) {
	const { mentoria, loading } = useMentoria(inscrito.mentoria_id);

	if (loading) {
		return (
			<div className="rounded-2xl border border-white/10 dark:border-white/10 bg-surface/30 dark:bg-white/[0.03] p-6 sm:p-8">
				<LoadingSpinner size="md" />
			</div>
		);
	}

	if (!mentoria) return null;

	const getStatusIcon = () => {
		if (inscrito.has_access) return CheckCircle2;
		if (inscrito.payment_status === 'paid') return Clock;
		return Clock;
	};

	const getStatusText = () => {
		if (inscrito.has_access) return 'Aprovado';
		if (inscrito.payment_status === 'paid') return 'Aguardando aprovação';
		if (inscrito.payment_status === 'failed') return 'Pagamento falhou';
		return 'Pendente';
	};

	const getStatusColor = () => {
		if (inscrito.has_access) return 'bg-green-500/20 dark:bg-green-500/20 text-green-600 dark:text-green-400';
		if (inscrito.payment_status === 'paid') return 'bg-blue-500/20 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400';
		if (inscrito.payment_status === 'failed') return 'bg-red-500/20 dark:bg-red-500/20 text-red-600 dark:text-red-400';
		return 'bg-yellow-500/20 dark:bg-yellow-500/20 text-yellow-600 dark:text-yellow-400';
	};

	const StatusIcon = getStatusIcon();

	return (
		<Card padding="md" hover>
			<div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4 mb-4">
				<div className="flex-1 min-w-0">
					<h3 className="font-semibold text-base sm:text-lg mb-1 text-text-primary">{mentoria.title}</h3>
					<p className="text-sm text-text-secondary line-clamp-2">{mentoria.description}</p>
				</div>
				<span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 whitespace-nowrap flex-shrink-0 ${getStatusColor()}`}>
					<StatusIcon size={12} aria-hidden="true" /> {getStatusText()}
				</span>
			</div>

			{inscrito.message && (
				<Card padding="sm" variant="outlined" className="mb-4">
					<p className="text-sm text-text-secondary break-words">
						<strong className="text-text-primary">Sua mensagem:</strong> {inscrito.message}
					</p>
				</Card>
			)}

			<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
				<div className="text-xs text-text-secondary">
					Inscrito em {new Date(inscrito.created_at).toLocaleDateString('pt-BR')}
				</div>
				{!inscrito.has_access && (
					<Button
						variant="secondary"
						size="sm"
						onClick={onCancel}
						disabled={cancelling}
						loading={cancelling}
						icon={<X size={14} />}
						className="border-red-500/30 text-red-400 hover:bg-red-500/10"
					>
						<span className="hidden sm:inline">Cancelar inscrição</span>
						<span className="sm:hidden">Cancelar</span>
					</Button>
				)}
			</div>
		</Card>
	);
}

