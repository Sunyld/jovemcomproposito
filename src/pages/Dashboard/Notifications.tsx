import DashboardShell from '../../components/dashboard/DashboardShell';
import { useNotifications, markAsRead, markAllAsRead } from '../../hooks/useNotifications';
import { useAuth } from '../../hooks/useAuth';
import { Card, Button } from '../../components/ui';
import { Bell, Check, CheckCheck, Inbox } from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import { Link } from 'react-router-dom';

export default function Notifications() {
	const { user, profile } = useAuth();
	const { notifications, loading } = useNotifications();

	const handleMarkAsRead = async (id: string) => {
		await markAsRead(id);
	};

	const handleMarkAllAsRead = async () => {
		if (user) {
			await markAllAsRead(user.id);
		}
	};

	const unreadCount = notifications.filter((n) => !n.read).length;

	// Determine role dynamically based on user's profile
	const roleForShell = profile?.role === 'admin' || profile?.role === 'mentor' 
		? (profile.role as 'admin' | 'mentor' | 'user') 
		: 'user';

	if (loading) {
		return (
			<DashboardShell role={roleForShell} title="Notificações" subtitle="Acompanhe suas notificações.">
				<LoadingSpinner size="lg" className="py-12" />
			</DashboardShell>
		);
	}

	return (
		<DashboardShell role={roleForShell} title="Notificações" subtitle={`Você tem ${unreadCount} notificação${unreadCount !== 1 ? 'ões' : ''} não lida${unreadCount !== 1 ? 's' : ''}.`}>
			<div className="space-y-4">
				{notifications.length > 0 && unreadCount > 0 && (
					<div className="flex justify-end">
						<Button
							variant="secondary"
							size="md"
							onClick={handleMarkAllAsRead}
							icon={<CheckCheck size={16} />}
						>
							<span className="hidden sm:inline">Marcar todas como lidas</span>
							<span className="sm:hidden">Todas</span>
						</Button>
					</div>
				)}

				{notifications.length === 0 ? (
					<EmptyState icon={Inbox} title="Nenhuma notificação" description="Você não tem notificações no momento." />
				) : (
					<div className="space-y-3">
						{notifications.map((notification) => (
							<NotificationCard key={notification.id} notification={notification} onMarkAsRead={handleMarkAsRead} />
						))}
					</div>
				)}
			</div>
		</DashboardShell>
	);
}

function NotificationCard({ notification, onMarkAsRead }: { notification: any; onMarkAsRead: (id: string) => void }) {
	const getIcon = () => {
		switch (notification.type) {
			case 'inscricao':
				return Bell;
			case 'aprovacao':
				return Check;
			case 'feedback':
				return Bell;
			default:
				return Bell;
		}
	};

	const Icon = getIcon();

	const cardVariant = notification.read ? 'default' : 'elevated';
	const cardClassName = notification.read 
		? 'border-border/50 bg-surface/50' 
		: 'border-purple/30 bg-purple/5';

	const CardContent = (
		<Card 
			padding="md" 
			variant={cardVariant}
			className={`transition ${notification.link ? 'hover:bg-surface/80 cursor-pointer' : ''} ${cardClassName}`}
		>
			<div className="flex items-start gap-3">
				<div className={`h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 ${
					notification.read 
						? 'bg-surface/30' 
						: 'bg-purple/20'
				}`}>
					<Icon size={18} className={notification.read ? 'text-text-secondary' : 'text-purple'} aria-hidden="true" />
				</div>
				<div className="flex-1 min-w-0">
					<div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
						<div className="flex-1 min-w-0">
							<h3 className={`font-medium text-sm sm:text-base ${notification.read ? 'text-text-secondary' : 'text-text-primary'}`}>
								{notification.title}
							</h3>
							<p className="text-sm text-text-secondary mt-1 break-words">{notification.message}</p>
							<div className="text-xs text-text-secondary mt-2">
								{new Date(notification.created_at).toLocaleString('pt-BR')}
							</div>
						</div>
						{!notification.read && (
							<Button
								variant="ghost"
								size="sm"
								onClick={(e) => {
									e.preventDefault();
									e.stopPropagation();
									onMarkAsRead(notification.id);
								}}
								title="Marcar como lida"
								aria-label="Marcar como lida"
								icon={<Check size={14} />}
								className="flex-shrink-0 self-start sm:self-auto"
							/>
						)}
					</div>
					{notification.link && (
						<div className="mt-3">
							<span className="text-sm text-purple inline-flex items-center gap-1">
								Ver detalhes →
							</span>
						</div>
					)}
				</div>
			</div>
		</Card>
	);

	if (notification.link) {
		return (
			<Link to={notification.link}>
				{CardContent}
			</Link>
		);
	}

	return CardContent;
}

