import { useState } from 'react';
import DashboardShell from '../../components/dashboard/DashboardShell';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import { useCategories, createCategory, updateCategory, deleteCategory } from '../../hooks/useCategories';
import { CheckCircle2, Edit, Trash2 } from 'lucide-react';
import { toast } from '../../components/Toast';

export default function AdminCategorias() {
	const { categories, loading } = useCategories();
	const [newCat, setNewCat] = useState('');
	const [editingId, setEditingId] = useState<string | null>(null);
	const [editingValue, setEditingValue] = useState('');

	const handleAdd = async () => {
		if (!newCat.trim()) return;
		try {
			await createCategory(newCat.trim());
			setNewCat('');
		} catch (err) {
			// handled in hook
		}
	};

	const handleEdit = (id: string, current: string) => {
		setEditingId(id);
		setEditingValue(current);
	};

	const handleSave = async () => {
		if (!editingId || !editingValue.trim()) return;
		try {
			await updateCategory(editingId, editingValue.trim());
			setEditingId(null);
			setEditingValue('');
		} catch (err) {
			// handled in hook
		}
	};

	const handleDelete = async (id: string) => {
		if (!confirm('Deletar categoria permanentemente?')) return;
		try {
			await deleteCategory(id);
			toast({ title: 'Categoria removida', variant: 'success' });
		} catch (err) {
			// handled
		}
	};

	return (
		<DashboardShell role="admin" title="Gestão de Categorias" subtitle="Organize os temas disponíveis para mentorias e discipulados.">
			<p className="text-sm text-text-secondary max-w-3xl">
				Categorias ajudam usuários a filtrar mentorias e manter o conteúdo organizado. Crie, renomeie ou remova categorias com poucos cliques.
			</p>

			<div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 space-y-4">
				<div className="flex flex-wrap gap-3">
					<input
						className="flex-1 min-w-[200px] px-3 py-2 rounded-lg bg-white/5 border border-white/10 outline-none focus:border-purple"
						placeholder="Nova categoria"
						value={newCat}
						onChange={(e) => setNewCat(e.target.value)}
						onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
					/>
					<button onClick={handleAdd} className="px-4 py-2 rounded-lg bg-purple text-background hover:bg-purple-light">
						Adicionar
					</button>
				</div>

				{loading ? (
					<LoadingSpinner size="lg" className="py-16" />
				) : categories.length === 0 ? (
					<EmptyState title="Nenhuma categoria" description="Crie sua primeira categoria para organizar as mentorias." />
				) : (
					<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
						{categories.map((category) => (
							<div key={category.id} className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 flex items-center justify-between gap-3">
								{editingId === category.id ? (
									<div className="flex-1 flex items-center gap-2">
										<input
											className="flex-1 bg-transparent border-b border-white/20 outline-none text-sm"
											value={editingValue}
											onChange={(e) => setEditingValue(e.target.value)}
											autoFocus
										/>
										<button onClick={handleSave} className="text-green-400 hover:text-green-300">
											<CheckCircle2 size={16} />
										</button>
										<button onClick={() => setEditingId(null)} className="text-text-secondary hover:text-text-primary">
											Cancel
										</button>
									</div>
								) : (
									<>
										<span className="text-sm font-medium">{category.name}</span>
										<div className="flex items-center gap-2 text-text-secondary">
											<button onClick={() => handleEdit(category.id, category.name)} className="hover:text-text-primary">
												<Edit size={14} />
											</button>
											<button onClick={() => handleDelete(category.id)} className="hover:text-red-400">
												<Trash2 size={14} />
											</button>
										</div>
									</>
								)}
							</div>
						))}
					</div>
				)}
			</div>
		</DashboardShell>
	);
}








