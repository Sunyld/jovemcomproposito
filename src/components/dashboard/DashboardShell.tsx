import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
	BarChart3,
	Bell,
	BookOpen,
	ChevronLeft,
	CreditCard,
	FilePlus2,
	FileText,
	Home,
	Layers,
	LayoutDashboard,
	LogOut,
	Menu,
	Moon,
	PieChart,
	ShieldCheck,
	Star,
	SunMedium,
	UserCircle2,
	UserCog,
	Users2,
	Calendar,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../ThemeProvider';
import { useUnreadNotifications } from '../../hooks/useUnreadNotifications';

type Role = 'admin' | 'mentor' | 'user';

type MenuItem = {
	label: string;
	to: string;
	icon: React.ComponentType<{ size?: number }>;
};

const menuByRole: Record<Role, MenuItem[]> = {
	admin: [
		{ label: 'Resumo', to: '/dashboard/admin', icon: LayoutDashboard },
		{ label: 'Administradores', to: '/dashboard/admin/admins', icon: ShieldCheck },
		{ label: 'Mentores', to: '/dashboard/admin/mentores', icon: Users2 },
		{ label: 'Categorias', to: '/dashboard/admin/categorias', icon: Layers },
		{ label: 'Devocionais', to: '/dashboard/admin/devocionais', icon: Calendar },
		{ label: 'Projetos', to: '/dashboard/admin/projetos', icon: Layers },
		{ label: 'Métricas', to: '/dashboard/admin/metricas', icon: PieChart },
		{ label: 'Relatórios', to: '/dashboard/admin/relatorios', icon: BarChart3 },
		{ label: 'Usuários', to: '/dashboard/admin/usuarios', icon: UserCog },
		{ label: 'Doações', to: '/dashboard/admin/doacoes', icon: CreditCard },
		{ label: 'Notificações', to: '/dashboard/notifications', icon: Bell },
		{ label: 'Perfil', to: '/dashboard/profile', icon: UserCircle2 },
	],
	mentor: [
		{ label: 'Painel', to: '/dashboard/mentor', icon: LayoutDashboard },
		{ label: 'Minhas Mentorias', to: '/dashboard/mentor/mentorias', icon: FileText },
		{ label: 'Criar mentoria', to: '/dashboard/mentor/mentorias/new', icon: FilePlus2 },
		{ label: 'Inscrições', to: '/dashboard/mentor/inscricoes', icon: Users2 },
		{ label: 'Feedback', to: '/dashboard/mentor/feedback', icon: Star },
		{ label: 'Devocional', to: '/devocional', icon: BookOpen },
		{ label: 'Notificações', to: '/dashboard/notifications', icon: Bell },
		{ label: 'Perfil', to: '/dashboard/profile', icon: UserCircle2 },
	],
	user: [
		{ label: 'Visão geral', to: '/dashboard/user', icon: LayoutDashboard },
		{ label: 'Minhas Mentorias', to: '/dashboard/user/mentorias', icon: FileText },
		{ label: 'Minhas Inscrições', to: '/dashboard/user/inscricoes', icon: Users2 },
		{ label: 'Avaliar', to: '/dashboard/user/feedback', icon: Star },
		{ label: 'Devocional', to: '/devocional', icon: BookOpen },
		{ label: 'Discipulados', to: '/discipulado', icon: BookOpen },
		{ label: 'Projetos', to: '/projetos', icon: Layers },
		{ label: 'Doação', to: '/doacao', icon: CreditCard },
		{ label: 'Notificações', to: '/dashboard/notifications', icon: Bell },
		{ label: 'Perfil', to: '/dashboard/profile', icon: UserCircle2 },
	],
};

const roleLabel: Record<Role, string> = {
	admin: 'Administrador',
	mentor: 'Mentor',
	user: 'Jovem',
};

type Props = {
	role: Role;
	title: string;
	subtitle?: string;
	children: React.ReactNode;
};

