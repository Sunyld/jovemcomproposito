import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabaseClient';
import { Inscrito } from '../lib/types';
import { toast } from '../components/Toast';
import { useAuth } from './useAuth';
import { queryClient } from '../lib/queryClient';

const INSCRITOS_KEY = 'inscritos';

export function useInscritos(mentoriaId?: string) {
	const { data, isLoading, error, isFetching } = useQuery<Inscrito[], Error>({
		queryKey: [INSCRITOS_KEY, mentoriaId],
		queryFn: async () => {
			let query = supabase.from('inscritos').select('*');
			if (mentoriaId) query = query.eq('mentoria_id', mentoriaId);
			const { data, error } = await query.order('created_at', { ascending: false });
			if (error) throw error;
			return data || [];
		},
		staleTime: 3 * 60 * 1000,
	});

	return { inscritos: data ?? [], loading: isLoading || isFetching, error };
}

export function useUserInscricoes() {
	const { user } = useAuth();
	const { data, isLoading, error, isFetching } = useQuery<Inscrito[], Error>({
		queryKey: [INSCRITOS_KEY, 'user', user?.id],
		enabled: !!user?.id,
		queryFn: async () => {
			if (!user?.id) return [];
			const { data, error } = await supabase
				.from('inscritos')
				.select('*')
				.eq('user_id', user.id)
				.order('created_at', { ascending: false });
			if (error) throw error;
			return data || [];
		},
		staleTime: 3 * 60 * 1000,
	});

	return { inscritos: data ?? [], loading: isLoading || isFetching, error };
}

export async function createInscricao(mentoriaId: string, message?: string) {
	const { data: { user } } = await supabase.auth.getUser();
	if (!user) throw new Error('Usuário não autenticado');

	const { data, error } = await supabase
		.from('inscritos')
		.insert({
			user_id: user.id,
			mentoria_id: mentoriaId,
			message: message || null,
		})
		.select()
		.single();

	if (error) {
		toast({ title: 'Erro ao criar inscrição', description: error.message, variant: 'error' });
		throw error;
	}

	await queryClient.invalidateQueries({ queryKey: [INSCRITOS_KEY] });
	toast({ title: 'Inscrição criada', variant: 'success' });
	return data;
}

export async function updateInscricao(id: string, updates: Partial<Inscrito>) {
	const { data, error } = await supabase.from('inscritos').update(updates).eq('id', id).select().single();

	if (error) {
		toast({ title: 'Erro ao atualizar inscrição', description: error.message, variant: 'error' });
		throw error;
	}

	await queryClient.invalidateQueries({ queryKey: [INSCRITOS_KEY] });
	toast({ title: 'Inscrição atualizada', variant: 'success' });
	return data;
}

export async function approveInscricao(id: string) {
	return updateInscricao(id, { has_access: true });
}

export async function cancelInscricao(id: string) {
	const { error } = await supabase.from('inscritos').delete().eq('id', id);

	if (error) {
		toast({ title: 'Erro ao cancelar inscrição', description: error.message, variant: 'error' });
		throw error;
	}

	await queryClient.invalidateQueries({ queryKey: [INSCRITOS_KEY] });
	toast({ title: 'Inscrição cancelada', variant: 'success' });
}