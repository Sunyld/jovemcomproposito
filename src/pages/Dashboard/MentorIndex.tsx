import { Link } from 'react-router-dom';
import { useMentorMentorias } from '../../hooks/useMentorias';
import { useInscritos } from '../../hooks/useInscritos';
import { useAuth } from '../../hooks/useAuth';
import DashboardShell from '../../components/dashboard/DashboardShell';
import DevocionalCard from '../../components/DevocionalCard';
import { Card, Button } from '../../components/ui';
import { PlusCircle, Edit2, FileText, Users2, Eye } from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';

export default function MentorIndex() {
	const { profile } = useAuth();
	const { mentorias, loading: mentoriasLoading } = useMentorMentorias();
	// Get inscritos for all mentorias - we'll use a single query for all
	const { inscritos: allInscritos } = useInscritos();

	const stats = [
		{ icon: FileText, label: 'Mentorias', value: mentorias.length },
		{ icon: Users2, label: 'Inscrições', value: allInscritos.filter((i) => mentorias.some((m) => m.id === i.mentoria_id)).length },
		{ icon: Eye, label: 'Publicadas', value: mentorias.filter((m) => m.published).length }
	];

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
						<Link key={m.id} to={`/dashboard/mentor/mentorias/${m.id}`} className="block">
							<Card padding="md" hover>
								<div className="flex items-start justify-between">
									<div className="flex-1 min-w-0">
										<div className="font-medium text-text-primary truncate">{m.title}</div>
										<div className="text-sm text-text-secondary mt-1">{m.price === 0 ? 'Grátis' : `MZN ${m.price}`}</div>
										<div className="text-xs text-text-secondary mt-1">
											{m.published ? 'Publicada' : 'Rascunho'}
										</div>
									</div>
									<Edit2 size={14} className="text-text-secondary flex-shrink-0 ml-2" />
								</div>
							</Card>
						</Link>
					))}
				</div>
				)}
			</div>
		</DashboardShell>
	);
}


