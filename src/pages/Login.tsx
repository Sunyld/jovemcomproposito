import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Link, useNavigate } from 'react-router-dom';
import { Mail } from 'lucide-react';
import PasswordInput from '../components/PasswordInput';
import { Input, Button } from '../components/ui';
import { toast } from '../components/Toast';
import { normalizeEmail, isValidEmail } from '../lib/emailUtils';

export default function Login() {
	const { signIn, signInWithGoogle } = useAuth();
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [loading, setLoading] = useState(false);
	const [googleLoading, setGoogleLoading] = useState(false);
	const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
	const navigate = useNavigate();

	function validate() {
		const newErrors: { email?: string; password?: string } = {};
		
		if (!email.trim()) {
			newErrors.email = 'Email é obrigatório';
		} else if (!isValidEmail(email)) {
			newErrors.email = 'Email inválido';
		}
		
		if (!password) {
			newErrors.password = 'Senha é obrigatória';
		}
		
		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	}

	async function onSubmit(e: React.FormEvent) {
		e.preventDefault();
		
		if (!validate()) {
			toast({ title: 'Erro de validação', description: 'Preencha todos os campos corretamente', variant: 'error' });
			return;
		}
		
		setLoading(true);
		try {
			// Email será normalizado no hook useAuth
			const { data, error } = await signIn({ email: normalizeEmail(email), password });
			
			if (error) {
				// Erro já é mostrado no hook useAuth
				setLoading(false);
				return;
			}
			
			if (data?.user) {
				// Aguardar um pouco para o profile ser carregado pelo useAuth
				await new Promise(resolve => setTimeout(resolve, 300));
				
				// Buscar o profile diretamente para garantir que temos o role
				const { supabase } = await import('../lib/supabaseClient');
				const { data: profileData, error: profileError } = await supabase
					.from('profiles')
					.select('role')
					.eq('id', data.user.id)
					.single();
				
				if (profileError && profileError.code !== 'PGRST116') {
					toast({ 
						title: 'Erro', 
						description: 'Não foi possível carregar seu perfil. Tente novamente.', 
						variant: 'error' 
					});
					setLoading(false);
					return;
				}
				
				const role = profileData?.role || 'user';
				const redirectMap: Record<string, string> = {
					admin: '/dashboard/admin',
					mentor: '/dashboard/mentor',
					user: '/dashboard/user',
				};
				const target = redirectMap[role] || '/dashboard/user';
				
				// Mostrar toast de sucesso
				toast({ 
					title: 'Login realizado com sucesso!', 
					description: `Bem-vindo! Você pode acessar seu dashboard agora.`, 
					variant: 'success' 
				});
				
				// Redirecionar após um pequeno delay para o usuário ver o toast
				setTimeout(() => {
					navigate(target, { replace: true });
				}, 500);
			} else {
				toast({ 
					title: 'Erro', 
					description: 'Não foi possível fazer login. Tente novamente.', 
					variant: 'error' 
				});
				setLoading(false);
			}
		} catch (err: any) {
			toast({ 
				title: 'Erro ao fazer login', 
				description: err.message || 'Erro desconhecido. Tente novamente.', 
				variant: 'error' 
			});
			setLoading(false);
		}
	}

	return (
		<div className="min-h-screen bg-background text-text-primary flex items-center justify-center px-4 py-16">
			<div className="w-full max-w-5xl grid lg:grid-cols-2 gap-6 rounded-[32px] border border-border bg-surface backdrop-blur-md p-6 sm:p-10 shadow-soft-3d">
				<div className="hidden lg:flex flex-col justify-between">
					<div>
						<p className="text-sm uppercase tracking-[0.5rem] text-purple">JCP</p>
						<h1 className="font-display text-3xl mt-4 text-text-primary">Bem-vindo de volta</h1>
						<p className="text-text-secondary mt-3">Faça login para acessar mentorias, discipulados e dashboards personalizados.</p>
					</div>
				</div>
				<div className="rounded-[26px] border border-border bg-surface p-6 sm:p-8">
					<form onSubmit={onSubmit} className="space-y-5">
						<Input
							label="Email"
							type="email"
							placeholder="seu@email.com"
							value={email}
							onChange={(e) => {
								setEmail(e.target.value);
								if (errors.email) setErrors({ ...errors, email: undefined });
							}}
							error={errors.email}
							leftIcon={<Mail size={18} />}
							required
						/>
						<div>
							<label className="block text-sm font-medium text-text-secondary mb-1.5">
								Senha
								<span className="text-red-400 ml-1">*</span>
							</label>
							<PasswordInput
								value={password}
								onChange={(e) => {
									setPassword(e.target.value);
									if (errors.password) setErrors({ ...errors, password: undefined });
								}}
								placeholder="••••••"
								required
							/>
							{errors.password && <p className="text-xs text-red-400 mt-1.5" role="alert">{errors.password}</p>}
						</div>
						<Button
							type="submit"
							variant="primary"
							size="lg"
							fullWidth
							loading={loading}
							disabled={loading}
						>
							Entrar
						</Button>
					</form>
					<div className="mt-6">
						<Button
							type="button"
							variant="secondary"
							size="md"
							fullWidth
							disabled={googleLoading || loading}
							loading={googleLoading}
							onClick={async () => {
								if (googleLoading || loading) return;
								
								setGoogleLoading(true);
								try {
									const result = await signInWithGoogle();
									if (result?.error) {
										toast({ 
											title: 'Erro ao fazer login', 
											description: result.error.message || 'Não foi possível fazer login com Google. Tente novamente.', 
											variant: 'error' 
										});
										setGoogleLoading(false);
									}
									// Se não houver erro, o usuário será redirecionado automaticamente
								} catch (err: any) {
									toast({ 
										title: 'Erro ao fazer login', 
										description: err.message || 'Não foi possível fazer login com Google. Tente novamente.', 
										variant: 'error' 
									});
									setGoogleLoading(false);
								}
							}}
							icon={
								!googleLoading && (
									<img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="h-4 w-4" />
								)
							}
						>
							{googleLoading ? 'Conectando...' : 'Entrar com Google'}
						</Button>
					</div>
					<div className="mt-4 text-sm text-text-secondary space-y-2">
						<div>
							Não tem conta? <Link to="/signup" className="text-purple hover:text-purple-light underline">Cadastrar</Link>
						</div>
						<div>
							<Link to="/forgot-password" className="text-purple hover:text-purple-light">
								Esqueceu sua senha?
							</Link>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}



