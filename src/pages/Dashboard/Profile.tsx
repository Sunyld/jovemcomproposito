import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardShell from '../../components/dashboard/DashboardShell';
import { useAuth } from '../../hooks/useAuth';
import { toast } from '../../components/Toast';
import FileUploader from '../../components/FileUploader';
import { supabase } from '../../lib/supabaseClient';
import PasswordInput from '../../components/PasswordInput';
import PasswordStrength, { validatePassword } from '../../components/PasswordStrength';
import { Card, Input, Textarea, Button } from '../../components/ui';

type ProfileFormState = {
	fullName: string;
	bio: string;
	avatarUrl: string;
};

export default function ProfilePage() {
	const { user, profile, signOut, updateProfile, deleteAccount, changePassword } = useAuth();
	const navigate = useNavigate();
	const [form, setForm] = useState<ProfileFormState>({
		fullName: profile?.full_name ?? '',
		bio: profile?.bio ?? '',
		avatarUrl: profile?.avatar_url ?? '',
	});
	const [saving, setSaving] = useState(false);
	const [confirmDelete, setConfirmDelete] = useState(false);
	const [uploadingAvatar, setUploadingAvatar] = useState(false);
	
	// Password change state
	const [showPasswordSection, setShowPasswordSection] = useState(false);
	const [currentPassword, setCurrentPassword] = useState('');
	const [newPassword, setNewPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [changingPassword, setChangingPassword] = useState(false);
	const [isOAuthUser, setIsOAuthUser] = useState(false);

	useEffect(() => {
		if (profile) {
			setForm({
				fullName: profile.full_name ?? '',
				bio: profile.bio ?? '',
				avatarUrl: profile.avatar_url ?? '',
			});
		}
	}, [profile]);

	useEffect(() => {
		// Verificar se usuário é OAuth (Google)
		async function checkOAuthUser() {
			if (user) {
				const { data: { user: currentUser } } = await supabase.auth.getUser();
				const isOAuth = currentUser?.app_metadata?.provider === 'google' || 
				               currentUser?.identities?.some((id: any) => id.provider === 'google');
				setIsOAuthUser(isOAuth || false);
			}
		}
		checkOAuthUser();
	}, [user]);

	if (!user || !profile) return null;

	const handleChange = (field: keyof ProfileFormState, value: string) => {
		setForm((prev) => ({ ...prev, [field]: value }));
	};

	const handleSave = async (event: React.FormEvent) => {
		event.preventDefault();
		setSaving(true);
		try {
			await updateProfile({
				full_name: form.fullName,
				bio: form.bio || null,
				avatar_url: form.avatarUrl || null,
			});
		} catch (err) {
			// Error already handled
		} finally {
			setSaving(false);
		}
	};

	const handleAvatarUpload = async (path: string, publicUrl?: string) => {
		setUploadingAvatar(true);
		try {
			await updateProfile({ avatar_url: publicUrl || path });
			setForm((prev) => ({ ...prev, avatarUrl: publicUrl || path }));
		} catch (err) {
			// Error already handled
		} finally {
			setUploadingAvatar(false);
		}
	};

	const handleChangePassword = async (e: React.FormEvent) => {
		e.preventDefault();
		
		if (newPassword !== confirmPassword) {
			toast({ title: 'Erro', description: 'As senhas não coincidem', variant: 'error' });
			return;
		}

		const passwordValidation = validatePassword(newPassword);
		if (!passwordValidation.valid) {
			toast({ title: 'Senha inválida', description: passwordValidation.errors[0], variant: 'error' });
			return;
		}

		setChangingPassword(true);
		try {
			// Para usuários OAuth, currentPassword pode ser vazio
			const { error } = await changePassword(isOAuthUser ? '' : currentPassword, newPassword);
			if (!error) {
				setCurrentPassword('');
				setNewPassword('');
				setConfirmPassword('');
				setShowPasswordSection(false);
			}
		} catch (err: any) {
			// Error already handled
		} finally {
			setChangingPassword(false);
		}
	};

	const handleDelete = async () => {
		if (!confirm('Tem certeza que deseja excluir sua conta? Esta ação não pode ser desfeita.')) return;

		try {
			const { error } = await deleteAccount();
			if (!error) {
				navigate('/login', { replace: true });
			}
		} catch (err: any) {
			toast({ title: 'Erro', description: err.message, variant: 'error' });
		}
	};

	const roleForShell = profile.role === 'admin' || profile.role === 'mentor' ? (profile.role as 'admin' | 'mentor' | 'user') : 'user';

	return (
		<DashboardShell role={roleForShell} title="Meu perfil" subtitle="Gerencie dados pessoais, preferências e segurança.">
			<form onSubmit={handleSave} className="space-y-8">
				<section className="grid gap-6 lg:grid-cols-2">
					<Card title="Dados pessoais" padding="md">
						<div className="space-y-5 mt-4">
							<div>
								<label className="block text-sm font-medium text-text-secondary mb-2">Avatar</label>
								<div className="flex items-center gap-4">
									{form.avatarUrl ? (
										<img src={form.avatarUrl} alt="Avatar" className="h-20 w-20 rounded-full object-cover border-2 border-purple/30 flex-shrink-0" />
									) : (
										<div className="h-20 w-20 rounded-full bg-card-glow flex items-center justify-center text-2xl font-medium uppercase border-2 border-purple/30 flex-shrink-0">
											{form.fullName?.[0] || user?.email?.[0] || 'U'}
										</div>
									)}
									<div className="flex-1 min-w-0">
										<FileUploader
											bucket="avatars"
											onUploaded={handleAvatarUpload}
											accept=".png,.jpg,.jpeg"
										/>
										{uploadingAvatar && <p className="text-xs text-text-secondary mt-1.5">Fazendo upload...</p>}
									</div>
								</div>
							</div>
							<Input
								label="Nome completo"
								value={form.fullName}
								onChange={(e) => handleChange('fullName', e.target.value)}
								required
							/>
							<div>
								<Input
									label="Email"
									value={user?.email || ''}
									readOnly
									className="text-text-secondary"
								/>
								<p className="text-xs text-text-secondary/70 mt-1.5">Para alterar o email, entre em contato com o administrador.</p>
							</div>
						</div>
					</Card>

					<Card title="Sobre você" padding="md">
						<div className="mt-4">
							<Textarea
								label="Bio"
								value={form.bio}
								onChange={(e) => handleChange('bio', e.target.value)}
								placeholder="Conte brevemente sobre sua jornada e propósito."
								className="min-h-[120px]"
							/>
						</div>
					</Card>
				</section>

				<Card padding="md">
					<div className="flex flex-wrap items-center gap-3">
						<Button
							type="submit"
							disabled={saving}
							loading={saving}
							variant="primary"
							size="md"
						>
							Salvar alterações
						</Button>
						<Button
							type="button"
							variant="secondary"
							size="md"
							onClick={() => {
								setForm({
									fullName: profile.full_name ?? '',
									bio: profile.bio ?? '',
									avatarUrl: profile.avatar_url ?? '',
								});
							}}
						>
							Reverter
						</Button>
					</div>
				</Card>

				{/* Seção de Atualização de Senha */}
				<Card title="Segurança" padding="md">
					<div className="flex items-center justify-between mb-4">
						<p className="text-sm text-text-secondary">
							{isOAuthUser 
								? 'Defina uma senha para fazer login com email e senha além do Google'
								: 'Atualize sua senha para manter sua conta segura'}
						</p>
						<Button
							type="button"
							variant="secondary"
							size="sm"
							onClick={() => {
								setShowPasswordSection(!showPasswordSection);
								if (showPasswordSection) {
									setCurrentPassword('');
									setNewPassword('');
									setConfirmPassword('');
								}
							}}
						>
							{showPasswordSection ? 'Cancelar' : 'Alterar senha'}
						</Button>
					</div>

					{showPasswordSection && (
						<form onSubmit={handleChangePassword} className="space-y-5 pt-4 border-t border-border">
							{!isOAuthUser && (
								<div>
									<label className="block text-sm font-medium text-text-secondary mb-1.5">
										Senha atual
										<span className="text-red-400 ml-1">*</span>
									</label>
									<PasswordInput
										value={currentPassword}
										onChange={(e) => setCurrentPassword(e.target.value)}
										placeholder="Digite sua senha atual"
										required={!isOAuthUser}
									/>
								</div>
							)}
							<div>
								<label className="block text-sm font-medium text-text-secondary mb-1.5">
									Nova senha
									<span className="text-red-400 ml-1">*</span>
								</label>
								<PasswordInput
									value={newPassword}
									onChange={(e) => setNewPassword(e.target.value)}
									placeholder="Digite sua nova senha"
									required
									minLength={8}
								/>
								{newPassword && <PasswordStrength password={newPassword} />}
							</div>
							<div>
								<label className="block text-sm font-medium text-text-secondary mb-1.5">
									Confirmar nova senha
									<span className="text-red-400 ml-1">*</span>
								</label>
								<PasswordInput
									value={confirmPassword}
									onChange={(e) => setConfirmPassword(e.target.value)}
									placeholder="Confirme sua nova senha"
									required
									minLength={8}
								/>
								{confirmPassword && newPassword !== confirmPassword && (
									<p className="text-xs text-red-400 mt-1.5" role="alert">As senhas não coincidem</p>
								)}
							</div>
							<Button
								type="submit"
								variant="primary"
								size="md"
								fullWidth
								disabled={changingPassword || !newPassword || !confirmPassword || (newPassword !== confirmPassword)}
								loading={changingPassword}
							>
								{isOAuthUser ? 'Definir senha' : 'Atualizar senha'}
							</Button>
						</form>
					)}
				</Card>

				<Card padding="md" className="border-red-500/30 bg-red-500/5">
					<h3 className="text-lg font-semibold text-red-600 dark:text-red-200 mb-2">Zona de risco</h3>
					<p className="text-sm text-red-600 dark:text-red-100 mb-4">
						Excluir sua conta remove seus dados locais. Essa ação não pode ser desfeita.
					</p>
					{confirmDelete ? (
						<div className="flex flex-wrap gap-3">
							<Button
								type="button"
								variant="danger"
								size="md"
								onClick={handleDelete}
							>
								Sim, excluir minha conta
							</Button>
							<Button
								type="button"
								variant="secondary"
								size="md"
								onClick={() => setConfirmDelete(false)}
							>
								Cancelar
							</Button>
						</div>
					) : (
						<Button
							type="button"
							variant="secondary"
							size="md"
							onClick={() => setConfirmDelete(true)}
							className="border-red-400/50 text-red-600 dark:text-red-100 hover:bg-red-400/10"
						>
							Excluir conta
						</Button>
					)}
				</Card>
			</form>
		</DashboardShell>
	);
}



