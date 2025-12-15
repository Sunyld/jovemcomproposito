import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { Input, Button, Card } from '../components/ui';
import PasswordInput from '../components/PasswordInput';
import { Lock, CheckCircle } from 'lucide-react';
import { toast } from '../components/Toast';

export default function ResetPassword() {
	const [password, setPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [loading, setLoading] = useState(false);
	const [success, setSuccess] = useState(false);
	const navigate = useNavigate();
	const [searchParams] = useSearchParams();

	useEffect(() => {
		// Verificar se há hash na URL (Supabase envia token via hash)
		const hash = window.location.hash;
		if (hash) {
			const params = new URLSearchParams(hash.substring(1));
			const accessToken = params.get('access_token');
			if (accessToken) {
				// Token está na URL, usuário pode prosseguir
			}
		}
	}, []);

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();

		if (password !== confirmPassword) {
			toast({ title: 'Erro', description: 'As senhas não coincidem.', variant: 'error' });
			return;
		}

		if (password.length < 6) {
			toast({ title: 'Erro', description: 'A senha deve ter pelo menos 6 caracteres.', variant: 'error' });
			return;
		}

		setLoading(true);

		try {
			const { error } = await supabase.auth.updateUser({ password });

			if (error) throw error;

			setSuccess(true);
			toast({ title: 'Senha redefinida', description: 'Sua senha foi atualizada com sucesso.', variant: 'success' });

			setTimeout(() => {
				navigate('/login', { replace: true });
			}, 2000);
		} catch (err: any) {
			toast({ title: 'Erro', description: err.message, variant: 'error' });
		} finally {
			setLoading(false);
		}
	}

	if (success) {
		return (
			<div className="min-h-screen bg-background text-text-primary flex items-center justify-center px-4 py-16">
				<Card padding="lg" variant="elevated" className="w-full max-w-md text-center">
					<div className="h-16 w-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
						<CheckCircle className="h-8 w-8 text-green-400" aria-hidden="true" />
					</div>
					<h1 className="font-display text-2xl mb-2 text-text-primary">Senha redefinida!</h1>
					<p className="text-text-secondary">Redirecionando para o login...</p>
				</Card>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-background text-text-primary flex items-center justify-center px-4 py-16">
			<Card padding="lg" variant="elevated" className="w-full max-w-md">
				<div className="mb-6">
					<h1 className="font-display text-2xl mb-2 text-text-primary">Nova senha</h1>
					<p className="text-text-secondary">Digite sua nova senha abaixo.</p>
				</div>
				<form onSubmit={handleSubmit} className="space-y-5">
					<div>
						<label className="block text-sm font-medium text-text-secondary mb-1.5">
							Nova senha
							<span className="text-red-400 ml-1">*</span>
						</label>
						<PasswordInput
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							placeholder="••••••"
							required
							minLength={6}
						/>
					</div>
					<div>
						<label className="block text-sm font-medium text-text-secondary mb-1.5">
							Confirmar senha
							<span className="text-red-400 ml-1">*</span>
						</label>
						<PasswordInput
							value={confirmPassword}
							onChange={(e) => setConfirmPassword(e.target.value)}
							placeholder="••••••"
							required
							minLength={6}
						/>
						{confirmPassword && password !== confirmPassword && (
							<p className="text-xs text-red-400 mt-1.5" role="alert">As senhas não coincidem</p>
						)}
					</div>
					<Button
						type="submit"
						variant="primary"
						size="lg"
						fullWidth
						loading={loading}
						disabled={loading || password !== confirmPassword}
					>
						Redefinir senha
					</Button>
				</form>
			</Card>
		</div>
	);
}







