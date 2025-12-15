import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabaseClient';
import { Feedback } from '../lib/types';
import { toast } from '../components/Toast';
import { queryClient } from '../lib/queryClient';

const FEEDBACK_KEY = 'feedback';

export function useFeedback(mentoriaId: string | undefined) {
	const { data, isLoading, error, isFetching } = useQuery<Feedback[], Error>({
		queryKey: [FEEDBACK_KEY, mentoriaId],
		enabled: !!mentoriaId,
		queryFn: async () => {
			if (!mentoriaId) return [];
			const { data, error } = await supabase
				.from('feedback')
				.select('*')
				.eq('mentoria_id', mentoriaId)
				.order('created_at', { ascending: false });
			if (error) throw error;
			return data || [];
		},
		staleTime: 3 * 60 * 1000,
	});

	return { feedback: data ?? [], loading: isLoading || isFetching, error };
}

export async function createFeedback(mentoriaId: string, rating: number, comment?: string) {
	const { data: { user } } = await supabase.auth.getUser();
	if (!user) throw new Error('Usuário não autenticado');

	const { data, error } = await supabase
		.from('feedback')
		.insert({
			user_id: user.id,
			mentoria_id: mentoriaId,
			rating,
			comment: comment || null,
		})
		.select()
		.single();

	if (error) {
		toast({ title: 'Erro ao criar feedback', description: error.message, variant: 'error' });
		throw error;
	}

	await queryClient.invalidateQueries({ queryKey: [FEEDBACK_KEY, mentoriaId] });
	toast({ title: 'Feedback enviado', variant: 'success' });
	return data;
}

export async function updateFeedback(id: string, rating: number, comment?: string) {
	const { data, error } = await supabase
		.from('feedback')
		.update({ rating, comment: comment || null })
		.eq('id', id)
		.select()
		.single();

	if (error) {
		toast({ title: 'Erro ao atualizar feedback', description: error.message, variant: 'error' });
		throw error;
	}

	await queryClient.invalidateQueries({ queryKey: [FEEDBACK_KEY] });
	toast({ title: 'Feedback atualizado', variant: 'success' });
	return data;
}