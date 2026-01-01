import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabaseClient';
import { Profile } from '../lib/types';
import { toast } from '../components/Toast';
import { queryClient } from '../lib/queryClient';

const PROFILES_KEY = 'profiles';

export function useProfiles(filters?: { role?: Profile['role'] }) {
	const { data, isLoading, error, isFetching } = useQuery<Profile[], Error>({
		queryKey: [PROFILES_KEY, filters?.role],
		queryFn: async () => {
			let query = supabase.from('profiles').select('*');
			if (filters?.role) query = query.eq('role', filters.role);
			const { data, error } = await query.order('created_at', { ascending: false });
			if (error) throw error;
			return data || [];
		},
		staleTime: 3 * 60 * 1000,
	});

	return { profiles: data ?? [], loading: isLoading || isFetching, error };
}

export function useProfile(userId: string | undefined) {
	const { data, isLoading, error } = useQuery<Profile | null, Error>({
		queryKey: [PROFILES_KEY, 'detail', userId],
		enabled: !!userId,
		queryFn: async () => {
			if (!userId) return null;
			const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
			if (error) throw error;
			return data;
		},
		staleTime: 3 * 60 * 1000,
	});

	return { profile: data ?? null, loading: isLoading, error };
}

export async function updateProfile(userId: string, updates: Partial<Profile>) {
	const { data, error } = await supabase.from('profiles').update(updates).eq('id', userId).select().single();

	if (error) {
		toast({ title: 'Erro ao atualizar perfil', description: error.message, variant: 'error' });
		throw error;
	}

	await queryClient.invalidateQueries({ queryKey: [PROFILES_KEY] });
	toast({ 
		title: 'Perfil atualizado com sucesso!', 
		description: 'As alterações foram salvas.',
		variant: 'success' 
	});
	return data;
}

export async function updateRole(userId: string, role: Profile['role']) {
	const { data, error } = await supabase.from('profiles').update({ role }).eq('id', userId).select().single();
	
	if (error) {
		toast({ title: 'Erro ao atualizar função', description: error.message, variant: 'error' });
		throw error;
	}
	
	await queryClient.invalidateQueries({ queryKey: [PROFILES_KEY] });
	const roleNames: Record<string, string> = {
		admin: 'administrador',
		mentor: 'mentor',
		user: 'usuário',
		visitor: 'visitante',
	};
	toast({ 
		title: 'Função atualizada com sucesso!', 
		description: `O usuário agora tem função de ${roleNames[role] || role}.`,
		variant: 'success' 
	});
	return data;
}

export async function approveMentor(userId: string) {
	const { data, error } = await supabase.from('profiles').update({ is_mentor_approved: true }).eq('id', userId).select().single();
	
	if (error) {
		toast({ title: 'Erro ao aprovar mentor', description: error.message, variant: 'error' });
		throw error;
	}
	
	await queryClient.invalidateQueries({ queryKey: [PROFILES_KEY] });
	toast({ 
		title: 'Mentor aprovado com sucesso!', 
		description: 'O mentor agora pode criar e publicar mentorias.',
		variant: 'success' 
	});
	return data;
}

export async function rejectMentor(userId: string) {
	const { data, error } = await supabase.from('profiles').update({ is_mentor_approved: false }).eq('id', userId).select().single();
	
	if (error) {
		toast({ title: 'Erro ao rejeitar mentor', description: error.message, variant: 'error' });
		throw error;
	}
	
	await queryClient.invalidateQueries({ queryKey: [PROFILES_KEY] });
	toast({ 
		title: 'Mentor rejeitado', 
		description: 'O mentor não poderá criar mentorias até ser aprovado novamente.',
		variant: 'success' 
	});
	return data;
}
