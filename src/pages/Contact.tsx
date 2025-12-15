import { useState } from 'react';
import { toast } from '../components/Toast';
import { Mail, Send } from 'lucide-react';

export default function Contact() {
	const [formData, setFormData] = useState({
		name: '',
		email: '',
		subject: '',
		message: '',
	});
	const [loading, setLoading] = useState(false);

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		
		if (!formData.name || !formData.email || !formData.subject || !formData.message) {
			toast({ title: 'Erro', description: 'Preencha todos os campos.', variant: 'error' });
			return;
		}

		setLoading(true);
		try {
			// Create mailto link as fallback (since we don't have email service configured)
			const mailtoLink = `mailto:contato@jovemcomproposito.com?subject=${encodeURIComponent(formData.subject)}&body=${encodeURIComponent(`Nome: ${formData.name}\nEmail: ${formData.email}\n\nMensagem:\n${formData.message}`)}`;
			window.location.href = mailtoLink;
			
			// Show success message
			toast({ title: 'Mensagem enviada', description: 'Seu cliente de email será aberto para enviar a mensagem.', variant: 'success' });
			
			// Reset form
			setFormData({ name: '', email: '', subject: '', message: '' });
		} catch (err: any) {
			toast({ title: 'Erro', description: 'Não foi possível enviar a mensagem. Tente novamente.', variant: 'error' });
		} finally {
			setLoading(false);
		}
	}

	return (
		<div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12 space-y-6">
			<section className="rounded-3xl border border-white/10 bg-white/[0.03] p-8 shadow-soft-3d">
				<h1 className="text-3xl font-display">Fale com a equipe Jovem com Propósito</h1>
				<p className="text-text-secondary mt-3">
					Tem dúvidas sobre planos, quer apresentar um projeto ou deseja se tornar mentor? Preencha o formulário abaixo ou envie um e-mail diretamente.
				</p>
				<form onSubmit={handleSubmit} className="mt-6 grid gap-4">
					<input
						className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 outline-none focus:border-purple text-text-primary placeholder:text-text-secondary"
						placeholder="Nome completo"
						value={formData.name}
						onChange={(e) => setFormData({ ...formData, name: e.target.value })}
						required
					/>
					<input
						className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 outline-none focus:border-purple text-text-primary placeholder:text-text-secondary"
						placeholder="Email"
						type="email"
						value={formData.email}
						onChange={(e) => setFormData({ ...formData, email: e.target.value })}
						required
					/>
					<select
						className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 outline-none focus:border-purple text-text-primary"
						value={formData.subject}
						onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
						required
					>
						<option value="">Assunto</option>
						<option value="Quero ser mentor">Quero ser mentor</option>
						<option value="Parcerias">Parcerias</option>
						<option value="Dúvidas gerais">Dúvidas gerais</option>
					</select>
					<textarea
						className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 outline-none focus:border-purple min-h-36 text-text-primary placeholder:text-text-secondary"
						placeholder="Mensagem"
						value={formData.message}
						onChange={(e) => setFormData({ ...formData, message: e.target.value })}
						required
					/>
					<button
						type="submit"
						disabled={loading}
						className="px-6 py-3 rounded-xl bg-purple text-background w-full sm:w-auto hover:bg-purple-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 justify-center"
					>
						{loading ? (
							<>Enviando...</>
						) : (
							<>
								<Send size={16} /> Enviar mensagem
							</>
						)}
					</button>
				</form>
			</section>
			<section className="rounded-3xl border border-white/10 bg-white/[0.02] p-6 text-sm text-text-secondary">
				<div className="flex items-center gap-2">
					<Mail size={16} />
					<span>Contato direto: <a href="mailto:contato@jovemcomproposito.com" className="text-text-primary underline">contato@jovemcomproposito.com</a></span>
				</div>
				<div className="mt-2">Suporte: segunda a sexta, 09h às 18h (GMT+3)</div>
			</section>
		</div>
	);
}



