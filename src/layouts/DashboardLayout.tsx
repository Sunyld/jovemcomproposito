import { Outlet } from 'react-router-dom';

export default function DashboardLayout() {
	return (
		<div className="min-h-screen bg-background text-text-primary">
			<Outlet />
		</div>
	);
}
