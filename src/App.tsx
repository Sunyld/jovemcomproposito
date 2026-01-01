import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Mentorias from './pages/Mentorias';
import MentoriaPage from './pages/MentoriaPage';
import Discipulado from './pages/Discipulado';
import Devocional from './pages/Devocional';
import Projetos from './pages/Projetos';
import Login from './pages/Login';
import Signup from './pages/Signup';
import OAuthCallback from './pages/OAuthCallback';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import VerifyEmail from './pages/VerifyEmail';
import MentorIndex from './pages/Dashboard/MentorIndex';
import MentorMentorias from './pages/Dashboard/MentorMentorias';
import MentorMentoriaEdit from './pages/Dashboard/MentorMentoriaEdit';
import MentorInscricoes from './pages/Dashboard/MentorInscricoes';
import MentorFeedback from './pages/Dashboard/MentorFeedback';
import AdminIndex from './pages/Dashboard/AdminIndex';
import AdminMentores from './pages/Dashboard/AdminMentores';
import AdminAdmins from './pages/Dashboard/AdminAdmins';
import AdminUsuarios from './pages/Dashboard/AdminUsuarios';
import AdminCategorias from './pages/Dashboard/AdminCategorias';
import AdminMetricas from './pages/Dashboard/AdminMetricas';
import AdminRelatorios from './pages/Dashboard/AdminRelatorios';
import AdminDoacoes from './pages/Dashboard/AdminDoacoes';
import AdminDevocionais from './pages/Dashboard/AdminDevocionais';
import AdminProjetos from './pages/Dashboard/AdminProjetos';
import UserIndex from './pages/Dashboard/UserIndex';
import UserMentorias from './pages/Dashboard/UserMentorias';
import UserInscricoes from './pages/Dashboard/UserInscricoes';
import UserFeedback from './pages/Dashboard/UserFeedback';
import Notifications from './pages/Dashboard/Notifications';
import Profile from './pages/Dashboard/Profile';
import ProtectedRoute from './components/ProtectedRoute';
import { ToastViewport } from './components/Toast';
import './index.css';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import Contact from './pages/Contact';
import { ThemeProvider } from './components/ThemeProvider';
import { AuthProvider } from './hooks/useAuth';
import { DevocionalProvider } from './contexts/DevocionalContext';
import Doacao from './pages/Doacao';
import NotFound from './pages/NotFound';
import LandingLayout from './layouts/LandingLayout';
import DashboardLayout from './layouts/DashboardLayout';

