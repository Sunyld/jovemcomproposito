import { useState } from 'react';
import DashboardShell from '../../components/dashboard/DashboardShell';
import { useInscritos, approveInscricao, updateInscricao } from '../../hooks/useInscritos';
import { useMentorMentorias, useMentoria } from '../../hooks/useMentorias';
import { useProfile } from '../../hooks/useProfiles';
import { toast } from '../../components/Toast';
import { Card, Button } from '../../components/ui';
import ConfirmDialog from '../../components/ConfirmDialog';
import { CheckCircle2, X, User, Clock, DollarSign } from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';

export default function MentorInscricoes() {
	const { mentorias } = useMentorMentorias();
	const [selectedMentoria, setSelectedMentoria] = useState<string>('all');
	const { inscritos, loading } = useInscritos(selectedMentoria === 'all' ? undefined : selectedMentoria);
	const [approveDialog, setApproveDialog] = useState<{ open: boolean; id: string | null }>({ open: false, id: null });
	const [rejectDialog, setRejectDialog] = useState<{ open: boolean; id: string | null }>({ open: false, id: null });
	const [processing, setProcessing] = useState(false);

	const filteredInscritos = inscritos.filter((i) => {
		if (selectedMentoria === 'all') return true;
		return i.mentoria_id === selectedMentoria;
	});

	const handleApprove = async () => {
		if (!approveDialog.id) return;
		setProcessing(true);
		try {
			await approveInscricao(approveDialog.id);
			setApproveDialog({ open: false, id: null });
			toast({ title: 'Inscrição aprovada', description: 'O usuário agora tem acesso à mentoria.', variant: 'success' });
		} catch (err) {
			// Error already handled in hook
		} finally {
			setProcessing(false);
		}
	};

	const handleReject = async () => {
		if (!rejectDialog.id) return;
		setProcessing(true);
		try {
			await updateInscricao(rejectDialog.id, { has_access: false });
			setRejectDialog({ open: false, id: null });
			toast({ title: 'Inscrição rejeitada', description: 'O acesso foi negado ao usuário.', variant: 'success' });
		} catch (err) {
			// Error already handled in hook
		} finally {
			setProcessing(false);
		}
	};

	if (loading) {
		return (
			<DashboardShell role="mentor" title="Inscrições" subtitle="Gerencie inscrições nas suas mentorias.">
				<LoadingSpinner size="lg" className="py-12" />
			</DashboardShell>
		);
	}

	return (
		<DashboardShell role="mentor" title="Inscrições" subtitle="Gerencie inscrições nas suas mentorias.">
			<div className="space-y-6">
				{/* Filter by mentoria */}
				<div className="flex flex-wrap gap-2 sm:gap-3">
					<Button
						variant={selectedMentoria === 'all' ? 'primary' : 'secondary'}
						size="md"
						onClick={() => setSelectedMentoria('all')}
					>
						Todas
					</Button>
					{mentorias.map((m) => (
						<Button
							key={m.id}
							variant={selectedMentoria === m.id ? 'primary' : 'secondary'}
							size="md"
							onClick={() => setSelectedMentoria(m.id)}
							title={m.title}
							className="truncate max-w-[200px] sm:max-w-none"
						>
							{m.title}
						</Button>
					))}
				</div>

				{/* Inscritos list */}
				{filteredInscritos.length === 0 ? (
					<EmptyState
						icon={User}
						title="Nenhuma inscrição encontrada"
						description="Quando houver inscrições nas suas mentorias, elas aparecerão aqui."
					/>
				) : (
					<div className="grid gap-4">
						{filteredInscritos.map((inscrito) => (
							<InscritoCard
								key={inscrito.id}
								inscrito={inscrito}
								onApprove={() => setApproveDialog({ open: true, id: inscrito.id })}
								onReject={() => setRejectDialog({ open: true, id: inscrito.id })}
							/>
						))}
					</div>
				)}
			</div>
			<ConfirmDialog
				open={approveDialog.open}
				onClose={() => setApproveDialog({ open: false, id: null })}
				onConfirm={handleApprove}
				title="Aprovar inscrição"
				description="Tem certeza que deseja aprovar esta inscrição? O usuário terá acesso completo à mentoria."
				confirmText={processing ? 'Aprovando...' : 'Aprovar'}
				cancelText="Cancelar"
				loading={processing}
			/>
			<ConfirmDialog
				open={rejectDialog.open}
				onClose={() => setRejectDialog({ open: false, id: null })}
				onConfirm={handleReject}
				title="Rejeitar inscrição"
				description="Tem certeza que deseja rejeitar esta inscrição? O acesso será negado ao usuário."
				confirmText={processing ? 'Rejeitando...' : 'Rejeitar'}
				cancelText="Cancelar"
				variant="danger"
				loading={processing}
			/>
		</DashboardShell>
	);
}

