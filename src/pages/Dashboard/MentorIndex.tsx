import { Link, useNavigate } from 'react-router-dom';
import { useMentorMentorias, deleteMentoria } from '../../hooks/useMentorias';
import { useInscritos } from '../../hooks/useInscritos';
import { useAuth } from '../../hooks/useAuth';
import DashboardShell from '../../components/dashboard/DashboardShell';
import DevocionalCard from '../../components/DevocionalCard';
import { Card, Button } from '../../components/ui';
import ConfirmDialog from '../../components/ConfirmDialog';
import { PlusCircle, Edit2, FileText, Users2, Eye, Trash2 } from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import { useState } from 'react';
import { toast } from '../../components/Toast';

export default function MentorIndex() {
	const { profile } = useAuth();
	const navigate = useNavigate();
	const { mentorias, loading: mentoriasLoading } = useMentorMentorias();
	const { inscritos: allInscritos } = useInscritos();
	const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id: string | null; title: string }>({ open: false, id: null, title: '' });
	const [deleting, setDeleting] = useState(false);

	const stats = [
		{ icon: FileText, label: 'Mentorias', value: mentorias.length },
		{ icon: Users2, label: 'Inscrições', value: allInscritos.filter((i) => mentorias.some((m) => m.id === i.mentoria_id)).length },
		{ icon: Eye, label: 'Publicadas', value: mentorias.filter((m) => m.published).length }
	];

	const handleDelete = async () => {
		if (!deleteDialog.id) return;
		setDeleting(true);
		try {
			await deleteMentoria(deleteDialog.id);
			setDeleteDialog({ open: false, id: null, title: '' });
			toast({ title: 'Mentoria deletada', description: 'A mentoria foi removida com sucesso.', variant: 'success' });
		} catch (err) {
			// Error already handled in hook
		} finally {
			setDeleting(false);
		}
	};

	if (mentoriasLoading) {
		return (
			<DashboardShell role="mentor" title="Meu painel" subtitle={`Bem-vindo, ${profile?.full_name ?? 'mentor'}!`}>
				<LoadingSpinner size="lg" className="py-12" />
			</DashboardShell>
		);
	}

	return (
		<DashboardShell role="mentor" title="Meu painel" subtitle={`Bem-vindo, ${profile?.full_name ?? 'mentor'}! Acompanhe mentorias, inscrições e materiais.`}>
			<div className="grid gap-4 sm:grid-cols-3">
				{stats.map((s) => {
					const Icon = s.icon;
					return (
						<Card key={s.label} padding="md" hover>
							<div className="flex items-center gap-3">
								<div className="h-10 w-10 rounded-lg bg-card-glow flex items-center justify-center text-text-primary flex-shrink-0">
									<Icon size={18} />
								</div>
								<div className="min-w-0">
									<div className="text-sm text-text-secondary">{s.label}</div>
									<div className="text-xl font-semibold text-text-primary">{s.value}</div>
								</div>
							</div>
						</Card>
					);
				})}
			</div>
			<div className="flex flex-wrap gap-3">
				<Link to="/dashboard/mentor/mentorias/new">
					<Button
						variant="primary"
						size="md"
						icon={<PlusCircle size={16} />}
					>
						Criar mentoria
					</Button>
				</Link>
			</div>
			<div className="space-y-4">
				<h2 className="text-lg font-semibold text-text-primary">Devocional do Dia</h2>
				<DevocionalCard />
			</div>
			<div className="space-y-4">
				<h2 className="text-lg font-semibold text-text-primary">Minhas Mentorias</h2>
				{mentorias.length === 0 ? (
					<EmptyState
						icon={FileText}
						title="Nenhuma mentoria criada"
						description="Comece criando sua primeira mentoria."
						action={
							<Link to="/dashboard/mentor/mentorias/new">
								<Button
									variant="primary"
									size="md"
									icon={<PlusCircle size={16} />}
								>
									Criar mentoria
								</Button>
							</Link>
						}
					/>
				) : (
				<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{mentorias.map((m) => (
						<Card key={m.id} padding="md" hover>
							<div className="flex items-start justify-between mb-3">
								<div className="flex-1 min-w-0">
									<div className="font-medium text-text-primary truncate">{m.title}</div>
									<div className="text-sm text-text-secondary mt-1">{m.price === 0 ? 'Grátis' : `MZN ${m.price}`}</div>
									<div className="text-xs text-text-secondary mt-1">
										{m.published ? 'Publicada' : 'Rascunho'}
									</div>
								</div>
							</div>
							<div className="flex gap-2">
								<Button
									variant="secondary"
									size="sm"
									fullWidth
									onClick={() => navigate(`/dashboard/mentor/mentorias/${m.id}`)}
									icon={<Edit2 size={16} />}
								>
									Editar
								</Button>
								<Button
									variant="danger"
									size="sm"
									fullWidth
									onClick={() => setDeleteDialog({ open: true, id: m.id, title: m.title })}
									icon={<Trash2 size={16} />}
								>
									Apagar
								</Button>
							</div>
						</Card>
					))}
				</div>
				)}
			</div>
			<ConfirmDialog
				open={deleteDialog.open}
				onClose={() => setDeleteDialog({ open: false, id: null, title: '' })}
				onConfirm={handleDelete}
				title="Apagar mentoria"
				description={`Tem certeza que deseja apagar a mentoria "${deleteDialog.title}"? Esta ação não pode ser desfeita.`}
				confirmText="Apagar"
				cancelText="Cancelar"
				variant="danger"
				loading={deleting}
			/>
			</div>
		</DashboardShell>
	);
}


