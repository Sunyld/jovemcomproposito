import { useMemo, useState } from 'react';
import { useProfiles } from '../../hooks/useProfiles';
import { useMentorias } from '../../hooks/useMentorias';
import { useInscritos } from '../../hooks/useInscritos';
import { useCategories } from '../../hooks/useCategories';
import DashboardShell from '../../components/dashboard/DashboardShell';
import { Card, Button } from '../../components/ui';
import { 
	Users2, 
	FileText, 
	CheckCircle2, 
	FolderPlus, 
	TrendingUp,
	Download,
	BarChart3,
	UserCheck,
	Eye,
	EyeOff
} from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';
import { toast } from '../../components/Toast';
import jsPDF from 'jspdf';

export default function AdminRelatorios() {
	const { profiles: allProfiles, loading: profilesLoading } = useProfiles();
	const { profiles: mentors } = useProfiles({ role: 'mentor' });
	const { profiles: admins } = useProfiles({ role: 'admin' });
	const { profiles: users } = useProfiles({ role: 'user' });
	const { mentorias: allMentorias, loading: mentoriasLoading } = useMentorias();
	const { mentorias: publishedMentorias } = useMentorias({ published: true });
	const { inscritos: allInscritos, loading: inscritosLoading } = useInscritos();
	const { categories, loading: categoriesLoading } = useCategories();
	const [generatingPDF, setGeneratingPDF] = useState(false);

	const loading = profilesLoading || mentoriasLoading || inscritosLoading || categoriesLoading;

	const stats = useMemo(() => {
		const approvedMentors = mentors.filter((m) => m.is_mentor_approved).length;
		const approvedInscritos = allInscritos.filter((i) => i.has_access).length;
		const pendingInscritos = allInscritos.filter((i) => !i.has_access).length;
		const draftMentorias = allMentorias.filter((m) => !m.published).length;

		return [
			{ 
				icon: Users2, 
				label: 'Total de Usuários', 
				value: allProfiles.length, 
				color: 'text-blue-400',
				details: [
					{ label: 'Usuários', value: users.length },
					{ label: 'Mentores', value: mentors.length },
					{ label: 'Admins', value: admins.length },
				]
			},
			{ 
				icon: UserCheck, 
				label: 'Mentores Aprovados', 
				value: approvedMentors, 
				color: 'text-green-400',
				details: [
					{ label: 'Total de mentores', value: mentors.length },
					{ label: 'Aprovados', value: approvedMentors },
					{ label: 'Pendentes', value: mentors.length - approvedMentors },
				]
			},
			{ 
				icon: FileText, 
				label: 'Total de Mentorias', 
				value: allMentorias.length, 
				color: 'text-purple-400',
				details: [
					{ label: 'Publicadas', value: publishedMentorias.length },
					{ label: 'Rascunhos', value: draftMentorias },
					{ label: 'Total', value: allMentorias.length },
				]
			},
			{ 
				icon: CheckCircle2, 
				label: 'Inscrições', 
				value: allInscritos.length, 
				color: 'text-yellow-400',
				details: [
					{ label: 'Aprovadas', value: approvedInscritos },
					{ label: 'Pendentes', value: pendingInscritos },
					{ label: 'Total', value: allInscritos.length },
				]
			},
			{ 
				icon: FolderPlus, 
				label: 'Categorias', 
				value: categories.length, 
				color: 'text-indigo-400',
				details: []
			},
		];
	}, [allProfiles.length, mentors.length, admins.length, users.length, allMentorias.length, publishedMentorias.length, allInscritos.length, categories.length]);

	const recentMentorias = useMemo(() => {
		return allMentorias
			.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
			.slice(0, 10);
	}, [allMentorias]);

	const recentInscritos = useMemo(() => {
		return allInscritos
			.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
			.slice(0, 10);
	}, [allInscritos]);

	const handleExportPDF = async () => {
		setGeneratingPDF(true);
		try {
			const doc = new jsPDF();
			let yPos = 20;

			// Título
			doc.setFontSize(20);
			doc.setTextColor(124, 92, 255); // Purple
			doc.text('Relatório de Estatísticas', 20, yPos);
			yPos += 10;

			// Data
			doc.setFontSize(10);
			doc.setTextColor(100, 100, 100);
			doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')} ${new Date().toLocaleTimeString('pt-BR')}`, 20, yPos);
			yPos += 15;

			// Estatísticas principais
			doc.setFontSize(16);
			doc.setTextColor(0, 0, 0);
			doc.text('Estatísticas Principais', 20, yPos);
			yPos += 10;

			doc.setFontSize(11);
			stats.forEach((stat) => {
				doc.setTextColor(0, 0, 0);
				doc.text(`${stat.label}: ${stat.value}`, 25, yPos);
				yPos += 7;
				
				if (stat.details && stat.details.length > 0) {
					stat.details.forEach((detail) => {
						doc.setFontSize(9);
						doc.setTextColor(100, 100, 100);
						doc.text(`  - ${detail.label}: ${detail.value}`, 30, yPos);
						yPos += 6;
					});
				}
				yPos += 3;
			});

			// Nova página para mentorias
			doc.addPage();
			yPos = 20;
			doc.setFontSize(16);
			doc.setTextColor(0, 0, 0);
			doc.text('Últimas Mentorias Criadas', 20, yPos);
			yPos += 10;

			doc.setFontSize(10);
			recentMentorias.forEach((mentoria, index) => {
				if (yPos > 270) {
					doc.addPage();
					yPos = 20;
				}
				doc.setTextColor(0, 0, 0);
				doc.text(`${index + 1}. ${mentoria.title}`, 25, yPos);
				yPos += 6;
				doc.setFontSize(9);
				doc.setTextColor(100, 100, 100);
				doc.text(`   Status: ${mentoria.published ? 'Publicada' : 'Rascunho'} | Tipo: ${mentoria.type} | Preço: ${mentoria.price === 0 ? 'Grátis' : `MZN ${mentoria.price}`}`, 25, yPos);
				yPos += 6;
				doc.text(`   Criada em: ${new Date(mentoria.created_at).toLocaleDateString('pt-BR')}`, 25, yPos);
				yPos += 8;
			});

			// Nova página para inscrições
			doc.addPage();
			yPos = 20;
			doc.setFontSize(16);
			doc.setTextColor(0, 0, 0);
			doc.text('Últimas Inscrições', 20, yPos);
			yPos += 10;

			doc.setFontSize(10);
			recentInscritos.forEach((inscrito, index) => {
				if (yPos > 270) {
					doc.addPage();
					yPos = 20;
				}
				doc.setTextColor(0, 0, 0);
				doc.text(`${index + 1}. Inscrição #${inscrito.id.substring(0, 8)}`, 25, yPos);
				yPos += 6;
				doc.setFontSize(9);
				doc.setTextColor(100, 100, 100);
				doc.text(`   Status: ${inscrito.has_access ? 'Aprovada' : 'Pendente'} | Pagamento: ${inscrito.payment_status}`, 25, yPos);
				yPos += 6;
				doc.text(`   Data: ${new Date(inscrito.created_at).toLocaleDateString('pt-BR')}`, 25, yPos);
				yPos += 8;
			});

			// Salvar PDF
			const fileName = `relatorio-${new Date().toISOString().split('T')[0]}.pdf`;
			doc.save(fileName);

			toast({
				title: 'PDF gerado com sucesso!',
				description: 'O relatório foi baixado.',
				variant: 'success',
			});
		} catch (err: any) {
			toast({
				title: 'Erro ao gerar PDF',
				description: err.message || 'Não foi possível gerar o relatório.',
				variant: 'error',
			});
		} finally {
			setGeneratingPDF(false);
		}
	};

	if (loading) {
		return (
			<DashboardShell role="admin" title="Relatórios" subtitle="Estatísticas e dados da plataforma.">
				<LoadingSpinner size="lg" className="py-12" />
			</DashboardShell>
		);
	}

	return (
		<DashboardShell role="admin" title="Relatórios" subtitle="Estatísticas e dados da plataforma.">
			<div className="space-y-6">
				{/* Botão de exportação */}
				<div className="flex justify-end">
					<Button
						variant="primary"
						size="md"
						icon={<Download size={16} />}
						onClick={handleExportPDF}
						loading={generatingPDF}
						disabled={generatingPDF}
					>
						Exportar PDF
					</Button>
				</div>

				{/* Estatísticas principais */}
				<section>
					<h2 className="text-xl font-semibold text-text-primary mb-4">Estatísticas Principais</h2>
					<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
						{stats.map((stat) => {
							const Icon = stat.icon;
							return (
								<Card key={stat.label} padding="md" hover>
									<div className="space-y-3">
										<div className="flex items-center gap-3">
											<div className={`h-10 w-10 rounded-lg bg-card-glow flex items-center justify-center flex-shrink-0 ${stat.color}`}>
												<Icon size={18} />
											</div>
											<div className="min-w-0 flex-1">
												<div className="text-sm text-text-secondary">{stat.label}</div>
												<div className={`text-2xl font-semibold ${stat.color}`}>{stat.value}</div>
											</div>
										</div>
										{stat.details && stat.details.length > 0 && (
											<div className="pt-2 border-t border-border space-y-1">
												{stat.details.map((detail) => (
													<div key={detail.label} className="flex justify-between text-xs">
														<span className="text-text-secondary">{detail.label}:</span>
														<span className="text-text-primary font-medium">{detail.value}</span>
													</div>
												))}
											</div>
										)}
									</div>
								</Card>
							);
						})}
					</div>
				</section>

				{/* Últimas mentorias */}
				<section>
					<h2 className="text-xl font-semibold text-text-primary mb-4">Últimas Mentorias Criadas</h2>
					<Card padding="md">
						<div className="overflow-x-auto">
							<table className="w-full">
								<thead className="bg-surface/50 border-b border-border">
									<tr>
										<th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase">Título</th>
										<th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase">Tipo</th>
										<th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase">Preço</th>
										<th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase">Status</th>
										<th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase">Data</th>
									</tr>
								</thead>
								<tbody className="divide-y divide-border">
									{recentMentorias.length === 0 ? (
										<tr>
											<td colSpan={5} className="px-4 py-8 text-center text-text-secondary">
												Nenhuma mentoria encontrada
											</td>
										</tr>
									) : (
										recentMentorias.map((mentoria) => (
											<tr key={mentoria.id} className="hover:bg-surface/50">
												<td className="px-4 py-3 text-sm text-text-primary">{mentoria.title}</td>
												<td className="px-4 py-3 text-sm text-text-secondary capitalize">{mentoria.type}</td>
												<td className="px-4 py-3 text-sm text-text-primary">
													{mentoria.price === 0 ? 'Grátis' : `MZN ${mentoria.price}`}
												</td>
												<td className="px-4 py-3">
													{mentoria.published ? (
														<span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400">
															<Eye size={12} />
															Publicada
														</span>
													) : (
														<span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-400">
															<EyeOff size={12} />
															Rascunho
														</span>
													)}
												</td>
												<td className="px-4 py-3 text-sm text-text-secondary">
													{new Date(mentoria.created_at).toLocaleDateString('pt-BR')}
												</td>
											</tr>
										))
									)}
								</tbody>
							</table>
						</div>
					</Card>
				</section>

				{/* Últimas inscrições */}
				<section>
					<h2 className="text-xl font-semibold text-text-primary mb-4">Últimas Inscrições</h2>
					<Card padding="md">
						<div className="overflow-x-auto">
							<table className="w-full">
								<thead className="bg-surface/50 border-b border-border">
									<tr>
										<th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase">ID</th>
										<th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase">Status</th>
										<th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase">Pagamento</th>
										<th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase">Data</th>
									</tr>
								</thead>
								<tbody className="divide-y divide-border">
									{recentInscritos.length === 0 ? (
										<tr>
											<td colSpan={4} className="px-4 py-8 text-center text-text-secondary">
												Nenhuma inscrição encontrada
											</td>
										</tr>
									) : (
										recentInscritos.map((inscrito) => (
											<tr key={inscrito.id} className="hover:bg-surface/50">
												<td className="px-4 py-3 text-sm text-text-primary font-mono">
													{inscrito.id.substring(0, 8)}...
												</td>
												<td className="px-4 py-3">
													{inscrito.has_access ? (
														<span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400">
															<CheckCircle2 size={12} />
															Aprovada
														</span>
													) : (
														<span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-400">
															Pendente
														</span>
													)}
												</td>
												<td className="px-4 py-3 text-sm text-text-secondary capitalize">
													{inscrito.payment_status}
												</td>
												<td className="px-4 py-3 text-sm text-text-secondary">
													{new Date(inscrito.created_at).toLocaleDateString('pt-BR')}
												</td>
											</tr>
										))
									)}
								</tbody>
							</table>
						</div>
					</Card>
				</section>
			</div>
		</DashboardShell>
	);
}

