import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { Mail, CheckCircle, ArrowLeft } from 'lucide-react';
import { toast } from '../components/Toast';

export default function VerifyEmail() {
	const [loading, setLoading] = useState(false);
	const [resent, setResent] = useState(false);
	const [searchParams] = useSearchParams();
	const email = searchParams.get('email');

	async function handleResend() {
		if (!email) {
			toast({ title: 'Erro', description: 'Email não encontrado.', variant: 'error' });
			return;
		}

		setLoading(true);
		try {
			const { error } = await supabase.auth.resend({
				type: 'signup',
				email,
			});

			if (error) throw error;

			setResent(true);
			toast({ title: 'Email reenviado', description: 'Verifique sua caixa de entrada.', variant: 'success' });
		} catch (err: any) {
			toast({ title: 'Erro', description: err.message, variant: 'error' });
		} finally {
			setLoading(false);
		}
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-[#0B0B10] via-[#111126] to-[#141429] text-text-primary flex items-center justify-center px-4 py-16">
			<div className="w-full max-w-md rounded-[32px] border border-white/10 bg-white/[0.04] backdrop-blur-md p-6 sm:p-10 shadow-soft-3d">
				<div className="text-center">
					<div className="h-16 w-16 rounded-full bg-purple/20 flex items-center justify-center mx-auto mb-4">
						<Mail className="h-8 w-8 text-purple" />
					</div>
					<h1 className="font-display text-2xl mb-2">Verifique seu email</h1>
					<p className="text-text-secondary mb-6">
						{email ? (
							<>
								Enviamos um link de verificação para <strong>{email}</strong>. Clique no link para confirmar sua conta.
							</>
						) : (
							'Enviamos um link de verificação para seu email. Clique no link para confirmar sua conta.'
						)}
					</p>
					{email && (
						<button
							onClick={handleResend}
							disabled={loading || resent}
							className="w-full px-4 py-2 rounded-xl border border-white/10 hover:border-white/20 mb-4"
						>
							{loading ? 'Enviando...' : resent ? 'Email reenviado!' : 'Reenviar email'}
						</button>
					)}
					<Link to="/login" className="inline-flex items-center gap-2 text-purple hover:text-purple-light">
						<ArrowLeft size={16} /> Voltar ao login
					</Link>
				</div>
			</div>
		</div>
	);
}








