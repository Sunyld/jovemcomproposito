import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useState } from 'react';
import { Menu, X, LogIn, UserPlus, Moon, Sun, Settings } from 'lucide-react';
import logo from '../assets/images/logo.svg';
import { useTheme } from './ThemeProvider';

export function Header() {
	const { user, profile, signOut } = useAuth();
	const [open, setOpen] = useState(false);
	const navigate = useNavigate();
	const { theme, toggle } = useTheme();

	return (
		<header className="fixed top-0 inset-x-0 z-50 backdrop-blur border-b border-border bg-background/70">
			<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				<div className="flex h-16 items-center justify-between">
					<Link to="/" className="flex items-center gap-3">
						<img src={logo} alt="Jovem com Propósito logo" className="h-9 w-9" />
						<span className="font-display text-lg tracking-wide text-text-primary">Jovem com Propósito</span>
					</Link>
					<nav className="hidden md:flex items-center gap-8" aria-label="Navegação principal">
						<NavLink to="/discipulado" className={({ isActive }) => (isActive ? 'text-purple' : 'text-text-secondary hover:text-text-primary transition')} aria-current={({ isActive }) => isActive ? 'page' : undefined}>Discipulado</NavLink>
						<NavLink to="/devocional" className={({ isActive }) => (isActive ? 'text-purple' : 'text-text-secondary hover:text-text-primary transition')} aria-current={({ isActive }) => isActive ? 'page' : undefined}>Devocional</NavLink>
						<NavLink to="/mentorias" className={({ isActive }) => (isActive ? 'text-purple' : 'text-text-secondary hover:text-text-primary transition')} aria-current={({ isActive }) => isActive ? 'page' : undefined}>Mentorias</NavLink>
						<NavLink to="/projetos" className={({ isActive }) => (isActive ? 'text-purple' : 'text-text-secondary hover:text-text-primary transition')} aria-current={({ isActive }) => isActive ? 'page' : undefined}>Projetos</NavLink>
						<NavLink to="/doacao" className={({ isActive }) => (isActive ? 'text-purple' : 'text-text-secondary hover:text-text-primary transition')} aria-current={({ isActive }) => isActive ? 'page' : undefined}>Doação</NavLink>
					</nav>
					<div className="hidden md:flex items-center gap-3">
						<button onClick={toggle} className="p-2 rounded-lg border border-border hover:border-purple transition-colors" aria-label="Alternar tema">
							{theme === 'dark' ? <Sun size={16} className="text-text-primary" /> : <Moon size={16} className="text-text-primary" />}
						</button>
						{!user ? (
							<>
								<Link to="/login" className="px-4 py-2 rounded-lg border border-border text-text-secondary hover:text-text-primary hover:border-purple transition-colors flex items-center gap-2" aria-label="Entrar">
									<LogIn size={16} aria-hidden="true" /> Entrar
								</Link>
								<button onClick={() => navigate('/signup')} className="px-4 py-2 rounded-lg bg-purple text-white font-medium shadow-elevate flex items-center gap-2 hover:bg-purple-light transition-colors" aria-label="Cadastrar-se">
									<UserPlus size={16} aria-hidden="true" /> Cadastrar-se
								</button>
							</>
						) : (
							<div className="flex items-center gap-2">
								{(profile?.role === 'mentor' || profile?.role === 'admin') ? (
									<Link to={profile?.role === 'admin' ? '/dashboard/admin' : '/dashboard/mentor'} className="px-4 py-2 rounded-lg bg-surface hover:bg-surface/80 transition text-text-primary">Dashboard</Link>
								) : (
									<Link to="/dashboard/user" className="px-4 py-2 rounded-lg bg-surface hover:bg-surface/80 transition text-text-primary" aria-label="Configurações">
										<Settings size={16} />
									</Link>
								)}
								<button onClick={signOut} className="px-4 py-2 rounded-lg border border-border hover:border-purple transition-colors text-text-primary" aria-label="Sair da conta">Sair</button>
							</div>
						)}
					</div>
					<button className="md:hidden p-2 rounded-lg border border-border hover:border-purple transition-colors" aria-label="Abrir menu" onClick={() => setOpen((v) => !v)}>
						{open ? <X className="text-text-primary" /> : <Menu className="text-text-primary" />}
					</button>
				</div>
			</div>
			{open && (
				<div className="md:hidden border-t border-border bg-background/95">
					<div className="px-4 py-4 flex flex-col gap-4">
						<button onClick={() => { toggle(); }} className="self-start px-3 py-2 rounded-lg border border-border hover:border-purple transition-colors flex items-center gap-2 text-sm text-text-primary" aria-label={`Alternar para modo ${theme === 'dark' ? 'claro' : 'escuro'}`}>
							{theme === 'dark' ? <Sun size={16} aria-hidden="true" /> : <Moon size={16} aria-hidden="true" />} {theme === 'dark' ? 'Modo claro' : 'Modo escuro'}
						</button>
						<NavLink to="/discipulado" onClick={() => setOpen(false)} className="text-text-secondary hover:text-text-primary transition-colors">Discipulado</NavLink>
						<NavLink to="/devocional" onClick={() => setOpen(false)} className="text-text-secondary hover:text-text-primary transition-colors">Devocional</NavLink>
						<NavLink to="/mentorias" onClick={() => setOpen(false)} className="text-text-secondary hover:text-text-primary transition-colors">Mentorias</NavLink>
						<NavLink to="/projetos" onClick={() => setOpen(false)} className="text-text-secondary hover:text-text-primary transition-colors">Projetos</NavLink>
						<NavLink to="/doacao" onClick={() => setOpen(false)} className="text-text-secondary hover:text-text-primary transition-colors">Doação</NavLink>
						<div className="pt-2 border-t border-border flex gap-3">
							{!user ? (
								<>
									<Link to="/login" onClick={() => setOpen(false)} className="flex-1 px-4 py-2 rounded-lg border border-border hover:border-purple transition-colors text-center text-text-primary">Entrar</Link>
									<Link to="/signup" onClick={() => setOpen(false)} className="flex-1 px-4 py-2 rounded-lg bg-purple text-white text-center hover:bg-purple-light transition-colors">Cadastrar</Link>
								</>
							) : (
								<>
									{(profile?.role === 'mentor' || profile?.role === 'admin') ? (
										<Link to={profile?.role === 'admin' ? '/dashboard/admin' : '/dashboard/mentor'} onClick={() => setOpen(false)} className="flex-1 px-4 py-2 rounded-lg bg-surface text-text-primary text-center hover:bg-surface/80 transition-colors">
											Dashboard
										</Link>
									) : (
										<Link to="/dashboard/user" onClick={() => setOpen(false)} className="flex-1 px-4 py-2 rounded-lg bg-surface text-text-primary text-center hover:bg-surface/80 transition-colors">
											Configurações
										</Link>
									)}
									<button onClick={() => { setOpen(false); signOut(); }} className="flex-1 px-4 py-2 rounded-lg border border-border hover:border-purple transition-colors text-text-primary">Sair</button>
								</>
							)}
						</div>
					</div>
				</div>
			)}
		</header>
	);
}


