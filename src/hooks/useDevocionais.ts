import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabaseClient';
import { DevocionalSeries, DevocionalItem, getActiveDevocional } from '../lib/devocionalService';
import { toast } from '../components/Toast';
import { queryClient } from '../lib/queryClient';

const DEVOCIONAL_KEY = 'devocional';
const DEVOCIONAL_SERIES_KEY = 'devocional-series';

export function useDevocional() {
	const { data, isLoading, error, isFetching, refetch } = useQuery({
		queryKey: [DEVOCIONAL_KEY, 'active'],
		queryFn: async () => {
			const result = await getActiveDevocional();
			if (result.error) throw result.error;
			return result.data ?? null;
		},
		staleTime: 30 * 1000,
		refetchInterval: 30 * 1000,
	});

	return { devocional: data ?? null, loading: isLoading || isFetching, error, refetch };
}

export function useDevocionalSeries(filters?: { status?: string }) {
	const [series, setSeries] = useState<DevocionalSeries[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		let mounted = true;

		async function loadSeries() {
			setLoading(true);
			try {
				let query = supabase.from('devocional_series').select('*').order('created_at', { ascending: false });

				if (filters?.status) {
					query = query.eq('status', filters.status);
				}

				const { data, error } = await query;

				if (error) throw error;
				if (mounted) {
					setSeries(data || []);
				}
			} catch (err: any) {
				if (mounted) {
					toast({ title: 'Erro ao carregar séries', description: err.message, variant: 'error' });
				}
			} finally {
				if (mounted) {
					setLoading(false);
				}
			}
		}

		loadSeries();

		return () => {
			mounted = false;
		};
	}, [filters?.status]);

	const refetch = async () => {
		setLoading(true);
		try {
			let query = supabase.from('devocional_series').select('*').order('created_at', { ascending: false });

			if (filters?.status) {
				query = query.eq('status', filters.status);
			}

			const { data, error } = await query;

			if (error) throw error;
			setSeries(data || []);
		} catch (err: any) {
			toast({ title: 'Erro ao carregar séries', description: err.message, variant: 'error' });
		} finally {
			setLoading(false);
		}
	};

	return { series, loading, refetch };
}

export function useDevocionalSeriesWithItems(seriesId?: string) {
	const [series, setSeries] = useState<DevocionalSeries | null>(null);
	const [items, setItems] = useState<DevocionalItem[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		if (!seriesId) {
			setLoading(false);
			return;
		}

		let mounted = true;

		async function loadSeriesWithItems() {
			if (!seriesId) return;
			setLoading(true);
			try {
				const { data: seriesData, error: seriesError } = await supabase
					.from('devocional_series')
					.select('*')
					.eq('id', seriesId)
					.single();

				if (seriesError) throw seriesError;

				const { data: itemsData, error: itemsError } = await supabase
					.from('devocional_items')
					.select('*')
					.eq('series_id', seriesId)
					.order('day_number', { ascending: true });

				if (itemsError) throw itemsError;

				if (mounted) {
					setSeries(seriesData as DevocionalSeries);
					setItems((itemsData || []) as DevocionalItem[]);
				}
			} catch (err: any) {
				if (mounted) {
					toast({ title: 'Erro ao carregar série', description: err.message, variant: 'error' });
				}
			} finally {
				if (mounted) {
					setLoading(false);
				}
			}
		}

		loadSeriesWithItems();

		return () => {
			mounted = false;
		};
	}, [seriesId]);

	const refetch = async () => {
		if (!seriesId) return;
		setLoading(true);
		try {
			const { data: seriesData, error: seriesError } = await supabase
				.from('devocional_series')
				.select('*')
				.eq('id', seriesId)
				.single();

			if (seriesError) throw seriesError;

			const { data: itemsData, error: itemsError } = await supabase
				.from('devocional_items')
				.select('*')
				.eq('series_id', seriesId)
				.order('day_number', { ascending: true });

			if (itemsError) throw itemsError;

			setSeries(seriesData as DevocionalSeries);
			setItems((itemsData || []) as DevocionalItem[]);
		} catch (err: any) {
			toast({ title: 'Erro ao carregar série', description: err.message, variant: 'error' });
		} finally {
			setLoading(false);
		}
	};

	return { series, items, loading, refetch };
}

