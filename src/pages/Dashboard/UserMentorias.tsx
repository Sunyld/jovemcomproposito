import DashboardShell from '../../components/dashboard/DashboardShell';
import { useUserInscricoes } from '../../hooks/useInscritos';
import { useMentoria } from '../../hooks/useMentorias';
import { getSignedUrl } from '../../hooks/useStorage';
import { toast } from '../../components/Toast';
import { Card, Button } from '../../components/ui';
import { Download, CheckCircle2, Clock, FileText, ExternalLink } from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import { useState } from 'react';

export default function UserMentorias() {
	const { inscritos, loading } = useUserInscricoes();

	const approvedInscritos = inscritos.filter((i) => i.has_access);

	if (loading) {
		return (
			<DashboardShell role="user" title="Minhas Mentorias" subtitle="Mentorias onde você está inscrito e tem acesso.">
				<LoadingSpinner size="lg" className="py-12" />
			</DashboardShell>
		);
	}

	return (
		<DashboardShell role="user" title="Minhas Mentorias" subtitle="Mentorias onde você está inscrito e tem acesso.">
			{approvedInscritos.length === 0 ? (
				<EmptyState
					icon={FileText}
					title="Nenhuma mentoria acessível"
					description="Você ainda não tem acesso a nenhuma mentoria. Explore as mentorias disponíveis e faça sua inscrição."
				/>
			) : (
				<div className="grid gap-4">
					{approvedInscritos.map((inscrito) => (
						<MentoriaCard key={inscrito.id} inscrito={inscrito} />
					))}
				</div>
			)}
		</DashboardShell>
	);
}

function MentoriaCard({ inscrito }: { inscrito: any }) {
	const { mentoria, loading } = useMentoria(inscrito.mentoria_id);
	const [downloading, setDownloading] = useState(false);

	if (loading) {
		return (
			<div className="rounded-2xl border border-border bg-surface p-6 sm:p-8">
				<LoadingSpinner size="md" />
			</div>
		);
	}

	if (!mentoria) return null;

	const handleDownload = async () => {
		if (!mentoria.document_path) {
			toast({ title: 'Sem documento', description: 'Esta mentoria não possui documento para download.', variant: 'info' });
			return;
		}

		setDownloading(true);
		try {
			const url = await getSignedUrl('mentorias-docs', mentoria.document_path, 3600);
			const link = document.createElement('a');
			link.href = url;
			link.download = mentoria.title;
			link.click();
			toast({ title: 'Download iniciado', variant: 'success' });
		} catch (err: any) {
			toast({ title: 'Erro ao baixar', description: err.message, variant: 'error' });
		} finally {
			setDownloading(false);
		}
	};

	return (
		<Card padding="md" hover className="overflow-hidden">
			<div className="flex flex-col sm:flex-row items-start gap-4">
				{mentoria.cover_url && (
					<img 
						src={mentoria.cover_url} 
						alt={mentoria.title} 
						className="w-full sm:w-24 h-48 sm:h-24 rounded-xl object-cover flex-shrink-0" 
					/>
				)}
				<div className="flex-1 min-w-0 w-full">
					<div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-3">
						<div className="flex-1 min-w-0">
							<h3 className="font-semibold text-base sm:text-lg text-text-primary">{mentoria.title}</h3>
							<p className="text-sm text-text-secondary mt-1 line-clamp-2">{mentoria.description}</p>
						</div>
						<span className="px-3 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400 flex items-center gap-1 whitespace-nowrap flex-shrink-0 self-start sm:self-auto">
							<CheckCircle2 size={12} aria-hidden="true" /> Acesso liberado
						</span>
					</div>
					<div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-4">
						{mentoria.external_link && (
							<a
								href={mentoria.external_link}
								target="_blank"
								rel="noopener noreferrer"
								className="inline-block"
							>
								<Button
									variant="secondary"
									size="sm"
									icon={<ExternalLink size={14} />}
								>
									<span className="hidden sm:inline">Acessar encontro</span>
									<span className="sm:hidden">Encontro</span>
								</Button>
							</a>
						)}
						{mentoria.document_path && (
							<Button
								variant="primary"
								size="sm"
								onClick={handleDownload}
								disabled={downloading}
								loading={downloading}
								icon={<Download size={14} />}
							>
								<span className="hidden sm:inline">Baixar documento</span>
								<span className="sm:hidden">Baixar</span>
							</Button>
						)}
					</div>
				</div>
			</div>
		</Card>
	);
}

