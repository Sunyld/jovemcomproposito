import { toast } from '../../components/Toast';
import { useMemo, useState, useEffect } from 'react';
import {
	Users2,
	CheckCircle2,
	FolderPlus,
	BarChart3,
	TrendingUp,
	UserPlus,
	Edit,
	Trash2,
	X,
	Shield,
	Ban,
} from 'lucide-react';
import DashboardShell from '../../components/dashboard/DashboardShell';
import DevocionalCard from '../../components/DevocionalCard';
import { Card, Button, Table, TableRow, TableCell, Input } from '../../components/ui';
import { useProfiles, approveMentor, rejectMentor, updateRole } from '../../hooks/useProfiles';
import { useCategories, createCategory, updateCategory, deleteCategory } from '../../hooks/useCategories';
import { useMentorias } from '../../hooks/useMentorias';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabaseClient';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useLocation, useNavigate } from 'react-router-dom';

const donationMethods = [
	{ title: 'M-Pesa', description: 'Conta empresarial', detail: '84 123 4567', reference: 'Jovem c/ Propósito' },
	{ title: 'e-Mola', description: 'Conta pessoal', detail: '86 987 6543', reference: 'JCP Ministry' },
	{ title: 'Conta Bancária', description: 'BCI - NIB', detail: '0002 0034 0000 1234 567 89', reference: 'IBAN: MZ59000200340000123456789' },
	{ title: 'Visa / Mastercard', description: 'Gateway internacional', detail: 'Em breve', reference: 'Solicite link seguro' },
];

