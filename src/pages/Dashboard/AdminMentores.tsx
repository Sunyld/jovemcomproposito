import DashboardShell from '../../components/dashboard/DashboardShell';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useProfiles, approveMentor, rejectMentor, updateProfile, updateRole } from '../../hooks/useProfiles';
import { toast } from '../../components/Toast';
import { CheckCircle2, Edit, UserPlus, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { normalizeEmail, isValidEmail } from '../../lib/emailUtils';

type MentorForm = {
	full_name: string;
	bio: string;
	avatar_url: string;
	is_mentor_approved: boolean;
};

export default function AdminMentores() {
	const { profiles, loading } = useProfiles();
	const mentors = useMemo(() => profiles.filter((p) => p.role === 'mentor'), [profiles]);
	const candidates = useMemo(() => profiles.filter((p) => p.role !== 'mentor' && p.role !== 'admin'), [profiles]);
	const [showCreateModal, setShowCreateModal] = useState(false);
	const [selectedCandidate, setSelectedCandidate] = useState<string>('');
	const [createBio, setCreateBio] = useState('');
	const [createLoading, setCreateLoading] = useState(false);
	const [createMode, setCreateMode] = useState<'promote' | 'new'>('promote');
	const [newMentorForm, setNewMentorForm] = useState({
		email: '',
		password: '',
		full_name: '',
		bio: '',
	});
	const [editingMentor, setEditingMentor] = useState<MentorForm & { id: string } | null>(null);
	const [savingEdit, setSavingEdit] = useState(false);

	const handleApprove = async (id: string) => {
		try {
			await approveMentor(id);
			toast({ title: 'Mentor aprovado', variant: 'success' });
		} catch (err) {
			// handled inside hook
		}
	};

	const handleReject = async (id: string) => {
		try {
			await rejectMentor(id);
			toast({ title: 'Mentor rejeitado', variant: 'success' });
		} catch (err) {
			// handled inside hook
		}
	};

	const handleCreateMentor = async () => {
		if (createMode === 'promote') {
		if (!selectedCandidate) {
			toast({ title: 'Selecione um usuário', description: 'Escolha um usuário para promover a mentor.', variant: 'error' });
			return;
		}
		setCreateLoading(true);
		try {
			await updateRole(selectedCandidate, 'mentor');
			await approveMentor(selectedCandidate);
			if (createBio.trim()) {
				await updateProfile(selectedCandidate, { bio: createBio.trim() });
			}
			toast({ title: 'Mentor criado', description: 'Usuário promovido a mentor com sucesso.', variant: 'success' });
			setSelectedCandidate('');
			setCreateBio('');
			setShowCreateModal(false);
		} catch (err: any) {
			// handled nos hooks
		} finally {
			setCreateLoading(false);
			}
		} else {
			// Criar novo usuário como mentor
			if (!newMentorForm.email || !newMentorForm.password || !newMentorForm.full_name) {
				toast({ title: 'Erro', description: 'Preencha todos os campos obrigatórios', variant: 'error' });
				return;
			}
			
			if (!isValidEmail(newMentorForm.email)) {
				toast({ title: 'Erro', description: 'Email inválido', variant: 'error' });
				return;
			}
			
			setCreateLoading(true);
			try {
				// Normalizar email antes de criar
				const normalizedEmail = normalizeEmail(newMentorForm.email);
				const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
					email: normalizedEmail,
					password: newMentorForm.password,
					options: {
						data: {
							full_name: newMentorForm.full_name,
						},
					},
				});

				if (signUpError) throw signUpError;

				if (signUpData.user) {
					await updateRole(signUpData.user.id, 'mentor');
					await approveMentor(signUpData.user.id);
					if (newMentorForm.bio.trim()) {
						await updateProfile(signUpData.user.id, { bio: newMentorForm.bio.trim() });
					}
					toast({ title: 'Mentor criado', description: 'Novo mentor cadastrado com sucesso. Verifique o email para confirmar.', variant: 'success' });
					setNewMentorForm({ email: '', password: '', full_name: '', bio: '' });
					setShowCreateModal(false);
				}
			} catch (err: any) {
				toast({ title: 'Erro ao criar mentor', description: err.message, variant: 'error' });
			} finally {
				setCreateLoading(false);
			}
		}
	};

	const openEditMentor = (mentorId: string) => {
		const mentor = mentors.find((m) => m.id === mentorId);
		if (!mentor) return;
		setEditingMentor({
			id: mentor.id,
			full_name: mentor.full_name ?? '',
			bio: mentor.bio ?? '',
			avatar_url: mentor.avatar_url ?? '',
			is_mentor_approved: mentor.is_mentor_approved,
		});
	};

	const handleSaveMentor = async () => {
		if (!editingMentor) return;
		setSavingEdit(true);
		try {
			await updateProfile(editingMentor.id, {
				full_name: editingMentor.full_name || null,
				bio: editingMentor.bio || null,
				avatar_url: editingMentor.avatar_url || null,
				is_mentor_approved: editingMentor.is_mentor_approved,
			});
			if (editingMentor.is_mentor_approved) {
				await approveMentor(editingMentor.id);
			}
			toast({ title: 'Mentor atualizado', variant: 'success' });
			setEditingMentor(null);
		} catch (err) {
			// handled
		} finally {
			setSavingEdit(false);
		}
	};

	return (
		<DashboardShell role="admin" title="Gestão de Mentores" subtitle="Aprove, cadastre e edite os mentores da plataforma.">
			<div className="flex items-center justify-between">
				<p className="text-sm text-text-secondary max-w-2xl">
					Acompanhe o status de aprovação, histórico e dados principais dos mentores. Utilize as ações rápidas para aprovar ou suspender perfis.
				</p>
				<button
					onClick={() => setShowCreateModal(true)}
					className="hidden sm:inline-flex items-center gap-2 rounded-xl bg-purple px-4 py-2 text-sm text-white hover:bg-purple-light transition-colors"
				>
					<UserPlus size={16} /> Novo mentor
				</button>
			</div>

			{loading ? (
				<LoadingSpinner size="lg" className="py-20" />
			) : mentors.length === 0 ? (
				<div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-center">
					<p className="text-lg font-semibold mb-2">Nenhum mentor encontrado</p>
					<p className="text-text-secondary text-sm">Assim que um mentor solicitar aprovação, ele aparecerá aqui.</p>
				</div>
			) : (
				<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{mentors.map((mentor) => (
						<div key={mentor.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 hover:bg-white/[0.05] transition">
							<div className="flex items-center gap-3 mb-4">
								{mentor.avatar_url ? (
									<img src={mentor.avatar_url} alt={mentor.full_name || 'Mentor'} className="h-12 w-12 rounded-full object-cover border-2 border-purple/30" />
								) : (
									<div className="h-12 w-12 rounded-full bg-card-glow flex items-center justify-center text-sm font-medium uppercase border-2 border-purple/30">
										{mentor.full_name?.[0] || 'M'}
									</div>
								)}
								<div className="flex-1 min-w-0">
									<div className="font-medium truncate">{mentor.full_name || 'Mentor'}</div>
									<p className="text-xs text-text-secondary truncate">{mentor.bio || 'Mentor da comunidade'}</p>
								</div>
								{mentor.is_mentor_approved && <CheckCircle2 size={16} className="text-green-400" />}
							</div>
							<div className="flex gap-2">
								{mentor.is_mentor_approved ? (
									<button
										onClick={() => openEditMentor(mentor.id)}
										className="flex-1 rounded-lg border border-white/10 px-3 py-2 text-sm hover:border-white/30 flex items-center justify-center gap-2"
									>
										<Edit size={14} /> Editar
									</button>
								) : (
									<>
										<button
											onClick={() => handleApprove(mentor.id)}
											className="flex-1 rounded-lg bg-green-500/20 text-green-300 px-3 py-2 text-sm hover:bg-green-500/30 flex items-center justify-center gap-2"
										>
											<CheckCircle2 size={14} /> Aprovar
										</button>
										<button
											onClick={() => handleReject(mentor.id)}
											className="rounded-lg bg-red-500/20 text-red-300 px-3 py-2 text-sm hover:bg-red-500/30 flex items-center justify-center"
										>
											<X size={14} />
										</button>
									</>
								)}
							</div>
						</div>
					))}
				</div>
			)}
			<Modal open={showCreateModal} onClose={() => setShowCreateModal(false)}>
				<div className="space-y-4">
					<h3 className="text-lg font-semibold">Criar Novo Mentor</h3>
					
					{/* Tabs */}
					<div className="flex gap-2 border-b border-border">
						<button
							onClick={() => setCreateMode('promote')}
							className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
								createMode === 'promote'
									? 'border-purple text-purple'
									: 'border-transparent text-text-secondary hover:text-text-primary'
							}`}
						>
							Promover Usuário
						</button>
						<button
							onClick={() => setCreateMode('new')}
							className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
								createMode === 'new'
									? 'border-purple text-purple'
									: 'border-transparent text-text-secondary hover:text-text-primary'
							}`}
						>
							Criar Novo
						</button>
					</div>

					{createMode === 'promote' ? (
						<>
					{candidates.length === 0 ? (
						<p className="text-sm text-text-secondary">Não há usuários elegíveis para promoção.</p>
					) : (
						<>
							<select
										className="w-full rounded-xl border border-border bg-input px-3 py-2 text-sm outline-none focus:border-purple text-text-primary"
								value={selectedCandidate}
								onChange={(e) => setSelectedCandidate(e.target.value)}
							>
								<option value="">Selecione um usuário</option>
								{candidates.map((c) => (
									<option key={c.id} value={c.id}>
										{c.full_name || 'Sem nome'}
									</option>
								))}
							</select>
							<textarea
										className="w-full rounded-xl border border-border bg-input px-3 py-2 text-sm outline-none focus:border-purple text-text-primary placeholder:text-text-secondary"
								rows={3}
								placeholder="Bio/Descrição do mentor (opcional)"
								value={createBio}
								onChange={(e) => setCreateBio(e.target.value)}
							/>
								</>
							)}
						</>
					) : (
						<>
							<input
								type="text"
								placeholder="Nome completo *"
								className="w-full rounded-xl border border-border bg-input px-3 py-2 text-sm outline-none focus:border-purple text-text-primary placeholder:text-text-secondary"
								value={newMentorForm.full_name}
								onChange={(e) => setNewMentorForm({ ...newMentorForm, full_name: e.target.value })}
								required
							/>
							<input
								type="email"
								placeholder="Email *"
								className="w-full rounded-xl border border-border bg-input px-3 py-2 text-sm outline-none focus:border-purple text-text-primary placeholder:text-text-secondary"
								value={newMentorForm.email}
								onChange={(e) => setNewMentorForm({ ...newMentorForm, email: e.target.value })}
								required
							/>
							<input
								type="password"
								placeholder="Senha * (mínimo 6 caracteres)"
								className="w-full rounded-xl border border-border bg-input px-3 py-2 text-sm outline-none focus:border-purple text-text-primary placeholder:text-text-secondary"
								value={newMentorForm.password}
								onChange={(e) => setNewMentorForm({ ...newMentorForm, password: e.target.value })}
								required
								minLength={6}
							/>
							<textarea
								className="w-full rounded-xl border border-border bg-input px-3 py-2 text-sm outline-none focus:border-purple text-text-primary placeholder:text-text-secondary"
								rows={3}
								placeholder="Bio/Descrição do mentor (opcional)"
								value={newMentorForm.bio}
								onChange={(e) => setNewMentorForm({ ...newMentorForm, bio: e.target.value })}
							/>
						</>
					)}

					<div className="flex justify-end gap-2 pt-4">
						<button
							onClick={() => {
								setShowCreateModal(false);
								setCreateMode('promote');
								setSelectedCandidate('');
								setCreateBio('');
								setNewMentorForm({ email: '', password: '', full_name: '', bio: '' });
							}}
							className="px-4 py-2 rounded-lg border border-border text-sm text-text-primary hover:bg-surface/80 transition-colors"
						>
									Cancelar
								</button>
								<button
									onClick={handleCreateMentor}
							disabled={createLoading || (createMode === 'promote' && candidates.length === 0)}
							className="px-4 py-2 rounded-lg bg-purple text-white text-sm hover:bg-purple-light disabled:opacity-50 transition-colors"
						>
							{createLoading
								? createMode === 'promote'
									? 'Promovendo...'
									: 'Criando...'
								: createMode === 'promote'
								? 'Promover a mentor'
								: 'Criar Mentor'}
								</button>
							</div>
				</div>
			</Modal>

			<Modal open={!!editingMentor} onClose={() => setEditingMentor(null)}>
				{editingMentor && (
					<div className="space-y-4">
						<h3 className="text-lg font-semibold">Editar mentor</h3>
						<input
							className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm outline-none focus:border-purple"
							placeholder="Nome completo"
							value={editingMentor.full_name}
							onChange={(e) => setEditingMentor({ ...editingMentor, full_name: e.target.value })}
						/>
						<textarea
							className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm outline-none focus:border-purple"
							rows={4}
							placeholder="Bio"
							value={editingMentor.bio}
							onChange={(e) => setEditingMentor({ ...editingMentor, bio: e.target.value })}
						/>
						<input
							className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm outline-none focus:border-purple"
							placeholder="URL do avatar"
							value={editingMentor.avatar_url}
							onChange={(e) => setEditingMentor({ ...editingMentor, avatar_url: e.target.value })}
						/>
						<label className="flex items-center gap-2 text-sm">
							<input
								type="checkbox"
								checked={editingMentor.is_mentor_approved}
								onChange={(e) => setEditingMentor({ ...editingMentor, is_mentor_approved: e.target.checked })}
							/>
							Mentor aprovado
						</label>
						<div className="flex justify-end gap-2">
							<button onClick={() => setEditingMentor(null)} className="px-4 py-2 rounded-lg border border-white/10 text-sm">
								Cancelar
							</button>
							<button
								onClick={handleSaveMentor}
								disabled={savingEdit}
								className="px-4 py-2 rounded-lg bg-purple text-background text-sm hover:bg-purple-light disabled:opacity-50"
							>
								{savingEdit ? 'Salvando...' : 'Salvar alterações'}
							</button>
						</div>
					</div>
				)}
			</Modal>
		</DashboardShell>
	);
}

function Modal({ open, onClose, children }: { open: boolean; onClose: () => void; children: React.ReactNode }) {
	if (!open) return null;
	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
			<div className="w-full max-w-lg rounded-2xl border border-white/10 bg-background p-6 shadow-elevate relative">
				<button onClick={onClose} className="absolute right-4 top-4 text-text-secondary hover:text-text-primary">
					<X size={16} />
				</button>
				{children}
			</div>
		</div>
	);
}

