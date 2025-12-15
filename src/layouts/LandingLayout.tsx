import { Outlet } from 'react-router-dom';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import BackgroundFX from '../components/BackgroundFX';

export default function LandingLayout() {
	return (
		<div className="min-h-screen bg-background text-text-primary selection:bg-purple/30">
			<BackgroundFX />
			<Header />
			<main className="pt-20">
				<Outlet />
			</main>
			<Footer />
		</div>
	);
}