export default function AdminIndex() {
	const location = useLocation();
	const navigate = useNavigate();
	const { user: currentUser } = useAuth();
	const { profiles: allProfiles, loading: profilesLoading } = useProfiles();
	const { profiles: mentors } = useProfiles({ role: 'mentor' });
	const { categories } = useCategories();
	const { mentorias } = useMentorias({ published: true });
	const [newCat, setNewCat] = useState('');
	const [editingCat, setEditingCat] = useState<string | null>(null);
	const [editCatName, setEditCatName] = useState('');
	const [donations, setDonations] = useState(donationMethods);
	const [editingDonation, setEditingDonation] = useState<number | null>(null);

	useEffect(() => {
		const hashMap: Record<string, string> = {
			'#admins': '/dashboard/admin/admins',
			'#mentores': '/dashboard/admin/mentores',
			'#categorias': '/dashboard/admin/categorias',
			'#metricas': '/dashboard/admin/metricas',
			'#usuarios': '/dashboard/admin/usuarios',
			'#doacoes': '/dashboard/admin/doacoes',
		};

		if (location.hash && hashMap[location.hash]) {
			navigate(hashMap[location.hash], { replace: true });
		}
	}, [location.hash, navigate]);

	useEffect(() => {
		async function loadDonations() {
			try {
				const { data } = await supabase.from('donations').select('*').order('created_at', { ascending: false });
				if (data && data.length > 0) {
					setDonations(data.map((d) => ({
						title: d.title,
						description: d.description,
						detail: d.detail,
						reference: d.reference,
					})));
				}
			} catch (err) {
				// Error loading donations - use default values
			}
		}
		loadDonations();
	}, []);

	const stats = useMemo(
		() => [
			{ icon: Users2, label: 'Total de usuários', value: allProfiles.length, color: 'text-blue-400' },
			{ icon: CheckCircle2, label: 'Mentores aprovados', value: mentors.filter((m) => m.is_mentor_approved).length, color: 'text-green-400' },
			{ icon: FolderPlus, label: 'Categorias', value: categories.length, color: 'text-purple-400' },
			{ icon: BarChart3, label: 'Mentorias publicadas', value: mentorias.length, color: 'text-yellow-400' },
			{ icon: TrendingUp, label: 'Crescimento mensal', value: '+12%', color: 'text-green-400' },
		],
		[allProfiles.length, mentors.length, categories.length, mentorias.length]
	);

	const handleApproveMentor = async (id: string) => {
		try {
			await approveMentor(id);
		} catch (err) {
			// Error already handled
		}
	};

	const handleRejectMentor = async (id: string) => {
		try {
			await rejectMentor(id);
		} catch (err) {
			// Error already handled
		}
	};

	const handleAddCategory = async () => {
		if (!newCat.trim()) return;
		try {
			await createCategory(newCat.trim());
			setNewCat('');
		} catch (err) {
			// Error already handled
		}
	};

	const handleEditCategory = (id: string) => {
		const cat = categories.find((c) => c.id === id);
		if (cat) {
			setEditingCat(id);
			setEditCatName(cat.name);
		}
	};

	const handleSaveCategory = async () => {
		if (!editingCat || !editCatName.trim()) return;
		try {
			await updateCategory(editingCat, editCatName.trim());
			setEditingCat(null);
			setEditCatName('');
		} catch (err) {
			// Error already handled
		}
	};

	const handleDeleteCategory = async (id: string) => {
		if (!confirm('Tem certeza que deseja deletar esta categoria?')) return;
		try {
			await deleteCategory(id);
		} catch (err) {
			// Error already handled
		}
	};

	const handleToggleAdmin = async (userId: string, currentRole: string) => {
		try {
			const newRole = currentRole === 'admin' ? 'user' : 'admin';
			await updateRole(userId, newRole as any);
		} catch (err) {
			// Error already handled
		}
	};

	const handleEditDonation = (index: number) => {
		setEditingDonation(index);
	};

	const handleSaveDonation = async (index: number) => {
		const donation = donations[index];
		try {
			// Check if donation exists in DB
			const { data: existing } = await supabase.from('donations').select('id').eq('title', donation.title).single();
			
			if (existing) {
				await supabase.from('donations').update({
					title: donation.title,
					description: donation.description,
					detail: donation.detail,
					reference: donation.reference,
				}).eq('id', existing.id);
			} else {
				await supabase.from('donations').insert({
					title: donation.title,
					description: donation.description,
					detail: donation.detail,
					reference: donation.reference,
				});
			}
			setEditingDonation(null);
			toast({ title: 'Doação atualizada', variant: 'success' });
		} catch (err: any) {
			toast({ title: 'Erro ao salvar', description: err.message, variant: 'error' });
		}
	};

	return (
		<DashboardShell role="admin" title="Painel Administrativo" subtitle="Gerencie mentores, categorias, usuários e monitore os indicadores da plataforma.">
			{/* Métricas */}
			<section id="metricas" className="space-y-4">
				<h2 className="text-xl font-semibold text-text-primary">Métricas e Estatísticas</h2>
				<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
					{stats.map((s) => {
						const Icon = s.icon;
						return (
							<Card key={s.label} padding="md" hover>
								<div className="flex items-center gap-3">
									<div className={`h-10 w-10 rounded-lg bg-card-glow flex items-center justify-center flex-shrink-0 ${s.color}`}>
										<Icon size={18} />
									</div>
									<div className="min-w-0">
										<div className="text-sm text-text-secondary">{s.label}</div>
										<div className={`text-xl font-semibold ${s.color}`}>{s.value}</div>
									</div>
								</div>
							</Card>
						);
					})}
				</div>
			</section>

			{/* Gestão de Mentores */}
			<section id="mentores" className="space-y-4">
				<div className="flex items-center justify-between flex-wrap gap-4">
					<h2 className="text-xl font-semibold text-text-primary">Gestão de Mentores</h2>
					<Button
						variant="primary"
						size="md"
						onClick={() => toast({ title: 'Em breve', description: 'Funcionalidade de cadastro de mentores será adicionada.', variant: 'default' })}
						icon={<UserPlus size={16} />}
					>
						Cadastrar Mentor
					</Button>
				</div>
				{profilesLoading ? (
					<LoadingSpinner size="lg" className="py-12" />
				) : (
					<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
						{mentors.map((m) => (
							<Card key={m.id} padding="md" hover>
								<div className="flex items-center gap-3 mb-4">
									{m.avatar_url ? (
										<img src={m.avatar_url} alt={m.full_name || 'Mentor'} className="h-12 w-12 rounded-full object-cover border-2 border-purple/30 flex-shrink-0" />
									) : (
										<div className="h-12 w-12 rounded-full bg-card-glow flex items-center justify-center text-sm font-medium uppercase border-2 border-purple/30 flex-shrink-0">
											{m.full_name?.[0] || 'M'}
										</div>
									)}
									<div className="flex-1 min-w-0">
										<div className="font-medium text-text-primary truncate">{m.full_name || 'Mentor'}</div>
										<div className="text-xs text-text-secondary truncate">{m.bio || 'Mentor'}</div>
									</div>
									{m.is_mentor_approved && <CheckCircle2 size={16} className="text-green-400 flex-shrink-0" />}
								</div>
								<div className="flex gap-2">
									{!m.is_mentor_approved && (
										<>
											<Button
												variant="success"
												size="sm"
												fullWidth
												onClick={() => handleApproveMentor(m.id)}
												icon={<CheckCircle2 size={14} />}
											>
												Aprovar
											</Button>
											<Button
												variant="danger"
												size="sm"
												onClick={() => handleRejectMentor(m.id)}
												icon={<X size={14} />}
											/>
										</>
									)}
									{m.is_mentor_approved && (
										<Button
											variant="secondary"
											size="sm"
											onClick={() => toast({ title: 'Editar mentor', description: 'Funcionalidade em desenvolvimento.', variant: 'default' })}
											icon={<Edit size={14} />}
										/>
									)}
								</div>
							</Card>
						))}
					</div>
				)}
			</section>

			{/* Gestão de Categorias */}
			<section id="categorias" className="space-y-4">
				<h2 className="text-xl font-semibold text-text-primary">Gestão de Categorias</h2>
				<Card padding="md">
					<div className="flex flex-wrap items-center gap-2 mb-4">
						{categories.map((c) => (
							<div key={c.id} className="group relative px-3 py-1.5 rounded-full text-sm bg-surface border border-border flex items-center gap-2 text-text-primary">
								{editingCat === c.id ? (
									<>
										<input
											value={editCatName}
											onChange={(e) => setEditCatName(e.target.value)}
											className="bg-transparent border-none outline-none w-24 text-text-primary"
											autoFocus
											onKeyDown={(e) => {
												if (e.key === 'Enter') handleSaveCategory();
												if (e.key === 'Escape') setEditingCat(null);
											}}
										/>
										<button onClick={handleSaveCategory} className="text-green-400 hover:text-green-300 transition-colors" aria-label="Salvar">
											<CheckCircle2 size={14} />
										</button>
										<button onClick={() => setEditingCat(null)} className="text-red-400 hover:text-red-300 transition-colors" aria-label="Cancelar">
											<X size={14} />
										</button>
									</>
								) : (
									<>
										<span>{c.name}</span>
										<button onClick={() => handleEditCategory(c.id)} className="opacity-0 group-hover:opacity-100 transition" aria-label="Editar categoria">
											<Edit size={12} />
										</button>
										<button onClick={() => handleDeleteCategory(c.id)} className="opacity-0 group-hover:opacity-100 transition text-red-400" aria-label="Deletar categoria">
											<Trash2 size={12} />
										</button>
									</>
								)}
							</div>
						))}
					</div>
					<div className="flex gap-2 flex-wrap">
						<Input
							placeholder="Nova categoria"
							value={newCat}
							onChange={(e) => setNewCat(e.target.value)}
							onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
							className="flex-1 min-w-[200px]"
							fullWidth={false}
						/>
						<Button onClick={handleAddCategory} variant="primary" size="md">
							Adicionar
						</Button>
					</div>
				</Card>
			</section>

			{/* Gestão de Usuários */}
			<section id="usuarios" className="space-y-4">
				<div className="flex items-center justify-between flex-wrap gap-4">
					<h2 className="text-xl font-semibold text-text-primary">Gestão de Usuários</h2>
					<p className="text-sm text-text-secondary">Usuários são criados através do signup. Aqui você pode gerenciar seus perfis.</p>
				</div>
				{profilesLoading ? (
					<LoadingSpinner size="lg" className="py-12" />
				) : (
					<Table
						headers={[
							{ label: 'Nome', align: 'left' },
							{ label: 'Email', align: 'left' },
							{ label: 'Função', align: 'left' },
							{ label: 'Ações', align: 'left' },
						]}
						emptyMessage={allProfiles.length === 0 ? 'Nenhum usuário encontrado' : undefined}
					>
						{allProfiles.map((p) => {
							const isCurrentUser = currentUser?.id === p.id;
							return (
								<TableRow key={p.id}>
									<TableCell>{p.full_name || 'Sem nome'}</TableCell>
									<TableCell className="text-text-secondary">
										{/* Email would need to come from auth.users - for now showing ID */}
										{p.id.slice(0, 8)}...
									</TableCell>
									<TableCell>
										<span className={`px-2 py-1 rounded-full text-xs font-medium ${p.role === 'admin' ? 'bg-purple/20 text-purple' : p.role === 'mentor' ? 'bg-blue-500/20 text-blue-400' : 'bg-surface text-text-secondary'}`}>
											{p.role}
										</span>
									</TableCell>
									<TableCell>
										<div className="flex items-center gap-2">
											{!isCurrentUser && (
												<Button
													variant="ghost"
													size="sm"
													onClick={() => handleToggleAdmin(p.id, p.role)}
													title={p.role === 'admin' ? 'Remover admin' : 'Tornar admin'}
													icon={p.role === 'admin' ? <Shield size={14} className="text-purple" /> : <Ban size={14} />}
												/>
											)}
											{isCurrentUser && <span className="text-xs text-text-secondary/50">Você</span>}
										</div>
									</TableCell>
								</TableRow>
							);
						})}
					</Table>
				)}
			</section>

			{/* Gestão de Doações */}
			<section id="doacoes" className="space-y-4">
				<h2 className="text-xl font-semibold text-text-primary">Gestão de Doações</h2>
				<p className="text-sm text-text-secondary">Edite as informações de doação que aparecem na landing page.</p>
				<div className="grid gap-4 sm:grid-cols-2">
					{donations.map((method, index) => (
						<Card key={index} padding="md" hover={editingDonation !== index}>
							{editingDonation === index ? (
								<div className="space-y-4">
									<Input
										placeholder="Título"
										value={method.title}
										onChange={(e) => setDonations((prev) => prev.map((d, i) => (i === index ? { ...d, title: e.target.value } : d)))}
									/>
									<Input
										placeholder="Descrição"
										value={method.description}
										onChange={(e) => setDonations((prev) => prev.map((d, i) => (i === index ? { ...d, description: e.target.value } : d)))}
									/>
									<Input
										placeholder="Detalhe"
										value={method.detail}
										onChange={(e) => setDonations((prev) => prev.map((d, i) => (i === index ? { ...d, detail: e.target.value } : d)))}
									/>
									<Input
										placeholder="Referência"
										value={method.reference}
										onChange={(e) => setDonations((prev) => prev.map((d, i) => (i === index ? { ...d, reference: e.target.value } : d)))}
									/>
									<div className="flex gap-2">
										<Button
											variant="success"
											size="sm"
											fullWidth
											onClick={() => handleSaveDonation(index)}
											icon={<CheckCircle2 size={14} />}
										>
											Salvar
										</Button>
										<Button
											variant="secondary"
											size="sm"
											onClick={() => setEditingDonation(null)}
											icon={<X size={14} />}
										/>
									</div>
								</div>
							) : (
								<>
									<div className="flex items-center justify-between mb-3">
										<h3 className="font-semibold text-text-primary">{method.title}</h3>
										<Button
											variant="ghost"
											size="sm"
											onClick={() => handleEditDonation(index)}
											icon={<Edit size={14} />}
										/>
									</div>
									<p className="text-xs uppercase tracking-wider text-text-secondary mb-2">{method.description}</p>
									<p className="text-text-secondary mb-1">{method.detail}</p>
									<p className="text-sm text-text-secondary/80">{method.reference}</p>
								</>
							)}
						</Card>
					))}
				</div>
			</section>

			{/* Devocional Ativo */}
			<section className="space-y-4">
				<h2 className="text-xl font-semibold text-text-primary">Devocional Ativo</h2>
				<DevocionalCard />
			</section>
		</DashboardShell>
	);
}