function App() {
	return (
		<AuthProvider>
			<ThemeProvider>
				<DevocionalProvider>
				<BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
					<Routes>
					<Route element={<LandingLayout />}>
						<Route path="/" element={<Home />} />
						<Route path="/mentorias" element={<Mentorias />} />
						<Route path="/mentorias/:id" element={<MentoriaPage />} />
						<Route path="/discipulado" element={<Discipulado />} />
						<Route path="/devocional" element={<Devocional />} />
						<Route path="/projetos" element={<Projetos />} />
						<Route path="/doacao" element={<Doacao />} />
						<Route path="/login" element={<Login />} />
						<Route path="/signup" element={<Signup />} />
						<Route path="/forgot-password" element={<ForgotPassword />} />
						<Route path="/reset-password" element={<ResetPassword />} />
						<Route path="/verify-email" element={<VerifyEmail />} />
						<Route path="/oauth/callback" element={<OAuthCallback />} />
						<Route path="/termos" element={<Terms />} />
						<Route path="/politica-privacidade" element={<Privacy />} />
						<Route path="/contato" element={<Contact />} />
					</Route>
					<Route element={<DashboardLayout />}>
						{/* Mentor Routes */}
						<Route
							path="/dashboard/mentor"
							element={
								<ProtectedRoute roles={['mentor', 'admin']}>
									<MentorIndex />
								</ProtectedRoute>
							}
						/>
						<Route
							path="/dashboard/mentor/mentorias"
							element={
								<ProtectedRoute roles={['mentor', 'admin']}>
									<MentorMentorias />
								</ProtectedRoute>
							}
						/>
						<Route
							path="/dashboard/mentor/mentorias/:id"
							element={
								<ProtectedRoute roles={['mentor', 'admin']}>
									<MentorMentoriaEdit />
								</ProtectedRoute>
							}
						/>
						<Route
							path="/dashboard/mentor/inscricoes"
							element={
								<ProtectedRoute roles={['mentor', 'admin']}>
									<MentorInscricoes />
								</ProtectedRoute>
							}
						/>
						<Route
							path="/dashboard/mentor/feedback"
							element={
								<ProtectedRoute roles={['mentor', 'admin']}>
									<MentorFeedback />
								</ProtectedRoute>
							}
						/>
						{/* Admin Routes */}
						<Route
							path="/dashboard/admin"
							element={
								<ProtectedRoute roles={['admin']}>
									<AdminIndex />
								</ProtectedRoute>
							}
						/>
						<Route
							path="/dashboard/admin/mentores"
							element={
								<ProtectedRoute roles={['admin']}>
									<AdminMentores />
								</ProtectedRoute>
							}
						/>
						<Route
							path="/dashboard/admin/admins"
							element={
								<ProtectedRoute roles={['admin']}>
									<AdminAdmins />
								</ProtectedRoute>
							}
						/>
						<Route
							path="/dashboard/admin/usuarios"
							element={
								<ProtectedRoute roles={['admin']}>
									<AdminUsuarios />
								</ProtectedRoute>
							}
						/>
						<Route
							path="/dashboard/admin/categorias"
							element={
								<ProtectedRoute roles={['admin']}>
									<AdminCategorias />
								</ProtectedRoute>
							}
						/>
						<Route
							path="/dashboard/admin/metricas"
							element={
								<ProtectedRoute roles={['admin']}>
									<AdminMetricas />
								</ProtectedRoute>
							}
						/>
						<Route
							path="/dashboard/admin/relatorios"
							element={
								<ProtectedRoute roles={['admin']}>
									<AdminRelatorios />
								</ProtectedRoute>
							}
						/>
						<Route
							path="/dashboard/admin/doacoes"
							element={
								<ProtectedRoute roles={['admin']}>
									<AdminDoacoes />
								</ProtectedRoute>
							}
						/>
						<Route
							path="/dashboard/admin/devocionais"
							element={
								<ProtectedRoute roles={['admin']}>
									<AdminDevocionais />
								</ProtectedRoute>
							}
						/>
						<Route
							path="/dashboard/admin/projetos"
							element={
								<ProtectedRoute roles={['admin']}>
									<AdminProjetos />
								</ProtectedRoute>
							}
						/>
						{/* User Routes */}
						<Route
							path="/dashboard/user"
							element={
								<ProtectedRoute roles={['user']}>
									<UserIndex />
								</ProtectedRoute>
							}
						/>
						<Route
							path="/dashboard/user/mentorias"
							element={
								<ProtectedRoute roles={['user']}>
									<UserMentorias />
								</ProtectedRoute>
							}
						/>
						<Route
							path="/dashboard/user/inscricoes"
							element={
								<ProtectedRoute roles={['user']}>
									<UserInscricoes />
								</ProtectedRoute>
							}
						/>
						<Route
							path="/dashboard/user/feedback"
							element={
								<ProtectedRoute roles={['user']}>
									<UserFeedback />
								</ProtectedRoute>
							}
						/>
						{/* Common Routes */}
						<Route
							path="/dashboard/notifications"
							element={
								<ProtectedRoute roles={['user', 'mentor', 'admin']}>
									<Notifications />
								</ProtectedRoute>
							}
						/>
						<Route
							path="/dashboard/profile"
							element={
								<ProtectedRoute roles={['user', 'mentor', 'admin']}>
									<Profile />
								</ProtectedRoute>
							}
						/>
					</Route>
						<Route path="*" element={<NotFound />} />
					</Routes>
					<ToastViewport />
				</BrowserRouter>
				</DevocionalProvider>
			</ThemeProvider>
		</AuthProvider>
	);
}

export default App;
