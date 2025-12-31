import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Profile } from '../lib/types';
import { toast } from '../components/Toast';

type AuthContextValue = ReturnType<typeof useProvideAuth>;

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
	const value = useProvideAuth();
	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
	const ctx = useContext(AuthContext);
	if (!ctx) {
		throw new Error('useAuth must be used within AuthProvider');
	}
	return ctx;
}

function useProvideAuth() {
	const [user, setUser] = useState<Awaited<ReturnType<typeof supabase.auth.getUser>>['data']['user'] | null>(null);
	const [profile, setProfile] = useState<Profile | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		let mounted = true;
		let subscription: { subscription: { unsubscribe: () => void } } | null = null;

		const init = async () => {
			const { data, error } = await supabase.auth.getUser();
			
			// Verificar se usuário ainda existe no banco
			if (data?.user) {
				// Verificar se perfil ainda existe
				const { data: profileData, error: profileError } = await supabase
					.from('profiles')
					.select('id')
					.eq('id', data.user.id)
					.single();
				
				// Se perfil não existe, usuário foi deletado - fazer logout
				if (profileError && profileError.code === 'PGRST116') {
					await supabase.auth.signOut();
					if (mounted) {
						setUser(null);
						setProfile(null);
						setLoading(false);
					}
					return;
				}
			}
			
			if (mounted) {
				setUser(data?.user ?? null);
				setLoading(false);
			}
			
			const { data: authData } = supabase.auth.onAuthStateChange(async (event, session) => {
				if (mounted) {
					// Se sessão foi removida ou usuário deletado, limpar estado
					if (event === 'SIGNED_OUT' || !session) {
						setUser(null);
						setProfile(null);
					} else if (session?.user) {
						// Verificar se perfil ainda existe
						const { data: profileCheck, error: profileError } = await supabase
							.from('profiles')
							.select('id')
							.eq('id', session.user.id)
							.single();
						
						if (profileError && profileError.code === 'PGRST116') {
							// Perfil não existe - fazer logout
							await supabase.auth.signOut();
							setUser(null);
							setProfile(null);
						} else {
							setUser(session.user);
						}
					}
				}
			});
			subscription = authData;
		};

		init();
		
		// Verificar sessão periodicamente (a cada 30 segundos)
		const interval = setInterval(async () => {
			if (!mounted) return;
			
			const { data: currentUser, error } = await supabase.auth.getUser();
			if (error || !currentUser?.user) {
				// Sessão inválida - fazer logout
				await supabase.auth.signOut();
				if (mounted) {
					setUser(null);
					setProfile(null);
				}
				return;
			}
			
			// Verificar se perfil ainda existe
			const { error: profileError } = await supabase
				.from('profiles')
				.select('id')
				.eq('id', currentUser.user.id)
				.single();
			
			if (profileError && profileError.code === 'PGRST116') {
				// Perfil não existe - fazer logout
				await supabase.auth.signOut();
				if (mounted) {
					setUser(null);
					setProfile(null);
				}
			}
		}, 30000); // Verificar a cada 30 segundos

		return () => {
			mounted = false;
			clearInterval(interval);
			if (subscription?.subscription) {
				subscription.subscription.unsubscribe();
			}
		};
	}, []); // Sem dependências para evitar loops

	useEffect(() => {
		let active = true;
		async function loadProfile() {
			if (!user) {
				setProfile(null);
				return;
			}
			try {
				// Load from Supabase profiles table
				const { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).single();
				
				if (error && error.code === 'PGRST116') {
					// Profile doesn't exist yet - create it
					let role: 'user' | 'mentor' | 'admin' = 'user';
					let is_mentor_approved = false;

					// Check if user metadata has role
					if (user.user_metadata?.role) {
						role = user.user_metadata.role;
						is_mentor_approved = user.user_metadata.is_mentor_approved || false;
					}

					// Create profile
					const { data: newProfile, error: createError } = await supabase
						.from('profiles')
						.insert({
							id: user.id,
							full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Usuário',
							role: role,
							avatar_url: user.user_metadata?.avatar_url || null,
							is_mentor_approved: is_mentor_approved,
						})
						.select()
						.single();
					
					if (createError) {
						// Fallback to basic profile
						if (active) {
							setProfile({
								id: user.id,
								full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Usuário',
								role: 'user',
								avatar_url: user.user_metadata?.avatar_url || null,
								is_mentor_approved: false,
							});
						}
					} else if (newProfile && active) {
						setProfile(newProfile);
					}
				} else if (error) {
					// Fallback to basic profile
					if (active) {
						setProfile({
							id: user.id,
							full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Usuário',
							role: 'user',
							avatar_url: user.user_metadata?.avatar_url || null,
							is_mentor_approved: false,
						});
					}
				} else if (data && active) {
					setProfile(data);
				}
			} catch (err) {
				// Fallback to basic profile
				if (active && user) {
					setProfile({
						id: user.id,
						full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Usuário',
						role: 'user',
						avatar_url: user.user_metadata?.avatar_url || null,
						email: user.email || null,
						is_mentor_approved: false,
					});
				}
			}
		}
		loadProfile();
		return () => {
			active = false;
		};
	}, [user]);

	const redirectByRole: Record<string, string> = {
		user: '/dashboard/user',
		mentor: '/dashboard/mentor',
		admin: '/dashboard/admin',
	};

	async function signIn({ email, password }: { email: string; password: string }) {
		try {
			// Normalize email to lowercase (emails are case-insensitive)
			const normalizedEmail = email.trim().toLowerCase();
			const { data, error } = await supabase.auth.signInWithPassword({ email: normalizedEmail, password });
			if (error) {
				// Mensagens de erro mais amigáveis
				let errorMessage = error.message;
				if (error.message.includes('Invalid login credentials')) {
					errorMessage = 'Email ou senha incorretos. Verifique suas credenciais.';
				} else if (error.message.includes('Email not confirmed')) {
					errorMessage = 'Por favor, confirme seu email antes de fazer login.';
				}
				toast({ title: 'Erro ao entrar', description: errorMessage, variant: 'error' });
				return { data: null, error };
			}
			
			// Load profile after sign in to get correct role
			if (data?.user) {
				const { data: profileData } = await supabase.from('profiles').select('*').eq('id', data.user.id).single();
				if (profileData) {
					setProfile(profileData);
				}
				// Toast de sucesso será mostrado na página de Login após redirecionamento
			}
			return { data, error: null };
		} catch (err: any) {
			const error = { message: err.message || 'Erro ao conectar com o servidor' };
			toast({ title: 'Erro ao entrar', description: error.message, variant: 'error' });
			return { data: null, error };
		}
	}

	async function signInWithGoogle() {
		try {
			// Usar a URL completa para evitar problemas com state
			const redirectTo = `${window.location.origin}/oauth/callback`;
			const { data, error } = await supabase.auth.signInWithOAuth({
				provider: 'google',
				options: {
					redirectTo,
					skipBrowserRedirect: false,
				},
			});
			
			if (error) {
				toast({ title: 'Erro Google', description: error.message || 'Não foi possível conectar com Google', variant: 'error' });
				return { error };
			}
			
			// Se não houver erro, o usuário será redirecionado automaticamente para Google
			// Depois Google redireciona para /oauth/callback
			// O redirect acontece automaticamente, não precisamos fazer nada aqui
			return { data, error: null };
		} catch (err: any) {
			toast({ title: 'Erro', description: err.message || 'Erro ao conectar com Google', variant: 'error' });
			return { error: err };
		}
	}

	async function forgotPassword(email: string) {
		// Normalize email to lowercase
		const normalizedEmail = email.trim().toLowerCase();
		const { error } = await supabase.auth.resetPasswordForEmail(normalizedEmail, {
			redirectTo: `${window.location.origin}/reset-password`,
		});
		if (error) {
			toast({ title: 'Erro', description: error.message, variant: 'error' });
		} else {
			toast({ title: 'Email enviado', description: 'Verifique sua caixa de entrada.', variant: 'success' });
		}
		return { error };
	}

	async function resetPassword(_accessToken: string, newPassword: string) {
		const { error } = await supabase.auth.updateUser({ password: newPassword });
		if (error) {
			toast({ title: 'Erro', description: error.message, variant: 'error' });
		} else {
			toast({ title: 'Senha redefinida', description: 'Sua senha foi atualizada com sucesso.', variant: 'success' });
		}
		return { error };
	}

	async function changePassword(currentPassword: string, newPassword: string) {
		if (!user?.email) {
			return { error: { message: 'Usuário não autenticado' } };
		}

		// Verificar se usuário é OAuth (Google)
		const { data: { user: currentUser } } = await supabase.auth.getUser();
		const isOAuthUser = currentUser?.app_metadata?.provider === 'google' || 
		                   currentUser?.identities?.some((id: any) => id.provider === 'google') ||
		                   !currentUser?.encrypted_password; // Se não tem senha, provavelmente é OAuth

		// Se não for OAuth, verificar senha atual
		if (!isOAuthUser && currentPassword) {
			// Verificar senha atual antes de atualizar
			const { error: verifyError } = await supabase.auth.signInWithPassword({
				email: user.email,
				password: currentPassword,
			});

			if (verifyError) {
				toast({ title: 'Erro', description: 'Senha atual incorreta', variant: 'error' });
				return { error: verifyError };
			}
		}

		// Atualizar senha (funciona para OAuth e não-OAuth)
		const { error } = await supabase.auth.updateUser({ password: newPassword });
		if (error) {
			toast({ title: 'Erro', description: error.message, variant: 'error' });
		} else {
			toast({ 
				title: isOAuthUser ? 'Senha definida' : 'Senha atualizada', 
				description: isOAuthUser 
					? 'Agora você pode fazer login com email e senha além do Google'
					: 'Sua senha foi atualizada com sucesso.', 
				variant: 'success' 
			});
		}
		return { error };
	}

	async function verifyEmail() {
		const { data: { user } } = await supabase.auth.getUser();
		if (!user?.email) {
			return { error: { message: 'Email não encontrado' } };
		}
		const { error } = await supabase.auth.resend({
			type: 'signup',
			email: user.email,
		});
		if (error) {
			toast({ title: 'Erro', description: error.message, variant: 'error' });
		} else {
			toast({ title: 'Email reenviado', description: 'Verifique sua caixa de entrada.', variant: 'success' });
		}
		return { error };
	}

	async function updateProfile(updates: Partial<Profile>) {
		if (!user) {
			toast({ title: 'Erro', description: 'Usuário não autenticado.', variant: 'error' });
			return { error: { message: 'Usuário não autenticado' } };
		}

		const { data, error } = await supabase.from('profiles').update(updates).eq('id', user.id).select().single();
		if (error) {
			toast({ title: 'Erro ao atualizar', description: error.message, variant: 'error' });
		} else {
			setProfile(data);
			toast({ title: 'Perfil atualizado', variant: 'success' });
		}
		return { data, error };
	}

	async function signUp({ email, password, full_name }: { email: string; password: string; full_name?: string }) {
		// Normalize email to lowercase (emails are case-insensitive)
		const normalizedEmail = email.trim().toLowerCase();
		const { data, error } = await supabase.auth.signUp({ 
			email: normalizedEmail, 
			password, 
			options: { 
				data: { 
					full_name: full_name || normalizedEmail.split('@')[0], 
					role: 'user' 
				} 
			} 
		});
		
		if (error) {
			toast({ title: 'Erro ao cadastrar', description: error.message, variant: 'error' });
		} else {
			toast({ title: 'Conta criada', description: 'Verifique seu e-mail para confirmar sua conta.', variant: 'success' });
		}
		return { data, error };
	}

	async function signOut() {
		const { error } = await supabase.auth.signOut();
		if (error) {
			toast({ title: 'Erro ao sair', description: error.message, variant: 'error' });
		} else {
			setUser(null);
			setProfile(null);
			toast({ title: 'Você saiu', variant: 'success' });
		}
	}

	async function deleteAccount() {
		if (!user) {
			toast({ title: 'Erro', description: 'Usuário não autenticado', variant: 'error' });
			return { error: { message: 'Usuário não autenticado' } };
		}
		
		try {
			// Try using the delete_user function if available
			const { error: rpcError } = await supabase.rpc('delete_user');
			if (rpcError) {
				// Fallback: delete profile manually
				const { error: profileError } = await supabase.from('profiles').delete().eq('id', user.id);
				if (profileError) {
					toast({ title: 'Erro ao excluir conta', description: profileError.message, variant: 'error' });
					return { error: profileError };
				}
			}
			
			// Sign out after deletion
			await supabase.auth.signOut();
			setUser(null);
			setProfile(null);
			toast({ title: 'Conta excluída', description: 'Sua conta foi removida com sucesso.', variant: 'success' });
			return { error: null };
		} catch (err: any) {
			toast({ title: 'Erro ao excluir conta', description: err.message, variant: 'error' });
			return { error: err };
		}
	}

	return useMemo(
		() => ({
			user,
			profile,
			loading,
			signIn,
			signInWithGoogle,
			signUp,
			signOut,
			forgotPassword,
			resetPassword,
			changePassword,
			verifyEmail,
			updateProfile,
			deleteAccount,
			redirectByRole,
		}),
		[user, profile, loading]
	);
}
