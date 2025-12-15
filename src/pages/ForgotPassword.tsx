import { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { Input, Button, Card } from '../components/ui';
import { Mail, ArrowLeft } from 'lucide-react';
import { toast } from '../components/Toast';

export default function ForgotPassword() {
	const [email, setEmail] = useState('');
	const [loading, setLoading] = useState(false);
	const [sent, setSent] = useState(false);

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		setLoading(true);

		try {
			const { error } = await supabase.auth.resetPasswordForEmail(email, {
				redirectTo: `${window.location.origin}/reset-password`,
			});

			if (error) throw error;

			setSent(true);
			toast({ title: 'Email enviado', description: 'Verifique sua caixa de entrada para redefinir sua senha.', variant: 'success' });
		} catch (err: any) {
			toast({ title: 'Erro', description: err.message, variant: 'error' });
		} finally {
			setLoading(false);
		}
	}

	if (sent) {
		return (
			<div className="min-h-screen bg-background text-text-primary flex items-center justify-center px-4 py-16">
				<Card padding="lg" variant="elevated" className="w-full max-w-md text-center">
					<div className="h-16 w-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
						<Mail className="h-8 w-8 text-green-400" aria-hidden="true" />
					</div>
					<h1 className="font-display text-2xl mb-2 text-text-primary">Email enviado!</h1>
					<p className="text-text-secondary mb-6">
						Enviamos um link para redefinir sua senha para <strong className="text-text-primary">{email}</strong>. Verifique sua caixa de entrada.
					</p>
					<Link to="/login" className="inline-flex items-center gap-2 text-purple hover:text-purple-light transition-colors">
						<ArrowLeft size={16} aria-hidden="true" /> Voltar ao login
					</Link>
				</Card>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-background text-text-primary flex items-center justify-center px-4 py-16">
			<Card padding="lg" variant="elevated" className="w-full max-w-md">
				<div className="mb-6">
					<h1 className="font-display text-2xl mb-2 text-text-primary">Recuperar senha</h1>
					<p className="text-text-secondary">Digite seu email e enviaremos um link para redefinir sua senha.</p>
				</div>
				<form onSubmit={handleSubmit} className="space-y-5">
					<Input
						label="Email"
						type="email"
						placeholder="seu@email.com"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						leftIcon={<Mail size={18} />}
						required
					/>
					<Button
						type="submit"
						variant="primary"
						size="lg"
						fullWidth
						loading={loading}
						disabled={loading}
					>
						Enviar link
					</Button>
				</form>
				<div className="mt-6 text-sm text-text-secondary text-center">
					<Link to="/login" className="text-purple hover:text-purple-light inline-flex items-center gap-1 transition-colors">
						<ArrowLeft size={14} aria-hidden="true" /> Voltar ao login
					</Link>
				</div>
			</Card>
		</div>
	);
}







