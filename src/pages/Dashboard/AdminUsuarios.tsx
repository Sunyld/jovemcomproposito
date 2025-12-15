import DashboardShell from '../../components/dashboard/DashboardShell';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useProfiles, updateRole } from '../../hooks/useProfiles';
import { useAuth } from '../../hooks/useAuth';
import { Shield, Ban } from 'lucide-react';
import { useState } from 'react';

export default function AdminUsuarios() {
	const { user } = useAuth();
	const { profiles, loading } = useProfiles();
	const [toggling, setToggling] = useState<string | null>(null);

	const handleToggleRole = async (id: string, role: string) => {
		if (id === user?.id) return;
		setToggling(id);
		try {
			const newRole = role === 'admin' ? 'user' : 'admin';
			await updateRole(id, newRole as any);
		} finally {
			setToggling(null);
		}
	};

	return (
		<DashboardShell role="admin" title="Gestão de Usuários" subtitle="Gerencie os perfis cadastrados, permissões e acessos.">
			{loading ? (
				<LoadingSpinner size="lg" className="py-16" />
			) : (
				<div className="rounded-2xl border border-border bg-surface overflow-hidden">
					<div className="overflow-x-auto">
						<table className="w-full min-w-[640px]">
							<thead className="bg-surface text-left text-xs uppercase tracking-widest text-text-secondary">
								<tr>
									<th className="px-4 py-3">Nome</th>
									<th className="px-4 py-3">Função</th>
									<th className="px-4 py-3 text-right">Ações</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-border text-sm">
								{profiles.map((profile) => {
									const isCurrent = profile.id === user?.id;
									return (
										<tr key={profile.id} className="hover:bg-surface/50">
											<td className="px-4 py-3">
												<div>
													<div className="font-medium text-text-primary">{profile.full_name || 'Sem nome'}</div>
													{profile.bio && <div className="text-xs text-text-secondary mt-1">{profile.bio}</div>}
												</div>
											</td>
											<td className="px-4 py-3">
												<span
													className={`px-2 py-1 rounded-full text-xs ${
														profile.role === 'admin'
															? 'bg-purple/20 text-purple-200'
															: profile.role === 'mentor'
																? 'bg-blue-500/20 text-blue-200'
																: 'bg-white/10 text-text-secondary'
													}`}
												>
													{profile.role}
												</span>
											</td>
											<td className="px-4 py-3 text-right">
												{isCurrent ? (
													<span className="text-xs text-text-secondary/60">Você</span>
												) : (
													<button
														onClick={() => handleToggleRole(profile.id, profile.role)}
														disabled={toggling === profile.id}
														className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-3 py-1.5 text-xs hover:border-white/30 disabled:opacity-50"
													>
														{profile.role === 'admin' ? (
															<>
																<Ban size={12} /> Remover admin
															</>
														) : (
															<>
																<Shield size={12} /> Tornar admin
															</>
														)}
													</button>
												)}
											</td>
										</tr>
									);
								})}
							</tbody>
						</table>
					</div>
				</div>
			)}
		</DashboardShell>
	);
}



