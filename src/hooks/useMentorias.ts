import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabaseClient';
import { Mentoria } from '../lib/types';
import { toast } from '../components/Toast';
import { useAuth } from './useAuth';
import { queryClient } from '../lib/queryClient';

const MENTORIAS_KEY = 'mentorias';

export function useMentorias(filters?: { category_id?: string; mentor_id?: string; published?: boolean }) {
	const isPublic = filters?.published === true && !filters?.mentor_id;
	const staleTime = isPublic ? 10 * 60 * 1000 : 3 * 60 * 1000;
	const cacheTime = isPublic ? 30 * 60 * 1000 : 5 * 60 * 1000;

	const { data, isLoading, error, refetch, isFetching } = useQuery<Mentoria[], Error>({
		queryKey: [MENTORIAS_KEY, filters],
		queryFn: async () => {
			let query = supabase.from('mentorias').select('*');
			if (filters?.category_id) query = query.eq('category_id', filters.category_id);
			if (filters?.mentor_id) query = query.eq('mentor_id', filters.mentor_id);
			if (filters?.published !== undefined) query = query.eq('published', filters.published);
			const { data, error } = await query.order('created_at', { ascending: false });
			if (error) throw error;
			return data || [];
		},
		staleTime,
		cacheTime,
	});

	return { mentorias: data ?? [], loading: isLoading || isFetching, error, refetch };
}

export function useMentoria(id: string | undefined) {
	const { data, isLoading, error } = useQuery<Mentoria | null, Error>({
		queryKey: [MENTORIAS_KEY, 'detail', id],
		enabled: !!id,
		queryFn: async () => {
			if (!id) return null;
			const { data, error } = await supabase.from('mentorias').select('*').eq('id', id).single();
			if (error) throw error;
			return data;
		},
		staleTime: 3 * 60 * 1000,
	});

	return { mentoria: data ?? null, loading: isLoading, error };
}

export function useMentorMentorias() {
	const { user } = useAuth();
	const { data, isLoading, error } = useQuery<Mentoria[], Error>({
		queryKey: [MENTORIAS_KEY, 'mentor', user?.id],
		enabled: !!user?.id,
		queryFn: async () => {
			if (!user?.id) return [];
			const { data, error } = await supabase
				.from('mentorias')
				.select('*')
				.eq('mentor_id', user.id)
				.order('created_at', { ascending: false });
			if (error) throw error;
			return data || [];
		},
		staleTime: 3 * 60 * 1000,
	});

	return { mentorias: data ?? [], loading: isLoading, error };
}

export async function createMentoria(mentoria: Omit<Mentoria, 'id' | 'created_at' | 'updated_at'>) {
	const { data, error } = await supabase.from('mentorias').insert(mentoria).select().single();

	if (error) {
		toast({ title: 'Erro ao criar mentoria', description: error.message, variant: 'error' });
		throw error;
	}

	await queryClient.invalidateQueries({ queryKey: [MENTORIAS_KEY] });
	toast({ title: 'Mentoria criada', variant: 'success' });
	return data;
}

export async function updateMentoria(id: string, updates: Partial<Mentoria>) {
	const { data, error } = await supabase.from('mentorias').update(updates).eq('id', id).select().single();

	if (error) {
		toast({ title: 'Erro ao atualizar mentoria', description: error.message, variant: 'error' });
		throw error;
	}

	await queryClient.invalidateQueries({ queryKey: [MENTORIAS_KEY] });
	toast({ title: 'Mentoria atualizada', variant: 'success' });
	return data;
}

export async function deleteMentoria(id: string) {
	const { error } = await supabase.from('mentorias').delete().eq('id', id);

	if (error) {
		toast({ title: 'Erro ao deletar mentoria', description: error.message, variant: 'error' });
		throw error;
	}

	await queryClient.invalidateQueries({ queryKey: [MENTORIAS_KEY] });
	toast({ title: 'Mentoria deletada', variant: 'success' });
}