export async function createDevocionalSeries(
	tipo: 'series' | 'single',
	title: string,
	items: Array<{ day_number: number | null; title: string; content: string }>
) {
	try {
		const { data: { user } } = await supabase.auth.getUser();
		if (!user) throw new Error('Usuário não autenticado');

		// Validate: series must have exactly 7 items
		if (tipo === 'series' && items.length !== 7) {
			throw new Error('Uma série deve ter exatamente 7 devocionais');
		}

		// Validate: single must have exactly 1 item
		if (tipo === 'single' && items.length !== 1) {
			throw new Error('Um devocional instantâneo deve ter exatamente 1 item');
		}

		// Create series
		const { data: seriesData, error: seriesError } = await supabase
			.from('devocional_series')
			.insert({
				title,
				tipo,
				status: 'draft',
				created_by: user.id,
				start_at: new Date().toISOString(), // Will be updated on publish
			})
			.select()
			.single();

		if (seriesError) throw seriesError;

		// Create items
		const itemsToInsert = items.map((item) => ({
			series_id: seriesData.id,
			day_number: item.day_number,
			title: item.title,
			content: item.content,
		}));

		const { error: itemsError } = await supabase.from('devocional_items').insert(itemsToInsert);

		if (itemsError) throw itemsError;

		toast({
			title: tipo === 'series' ? 'Série criada' : 'Devocional criado',
			description: tipo === 'series' ? 'A série de 7 devocionais foi criada com sucesso.' : 'O devocional foi criado com sucesso.',
			variant: 'success',
		});

		await queryClient.invalidateQueries({ queryKey: [DEVOCIONAL_SERIES_KEY] });
		await queryClient.invalidateQueries({ queryKey: [DEVOCIONAL_KEY, 'active'] });
		return { data: seriesData, error: null };
	} catch (err: any) {
		toast({ title: 'Erro ao criar devocional', description: err.message, variant: 'error' });
		return { data: null, error: err };
	}
}

export async function updateDevocionalSeries(seriesId: string, updates: Partial<DevocionalSeries>) {
	try {
		const { data, error } = await supabase
			.from('devocional_series')
			.update(updates)
			.eq('id', seriesId)
			.select()
			.single();

		if (error) throw error;
		toast({ title: 'Série atualizada', variant: 'success' });
		await queryClient.invalidateQueries({ queryKey: [DEVOCIONAL_SERIES_KEY] });
		await queryClient.invalidateQueries({ queryKey: [DEVOCIONAL_KEY, 'active'] });
		return { data, error: null };
	} catch (err: any) {
		toast({ title: 'Erro ao atualizar série', description: err.message, variant: 'error' });
		return { data: null, error: err };
	}
}

export async function updateDevocionalItem(itemId: string, updates: Partial<DevocionalItem>) {
	try {
		const { data, error } = await supabase
			.from('devocional_items')
			.update(updates)
			.eq('id', itemId)
			.select()
			.single();

		if (error) throw error;
		await queryClient.invalidateQueries({ queryKey: [DEVOCIONAL_SERIES_KEY] });
		await queryClient.invalidateQueries({ queryKey: [DEVOCIONAL_KEY, 'active'] });
		return { data, error: null };
	} catch (err: any) {
		toast({ title: 'Erro ao atualizar item', description: err.message, variant: 'error' });
		return { data: null, error: err };
	}
}

export async function publishDevocionalSeries(seriesId: string) {
	try {
		const { publishDevocionalSeries: publishFn } = await import('../lib/devocionalService');
		const result = await publishFn(seriesId);

		if (result.error) {
			// Don't show toast here - let the caller handle it
			return result;
		}

		// Success toast will be shown by the caller
		await queryClient.invalidateQueries({ queryKey: [DEVOCIONAL_SERIES_KEY] });
		await queryClient.invalidateQueries({ queryKey: [DEVOCIONAL_KEY, 'active'] });
		return result;
	} catch (err: any) {
		// Don't show toast here - let the caller handle it
		return { data: null, error: err };
	}
}

export async function deleteDevocionalSeries(seriesId: string) {
	try {
		const { error } = await supabase.from('devocional_series').delete().eq('id', seriesId);

		if (error) throw error;
		toast({ title: 'Série deletada', variant: 'success' });
		await queryClient.invalidateQueries({ queryKey: [DEVOCIONAL_SERIES_KEY] });
		await queryClient.invalidateQueries({ queryKey: [DEVOCIONAL_KEY, 'active'] });
		return { error: null };
	} catch (err: any) {
		toast({ title: 'Erro ao deletar série', description: err.message, variant: 'error' });
		return { error: err };
	}
}
