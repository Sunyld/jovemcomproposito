import { useNavigate, useParams } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import FileUploader from '../../components/FileUploader';
import { useMentoria, createMentoria, updateMentoria, useMentorMentorias, deleteMentoria } from '../../hooks/useMentorias';
import { useCategories } from '../../hooks/useCategories';
import { useAuth } from '../../hooks/useAuth';
import { toast } from '../../components/Toast';
import DashboardShell from '../../components/dashboard/DashboardShell';
import LoadingSpinner from '../../components/LoadingSpinner';
import { Input, Textarea, Select, Button, Card } from '../../components/ui';
import ConfirmDialog from '../../components/ConfirmDialog';
import { MoreVertical, Edit2, Trash2, Pause, Play, Eye } from 'lucide-react';
import EmptyState from '../../components/EmptyState';
import { FileText } from 'lucide-react';

export default function MentorMentoriaEdit() {
	const { id } = useParams();
	const navigate = useNavigate();
	const { user } = useAuth();
	const isNew = id === 'new' || !id;
	const { mentoria: existing, loading: loadingExisting } = useMentoria(id);
	const { categories } = useCategories();
	const { mentorias: allMentorias, loading: mentoriasLoading } = useMentorMentorias();

	const [title, setTitle] = useState('');
	const [description, setDescription] = useState('');
	const [coverUrl, setCoverUrl] = useState('');
	const [docPath, setDocPath] = useState('');
	const [type, setType] = useState<'online' | 'presencial' | 'documento'>('online');
	const [price, setPrice] = useState(0);
	const [categoryId, setCategoryId] = useState('');
	const [externalLink, setExternalLink] = useState('');
	const [published, setPublished] = useState(false);
	const [saving, setSaving] = useState(false);
	
	// Estados para menus e dialogs
	const [openMenuId, setOpenMenuId] = useState<string | null>(null);
	const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id: string | null; title: string }>({ open: false, id: null, title: '' });
	const [pauseDialog, setPauseDialog] = useState<{ open: boolean; id: string | null; title: string }>({ open: false, id: null, title: '' });
	const [publishDialog, setPublishDialog] = useState<{ open: boolean; id: string | null; title: string }>({ open: false, id: null, title: '' });
	const [processing, setProcessing] = useState(false);
	const menuRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

	useEffect(() => {
		if (existing) {
			setTitle(existing.title);
			setDescription(existing.description);
			setCoverUrl(existing.cover_url || '');
			setDocPath(existing.document_path || '');
			setType(existing.type);
			setPrice(existing.price);
			setCategoryId(existing.category_id || '');
			setExternalLink(existing.external_link || '');
			setPublished(existing.published);
		}
	}, [existing]);

	// Fechar menu ao clicar fora
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (openMenuId && menuRefs.current[openMenuId]) {
				if (!menuRefs.current[openMenuId]?.contains(event.target as Node)) {
					setOpenMenuId(null);
				}
			}
		};
		document.addEventListener('mousedown', handleClickOutside);
		return () => document.removeEventListener('mousedown', handleClickOutside);
	}, [openMenuId]);

	if (loadingExisting) {
		return (
			<DashboardShell role="mentor" title={isNew ? 'Nova mentoria' : 'Editar mentoria'} subtitle="Carregando...">
				<LoadingSpinner size="lg" className="py-12" />
			</DashboardShell>
		);
	}

	async function handleSave() {
		if (!user || !title || !description) {
			toast({ title: 'Campos obrigatórios', description: 'Preencha título e descrição.', variant: 'error' });
			return;
		}

		setSaving(true);
		try {
			const mentoriaData = {
				mentor_id: user.id,
				title,
				description,
				cover_url: coverUrl || null,
				document_path: docPath || null,
				type,
				price,
				category_id: categoryId || null,
				external_link: externalLink || null,
				published,
			};

			if (isNew) {
				await createMentoria(mentoriaData);
			} else if (id) {
				await updateMentoria(id, mentoriaData);
			}

			navigate('/dashboard/mentor');
		} catch (err) {
			// Error already handled in hook
		} finally {
			setSaving(false);
		}
	}

	const handleDelete = async () => {
		if (!deleteDialog.id) return;
		setProcessing(true);
		try {
			await deleteMentoria(deleteDialog.id);
			setDeleteDialog({ open: false, id: null, title: '' });
			toast({ title: 'Mentoria deletada', description: 'A mentoria foi removida com sucesso.', variant: 'success' });
		} catch (err) {
			// Error already handled in hook
		} finally {
			setProcessing(false);
		}
	};

	const handlePause = async () => {
		if (!pauseDialog.id) return;
		setProcessing(true);
		try {
			await updateMentoria(pauseDialog.id, { published: false });
			setPauseDialog({ open: false, id: null, title: '' });
			toast({ title: 'Mentoria pausada', description: 'A mentoria foi pausada e não será mais exibida publicamente.', variant: 'success' });
		} catch (err) {
			// Error already handled in hook
		} finally {
			setProcessing(false);
		}
	};

	const handlePublish = async () => {
		if (!publishDialog.id) return;
		setProcessing(true);
		try {
			await updateMentoria(publishDialog.id, { published: true });
			setPublishDialog({ open: false, id: null, title: '' });
			toast({ title: 'Mentoria publicada', description: 'A mentoria foi publicada com sucesso.', variant: 'success' });
		} catch (err) {
			// Error already handled in hook
		} finally {
			setProcessing(false);
		}
	};

	return (
		<DashboardShell role="mentor" title={isNew ? 'Nova mentoria' : 'Editar mentoria'} subtitle="Cadastre conteúdos com capa, documentos e links de encontro.">
			<div className="space-y-6">
				{/* Formulário */}
				<Card padding="lg" className="max-w-3xl">
					<form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-5">
						<Input
							label="Título"
							value={title}
							onChange={(e) => setTitle(e.target.value)}
							placeholder="Título da mentoria"
							required
						/>
						<Textarea
							label="Descrição"
							value={description}
							onChange={(e) => setDescription(e.target.value)}
							placeholder="Descrição da mentoria"
							className="min-h-32"
							required
						/>
						<div>
							<label className="block text-sm font-medium text-text-secondary mb-2">Capa da mentoria</label>
							<FileUploader 
								bucket="covers" 
								onUploaded={(_, pub) => setCoverUrl(pub ?? '')} 
								accept=".png,.jpg,.jpeg,.webp"
								showPreview={true}
								currentFile={coverUrl}
								maxSizeMb={5}
							/>
						</div>
						<div>
							<label className="block text-sm font-medium text-text-secondary mb-2">Documento PDF (opcional)</label>
							<FileUploader 
								bucket="mentorias-docs" 
								onUploaded={(path) => setDocPath(path)} 
								accept=".pdf"
								maxSizeMb={20}
							/>
							{docPath && (
								<Card padding="sm" variant="outlined" className="mt-2">
									<p className="text-xs text-text-secondary">Documento: {docPath.split('/').pop()}</p>
								</Card>
							)}
						</div>
						<div className="grid sm:grid-cols-3 gap-4">
							<Select
								label="Categoria"
								value={categoryId}
								onChange={(e) => setCategoryId(e.target.value)}
								options={[
									{ value: '', label: 'Selecione categoria' },
									...categories.map((c) => ({ value: c.id, label: c.name })),
								]}
								fullWidth={false}
							/>
							<Select
								label="Tipo"
								value={type}
								onChange={(e) => setType(e.target.value as 'online' | 'presencial' | 'documento')}
								options={[
									{ value: 'online', label: 'Online' },
									{ value: 'presencial', label: 'Presencial' },
									{ value: 'documento', label: 'Documento' },
								]}
								fullWidth={false}
							/>
							<Input
								label="Preço"
								type="number"
								value={price.toString()}
								onChange={(e) => setPrice(Number(e.target.value))}
								placeholder="0 = grátis"
								min="0"
								fullWidth={false}
							/>
						</div>
						<Input
							label="Link Google Meet / Zoom (opcional)"
							type="url"
							value={externalLink}
							onChange={(e) => setExternalLink(e.target.value)}
							placeholder="https://meet.google.com/..."
						/>
						<div className="flex items-center gap-3 p-4 rounded-xl border border-border bg-surface/50">
							<input
								type="checkbox"
								id="published"
								checked={published}
								onChange={(e) => setPublished(e.target.checked)}
								className="h-4 w-4 rounded border-border bg-input text-purple focus:ring-purple focus:ring-offset-2 focus:ring-offset-background"
							/>
							<label htmlFor="published" className="text-sm text-text-secondary cursor-pointer">
								Publicar mentoria
							</label>
						</div>
						<div className="flex gap-3 pt-2">
							<Button
								type="button"
								variant="secondary"
								size="md"
								fullWidth
								onClick={() => navigate(-1)}
							>
								Cancelar
							</Button>
							<Button
								type="submit"
								variant="primary"
								size="md"
								fullWidth
								disabled={saving || !title || !description || !user}
								loading={saving}
							>
								Salvar
							</Button>
						</div>
					</form>
				</Card>

				{/* Lista de Mentorias */}
				<div className="space-y-4">
					<div className="flex items-center justify-between">
						<h2 className="text-lg font-semibold text-text-primary">Minhas Mentorias</h2>
						{!mentoriasLoading && allMentorias.length > 0 && (
							<span className="text-sm text-text-secondary">
								{allMentorias.filter(m => m.published).length} publicada(s) • {allMentorias.length} total
							</span>
						)}
					</div>
					
					{mentoriasLoading ? (
						<LoadingSpinner size="md" className="py-8" />
					) : allMentorias.length === 0 ? (
						<EmptyState
							icon={FileText}
							title="Nenhuma mentoria criada"
							description="As mentorias que você criar aparecerão aqui."
						/>
					) : (
						<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
							{allMentorias.map((mentoria) => (
								<Card key={mentoria.id} padding="md" hover className="relative">
									{mentoria.cover_url && (
										<img 
											src={mentoria.cover_url} 
											alt={mentoria.title}
											className="w-full h-32 object-cover rounded-lg mb-3"
										/>
									)}
									<div className="flex items-start justify-between mb-2">
										<div className="flex-1 min-w-0 pr-2">
											<h3 className="font-medium text-text-primary truncate">{mentoria.title}</h3>
											<p className="text-sm text-text-secondary mt-1 line-clamp-2">{mentoria.description}</p>
											<div className="flex items-center gap-2 mt-2 text-xs text-text-secondary">
												<span>{mentoria.price === 0 ? 'Grátis' : `MZN ${mentoria.price}`}</span>
												<span>•</span>
												<span className="capitalize">{mentoria.type}</span>
											</div>
										</div>
										<div className="relative flex-shrink-0" ref={(el) => (menuRefs.current[mentoria.id] = el)}>
											<button
												onClick={() => setOpenMenuId(openMenuId === mentoria.id ? null : mentoria.id)}
												className="p-1.5 rounded-lg hover:bg-surface transition-colors text-text-secondary hover:text-text-primary"
												aria-label="Menu de opções"
											>
												<MoreVertical size={18} />
											</button>
											{openMenuId === mentoria.id && (
												<div className="absolute right-0 top-10 z-50 w-48 rounded-xl border border-border bg-surface shadow-lg py-1">
													<button
														onClick={() => {
															setOpenMenuId(null);
															navigate(`/dashboard/mentor/mentorias/${mentoria.id}`);
														}}
														className="w-full px-4 py-2 text-left text-sm text-text-primary hover:bg-surface/80 flex items-center gap-2"
													>
														<Edit2 size={16} />
														Editar
													</button>
													{mentoria.published ? (
														<button
															onClick={() => {
																setOpenMenuId(null);
																setPauseDialog({ open: true, id: mentoria.id, title: mentoria.title });
															}}
															className="w-full px-4 py-2 text-left text-sm text-text-primary hover:bg-surface/80 flex items-center gap-2"
														>
															<Pause size={16} />
															Pausar
														</button>
													) : (
														<button
															onClick={() => {
																setOpenMenuId(null);
																setPublishDialog({ open: true, id: mentoria.id, title: mentoria.title });
															}}
															className="w-full px-4 py-2 text-left text-sm text-text-primary hover:bg-surface/80 flex items-center gap-2"
														>
															<Play size={16} />
															Publicar
														</button>
													)}
													<button
														onClick={() => {
															setOpenMenuId(null);
															setDeleteDialog({ open: true, id: mentoria.id, title: mentoria.title });
														}}
														className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-red-500/10 flex items-center gap-2"
													>
														<Trash2 size={16} />
														Apagar
													</button>
												</div>
											)}
										</div>
									</div>
									<div className="flex items-center gap-2 mt-3 pt-3 border-t border-border">
										{mentoria.published ? (
											<>
												<Eye size={14} className="text-green-400" />
												<span className="text-xs text-green-400 font-medium">Publicada</span>
											</>
										) : (
											<>
												<Pause size={14} className="text-text-secondary" />
												<span className="text-xs text-text-secondary">Pausada / Rascunho</span>
											</>
										)}
									</div>
								</Card>
							))}
						</div>
					)}
				</div>
			</div>

			{/* Dialogs de Confirmação */}
			<ConfirmDialog
				open={deleteDialog.open}
				onClose={() => !processing && setDeleteDialog({ open: false, id: null, title: '' })}
				onConfirm={handleDelete}
				title="Apagar mentoria"
				description={`Tem certeza que deseja apagar a mentoria "${deleteDialog.title}"? Esta ação não pode ser desfeita.`}
				confirmText={processing ? 'Apagando...' : 'Apagar'}
				cancelText="Cancelar"
				variant="danger"
				loading={processing}
			/>
			<ConfirmDialog
				open={pauseDialog.open}
				onClose={() => !processing && setPauseDialog({ open: false, id: null, title: '' })}
				onConfirm={handlePause}
				title="Pausar mentoria"
				description={`Tem certeza que deseja pausar a mentoria "${pauseDialog.title}"? Ela não será mais exibida publicamente, mas poderá ser republicada depois.`}
				confirmText={processing ? 'Pausando...' : 'Pausar'}
				cancelText="Cancelar"
				variant="default"
				loading={processing}
			/>
			<ConfirmDialog
				open={publishDialog.open}
				onClose={() => !processing && setPublishDialog({ open: false, id: null, title: '' })}
				onConfirm={handlePublish}
				title="Publicar mentoria"
				description={`Tem certeza que deseja publicar a mentoria "${publishDialog.title}"? Ela ficará visível para todos os usuários.`}
				confirmText={processing ? 'Publicando...' : 'Publicar'}
				cancelText="Cancelar"
				variant="default"
				loading={processing}
			/>
		</DashboardShell>
	);
}
