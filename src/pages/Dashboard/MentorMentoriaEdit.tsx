import { useNavigate, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import FileUploader from '../../components/FileUploader';
import { useMentoria, createMentoria, updateMentoria } from '../../hooks/useMentorias';
import { useCategories } from '../../hooks/useCategories';
import { useAuth } from '../../hooks/useAuth';
import { toast } from '../../components/Toast';
import DashboardShell from '../../components/dashboard/DashboardShell';
import LoadingSpinner from '../../components/LoadingSpinner';
import { Input, Textarea, Select, Button, Card } from '../../components/ui';

export default function MentorMentoriaEdit() {
	const { id } = useParams();
	const navigate = useNavigate();
	const { user } = useAuth();
	const isNew = id === 'new' || !id;
	const { mentoria: existing, loading: loadingExisting } = useMentoria(id);
	const { categories } = useCategories();

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

	return (
		<DashboardShell role="mentor" title={isNew ? 'Nova mentoria' : 'Editar mentoria'} subtitle="Cadastre conteúdos com capa, documentos e links de encontro.">
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
		</DashboardShell>
	);
}


