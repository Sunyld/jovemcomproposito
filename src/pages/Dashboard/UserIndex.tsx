import { useAuth } from '../../hooks/useAuth';
import { useState } from 'react';
import DashboardShell from '../../components/dashboard/DashboardShell';
import { useMentorias } from '../../hooks/useMentorias';
import { useUserInscricoes } from '../../hooks/useInscritos';
import CardMentoria from '../../components/CardMentoria';
import DevocionalCard from '../../components/DevocionalCard';
import { Card, Input, Button } from '../../components/ui';
import { BookOpen, Download, Bell } from 'lucide-react';
import { toast } from '../../components/Toast';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';

export default function UserIndex() {
	const { user, profile, updateProfile } = useAuth();
	const { mentorias, loading: mentoriasLoading } = useMentorias({ published: true });
	const { inscritos } = useUserInscricoes();
	const [fullName, setFullName] = useState(profile?.full_name ?? '');
	const [saving, setSaving] = useState(false);

	const stats = [
		{ icon: BookOpen, label: 'Mentorias inscritas', value: inscritos.filter((i) => i.has_access).length },
		{ icon: Download, label: 'Downloads disponíveis', value: inscritos.filter((i) => i.has_access).length },
		{ icon: Bell, label: 'Inscrições pendentes', value: inscritos.filter((i) => !i.has_access).length },
	];

	const handleSave = async () => {
		if (!user || !fullName.trim()) {
			toast({ title: 'Erro', description: 'Preencha o nome completo.', variant: 'error' });
			return;
		}

		setSaving(true);
		try {
			await updateProfile({ full_name: fullName.trim() });
		} catch (err) {
			// Error already handled
		} finally {
			setSaving(false);
		}
	};

	return (
		<DashboardShell role="user" title="Visão geral" subtitle="Acompanhe suas mentorias e atualize seus dados.">
			<div className="grid gap-4 sm:grid-cols-3">
				{stats.map((card) => {
					const Icon = card.icon;
					return (
						<Card key={card.label} padding="md" hover>
							<div className="flex items-center gap-3">
								<div className="h-10 w-10 rounded-lg bg-card-glow flex items-center justify-center text-text-primary flex-shrink-0">
									<Icon size={18} />
								</div>
								<div className="min-w-0">
									<div className="text-sm text-text-secondary">{card.label}</div>
									<div className="text-xl font-semibold text-text-primary">{card.value}</div>
								</div>
							</div>
						</Card>
					);
				})}
			</div>
			<div className="grid gap-6 sm:grid-cols-2">
				<Card title="Dados" padding="md">
					<div className="space-y-4 mt-4">
						<Input
							placeholder="Nome completo"
							value={fullName}
							onChange={(e) => setFullName(e.target.value)}
						/>
						<Input
							placeholder="Email"
							value={user?.email || ''}
							readOnly
							className="text-text-secondary"
						/>
						<Button
							onClick={handleSave}
							disabled={saving}
							loading={saving}
							variant="primary"
							size="md"
							className="w-full sm:w-auto"
						>
							Salvar
						</Button>
					</div>
				</Card>
				<Card title="Preferências" padding="md">
					<p className="text-sm text-text-secondary mt-2">Gerencie suas preferências no menu Perfil.</p>
				</Card>
			</div>
			<div className="space-y-4">
				<h2 className="text-lg font-semibold text-text-primary">Devocional do Dia</h2>
				<DevocionalCard />
			</div>
			<div className="space-y-4">
				<h2 className="text-lg font-semibold text-text-primary">Mentorias disponíveis</h2>
				{mentoriasLoading ? (
					<LoadingSpinner size="lg" className="py-12" />
				) : mentorias.length === 0 ? (
					<EmptyState icon={BookOpen} title="Nenhuma mentoria disponível" description="Em breve teremos mentorias para você." />
				) : (
					<div className="grid gap-4 md:grid-cols-2">
						{mentorias.slice(0, 4).map((m) => (
							<CardMentoria key={m.id} m={m} />
						))}
					</div>
				)}
			</div>
		</DashboardShell>
	);
}


