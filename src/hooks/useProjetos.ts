import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Projeto, ProjetoInscricao } from '../lib/types';
import { toast } from '../components/Toast';

export function useProjetos(filters?: { status?: string }) {
	const [projetos, setProjetos] = useState<Projeto[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		let mounted = true;

		async function loadProjetos() {
			setLoading(true);
			try {
				let query = supabase.from('projetos').select('*').order('created_at', { ascending: false });

				if (filters?.status) {
					query = query.eq('status', filters.status);
				}

				const { data, error } = await query;

				if (error) throw error;
				if (mounted) {
					setProjetos(data || []);
				}
			} catch (err: any) {
				if (mounted) {
					toast({ title: 'Erro ao carregar projetos', description: err.message, variant: 'error' });
				}
			} finally {
				if (mounted) {
					setLoading(false);
				}
			}
		}

		loadProjetos();

		return () => {
			mounted = false;
		};
	}, [filters?.status]);

	const refetch = async () => {
		setLoading(true);
		try {
			let query = supabase.from('projetos').select('*').order('created_at', { ascending: false });

			if (filters?.status) {
				query = query.eq('status', filters.status);
			}

			const { data, error } = await query;

			if (error) throw error;
			setProjetos(data || []);
		} catch (err: any) {
			toast({ title: 'Erro ao carregar projetos', description: err.message, variant: 'error' });
		} finally {
			setLoading(false);
		}
	};

	return { projetos, loading, refetch };
}

export function useProjeto(id: string | undefined) {
	const [projeto, setProjeto] = useState<Projeto | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		if (!id) {
			setLoading(false);
			return;
		}

		let mounted = true;

		async function loadProjeto() {
			setLoading(true);
			try {
				const { data, error } = await supabase.from('projetos').select('*').eq('id', id).single();

				if (error) throw error;
				if (mounted) {
					setProjeto(data);
				}
			} catch (err: any) {
				if (mounted) {
					toast({ title: 'Erro ao carregar projeto', description: err.message, variant: 'error' });
				}
			} finally {
				if (mounted) {
					setLoading(false);
				}
			}
		}

		loadProjeto();

		return () => {
			mounted = false;
		};
	}, [id]);

	return { projeto, loading };
}

export function useProjetoInscricoes(projetoId?: string) {
	const [inscricoes, setInscricoes] = useState<ProjetoInscricao[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		if (!projetoId) {
			setLoading(false);
			return;
		}

		let mounted = true;

		async function loadInscricoes() {
			setLoading(true);
			try {
				const { data, error } = await supabase
					.from('projeto_inscricoes')
					.select('*')
					.eq('projeto_id', projetoId)
					.order('created_at', { ascending: false });

				if (error) throw error;
				if (mounted) {
					setInscricoes(data || []);
				}
			} catch (err: any) {
				if (mounted) {
					toast({ title: 'Erro ao carregar inscrições', description: err.message, variant: 'error' });
				}
			} finally {
				if (mounted) {
					setLoading(false);
				}
			}
		}

		loadInscricoes();

		return () => {
			mounted = false;
		};
	}, [projetoId]);

	const refetch = async () => {
		if (!projetoId) return;
		setLoading(true);
		try {
			const { data, error } = await supabase
				.from('projeto_inscricoes')
				.select('*')
				.eq('projeto_id', projetoId)
				.order('created_at', { ascending: false });

			if (error) throw error;
			setInscricoes(data || []);
		} catch (err: any) {
			toast({ title: 'Erro ao carregar inscrições', description: err.message, variant: 'error' });
		} finally {
			setLoading(false);
		}
	};

	return { inscricoes, loading, refetch };
}

export async function createProjeto(projeto: {
	title: string;
	description: string;
	cover_url?: string;
	type: 'voluntariado' | 'projeto-pratico' | 'comunidade';
	max_volunteers?: number;
}) {
	try {
		const { data: { user } } = await supabase.auth.getUser();
		if (!user) throw new Error('Usuário não autenticado');

		const { data, error } = await supabase
			.from('projetos')
			.insert({
				...projeto,
				created_by: user.id,
				status: 'aberto',
			})
			.select()
			.single();

		if (error) throw error;
		toast({ title: 'Projeto criado', description: 'O projeto foi criado com sucesso.', variant: 'success' });
		return { data, error: null };
	} catch (err: any) {
		toast({ title: 'Erro ao criar projeto', description: err.message, variant: 'error' });
		return { data: null, error: err };
	}
}

export async function updateProjeto(id: string, updates: Partial<Projeto>) {
	try {
		const { data, error } = await supabase.from('projetos').update(updates).eq('id', id).select().single();

		if (error) throw error;
		toast({ title: 'Projeto atualizado', variant: 'success' });
		return { data, error: null };
	} catch (err: any) {
		toast({ title: 'Erro ao atualizar projeto', description: err.message, variant: 'error' });
		return { data: null, error: err };
	}
}

export async function deleteProjeto(id: string) {
	try {
		const { error } = await supabase.from('projetos').delete().eq('id', id);

		if (error) throw error;
		toast({ title: 'Projeto deletado', variant: 'success' });
		return { error: null };
	} catch (err: any) {
		toast({ title: 'Erro ao deletar projeto', description: err.message, variant: 'error' });
		return { error: err };
	}
}

export async function createProjetoInscricao(projetoId: string, message?: string) {
	try {
		const { data: { user } } = await supabase.auth.getUser();
		if (!user) throw new Error('Usuário não autenticado');

		const { data, error } = await supabase
			.from('projeto_inscricoes')
			.insert({
				projeto_id: projetoId,
				user_id: user.id,
				message: message || null,
				status: 'pendente',
			})
			.select()
			.single();

		if (error) throw error;
		toast({ title: 'Inscrição realizada', description: 'Sua inscrição foi enviada com sucesso.', variant: 'success' });
		return { data, error: null };
	} catch (err: any) {
		toast({ title: 'Erro ao se inscrever', description: err.message, variant: 'error' });
		return { data: null, error: err };
	}
}

export async function updateProjetoInscricao(id: string, status: 'pendente' | 'aprovado' | 'rejeitado') {
	try {
		const { data, error } = await supabase
			.from('projeto_inscricoes')
			.update({ status })
			.eq('id', id)
			.select()
			.single();

		if (error) throw error;
		toast({ title: 'Inscrição atualizada', variant: 'success' });
		return { data, error: null };
	} catch (err: any) {
		toast({ title: 'Erro ao atualizar inscrição', description: err.message, variant: 'error' });
		return { data: null, error: err };
	}
}