function InscritoCard({ inscrito, onApprove, onReject }: { inscrito: any; onApprove: () => void; onReject: () => void }) {
	const { profile, loading: profileLoading } = useProfile(inscrito.user_id);
	const { mentoria, loading: mentoriaLoading } = useMentoria(inscrito.mentoria_id);
	const loading = profileLoading || mentoriaLoading;

	if (loading) {
		return (
			<div className="rounded-2xl border border-border bg-surface p-6 sm:p-8">
				<LoadingSpinner size="md" />
			</div>
		);
	}

	return (
		<Card padding="md" hover>
			<div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
				<div className="flex items-start gap-3 flex-1 min-w-0">
					<div className="h-12 w-12 rounded-full bg-card-glow flex items-center justify-center text-lg font-medium uppercase flex-shrink-0">
						{profile?.full_name?.[0] || 'U'}
					</div>
					<div className="min-w-0 flex-1">
						<div className="font-medium text-text-primary truncate">{profile?.full_name || 'Usuário'}</div>
						{profile?.bio && <div className="text-xs text-text-secondary truncate mt-1">{profile.bio}</div>}
						{mentoria && (
							<div className="text-xs text-text-secondary mt-1 truncate">
								Mentoria: {mentoria.title}
							</div>
						)}
					</div>
				</div>
				<div className="flex items-center gap-2 flex-shrink-0">
					{inscrito.has_access ? (
						<span className="px-3 py-1 rounded-full text-xs font-medium bg-green-500/20 text-success flex items-center gap-1 whitespace-nowrap">
							<CheckCircle2 size={12} aria-hidden="true" /> Aprovado
						</span>
					) : (
						<span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-500/20 text-warning flex items-center gap-1 whitespace-nowrap">
							<Clock size={12} aria-hidden="true" /> Pendente
						</span>
					)}
				</div>
			</div>

			{inscrito.message && (
				<Card padding="sm" variant="outlined" className="mb-4">
					<p className="text-sm text-text-secondary break-words">{inscrito.message}</p>
				</Card>
			)}

			<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
				<div className="flex flex-wrap items-center gap-3 sm:gap-4 text-sm text-text-secondary">
					<div className="flex items-center gap-1">
						<DollarSign size={14} className="flex-shrink-0" aria-hidden="true" />
						<span className="capitalize">{inscrito.payment_status}</span>
					</div>
					<div className="text-xs">
						{new Date(inscrito.created_at).toLocaleDateString('pt-BR')}
					</div>
				</div>
				{!inscrito.has_access && (
					<div className="flex flex-wrap gap-2">
						<Button
							variant="success"
							size="sm"
							onClick={onApprove}
							icon={<CheckCircle2 size={16} />}
						>
							<span className="hidden sm:inline">Aprovar</span>
							<span className="sm:hidden">Aprovar</span>
						</Button>
						<Button
							variant="secondary"
							size="sm"
							onClick={onReject}
							icon={<X size={16} />}
							className="border-red-500/30 text-red-400 hover:bg-red-500/10"
						>
							<span className="hidden sm:inline">Rejeitar</span>
							<span className="sm:hidden">Rejeitar</span>
						</Button>
					</div>
				)}
			</div>
		</Card>
	);
}
