import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

type Props = {
	children: ReactNode;
	roles?: Array<'user' | 'mentor' | 'admin'>;
};

export default function ProtectedRoute({ children, roles }: Props) {
	const { user, profile, loading } = useAuth();
	const location = useLocation();

	if (loading) {
		return (
			<div className="min-h-[50vh] flex items-center justify-center text-text-secondary">
				Carregando...
			</div>
		);
	}

	// Verificar se usuário ainda existe no banco
	if (user) {
		// Se user existe mas profile não, pode ter sido deletado
		// O useAuth já faz essa verificação, mas garantimos aqui também
		if (!profile && !loading) {
			// Profile não existe - redirecionar para login
			return <Navigate to="/login" state={{ from: location.pathname }} replace />;
		}
	}

	if (!user) {
		return <Navigate to="/login" state={{ from: location.pathname }} replace />;
	}

	if (roles && profile && !roles.includes(profile.role as any)) {
		return <Navigate to="/login" state={{ from: location.pathname }} replace />;
	}

	return <>{children}</>;
}


