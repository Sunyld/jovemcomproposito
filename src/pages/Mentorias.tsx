import { useMemo, useState } from 'react';
import { useMentorias } from '../hooks/useMentorias';
import { useCategories } from '../hooks/useCategories';
import CardMentoria from '../components/CardMentoria';
import { Input, Select } from '../components/ui';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import Pagination from '../components/Pagination';
import SkeletonLoader from '../components/SkeletonLoader';
import { FileText } from 'lucide-react';

const ITEMS_PER_PAGE = 9;

export default function Mentorias() {
	const [q, setQ] = useState('');
	const [cat, setCat] = useState<string>('all');
	const [type, setType] = useState<string>('all');
	const [pricing, setPricing] = useState<string>('all');
	const [currentPage, setCurrentPage] = useState(1);

	const { mentorias, loading: mentoriasLoading } = useMentorias({ published: true });
	const { categories, loading: categoriesLoading } = useCategories();

	const filtered = useMemo(() => {
		return mentorias.filter((m) => {
			if (q && !m.title.toLowerCase().includes(q.toLowerCase())) return false;
			if (cat !== 'all' && m.category_id !== cat) return false;
			if (type !== 'all' && m.type !== type) return false;
			if (pricing === 'free' && m.price !== 0) return false;
			if (pricing === 'paid' && m.price === 0) return false;
			return true;
		});
	}, [q, cat, type, pricing, mentorias]);

	const paginated = useMemo(() => {
		const start = (currentPage - 1) * ITEMS_PER_PAGE;
		return filtered.slice(start, start + ITEMS_PER_PAGE);
	}, [filtered, currentPage]);

	const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);

	// Reset to page 1 when filters change
	useMemo(() => {
		setCurrentPage(1);
	}, [q, cat, type, pricing]);

	return (
		<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
			<div className="py-8">
				<h1 className="text-2xl font-display text-text-primary">Mentorias</h1>
				<div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
					<Input
						placeholder="Buscar..."
						value={q}
						onChange={(e) => setQ(e.target.value)}
						fullWidth={false}
					/>
					<Select
						value={cat}
						onChange={(e) => setCat(e.target.value)}
						options={[
							{ value: 'all', label: 'Todas categorias' },
							...categories.map((c) => ({ value: c.id, label: c.name })),
						]}
						fullWidth={false}
					/>
					<Select
						value={type}
						onChange={(e) => setType(e.target.value)}
						options={[
							{ value: 'all', label: 'Todos os tipos' },
							{ value: 'online', label: 'Online' },
							{ value: 'presencial', label: 'Presencial' },
							{ value: 'documento', label: 'Documento' },
						]}
						fullWidth={false}
					/>
					<Select
						value={pricing}
						onChange={(e) => setPricing(e.target.value)}
						options={[
							{ value: 'all', label: 'Preço' },
							{ value: 'free', label: 'Grátis' },
							{ value: 'paid', label: 'Pago' },
						]}
						fullWidth={false}
					/>
				</div>
				{mentoriasLoading || categoriesLoading ? (
					<SkeletonLoader variant="card" count={6} className="mt-6" />
				) : filtered.length === 0 ? (
					<EmptyState
						icon={FileText}
						title="Nenhuma mentoria encontrada"
						description="Tente ajustar os filtros para encontrar mentorias."
					/>
				) : (
					<>
						<div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
							{paginated.map((m) => <CardMentoria key={m.id} m={m} />)}
						</div>
						<Pagination
							currentPage={currentPage}
							totalPages={totalPages}
							onPageChange={setCurrentPage}
						/>
						<div className="text-center text-sm text-text-secondary mt-4">
							Mostrando {paginated.length} de {filtered.length} mentorias
						</div>
					</>
				)}
			</div>
		</div>
	);
}


