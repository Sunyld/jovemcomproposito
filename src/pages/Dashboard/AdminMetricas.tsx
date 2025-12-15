import DashboardShell from '../../components/dashboard/DashboardShell';
import { useProfiles } from '../../hooks/useProfiles';
import { useMentorias } from '../../hooks/useMentorias';
import { useCategories } from '../../hooks/useCategories';
import { useMemo } from 'react';
import { BarChart3, TrendingUp, Users2, FolderPlus, CheckCircle2 } from 'lucide-react';

export default function AdminMetricas() {
	const { profiles } = useProfiles();
	const { mentorias } = useMentorias({ published: true });
	const { categories } = useCategories();

	const stats = useMemo(
		() => [
			{ icon: Users2, label: 'Usuários ativos', value: profiles.length, color: 'text-blue-400' },
			{ icon: CheckCircle2, label: 'Mentorias publicadas', value: mentorias.length, color: 'text-green-400' },
			{ icon: FolderPlus, label: 'Categorias', value: categories.length, color: 'text-purple-400' },
			{ icon: BarChart3, label: 'Taxa de aprovação', value: `${Math.min(100, Math.round((mentorias.length / Math.max(1, profiles.length)) * 100))}%`, color: 'text-yellow-400' },
			{ icon: TrendingUp, label: 'Crescimento', value: '+12% este mês', color: 'text-emerald-400' },
		],
		[profiles.length, mentorias.length, categories.length]
	);

	return (
		<DashboardShell role="admin" title="Métricas e Estatísticas" subtitle="Acompanhe os principais indicadores do ecossistema Jovem com Propósito.">
			<section className="space-y-6">
				<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
					{stats.map((stat) => {
						const Icon = stat.icon;
						return (
							<div key={stat.label} className="rounded-2xl border border-border bg-surface p-5 hover:bg-surface/80 transition">
								<div className="flex items-center gap-3">
									<div className={`h-10 w-10 rounded-lg bg-card-glow flex items-center justify-center ${stat.color}`}>
										<Icon size={18} />
									</div>
									<div>
										<div className="text-sm text-text-secondary">{stat.label}</div>
										<div className={`text-xl font-semibold ${stat.color}`}>{stat.value}</div>
									</div>
								</div>
							</div>
						);
					})}
				</div>

			</section>
		</DashboardShell>
	);
}



