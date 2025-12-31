import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import LoadingSpinner from '../components/LoadingSpinner';
import { normalizeEmail } from '../lib/emailUtils';
import { toast } from '../components/Toast';

export default function OAuthCallback() {
	const navigate = useNavigate();
	const [searchParams] = useSearchParams();

	useEffect(() => {
		const handleAuthCallback = async () => {
			try {
				// Check for OAuth errors in URL parameters
				const error = searchParams.get('error');
				const errorDescription = searchParams.get('error_description');
				
				if (error) {
					toast({ 
						title: 'Erro na autenticação', 
						description: errorDescription || 'Não foi possível fazer login com Google. Tente novamente.', 
						variant: 'error' 
					});
					setTimeout(() => {
						navigate('/login');
					}, 2000);
					return;
				}

				// Check URL hash for OAuth tokens (Supabase envia tokens no hash)
				const hashParams = new URLSearchParams(window.location.hash.substring(1));
				const accessToken = hashParams.get('access_token');
				const errorHash = hashParams.get('error');
				const errorDescriptionHash = hashParams.get('error_description');
				
				if (errorHash) {
					toast({ 
						title: 'Erro na autenticação', 
						description: errorDescriptionHash || 'Não foi possível fazer login com Google. Tente novamente.', 
						variant: 'error' 
					});
					setTimeout(() => {
						navigate('/login');
					}, 2000);
					return;
				}

				// Get session - Supabase processes hash tokens automatically
				// Try multiple times if needed
				let session = null;
				let attempts = 0;
				const maxAttempts = 3;

				while (attempts < maxAttempts && !session?.user) {
					const { data: { session: sessionData }, error: sessionError } = await supabase.auth.getSession();
					
					// Session error handled below
					
					if (sessionData?.user) {
						session = sessionData;
						break;
					}
					
					// Wait before retry
					if (attempts < maxAttempts - 1) {
						await new Promise(resolve => setTimeout(resolve, 500 * (attempts + 1)));
					}
					attempts++;
				}

				if (!session?.user) {
					toast({ 
						title: 'Erro na autenticação', 
						description: 'Sessão não encontrada. Tente fazer login novamente.', 
						variant: 'error' 
					});
					setTimeout(() => {
						navigate('/login');
					}, 2000);
					return;
				}

				await processUser(session.user);
			} catch (err) {
				toast({ 
					title: 'Erro inesperado', 
					description: 'Ocorreu um erro ao processar sua autenticação. Tente novamente.', 
					variant: 'error' 
				});
				setTimeout(() => {
					navigate('/login');
				}, 2000);
			}
		};

		async function processUser(user: any) {
			if (!user?.email) {
				toast({ 
					title: 'Erro na autenticação', 
					description: 'Email não encontrado. Tente fazer login novamente.', 
					variant: 'error' 
				});
				navigate('/login?error=no_email');
				return;
			}

			const normalizedEmail = normalizeEmail(user.email);

			// First, check if profile exists for this user ID
			const { data: profile, error: profileError } = await supabase
				.from('profiles')
				.select('role, id')
				.eq('id', user.id)
				.single();

			// If profile exists, use its role (this is the correct account)
			if (profile && !profileError) {
				const role = profile.role || 'user';
				const redirectMap: Record<string, string> = {
					admin: '/dashboard/admin',
					mentor: '/dashboard/mentor',
					user: '/dashboard/user',
				};
				const target = redirectMap[role] || '/dashboard/user';
				
				// Mostrar toast de sucesso
				toast({ 
					title: 'Login realizado com sucesso!', 
					description: `Bem-vindo! Redirecionando para seu dashboard...`, 
					variant: 'success' 
				});
				
				// Redirecionar após um pequeno delay
				setTimeout(() => {
					navigate(target, { replace: true });
				}, 500);
				return;
			}

			// Profile doesn't exist for this user ID
			// Check if there's an existing user with this email (case-insensitive)
			if (profileError && profileError.code === 'PGRST116') {
				// Try to find existing account by email using a database function
				const { data: existingUserData, error: checkError } = await supabase
					.rpc('check_user_by_email', { email_param: normalizedEmail })
					.single();

				// If found existing user with same email (case-insensitive), link to that profile
				if (existingUserData && existingUserData.email_exists && existingUserData.user_id !== user.id) {
					// Email já existe com outro ID - não criar novo perfil
					// O Supabase Auth deveria ter vinculado, mas se não vinculou, 
					// vamos usar o perfil existente
					const { data: existingProfile } = await supabase
						.from('profiles')
						.select('role')
						.eq('id', existingUserData.user_id)
						.single();

					if (existingProfile) {
						// Usar o role do perfil existente
						const role = existingProfile.role || 'user';
						const redirectMap: Record<string, string> = {
							admin: '/dashboard/admin',
							mentor: '/dashboard/mentor',
							user: '/dashboard/user',
						};
						const target = redirectMap[role] || '/dashboard/user';
						
						// Mostrar toast de sucesso
						toast({ 
							title: 'Login realizado com sucesso!', 
							description: `Bem-vindo! Redirecionando para seu dashboard...`, 
							variant: 'success' 
						});
						
						setTimeout(() => {
							navigate(target, { replace: true });
						}, 500);
						return;
					}
				}

				// No existing user found or function failed - create new profile as 'user'
				const { error: createError } = await supabase
					.from('profiles')
					.insert({
						id: user.id,
						full_name: user.user_metadata?.full_name || normalizedEmail.split('@')[0] || 'Usuário',
						role: 'user',
						avatar_url: user.user_metadata?.avatar_url || null,
					});

				if (createError) {
					toast({ 
						title: 'Erro ao criar perfil', 
						description: 'Não foi possível criar seu perfil. Tente novamente.', 
						variant: 'error' 
					});
					navigate('/login?error=profile_creation_failed');
					return;
				}
				
				// Mostrar toast de sucesso
				toast({ 
					title: 'Conta criada com sucesso!', 
					description: 'Bem-vindo! Redirecionando para seu dashboard...', 
					variant: 'success' 
				});
				
				// Redirect to user dashboard
				setTimeout(() => {
					navigate('/dashboard/user', { replace: true });
				}, 500);
				return;
			}

			if (profileError) {
				toast({ 
					title: 'Erro ao carregar perfil', 
					description: 'Não foi possível carregar seu perfil. Tente fazer login novamente.', 
					variant: 'error' 
				});
				navigate('/login?error=profile_load_failed');
				return;
			}

			// Fallback: redirect to user dashboard
			toast({ 
				title: 'Login realizado com sucesso!', 
				description: 'Bem-vindo! Redirecionando...', 
				variant: 'success' 
			});
			setTimeout(() => {
				navigate('/dashboard/user', { replace: true });
			}, 500);
		}

		handleAuthCallback();
	}, [navigate, searchParams]);

	return (
		<div className="min-h-screen bg-gradient-to-br from-[#0B0B10] via-[#111126] to-[#141429] text-text-primary flex items-center justify-center px-4">
			<div className="text-center space-y-4">
				<LoadingSpinner size="lg" variant="dots" text="Autenticando com Google..." />
				<div className="space-y-2">
					<p className="text-text-secondary">Aguarde enquanto processamos sua autenticação</p>
					<div className="flex items-center justify-center gap-1">
						<div className="h-1 w-1 bg-purple rounded-full animate-pulse" style={{ animationDelay: '0ms' }} />
						<div className="h-1 w-1 bg-purple rounded-full animate-pulse" style={{ animationDelay: '200ms' }} />
						<div className="h-1 w-1 bg-purple rounded-full animate-pulse" style={{ animationDelay: '400ms' }} />
					</div>
				</div>
			</div>
		</div>
	);
}


