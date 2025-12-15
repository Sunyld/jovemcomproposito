import { useState, useMemo } from 'react';
import DashboardShell from '../../components/dashboard/DashboardShell';
import { useProfiles, updateRole } from '../../hooks/useProfiles';
import { toast } from '../../components/Toast';
import { UserPlus, X, Shield, Trash2, Edit } from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';
import { supabase } from '../../lib/supabaseClient';
import EmptyState from '../../components/EmptyState';
import { normalizeEmail, isValidEmail } from '../../lib/emailUtils';

type AdminForm = {
	email: string;
	password: string;
	full_name: string;
};

export default function AdminAdmins() {
	const { profiles, loading } = useProfiles();
	const admins = useMemo(() => profiles.filter((p) => p.role === 'admin'), [profiles]);
	const [showCreateModal, setShowCreateModal] = useState(false);
	const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null);
	const [form, setForm] = useState<AdminForm>({
		email: '',
		password: '',
		full_name: '',
	});
	const [creating, setCreating] = useState(false);

	const handleCreate = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!form.email || !form.password || !form.full_name) {
			toast({ title: 'Erro', description: 'Preencha todos os campos', variant: 'error' });
			return;
		}

		if (!isValidEmail(form.email)) {
			toast({ title: 'Erro', description: 'Email inválido', variant: 'error' });
			return;
		}

		setCreating(true);
		try {
			// Normalizar email antes de criar
			const normalizedEmail = normalizeEmail(form.email);
			
			// Criar usuário no Supabase Auth
			const { data: authData, error: authError } = await supabase.auth.admin.createUser({
				email: normalizedEmail,
				password: form.password,
				email_confirm: true,
				user_metadata: {
					full_name: form.full_name,
				},
			});

			if (authError) {
				// Se admin.createUser não funcionar, usar signUp normal
				const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
					email: normalizedEmail,
					password: form.password,
					options: {
						data: {
							full_name: form.full_name,
						},
					},
				});

				if (signUpError) throw signUpError;

				// Atualizar perfil para admin
				if (signUpData.user) {
					await updateRole(signUpData.user.id, 'admin');
					toast({ title: 'Admin criado', description: 'Verifique o email para confirmar a conta', variant: 'success' });
				}
			} else if (authData.user) {
				// Criar perfil como admin
				await updateRole(authData.user.id, 'admin');
				toast({ title: 'Admin criado', variant: 'success' });
			}

			setForm({ email: '', password: '', full_name: '' });
			setShowCreateModal(false);
		} catch (err: any) {
			toast({ title: 'Erro ao criar admin', description: err.message, variant: 'error' });
		} finally {
			setCreating(false);
		}
	};

	const handleDelete = async (id: string) => {
		if (!confirm('Tem certeza que deseja remover este admin? Ele será rebaixado para usuário normal.')) return;

		try {
			await updateRole(id, 'user');
			toast({ title: 'Admin removido', description: 'O usuário foi rebaixado para usuário normal', variant: 'success' });
			setShowDeleteModal(null);
		} catch (err: any) {
			toast({ title: 'Erro', description: err.message, variant: 'error' });
		}
	};

	if (loading) {
		return (
			<DashboardShell role="admin" title="Administradores" subtitle="Gerencie administradores do sistema.">
				<LoadingSpinner size="lg" className="py-12" />
			</DashboardShell>
		);
	}

	return (
		<DashboardShell role="admin" title="Administradores" subtitle="Gerencie administradores do sistema.">
			<div className="space-y-6">
				<div className="flex justify-between items-center">
					<div>
						<h2 className="text-2xl font-bold text-text-primary">Administradores</h2>
						<p className="text-text-secondary mt-1">Total: {admins.length}</p>
					</div>
					<button
						onClick={() => setShowCreateModal(true)}
						className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple text-white hover:bg-purple-light transition-colors"
					>
						<UserPlus size={20} /> Novo Admin
					</button>
				</div>

				{admins.length === 0 ? (
					<EmptyState icon={Shield} title="Nenhum administrador" description="Crie o primeiro administrador do sistema." />
				) : (
					<div className="grid gap-4">
						{admins.map((admin) => (
							<div key={admin.id} className="rounded-2xl border border-border bg-surface p-6 hover:bg-surface/80 transition">
								<div className="flex items-start justify-between">
									<div className="flex items-start gap-4 flex-1">
										<div className="h-12 w-12 rounded-full bg-card-glow flex items-center justify-center text-lg font-medium uppercase">
											{admin.full_name?.[0] || 'A'}
										</div>
										<div className="flex-1">
											<div className="font-medium text-text-primary">{admin.full_name || 'Sem nome'}</div>
											{admin.bio && <div className="text-sm text-text-secondary mt-1">{admin.bio}</div>}
										</div>
									</div>
									<div className="flex items-center gap-2">
										<span className="px-3 py-1 rounded-full text-xs bg-purple/20 text-purple">Admin</span>
										<button
											onClick={() => setShowDeleteModal(admin.id)}
											className="p-2 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors"
											title="Remover admin"
										>
											<Trash2 size={18} />
										</button>
									</div>
								</div>
							</div>
						))}
					</div>
				)}
			</div>

			{/* Modal Criar Admin */}
			{showCreateModal && (
				<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
					<div className="bg-surface border border-border rounded-2xl p-6 max-w-md w-full">
						<div className="flex items-center justify-between mb-4">
							<h3 className="text-xl font-semibold text-text-primary">Criar Novo Admin</h3>
							<button
								onClick={() => setShowCreateModal(false)}
								className="p-2 rounded-xl hover:bg-surface/80 transition-colors"
							>
								<X size={20} className="text-text-secondary" />
							</button>
						</div>
						<form onSubmit={handleCreate} className="space-y-4">
							<div>
								<label className="block text-sm text-text-secondary mb-2">Nome Completo</label>
								<input
									type="text"
									value={form.full_name}
									onChange={(e) => setForm({ ...form, full_name: e.target.value })}
									className="w-full rounded-xl border border-border bg-input px-4 py-2 text-text-primary outline-none focus:border-purple"
									required
								/>
							</div>
							<div>
								<label className="block text-sm text-text-secondary mb-2">Email</label>
								<input
									type="email"
									value={form.email}
									onChange={(e) => setForm({ ...form, email: e.target.value })}
									className="w-full rounded-xl border border-border bg-input px-4 py-2 text-text-primary outline-none focus:border-purple"
									required
								/>
							</div>
							<div>
								<label className="block text-sm text-text-secondary mb-2">Senha</label>
								<input
									type="password"
									value={form.password}
									onChange={(e) => setForm({ ...form, password: e.target.value })}
									className="w-full rounded-xl border border-border bg-input px-4 py-2 text-text-primary outline-none focus:border-purple"
									required
									minLength={6}
								/>
							</div>
							<div className="flex gap-3 pt-4">
								<button
									type="button"
									onClick={() => setShowCreateModal(false)}
									className="flex-1 px-4 py-2 rounded-xl border border-border text-text-primary hover:bg-surface/80 transition-colors"
								>
									Cancelar
								</button>
								<button
									type="submit"
									disabled={creating}
									className="flex-1 px-4 py-2 rounded-xl bg-purple text-white hover:bg-purple-light transition-colors disabled:opacity-50"
								>
									{creating ? 'Criando...' : 'Criar Admin'}
								</button>
							</div>
						</form>
					</div>
				</div>
			)}

			{/* Modal Confirmar Delete */}
			{showDeleteModal && (
				<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
					<div className="bg-surface border border-border rounded-2xl p-6 max-w-md w-full">
						<h3 className="text-xl font-semibold text-text-primary mb-4">Remover Admin</h3>
						<p className="text-text-secondary mb-6">
							Tem certeza que deseja remover este administrador? Ele será rebaixado para usuário normal.
						</p>
						<div className="flex gap-3">
							<button
								onClick={() => setShowDeleteModal(null)}
								className="flex-1 px-4 py-2 rounded-xl border border-border text-text-primary hover:bg-surface/80 transition-colors"
							>
								Cancelar
							</button>
							<button
								onClick={() => handleDelete(showDeleteModal)}
								className="flex-1 px-4 py-2 rounded-xl bg-red-500 text-white hover:bg-red-600 transition-colors"
							>
								Remover
							</button>
						</div>
					</div>
				</div>
			)}
		</DashboardShell>
	);
}

