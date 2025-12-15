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
	toast({ title: 'Perfil atualizado', variant: 'success' });
	return data;
}

export async function updateRole(userId: string, role: Profile['role']) {
	return updateProfile(userId, { role });
}

export async function approveMentor(userId: string) {
	return updateProfile(userId, { is_mentor_approved: true });
}

export async function rejectMentor(userId: string) {
	return updateProfile(userId, { is_mentor_approved: false });
}