export default function DashboardShell({ role, title, subtitle, children }: Props) {
	const { profile, user, signOut } = useAuth();
	const { theme, toggle } = useTheme();
	const location = useLocation();
	const navigate = useNavigate();
	const [collapsed, setCollapsed] = useState(false);
	const [mobileOpen, setMobileOpen] = useState(false);
	const unreadCount = useUnreadNotifications();

	const menu = useMemo(() => menuByRole[role], [role]);

	useEffect(() => {
		setMobileOpen(false);
	}, [location.pathname, location.hash]);

	const isActive = (target: string) => {
		if (target.includes('#')) {
			const [path, hash] = target.split('#');
			return location.pathname === path && location.hash === `#${hash}`;
		}
		return location.pathname === target;
	};

	const renderMenu = () => (
		<nav className="flex-1 space-y-1 overflow-y-auto">
			{menu.map((item) => {
				const Icon = item.icon;
				const active = isActive(item.to);
				const isNotifications = item.to === '/dashboard/notifications';
				const showBadge = isNotifications && unreadCount > 0;

				return (
					<Link
						key={item.to}
						to={item.to}
						onClick={() => setMobileOpen(false)}
						className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition relative ${
							active ? 'bg-purple text-white shadow-soft-3d' : 'text-text-secondary hover:text-text-primary hover:bg-surface'
						}`}
						title={collapsed ? item.label : undefined}
					>
						<div className="relative flex-shrink-0">
							<Icon size={16} />
							{showBadge && (
								<span
									className={`absolute -top-1 -right-1 flex items-center justify-center rounded-full text-[10px] font-bold text-white leading-none ${
										active ? 'bg-white text-purple' : 'bg-red-500'
									}`}
									style={{
										minWidth: collapsed ? '16px' : '18px',
										height: collapsed ? '16px' : '18px',
										padding: unreadCount > 99 ? '0 4px' : '0 2px',
									}}
								>
									{unreadCount > 99 ? '99+' : unreadCount}
								</span>
							)}
						</div>
						{!collapsed && (
							<span className="flex-1 min-w-0" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
								{item.label}
							</span>
						)}
					</Link>
				);
			})}
		</nav>
	);

	return (
		<div className="h-screen bg-background text-text-primary flex overflow-hidden">
			{/* Desktop sidebar */}
			<aside
				className={`hidden lg:flex flex-col border-r border-border bg-background/80 px-4 py-6 transition-all sticky top-0 h-screen overflow-hidden ${collapsed ? 'w-20' : 'w-[16rem]'}`}
			>
				<div className="flex items-center justify-between mb-6">
					<div className="text-sm uppercase tracking-[0.4rem] text-purple">{collapsed ? 'JCP' : 'Jovem c/ Propósito'}</div>
					<button
						type="button"
						onClick={() => setCollapsed((prev) => !prev)}
						className="rounded-lg border border-border p-1 hover:border-purple transition-colors text-text-primary"
						aria-label="Alternar menu"
					>
						<ChevronLeft className={`h-4 w-4 transition ${collapsed ? 'rotate-180' : ''}`} />
					</button>
				</div>
				{renderMenu()}
				<button
					onClick={signOut}
					className="mt-auto flex items-center gap-3 rounded-xl border border-border px-3 py-2 text-sm text-text-secondary hover:text-text-primary hover:border-purple transition-colors flex-shrink-0"
					title={collapsed ? 'Sair' : undefined}
				>
					<LogOut size={16} className="flex-shrink-0" />
					{!collapsed && <span>Sair</span>}
				</button>
			</aside>

			{/* Mobile sidebar */}
			{mobileOpen && (
				<>
					<div className="fixed inset-0 z-40 bg-black/60 lg:hidden" onClick={() => setMobileOpen(false)} />
					<div className="fixed inset-y-0 left-0 z-50 w-72 bg-background/95 border-r border-border px-4 py-6 shadow-elevate lg:hidden">
						<div className="flex items-center justify-between mb-6">
							<div className="text-sm uppercase tracking-[0.4rem] text-purple">JCP</div>
							<button type="button" onClick={() => setMobileOpen(false)} className="rounded-full border border-border p-2 hover:border-purple transition-colors text-text-primary">
								<ChevronLeft className="h-4 w-4" />
							</button>
						</div>
						{renderMenu()}
					</div>
				</>
			)}

			<div className="flex-1 flex flex-col h-screen overflow-hidden">
				<header className="flex items-center justify-between border-b border-border px-4 py-4 sm:px-6 lg:px-8 bg-background/80 sticky top-0 z-20">
					<div className="flex items-center gap-3">
						<button
							type="button"
							className="lg:hidden rounded-xl border border-border p-2 hover:border-purple transition-colors text-text-primary"
							onClick={() => setMobileOpen(true)}
							aria-label="Abrir menu"
						>
							<Menu className="h-5 w-5" />
						</button>
						<div>
							<p className="text-xs uppercase tracking-widest text-purple/80">{roleLabel[role]}</p>
							<h1 className="font-display text-xl sm:text-2xl text-text-primary">{title}</h1>
							{subtitle && <p className="text-xs text-text-secondary mt-1">{subtitle}</p>}
						</div>
					</div>
					<div className="flex items-center gap-3">
						<button
							type="button"
							onClick={toggle}
							className="rounded-full border border-border p-2 hover:border-purple transition-colors text-text-primary"
							aria-label="Alternar tema"
						>
							{theme === 'dark' ? <SunMedium className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
						</button>
						<Link
							to="/dashboard/profile"
							className="hidden sm:flex items-center gap-3 rounded-xl border border-border px-3 py-2 text-sm hover:border-purple transition-colors text-text-primary"
						>
							<div className="text-right">
								<div className="text-sm font-medium text-text-primary">{profile?.full_name ?? 'Usuário'}</div>
								<div className="text-xs text-text-secondary capitalize">{profile?.role ?? 'user'}</div>
							</div>
							<div className="h-10 w-10 rounded-full bg-card-glow flex items-center justify-center text-sm font-medium uppercase text-text-primary">
								{profile?.full_name?.[0] ?? (user?.email?.[0] ?? 'J')}
							</div>
						</Link>
						<button
							type="button"
							onClick={() => navigate('/dashboard/profile')}
							className="sm:hidden rounded-full border border-border p-2 hover:border-purple transition-colors text-text-primary"
							aria-label="Ir para o perfil"
						>
							<UserCircle2 className="h-4 w-4" />
						</button>
					</div>
				</header>

				<main className="flex-1 overflow-y-auto bg-background px-4 py-8 sm:px-6 lg:px-10">
					<div className="max-w-6xl mx-auto space-y-10">{children}</div>
				</main>
			</div>
		</div>
	);
}



