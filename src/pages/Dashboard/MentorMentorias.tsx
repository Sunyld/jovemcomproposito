import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMentorMentorias, deleteMentoria } from '../../hooks/useMentorias';
import DashboardShell from '../../components/dashboard/DashboardShell';
import { Button, Card } from '../../components/ui';
import { PlusCircle, Edit2, Trash2, FileText, Eye, EyeOff } from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import ConfirmDialog from '../../components/ConfirmDialog';
import { toast } from '../../components/Toast';

export default function MentorMentorias() {
	const { mentorias, loading } = useMentorMentorias();
	const navigate = useNavigate();
	const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; mentoriaId: string | null; mentoriaTitle: string }>({
		open: false,
		mentoriaId: null,
		mentoriaTitle: '',
	});
	const [deleting, setDeleting] = useState(false);

	const handleDelete = async () => {
		if (!deleteDialog.mentoriaId) return;

		setDeleting(true);
		try {
			await deleteMentoria(deleteDialog.mentoriaId);
			setDeleteDialog({ open: false, mentoriaId: null, mentoriaTitle: '' });
		} catch (err) {
			// Error already handled in hook
		} finally {
			setDeleting(false);
		}
	};

	const openDeleteDialog = (id: string, title: string) => {
		setDeleteDialog({ open: true, mentoriaId: id, mentoriaTitle: title });
	};

	if (loading) {
		return (
			<DashboardShell role="mentor" title="Minhas Mentorias" subtitle="Gerencie suas mentorias criadas.">
				<LoadingSpinner size="lg" className="py-12" />
			</DashboardShell>
		);
	}

	return (
		<>
			<DashboardShell role="mentor" title="Minhas Mentorias" subtitle="Gerencie suas mentorias criadas.">
				<div className="space-y-4">
					<div className="flex items-center justify-between">
						<h2 className="text-lg font-semibold text-text-primary">Todas as Mentorias</h2>
						<Button
							variant="primary"
							size="md"
							icon={<PlusCircle size={16} />}
							onClick={() => navigate('/dashboard/mentor/mentorias/new')}
						>
							Nova Mentoria
						</Button>
					</div>

					{mentorias.length === 0 ? (
						<EmptyState
							icon={FileText}
							title="Nenhuma mentoria criada"
							description="Comece criando sua primeira mentoria."
							action={
								<Button
									variant="primary"
									size="md"
									icon={<PlusCircle size={16} />}
									onClick={() => navigate('/dashboard/mentor/mentorias/new')}
								>
									Criar primeira mentoria
								</Button>
							}
						/>
					) : (
						<div className="rounded-xl border border-border bg-surface overflow-hidden">
							<div className="overflow-x-auto">
								<table className="w-full">
									<thead className="bg-surface/50 border-b border-border">
										<tr>
											<th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">
												Título
											</th>
											<th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">
												Preço
											</th>
											<th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">
												Tipo
											</th>
											<th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">
												Status
											</th>
											<th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">
												Criada em
											</th>
											<th className="px-4 py-3 text-right text-xs font-semibold text-text-secondary uppercase tracking-wider w-32">
												Ações
											</th>
										</tr>
									</thead>
									<tbody className="divide-y divide-border">
										{mentorias.map((mentoria) => (
											<tr key={mentoria.id} className="hover:bg-surface/50 transition-colors">
												<td className="px-4 py-3">
													<div className="font-medium text-text-primary">{mentoria.title}</div>
													{mentoria.description && (
														<div className="text-sm text-text-secondary mt-1 line-clamp-1">
															{mentoria.description}
														</div>
													)}
												</td>
												<td className="px-4 py-3 text-sm text-text-primary">
													{mentoria.price === 0 ? 'Grátis' : `MZN ${mentoria.price}`}
												</td>
												<td className="px-4 py-3 text-sm text-text-secondary capitalize">
													{mentoria.type}
												</td>
												<td className="px-4 py-3">
													{mentoria.published ? (
														<span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400">
															<Eye size={12} />
															Publicada
														</span>
													) : (
														<span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-400">
															<EyeOff size={12} />
															Rascunho
														</span>
													)}
												</td>
												<td className="px-4 py-3 text-sm text-text-secondary">
													{new Date(mentoria.created_at).toLocaleDateString('pt-BR')}
												</td>
												<td className="px-4 py-3">
													<div className="flex items-center justify-end gap-2">
														<Button
															variant="secondary"
															size="sm"
															icon={<Edit2 size={14} />}
															onClick={() => navigate(`/dashboard/mentor/mentorias/${mentoria.id}`)}
														>
															Editar
														</Button>
														<Button
															variant="danger"
															size="sm"
															icon={<Trash2 size={14} />}
															onClick={() => openDeleteDialog(mentoria.id, mentoria.title)}
														>
															Excluir
														</Button>
													</div>
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						</div>
					)}
				</div>
			</DashboardShell>

			<ConfirmDialog
				open={deleteDialog.open}
				onClose={() => setDeleteDialog((prev) => ({ ...prev, open: false }))}
				title="Excluir mentoria"
				description={`Tem certeza que deseja excluir a mentoria "${deleteDialog.mentoriaTitle}"? Esta ação não pode ser desfeita.`}
				variant="danger"
				confirmText="Excluir"
				cancelText="Cancelar"
				onConfirm={handleDelete}
				loading={deleting}
			/>
		</>
	);
}

