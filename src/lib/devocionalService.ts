import { supabase } from './supabaseClient';

export type DevocionalSeries = {
	id: string;
	title: string;
	start_at: string;
	status: 'draft' | 'active' | 'expired';
	tipo: 'series' | 'single';
	created_by: string;
	created_at: string;
	updated_at: string;
};

export type DevocionalItem = {
	id: string;
	series_id: string;
	day_number: number | null;
	title: string;
	content: string;
	created_at: string;
	updated_at: string;
};

export type ActiveDevocional = {
	series_id: string;
	item_id: string;
	title: string;
	content: string;
	day_number: number;
	tipo: 'series' | 'single';
	start_at: string;
	expires_at: string;
};

/**
 * Calculates which devocional should be active based on current time
 */
export function calculateActiveDevocional(series: DevocionalSeries, items: DevocionalItem[]): ActiveDevocional | null {
	if (series.status !== 'active') return null;

	const startAt = new Date(series.start_at);
	const now = new Date();
	const hoursSinceStart = (now.getTime() - startAt.getTime()) / (1000 * 60 * 60);

	// For single devocionais
	if (series.tipo === 'single') {
		const item = items[0];
		if (!item) return null;

		// Check if expired (24h passed)
		if (hoursSinceStart >= 24) {
			return null; // Will be marked as expired by getActiveDevocional
		}

		return {
			series_id: series.id,
			item_id: item.id,
			title: item.title,
			content: item.content,
			day_number: 1,
			tipo: 'single',
			start_at: series.start_at,
			expires_at: new Date(startAt.getTime() + 24 * 60 * 60 * 1000).toISOString(),
		};
	}

	// For series (7 days)
	const activeIndex = Math.floor(hoursSinceStart / 24);

	// If series expired (7 days passed)
	if (activeIndex >= 7) {
		return null; // Will be marked as expired by getActiveDevocional
	}

	const activeItem = items.find((item) => item.day_number === activeIndex + 1);
	if (!activeItem) return null;

	return {
		series_id: series.id,
		item_id: activeItem.id,
		title: activeItem.title,
		content: activeItem.content,
		day_number: activeItem.day_number || activeIndex + 1,
		tipo: 'series',
		start_at: series.start_at,
		expires_at: new Date(startAt.getTime() + (activeIndex + 1) * 24 * 60 * 60 * 1000).toISOString(),
	};
}

/**
 * Gets the currently active devocional
 */
export async function getActiveDevocional(): Promise<ActiveDevocional | null> {
	try {
		// Use the SQL function
		const { data, error } = await supabase.rpc('get_active_devocional');

		if (error) throw error;
		if (!data || data.length === 0) return null;

		return data[0] as ActiveDevocional;
	} catch (err) {
		// Fallback: manual calculation
		const { data: seriesData, error: seriesError } = await supabase
			.from('devocional_series')
			.select('*')
			.eq('status', 'active')
			.order('start_at', { ascending: false })
			.limit(1)
			.single();

		if (seriesError || !seriesData) return null;

		const { data: itemsData, error: itemsError } = await supabase
			.from('devocional_items')
			.select('*')
			.eq('series_id', seriesData.id)
			.order('day_number', { ascending: true });

		if (itemsError || !itemsData) return null;

		const active = calculateActiveDevocional(seriesData as DevocionalSeries, itemsData as DevocionalItem[]);
		
		// If expired, mark as expired
		if (!active) {
			await markAsExpired(seriesData.id);
		}
		
		return active;
	}
}

/**
 * Marks a devocional series as expired
 */
export async function markAsExpired(seriesId: string) {
	try {
		await supabase.from('devocional_series').update({ status: 'expired' }).eq('id', seriesId);
	} catch (err) {
		// Silent fail - will be handled by next check
	}
}

/**
 * Publishes a devocional series (deactivates others automatically via trigger)
 */
export async function publishDevocionalSeries(seriesId: string) {
	try {
		if (!seriesId) {
			throw new Error('ID da série não fornecido');
		}

		// First verify the series exists and has items
		const { data: seriesData, error: seriesError } = await supabase
			.from('devocional_series')
			.select('id, tipo, status')
			.eq('id', seriesId)
			.single();

		if (seriesError) {
			throw new Error(`Erro ao buscar série: ${seriesError.message || seriesError.code || 'Erro desconhecido'}`);
		}

		if (!seriesData) {
			throw new Error('Série não encontrada');
		}

		// Check if series has items
		const { data: itemsData, error: itemsError } = await supabase
			.from('devocional_items')
			.select('id')
			.eq('series_id', seriesId);

		if (itemsError) {
			throw new Error(`Erro ao verificar itens: ${itemsError.message || itemsError.code || 'Erro desconhecido'}`);
		}

		if (!itemsData || itemsData.length === 0) {
			throw new Error('A série não possui devocionais. Adicione pelo menos um devocional antes de publicar.');
		}

		// Validate: series must have 7 items, single must have 1
		if (seriesData.tipo === 'series') {
			if (itemsData.length !== 7) {
				throw new Error(`Uma série deve ter exatamente 7 devocionais. Encontrados: ${itemsData.length}`);
			}
		} else if (seriesData.tipo === 'single') {
			if (itemsData.length !== 1) {
				throw new Error(`Um devocional instantâneo deve ter exatamente 1 item. Encontrados: ${itemsData.length}`);
			}
		}

		// Now publish
		const { data, error } = await supabase
			.from('devocional_series')
			.update({ 
				status: 'active', 
				start_at: new Date().toISOString() 
			})
			.eq('id', seriesId)
			.select()
			.single();

		if (error) {
			throw new Error(`Erro ao publicar: ${error.message || error.code || 'Erro desconhecido'}. Detalhes: ${JSON.stringify(error)}`);
		}

		if (!data) {
			throw new Error('Nenhum dado retornado após publicação');
		}

		return { data, error: null };
	} catch (err: any) {
		const errorMessage = err instanceof Error 
			? err.message 
			: typeof err === 'string' 
				? err 
				: err?.message || JSON.stringify(err) || 'Erro desconhecido ao publicar';
		
		return { 
			data: null, 
			error: new Error(errorMessage)
		};
	}
}

