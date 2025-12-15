import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabaseClient';
import { Donation } from '../lib/types';
import { toast } from '../components/Toast';
import { queryClient } from '../lib/queryClient';

const DOACOES_KEY = 'doacoes';
const DOACOES_STALE = 10 * 60 * 1000; // 10 min
const DOACOES_CACHE = 30 * 60 * 1000; // 30 min

export function useDoacoes() {
	const { data, isLoading, error, isFetching, refetch } = useQuery<Donation[], Error>({
		queryKey: [DOACOES_KEY],
		queryFn: async () => {
			const { data, error } = await supabase.from('donations').select('*').order('created_at', { ascending: true });
			if (error) throw error;
			return data || [];
		},
		staleTime: DOACOES_STALE,
		cacheTime: DOACOES_CACHE,
	});

	return { doacoes: data ?? [], loading: isLoading || isFetching, error, refetch };
}

export async function saveDoacao(row: Partial<Donation> & { id?: string }) {
	if (!row.title || !row.description || !row.detail || !row.reference) {
		throw new Error('Preencha todos os campos da doação');
	}

	if (row.id) {
		const { error } = await supabase
			.from('donations')
			.update({
				title: row.title,
				description: row.description,
				detail: row.detail,
				reference: row.reference,
			})
			.eq('id', row.id);

		if (error) {
			toast({ title: 'Erro ao salvar doação', description: error.message, variant: 'error' });
			throw error;
		}
	} else {
		const { data, error } = await supabase
			.from('donations')
			.insert({
				title: row.title,
				description: row.description,
				detail: row.detail,
				reference: row.reference,
			})
			.select()
			.single();

		if (error) {
			toast({ title: 'Erro ao salvar doação', description: error.message, variant: 'error' });
			throw error;
		}

		row.id = data.id;
	}

	await queryClient.invalidateQueries({ queryKey: [DOACOES_KEY] });
	toast({ title: 'Doação atualizada', variant: 'success' });
	return row;
}

