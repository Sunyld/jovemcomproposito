import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabaseClient';
import { Category } from '../lib/types';
import { toast } from '../components/Toast';
import { queryClient } from '../lib/queryClient';

const CATEGORY_KEY = ['categories'];
const CATEGORY_STALE = 10 * 60 * 1000; // 10 min
const CATEGORY_CACHE = 30 * 60 * 1000; // 30 min

export function useCategories() {
	const {
		data,
		isLoading,
		error,
	} = useQuery<Category[], Error>({
		queryKey: CATEGORY_KEY,
		queryFn: async () => {
			const { data, error } = await supabase.from('categories').select('*').order('name', { ascending: true });
			if (error) throw error;
			return data || [];
		},
		staleTime: CATEGORY_STALE,
		cacheTime: CATEGORY_CACHE,
	});

	return { categories: data ?? [], loading: isLoading, error };
}

export async function createCategory(name: string) {
	const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
	const { data, error } = await supabase.from('categories').insert({ name, slug }).select().single();

	if (error) {
		toast({ title: 'Erro ao criar categoria', description: error.message, variant: 'error' });
		throw error;
	}

	await queryClient.invalidateQueries({ queryKey: CATEGORY_KEY });
	toast({ 
		title: 'Categoria criada com sucesso!', 
		description: `A categoria "${name}" foi adicionada.`,
		variant: 'success' 
	});
	return data;
}

export async function updateCategory(id: string, name: string) {
	const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
	const { data, error } = await supabase.from('categories').update({ name, slug }).eq('id', id).select().single();

	if (error) {
		toast({ title: 'Erro ao atualizar categoria', description: error.message, variant: 'error' });
		throw error;
	}

	await queryClient.invalidateQueries({ queryKey: CATEGORY_KEY });
	toast({ 
		title: 'Categoria atualizada com sucesso!', 
		description: 'As alterações foram salvas.',
		variant: 'success' 
	});
	return data;
}

export async function deleteCategory(id: string) {
	const { error } = await supabase.from('categories').delete().eq('id', id);

	if (error) {
		toast({ title: 'Erro ao deletar categoria', description: error.message, variant: 'error' });
		throw error;
	}

	await queryClient.invalidateQueries({ queryKey: CATEGORY_KEY });
	toast({ 
		title: 'Categoria deletada com sucesso!', 
		description: 'A categoria foi removida permanentemente.',
		variant: 'success' 
	});
}
