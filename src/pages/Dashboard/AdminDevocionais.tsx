import { useState } from 'react';
import DashboardShell from '../../components/dashboard/DashboardShell';
import {
	useDevocionalSeries,
	createDevocionalSeries,
	updateDevocionalSeries,
	deleteDevocionalSeries,
	publishDevocionalSeries,
} from '../../hooks/useDevocionais';
import { useAuth } from '../../hooks/useAuth';
import { toast } from '../../components/Toast';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import Modal from '../../components/Modal';
import ConfirmDialog from '../../components/ConfirmDialog';
import { Card, Button, Input, Textarea } from '../../components/ui';
import { PlusCircle, Edit, Trash2, Eye, Calendar, BookOpen, Zap } from 'lucide-react';
import { DevocionalSeries } from '../../lib/devocionalService';

type DevocionalItemForm = {
	day_number: number | null;
	title: string;
	content: string;
};

export default function AdminDevocionais() {
	const { user, profile } = useAuth();
	const { series, loading, refetch } = useDevocionalSeries();
	const [modalOpen, setModalOpen] = useState(false);
	const [deleteModalOpen, setDeleteModalOpen] = useState<string | null>(null);
	const [publishModalOpen, setPublishModalOpen] = useState<string | null>(null);
	const [publishing, setPublishing] = useState<string | null>(null);
	const [creating, setCreating] = useState(false);
	const [tipo, setTipo] = useState<'series' | 'single'>('series');
	const [seriesTitle, setSeriesTitle] = useState('');
	const [items, setItems] = useState<DevocionalItemForm[]>([]);
	const [editing, setEditing] = useState<DevocionalSeries | null>(null);

	function handleOpenModal(serie?: DevocionalSeries) {
		if (serie) {
			setEditing(serie);
			setTipo(serie.tipo);
			setSeriesTitle(serie.title);
			// Load items for editing
			// For now, we'll just reset - full edit would require loading items
			setItems([]);
		} else {
			setEditing(null);
			const defaultTipo = 'series';
			setTipo(defaultTipo);
			setSeriesTitle('');
			// Initialize items based on tipo
			if (defaultTipo === 'series') {
				setItems(
					Array.from({ length: 7 }, (_, i) => ({
						day_number: i + 1,
						title: '',
						content: '',
					}))
				);
			} else {
				setItems([
					{
						day_number: null,
						title: '',
						content: '',
					},
				]);
			}
		}
		setModalOpen(true);
	}

	function handleCloseModal() {
		setModalOpen(false);
		setEditing(null);
		setTipo('series');
		setSeriesTitle('');
		setItems([]);
	}

	function handleTipoChange(newTipo: 'series' | 'single') {
		setTipo(newTipo);
		if (newTipo === 'series') {
			// Initialize with 7 empty items
			setItems(
				Array.from({ length: 7 }, (_, i) => ({
					day_number: i + 1,
					title: '',
					content: '',
				}))
			);
		} else {
			// Initialize with 1 empty item
			setItems([
				{
					day_number: null,
					title: '',
					content: '',
				},
			]);
		}
	}


	function updateItem(index: number, field: keyof DevocionalItemForm, value: string | number | null) {
		const newItems = [...items];
		newItems[index] = { ...newItems[index], [field]: value };
		setItems(newItems);
	}

	function addItem() {
		if (tipo === 'series') {
			if (items.length >= 7) {
				toast({ title: 'Limite atingido', description: 'Uma série pode ter no máximo 7 devocionais.', variant: 'error' });
				return;
			}
			setItems([
				...items,
				{
					day_number: items.length + 1,
					title: '',
					content: '',
				},
			]);
		}
	}

	function removeItem(index: number) {
		if (tipo === 'series' && items.length <= 1) {
			toast({ title: 'Erro', description: 'Uma série deve ter pelo menos 1 devocional.', variant: 'error' });
			return;
		}
		const newItems = items.filter((_, i) => i !== index);
		// Re-number days
		if (tipo === 'series') {
			newItems.forEach((item, i) => {
				item.day_number = i + 1;
			});
		}
		setItems(newItems);
	}

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();

		if (!seriesTitle.trim()) {
			toast({ title: 'Erro', description: 'Preencha o título da série.', variant: 'error' });
			return;
		}

		if (tipo === 'series' && items.length !== 7) {
			toast({ title: 'Erro', description: 'Uma série deve ter exatamente 7 devocionais.', variant: 'error' });
			return;
		}

		if (tipo === 'single' && items.length !== 1) {
			toast({ title: 'Erro', description: 'Um devocional instantâneo deve ter exatamente 1 item.', variant: 'error' });
			return;
		}

		// Validate all items
		for (let i = 0; i < items.length; i++) {
			if (!items[i].title.trim() || !items[i].content.trim()) {
				toast({ title: 'Erro', description: `Preencha todos os campos do devocional ${i + 1}.`, variant: 'error' });
				return;
			}
		}

		setCreating(true);
		try {
			if (editing) {
				await updateDevocionalSeries(editing.id, { title: seriesTitle });
				toast({ title: 'Série atualizada', description: 'Nota: Para editar itens, delete e recrie a série.', variant: 'info' });
			} else {
				const result = await createDevocionalSeries(tipo, seriesTitle, items);
				if (result.data) {
					// Automatically publish the devocional series
					const publishResult = await publishDevocionalSeries(result.data.id);
					if (publishResult.error) {
						toast({ 
							title: 'Série criada mas não publicada', 
							description: 'A série foi criada, mas houve um erro ao publicar. Você pode publicar manualmente.', 
							variant: 'warning' 
						});
					} else {
						toast({ 
							title: 'Série criada e publicada!', 
							description: 'A série foi criada e publicada automaticamente. Todos os usuários receberam notificações.', 
							variant: 'success' 
						});
					}
				}
			}
			refetch();
			handleCloseModal();
		} catch (err) {
			// Error already handled in hook
		} finally {
			setCreating(false);
		}
	}

	async function handleDelete(seriesId: string) {
		try {
			await deleteDevocionalSeries(seriesId);
			refetch();
			setDeleteModalOpen(null);
		} catch (err) {
			// Error already handled in hook
		}
	}

	async function handlePublish(seriesId: string) {
		if (!seriesId) {
			toast({ 
				title: 'Erro', 
				description: 'ID da série não fornecido.', 
				variant: 'error' 
			});
			return;
		}

		if (!user || !profile) {
			toast({ 
				title: 'Erro de autenticação', 
				description: 'Você precisa estar autenticado para publicar devocionais.', 
				variant: 'error' 
			});
			return;
		}

		if (profile.role !== 'admin') {
			toast({ 
				title: 'Permissão negada', 
				description: 'Apenas administradores podem publicar devocionais.', 
				variant: 'error' 
			});
			return;
		}

		setPublishing(seriesId);
		try {
			const result = await publishDevocionalSeries(seriesId);
			
			if (result.error) {
				const errorMsg = result.error.message || 'Não foi possível publicar o devocional. Tente novamente.';
				toast({ 
					title: 'Erro ao publicar', 
					description: errorMsg, 
					variant: 'error' 
				});
				setPublishing(null);
				return;
			}

			if (!result.data) {
				toast({ 
					title: 'Erro ao publicar', 
					description: 'Nenhum dado retornado após publicação. Verifique se o devocional foi criado corretamente.', 
					variant: 'error' 
				});
				setPublishing(null);
				return;
			}

			// Success
			toast({ 
				title: 'Devocional publicado!', 
				description: 'O devocional foi publicado com sucesso. Todos os usuários receberam notificações.', 
				variant: 'success' 
			});
			
			// Wait a bit before refetching to ensure DB is updated
			setTimeout(() => {
				refetch();
				setPublishModalOpen(null);
				setPublishing(null);
			}, 500);
		} catch (err: any) {
			const errorMsg = err?.message || err?.toString() || 'Ocorreu um erro inesperado. Tente novamente.';
			toast({ 
				title: 'Erro ao publicar', 
				description: errorMsg, 
				variant: 'error' 
			});
			setPublishing(null);
		}
	}

	return (
		<DashboardShell role="admin" title="Gestão de Devocionais" subtitle="Crie séries de 7 dias ou devocionais instantâneos. Apenas um devocional pode estar ativo por vez.">
			<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
				<div className="flex-1 min-w-0">
					<h2 className="text-xl font-semibold text-text-primary">Devocionais</h2>
					<p className="text-sm text-text-secondary mt-1">
						Escolha entre criar uma série de 7 dias (publicação automática) ou um devocional instantâneo (24h).
					</p>
				</div>
				<div className="flex flex-col sm:flex-row gap-2 flex-shrink-0">
					<Button
						variant="primary"
						size="md"
						onClick={() => {
							setTipo('single');
							setSeriesTitle('');
							setItems([
								{
									day_number: null,
									title: '',
									content: '',
								},
							]);
							setEditing(null);
							setModalOpen(true);
						}}
						icon={<Zap size={16} />}
					>
						Devocional Instantâneo
					</Button>
					<Button
						variant="primary"
						size="md"
						onClick={() => {
							setTipo('series');
							setSeriesTitle('');
							setItems(
								Array.from({ length: 7 }, (_, i) => ({
									day_number: i + 1,
									title: '',
									content: '',
								}))
							);
							setEditing(null);
							setModalOpen(true);
						}}
						icon={<PlusCircle size={16} />}
					>
						Criar Série (7 dias)
					</Button>
				</div>
			</div>

			{loading ? (
				<LoadingSpinner size="lg" className="py-12" />
			) : series.length === 0 ? (
				<EmptyState
					icon={Calendar}
					title="Nenhum devocional criado"
					description="Comece criando uma série de 7 dias ou um devocional instantâneo."
				/>
			) : (
				<div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
					{series.map((serie) => (
						<Card key={serie.id} padding="md" variant="default" className="min-w-0">
							<div className="flex items-start justify-between mb-4">
								<div className="flex-1 min-w-0">
									<div className="flex items-center gap-2 mb-2">
										{serie.tipo === 'series' ? (
											<BookOpen size={20} className="text-purple flex-shrink-0" aria-hidden="true" />
										) : (
											<Zap size={20} className="text-yellow-400 flex-shrink-0" aria-hidden="true" />
										)}
										<h3 className="font-semibold text-text-primary truncate min-w-0">{serie.title}</h3>
									</div>
									<div className="flex items-center gap-3 text-sm flex-wrap">
										<span
											className={`px-2 py-1 rounded-full text-xs font-medium ${
												serie.status === 'active'
													? 'bg-green-500/20 text-green-400'
													: serie.status === 'expired'
														? 'bg-gray-500/20 text-gray-400'
														: 'bg-yellow-500/20 text-yellow-400'
											}`}
										>
											{serie.status === 'active' ? 'Ativo' : serie.status === 'expired' ? 'Expirado' : 'Rascunho'}
										</span>
										<span className="text-text-secondary">
											{serie.tipo === 'series' ? 'Série de 7 dias' : 'Instantâneo'}
										</span>
									</div>
									{serie.status === 'active' && (
										<div className="mt-2 text-xs text-text-secondary">
											Iniciado em: {new Date(serie.start_at).toLocaleString('pt-BR')}
										</div>
									)}
								</div>
								<div className="flex items-center gap-2 flex-shrink-0 ml-2">
									{serie.status === 'draft' && (
										<Button
											variant="ghost"
											size="sm"
											onClick={(e) => {
												e.preventDefault();
												e.stopPropagation();
												if (serie.id) {
													setPublishModalOpen(serie.id);
												} else {
													toast({ 
														title: 'Erro', 
														description: 'ID da série não encontrado', 
														variant: 'error' 
													});
												}
											}}
											disabled={publishing === serie.id}
											loading={publishing === serie.id}
											title="Publicar"
											aria-label="Publicar devocional"
											icon={<Eye size={14} />}
											className="text-green-400 hover:text-green-500"
										/>
									)}
									<Button
										variant="ghost"
										size="sm"
										onClick={() => handleOpenModal(serie)}
										title="Editar"
										aria-label="Editar devocional"
										icon={<Edit size={14} />}
									/>
									<Button
										variant="ghost"
										size="sm"
										onClick={() => setDeleteModalOpen(serie.id)}
										title="Deletar"
										aria-label="Deletar devocional"
										icon={<Trash2 size={14} />}
										className="text-red-400 hover:text-red-500"
									/>
								</div>
							</div>
						</Card>
					))}
				</div>
			)}

			{/* Create/Edit Modal */}
			<Modal open={modalOpen} onClose={handleCloseModal} title={editing ? 'Editar Série' : tipo === 'series' ? 'Criar Série de 7 Dias' : 'Criar Devocional Instantâneo'} size="xl">
				<form onSubmit={handleSubmit} className="space-y-5">
					<div>
						<label className="block text-sm font-medium text-text-secondary mb-2">Tipo de Publicação</label>
						<div className="flex gap-2">
							<Button
								type="button"
								variant={tipo === 'series' ? 'primary' : 'secondary'}
								size="md"
								fullWidth
								onClick={() => handleTipoChange('series')}
								icon={<BookOpen size={16} />}
							>
								Série (7 dias)
							</Button>
							<Button
								type="button"
								variant={tipo === 'single' ? 'primary' : 'secondary'}
								size="md"
								fullWidth
								onClick={() => handleTipoChange('single')}
								icon={<Zap size={16} />}
							>
								Instantâneo (24h)
							</Button>
						</div>
					</div>

					<Input
						label={tipo === 'series' ? 'Título da Série' : 'Título do Devocional'}
						type="text"
						placeholder={tipo === 'series' ? 'Ex: Semana de Oração' : 'Título do devocional'}
						value={seriesTitle}
						onChange={(e) => setSeriesTitle(e.target.value)}
						required
					/>

					<div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
						{items.map((item, index) => (
							<Card key={index} padding="md" variant="outlined" className="flex-shrink-0">
								<div className="flex items-center justify-between mb-3">
									<span className="text-sm font-medium text-text-primary">
										{tipo === 'series' ? `Dia ${item.day_number}/7` : 'Devocional'}
									</span>
									{tipo === 'series' && items.length > 1 && (
										<Button
											type="button"
											variant="ghost"
											size="sm"
											onClick={() => removeItem(index)}
											className="text-red-400 hover:text-red-500 text-xs"
										>
											Remover
										</Button>
									)}
								</div>
								<div className="space-y-3">
									<Input
										placeholder="Título"
										value={item.title}
										onChange={(e) => updateItem(index, 'title', e.target.value)}
										required
										className="text-sm"
									/>
									<Textarea
										placeholder="Conteúdo do devocional..."
										value={item.content}
										onChange={(e) => updateItem(index, 'content', e.target.value)}
										className="min-h-32 text-sm"
										required
									/>
								</div>
							</Card>
						))}
					</div>

					{tipo === 'series' && items.length < 7 && (
						<Button
							type="button"
							variant="secondary"
							size="md"
							fullWidth
							onClick={addItem}
							icon={<PlusCircle size={16} />}
						>
							Adicionar Devocional ({items.length}/7)
						</Button>
					)}

					<div className="flex gap-3 pt-4 border-t border-border">
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
							loading={creating}
							disabled={creating}
						>
							{editing ? 'Salvar alterações' : creating ? 'Publicando...' : 'Criar e Publicar'}
						</Button>
					</div>
				</form>
			</Modal>

			{/* Delete Confirmation */}
			<ConfirmDialog
				open={deleteModalOpen !== null}
				onClose={() => setDeleteModalOpen(null)}
				onConfirm={() => deleteModalOpen && handleDelete(deleteModalOpen)}
				title="Deletar Série"
				message="Tem certeza que deseja deletar esta série? Esta ação não pode ser desfeita."
				confirmText="Deletar"
				variant="danger"
			/>

			{/* Publish Confirmation */}
			{publishModalOpen && (
				<ConfirmDialog
					open={true}
					onClose={() => {
						if (!publishing) {
							setPublishModalOpen(null);
						}
					}}
					onConfirm={async () => {
						const seriesId = publishModalOpen;
						if (!seriesId) {
							toast({ 
								title: 'Erro', 
								description: 'ID da série não encontrado', 
								variant: 'error' 
							});
							setPublishModalOpen(null);
							return;
						}
						
						try {
							await handlePublish(seriesId);
						} catch (err: any) {
							toast({ 
								title: 'Erro', 
								description: err?.message || 'Erro ao executar publicação', 
								variant: 'error' 
							});
							setPublishing(null);
						}
					}}
					title="Publicar Devocional"
					message="Ao publicar, todos os outros devocionais ativos serão desativados automaticamente. Todos os usuários receberão uma notificação. Continuar?"
					confirmText={publishing ? 'Publicando...' : 'Publicar'}
					variant="info"
					disabled={!!publishing}
				/>
			)}
		</DashboardShell>
	);
}
