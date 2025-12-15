import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabaseClient';
import { Notification } from '../lib/types';
import { toast } from '../components/Toast';
import { useAuth } from './useAuth';
import { queryClient } from '../lib/queryClient';

const NOTIFICATIONS_KEY = 'notifications';

export function useNotifications() {
	const { user } = useAuth();

	const { data, isLoading, error, isFetching } = useQuery<Notification[], Error>({
		queryKey: [NOTIFICATIONS_KEY, user?.id],
		enabled: !!user?.id,
		queryFn: async () => {
			if (!user?.id) return [];
			const { data, error } = await supabase
				.from('notifications')
				.select('*')
				.eq('user_id', user.id)
				.order('created_at', { ascending: false })
				.limit(50);
			if (error) throw error;
			return data || [];
		},
		staleTime: 30 * 1000,
	});

	useEffect(() => {
		if (!user?.id) return;

		const channel = supabase
			.channel('notifications')
			.on(
				'postgres_changes',
				{ event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` },
				(payload) => {
					queryClient.setQueryData<Notification[]>([NOTIFICATIONS_KEY, user.id], (prev) => [payload.new as Notification, ...(prev ?? [])]);
				}
			)
			.on(
				'postgres_changes',
				{ event: 'UPDATE', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` },
				(payload) => {
					queryClient.setQueryData<Notification[]>([NOTIFICATIONS_KEY, user.id], (prev) =>
						(prev ?? []).map((n) => (n.id === payload.new.id ? (payload.new as Notification) : n))
					);
				}
			)
			.subscribe();

		return () => {
			channel.unsubscribe();
		};
	}, [user?.id]);

	return { notifications: data ?? [], loading: isLoading || isFetching, error };
}

export async function markAsRead(id: string) {
	const { error } = await supabase.from('notifications').update({ read: true }).eq('id', id);

	if (error) {
		toast({ title: 'Erro ao marcar notificação', description: error.message, variant: 'error' });
		throw error;
	}

	await queryClient.invalidateQueries({ queryKey: [NOTIFICATIONS_KEY] });
}

export async function markAllAsRead(userId: string) {
	const { error } = await supabase.from('notifications').update({ read: true }).eq('user_id', userId).eq('read', false);

	if (error) {
		toast({ title: 'Erro ao marcar notificações', description: error.message, variant: 'error' });
		throw error;
	}

	await queryClient.invalidateQueries({ queryKey: [NOTIFICATIONS_KEY, userId] });
}

export async function createNotification(userId: string, type: Notification['type'], title: string, message: string, link?: string) {
	const { data, error } = await supabase
		.from('notifications')
		.insert({
			user_id: userId,
			type,
			title,
			message,
			link: link || null,
		})
		.select()
		.single();

	if (error) {
		console.error('Erro ao criar notificação:', error);
		throw error;
	}

	await queryClient.invalidateQueries({ queryKey: [NOTIFICATIONS_KEY, userId] });
	return data;
}





