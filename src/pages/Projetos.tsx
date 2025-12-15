import { useState } from 'react';
import { useProjetos, createProjetoInscricao } from '../hooks/useProjetos';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import Modal from '../components/Modal';
import { Card, Button, Textarea } from '../components/ui';
import { toast } from '../components/Toast';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import { Projeto } from '../lib/types';

export default function Projetos() {
	const { projetos, loading } = useProjetos({ status: 'aberto' });
	const { user } = useAuth();
	const navigate = useNavigate();
	const [selectedProjeto, setSelectedProjeto] = useState<Projeto | null>(null);
	const [message, setMessage] = useState('');
	const [submitting, setSubmitting] = useState(false);
	const [modalOpen, setModalOpen] = useState(false);

	function handleAplicar(projeto: Projeto) {
		if (!user) {
			toast({ title: 'Login necessário', description: 'Faça login para se inscrever em projetos.', variant: 'error' });
			navigate('/login');
			return;
		}
		setSelectedProjeto(projeto);
		setModalOpen(true);
	}

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		if (!selectedProjeto) return;

		setSubmitting(true);
		try {
			await createProjetoInscricao(selectedProjeto.id, message);
			setModalOpen(false);
			setMessage('');
			setSelectedProjeto(null);
		} catch (err) {
			// Error already handled in hook
		} finally {
			setSubmitting(false);
		}
	}

	return (
		<div className="min-h-screen bg-background text-text-primary">
			<section className="relative overflow-hidden py-16">
				<div className="absolute inset-0 pointer-events-none"
					style={{ background: 'radial-gradient(circle at 20% 20%, rgba(124,92,255,0.3), rgba(15,17,22,0) 70%)' }} />
				<div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 relative">
					<p className="text-sm uppercase tracking-widest text-purple">Projetos & Voluntariado</p>
					<h1 className="font-display text-3xl sm:text-4xl mt-3 leading-tight">Conecte sua vocação a iniciativas de impacto</h1>
					<p className="text-text-secondary mt-4 text-lg">
						Participe de iniciativas que conectam mentores, alunos e organizações. Escolha projetos alinhados ao seu propósito e contribua com horas voluntárias, consultorias ou workshops.
					</p>
				</div>
			</section>
			<section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pb-20">
				{loading ? (
					<div className="flex justify-center py-12">
						<LoadingSpinner size="lg" />
					</div>
				) : projetos.length === 0 ? (
					<EmptyState
						title="Nenhum projeto disponível"
						description="Em breve teremos projetos para você participar."
					/>
				) : (
					<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
						{projetos.map((projeto) => (
							<Card key={projeto.id} padding="none" variant="default" className="overflow-hidden hover:bg-surface/80 transition-colors">
								{projeto.cover_url ? (
									<img src={projeto.cover_url} alt={projeto.title} className="h-44 w-full object-cover" loading="lazy" />
								) : (
									<div className="h-44 w-full bg-gradient-to-br from-purple/20 to-purple-light/20 flex items-center justify-center">
										<span className="text-text-secondary text-sm">Sem imagem</span>
									</div>
								)}
								<div className="p-6 flex flex-col gap-3">
									<div className="text-xs uppercase tracking-wider text-purple font-medium">{projeto.type}</div>
									<h3 className="font-semibold text-lg text-text-primary">{projeto.title}</h3>
									<p className="text-sm text-text-secondary flex-1 line-clamp-3">{projeto.description}</p>
									<Button
										variant="ghost"
										size="sm"
										onClick={() => handleAplicar(projeto)}
										className="self-start text-purple hover:text-purple-light"
									>
										Aplicar →
									</Button>
								</div>
							</Card>
						))}
					</div>
				)}
			</section>

			<Modal open={modalOpen} onClose={() => { setModalOpen(false); setMessage(''); setSelectedProjeto(null); }} title="Inscrever-se no Projeto" size="md">
				<form onSubmit={handleSubmit} className="space-y-5">
					<Textarea
						label="Mensagem (opcional)"
						placeholder="Conte-nos por que você quer participar deste projeto..."
						value={message}
						onChange={(e) => setMessage(e.target.value)}
						className="min-h-32"
					/>
					<div className="flex gap-3 pt-2">
						<Button
							type="button"
							variant="secondary"
							size="md"
							fullWidth
							onClick={() => { setModalOpen(false); setMessage(''); setSelectedProjeto(null); }}
						>
							Cancelar
						</Button>
						<Button
							type="submit"
							variant="primary"
							size="md"
							fullWidth
							disabled={submitting}
							loading={submitting}
						>
							Confirmar inscrição
						</Button>
					</div>
				</form>
			</Modal>
		</div>
	);
}



