import { useState } from 'react';
import DashboardShell from '../../components/dashboard/DashboardShell';
import { useProjetos, createProjeto, updateProjeto, deleteProjeto } from '../../hooks/useProjetos';
import { toast } from '../../components/Toast';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import Modal from '../../components/Modal';
import FileUploader from '../../components/FileUploader';
import { Card, Button, Input, Textarea, Select } from '../../components/ui';
import { PlusCircle, Edit, Trash2, Users2 } from 'lucide-react';
import { Projeto } from '../../lib/types';
import { useAuth } from '../../hooks/useAuth';

export default function AdminProjetos() {
	const { projetos, loading, refetch } = useProjetos();
	const { user } = useAuth();
	const [modalOpen, setModalOpen] = useState(false);
	const [editing, setEditing] = useState<Projeto | null>(null);
	const [formData, setFormData] = useState({
		title: '',
		description: '',
		cover_url: '',
		type: 'voluntariado' as 'voluntariado' | 'projeto-pratico' | 'comunidade',
		max_volunteers: '',
		status: 'aberto' as 'aberto' | 'fechado' | 'concluido',
	});

	function handleOpenModal(projeto?: Projeto) {
		if (projeto) {
			setEditing(projeto);
			setFormData({
				title: projeto.title,
				description: projeto.description,
				cover_url: projeto.cover_url || '',
				type: projeto.type,
				max_volunteers: projeto.max_volunteers?.toString() || '',
				status: projeto.status,
			});
		} else {
			setEditing(null);
			setFormData({
				title: '',
				description: '',
				cover_url: '',
				type: 'voluntariado',
				max_volunteers: '',
				status: 'aberto',
			});
		}
		setModalOpen(true);
	}

	function handleCloseModal() {
		setModalOpen(false);
		setEditing(null);
		setFormData({
			title: '',
			description: '',
			cover_url: '',
			type: 'voluntariado',
			max_volunteers: '',
			status: 'aberto',
		});
	}

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();

		if (!formData.title || !formData.description) {
			toast({ title: 'Erro', description: 'Preencha título e descrição.', variant: 'error' });
			return;
		}

		try {
			const data = {
				title: formData.title,
				description: formData.description,
				type: formData.type,
				cover_url: formData.cover_url || undefined,
				max_volunteers: formData.max_volunteers ? parseInt(formData.max_volunteers) : undefined,
			};

			if (editing) {
				await updateProjeto(editing.id, { ...data, status: formData.status });
			} else {
				await createProjeto(data);
			}
			refetch();
			handleCloseModal();
		} catch (err) {
			// Error already handled in hook
		}
	}

	async function handleDelete(id: string) {
		if (!confirm('Tem certeza que deseja deletar este projeto?')) return;
		try {
			await deleteProjeto(id);
			refetch();
		} catch (err) {
			// Error already handled in hook
		}
	}

	return (
		<DashboardShell role="admin" title="Gestão de Projetos" subtitle="Crie e gerencie projetos e oportunidades de voluntariado.">
			<div className="flex items-center justify-between mb-6 flex-wrap gap-4">
				<div>
					<h2 className="text-xl font-semibold text-text-primary">Projetos</h2>
					<p className="text-sm text-text-secondary mt-1">
						Gerencie projetos, oportunidades de voluntariado e iniciativas da comunidade.
					</p>
				</div>
				<Button
					variant="primary"
					size="md"
					onClick={() => handleOpenModal()}
					icon={<PlusCircle size={16} />}
				>
					Criar Projeto
				</Button>
			</div>

			{loading ? (
				<LoadingSpinner size="lg" className="py-12" />
			) : projetos.length === 0 ? (
				<EmptyState
					icon={Users2}
					title="Nenhum projeto criado"
					description="Comece criando seu primeiro projeto."
					action={
						<Button
							variant="primary"
							size="md"
							onClick={() => handleOpenModal()}
							icon={<PlusCircle size={16} />}
						>
							Criar Projeto
						</Button>
					}
				/>
			) : (
				<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
					{projetos.map((projeto) => (
						<Card key={projeto.id} padding="none" variant="default" className="overflow-hidden">
							{projeto.cover_url ? (
								<img src={projeto.cover_url} alt={projeto.title} className="h-44 w-full object-cover" />
							) : (
								<div className="h-44 w-full bg-gradient-to-br from-purple/20 to-purple-light/20 flex items-center justify-center">
									<span className="text-text-secondary text-sm">Sem imagem</span>
								</div>
							)}
							<div className="p-6">
								<div className="flex items-start justify-between mb-3">
									<div className="flex-1 min-w-0">
										<div className="text-xs uppercase tracking-wider text-purple mb-1">{projeto.type}</div>
										<h3 className="font-semibold text-lg text-text-primary truncate">{projeto.title}</h3>
										<div className="mt-2">
											<span className={`px-2 py-1 rounded-full text-xs font-medium ${
												projeto.status === 'aberto' ? 'bg-green-500/20 text-green-400' :
												projeto.status === 'fechado' ? 'bg-yellow-500/20 text-yellow-400' :
												'bg-gray-500/20 text-gray-400'
											}`}>
												{projeto.status === 'aberto' ? 'Aberto' : projeto.status === 'fechado' ? 'Fechado' : 'Concluído'}
											</span>
										</div>
									</div>
									<div className="flex items-center gap-2 flex-shrink-0 ml-2">
										<Button
											variant="ghost"
											size="sm"
											onClick={() => handleOpenModal(projeto)}
											title="Editar"
											icon={<Edit size={14} />}
										/>
										<Button
											variant="ghost"
											size="sm"
											onClick={() => handleDelete(projeto.id)}
											title="Deletar"
											icon={<Trash2 size={14} />}
											className="text-red-400 hover:text-red-500"
										/>
									</div>
								</div>
								<p className="text-sm text-text-secondary line-clamp-3">{projeto.description}</p>
								{projeto.max_volunteers && (
									<div className="mt-3 flex items-center gap-2 text-xs text-text-secondary">
										<Users2 size={14} />
										<span>Máximo {projeto.max_volunteers} voluntários</span>
									</div>
								)}
							</div>
						</Card>
					))}
				</div>
			)}

			<Modal open={modalOpen} onClose={handleCloseModal} title={editing ? 'Editar Projeto' : 'Criar Projeto'} size="lg">
				<form onSubmit={handleSubmit} className="space-y-5">
					<Input
						label="Título"
						type="text"
						placeholder="Título do projeto"
						value={formData.title}
						onChange={(e) => setFormData({ ...formData, title: e.target.value })}
						required
					/>
					<Textarea
						label="Descrição"
						placeholder="Descreva o projeto..."
						value={formData.description}
						onChange={(e) => setFormData({ ...formData, description: e.target.value })}
						className="min-h-32"
						required
					/>
					<Select
						label="Tipo"
						value={formData.type}
						onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
						options={[
							{ value: 'voluntariado', label: 'Voluntariado' },
							{ value: 'projeto-pratico', label: 'Projeto Prático' },
							{ value: 'comunidade', label: 'Comunidade' },
						]}
						required
					/>
					{editing && (
						<Select
							label="Status"
							value={formData.status}
							onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
							options={[
								{ value: 'aberto', label: 'Aberto' },
								{ value: 'fechado', label: 'Fechado' },
								{ value: 'concluido', label: 'Concluído' },
							]}
						/>
					)}
					<Input
						label="Máximo de voluntários (opcional)"
						type="number"
						min="1"
						placeholder="Ex: 10"
						value={formData.max_volunteers}
						onChange={(e) => setFormData({ ...formData, max_volunteers: e.target.value })}
					/>
					<div>
						<label className="block text-sm font-medium text-text-secondary mb-1.5">Imagem de capa (opcional)</label>
						<FileUploader
							bucket="covers"
							onUploaded={(url) => setFormData({ ...formData, cover_url: url })}
							currentFile={formData.cover_url}
							accept="image/*"
						/>
					</div>
					<div className="flex gap-3 pt-2">
						<Button
							type="button"
							variant="secondary"
							size="md"
							fullWidth
							onClick={handleCloseModal}
						>
							Cancelar
						</Button>
						<Button
							type="submit"
							variant="primary"
							size="md"
							fullWidth
						>
							{editing ? 'Salvar alterações' : 'Criar projeto'}
						</Button>
					</div>
				</form>
			</Modal>
		</DashboardShell>
	);
}


