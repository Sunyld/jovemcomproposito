import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from './useAuth';

export function useUnreadNotifications() {
	const { user } = useAuth();
	const [unreadCount, setUnreadCount] = useState(0);

	useEffect(() => {
		if (!user) {
			setUnreadCount(0);
			return;
		}

		let mounted = true;

		async function fetchUnreadCount() {
			try {
				const { data, error } = await supabase
					.from('notifications')
					.select('id')
					.eq('user_id', user.id)
					.eq('read', false);

				if (error) throw error;
				if (mounted) {
					setUnreadCount(data?.length || 0);
				}
			} catch (err) {
				// Silent fail
				if (mounted) {
					setUnreadCount(0);
				}
			}
		}

		fetchUnreadCount();

		// Subscribe to realtime updates
		const channel = supabase
			.channel('unread_notifications')
			.on(
				'postgres_changes',
				{
					event: '*',
					schema: 'public',
					table: 'notifications',
					filter: `user_id=eq.${user.id}`,
				},
				() => {
					// Refetch count when notifications change
					if (mounted) {
						fetchUnreadCount();
					}
				}
			)
			.subscribe();

		return () => {
			mounted = false;
			channel.unsubscribe();
		};
	}, [user?.id]);

	return unreadCount;
}

