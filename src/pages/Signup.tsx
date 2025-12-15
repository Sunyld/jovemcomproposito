import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, User } from 'lucide-react';
import PasswordInput from '../components/PasswordInput';
import PasswordStrength, { validatePassword } from '../components/PasswordStrength';
import { Input, Button } from '../components/ui';
import { toast } from '../components/Toast';
import { normalizeEmail, isValidEmail } from '../lib/emailUtils';

export default function Signup() {
	const { signUp, signInWithGoogle } = useAuth();
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [name, setName] = useState('');
	const [loading, setLoading] = useState(false);
	const [errors, setErrors] = useState<{ email?: string; password?: string; name?: string }>({});
	const navigate = useNavigate();

	function validate() {
		const newErrors: { email?: string; password?: string; name?: string } = {};
		
		if (!name.trim()) {
			newErrors.name = 'Nome é obrigatório';
		} else if (name.trim().length < 2) {
			newErrors.name = 'Nome deve ter pelo menos 2 caracteres';
		}
		
		if (!email.trim()) {
			newErrors.email = 'Email é obrigatório';
		} else if (!isValidEmail(email)) {
			newErrors.email = 'Email inválido';
		}
		
		if (!password) {
			newErrors.password = 'Senha é obrigatória';
		} else {
			const passwordValidation = validatePassword(password);
			if (!passwordValidation.valid) {
				newErrors.password = passwordValidation.errors[0];
			}
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
		// Email será normalizado no hook useAuth
		const { error } = await signUp({ email: normalizeEmail(email), password, full_name: name });
		setLoading(false);
		
		if (!error) {
			toast({ title: 'Conta criada!', description: 'Verifique seu email para confirmar a conta', variant: 'success' });
			navigate('/dashboard/user', { replace: true });
		} else {
			toast({ title: 'Erro ao criar conta', description: error.message, variant: 'error' });
		}
	}

	return (
		<div className="min-h-screen bg-background text-text-primary flex items-center justify-center px-4 py-16">
			<div className="w-full max-w-4xl rounded-[32px] border border-border bg-surface backdrop-blur-md p-6 sm:p-10 shadow-soft-3d">
				<h1 className="font-display text-3xl text-text-primary">Crie sua conta</h1>
				<p className="text-text-secondary mt-2">Junte-se ao movimento Jovem com Propósito.</p>
				<form onSubmit={onSubmit} className="mt-6 space-y-5">
					<Input
						label="Nome completo"
						type="text"
						placeholder="Nome completo"
						value={name}
						onChange={(e) => {
							setName(e.target.value);
							if (errors.name) setErrors({ ...errors, name: undefined });
						}}
						error={errors.name}
						leftIcon={<User size={18} />}
						required
						minLength={2}
					/>
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
							placeholder="Digite sua senha"
							required
							minLength={8}
						/>
						{password && <PasswordStrength password={password} />}
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
						Criar conta
					</Button>
				</form>
				<Button
					type="button"
					variant="secondary"
					size="lg"
					fullWidth
					onClick={() => signInWithGoogle()}
					icon={
						<img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="h-4 w-4" />
					}
					className="mt-4 bg-white text-black hover:bg-gray-100 border-gray-300"
				>
					Criar com Google
				</Button>
				<p className="text-sm text-text-secondary mt-3">
					Já possui conta? <Link to="/login" className="text-purple hover:text-purple-light underline">Entrar</Link>
				</p>
			</div>
		</div>
	);
}


