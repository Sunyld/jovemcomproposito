import { useParams } from 'react-router-dom';
import { useMentoria } from '../hooks/useMentorias';
import { useProfile } from '../hooks/useProfiles';
import { createInscricao } from '../hooks/useInscritos';
import { getSignedUrl } from '../hooks/useStorage';
import { useUserInscricoes } from '../hooks/useInscritos';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import { useState } from 'react';
import { toast } from '../components/Toast';
import { useAuth } from '../hooks/useAuth';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';

export default function MentoriaPage() {
	const { id } = useParams();
	const { mentoria, loading: mentoriaLoading } = useMentoria(id);
	const { profile: mentorProfile, loading: mentorLoading } = useProfile(mentoria?.mentor_id);
	const { inscritos: userInscricoes } = useUserInscricoes();
	const [confirmOpen, setConfirmOpen] = useState(false);
	const [contact, setContact] = useState(false);
	const [submitting, setSubmitting] = useState(false);
	const [downloading, setDownloading] = useState(false);
	const { user } = useAuth();

	if (mentoriaLoading || mentorLoading) {
		return (
			<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
				<LoadingSpinner size="lg" />
			</div>
		);
	}

	if (!mentoria) {
		return (
			<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
				<EmptyState title="Mentoria não encontrada" description="A mentoria que você está procurando não existe ou foi removida." />
			</div>
		);
	}

	const isFree = mentoria.price === 0;
	const userInscricao = userInscricoes.find((i) => i.mentoria_id === mentoria.id);
	const hasAccess = userInscricao?.has_access || false;

	async function handleDownload() {
		if (!user) {
			toast({ title: 'Acesso restrito', description: 'Faça login para baixar materiais', variant: 'error' });
			return;
		}

		if (!hasAccess) {
			toast({ title: 'Acesso negado', description: 'Você precisa estar inscrito e aprovado para baixar este documento.', variant: 'error' });
			return;
		}

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
	}

	async function handleInscricao() {
		if (!user) {
			toast({ title: 'Acesso restrito', description: 'Faça login para se inscrever', variant: 'error' });
			return;
		}

		setSubmitting(true);
		try {
			await createInscricao(mentoria.id);
			setConfirmOpen(false);
			toast({ 
				title: 'Pedido enviado com sucesso', 
				description: 'O mentor será notificado sobre sua solicitação.', 
				variant: 'success' 
			});
		} catch (err) {
			// Error already handled in hook
		} finally {
			setSubmitting(false);
		}
	}

	return (
		<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 grid lg:grid-cols-3 gap-8">
			<div className="lg:col-span-2">
				<img src={mentoria.cover_url} alt={mentoria.title} className="w-full rounded-2xl border border-border object-cover max-h-[360px]" />
				<h1 className="mt-4 text-2xl font-display text-text-primary">{mentoria.title}</h1>
				<p className="text-text-secondary mt-2">{mentoria.description}</p>
				<div className="mt-6 space-y-3">
					<h3 className="font-medium text-text-primary">Downloads</h3>
					<button onClick={handleDownload} className="px-4 py-2 rounded-lg border border-border hover:border-purple transition-colors text-text-primary">
						Baixar documento
					</button>
				</div>
			</div>
			<aside className="lg:col-span-1">
				<div className="rounded-2xl border border-border p-4 bg-surface">
					<div className="flex items-center gap-3">
						{mentorProfile?.avatar_url ? (
							<img src={mentorProfile.avatar_url} alt={mentorProfile.full_name || 'Mentor'} className="h-12 w-12 rounded-full object-cover" />
						) : (
							<div className="h-12 w-12 rounded-full bg-card-glow flex items-center justify-center text-sm font-medium uppercase">
								{mentorProfile?.full_name?.[0] || 'M'}
							</div>
						)}
						<div>
							<div className="font-medium text-text-primary">{mentorProfile?.full_name || 'Mentor'}</div>
							<div className="text-xs text-text-secondary">Mentor</div>
						</div>
					</div>
					<div className="mt-4">
						<div className="text-sm text-text-secondary">Preço</div>
						<div className="text-lg font-medium text-text-primary">{isFree ? 'Grátis' : `MZN ${mentoria.price}`}</div>
						{hasAccess && (
							<div className="mt-2 text-xs text-success">✓ Você tem acesso a esta mentoria</div>
						)}
						<div className="mt-4 flex flex-col gap-2">
							{!userInscricao ? (
								<button onClick={() => setConfirmOpen(true)} className="w-full px-4 py-2 rounded-lg bg-purple text-white hover:bg-purple-light transition-colors">
									Pedir para participar da mentoria
								</button>
							) : hasAccess ? (
								<button
									onClick={handleDownload}
									disabled={downloading || !mentoria.document_path}
									className="w-full px-4 py-2 rounded-lg bg-purple text-white disabled:opacity-50 hover:bg-purple-light transition-colors"
								>
									{downloading ? 'Baixando...' : 'Baixar documento'}
								</button>
							) : (
								<button disabled className="w-full px-4 py-2 rounded-lg border border-border opacity-50 text-text-primary">
									Aguardando aprovação
								</button>
							)}
							{!isFree && !hasAccess && (
								<button onClick={() => setContact(true)} className="w-full px-4 py-2 rounded-lg border border-border hover:border-purple transition-colors text-text-primary">
									Contactar mentor
								</button>
							)}
						</div>
					</div>
				</div>
			</aside>
			<ConfirmDialog
				open={confirmOpen}
				onClose={() => setConfirmOpen(false)}
				onConfirm={handleInscricao}
				title="Confirmar participação"
				description="Tem certeza que deseja solicitar participação nesta mentoria?"
				confirmText="Confirmar"
				cancelText="Cancelar"
				loading={submitting}
			/>
			<Modal title="Contactar mentor" open={contact} onClose={() => setContact(false)}>
				<p className="text-sm text-text-secondary">Entre em contato com {mentorProfile?.full_name || 'o mentor'} para finalizar a inscrição.</p>
				<div className="mt-3 rounded-xl bg-surface border border-border p-4 text-sm">
					<p className="text-text-secondary">Para mentorias pagas, entre em contato diretamente com o mentor para acertar os detalhes do pagamento.</p>
				</div>
			</Modal>
		</div>
	);
}


