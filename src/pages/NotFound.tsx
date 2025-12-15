import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
	return (
		<div className="min-h-screen bg-background text-text-primary flex items-center justify-center px-4 sm:px-6 lg:px-8">
			<div className="max-w-2xl mx-auto text-center space-y-6">
				<div className="text-8xl mb-4">🛰️</div>
				<h1 className="text-4xl sm:text-5xl font-display font-bold">404</h1>
				<h2 className="text-2xl sm:text-3xl font-display text-text-primary">Página não encontrada</h2>
				<p className="text-text-secondary text-lg max-w-md mx-auto">
					A página que você está procurando não existe ou foi movida. Verifique o endereço e tente novamente.
				</p>
				<div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
					<Link
						to="/"
						className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-purple text-background hover:bg-purple-light transition font-medium"
					>
						<Home size={18} />
						Voltar para o início
					</Link>
					<button
						onClick={() => window.history.back()}
						className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-white/10 text-text-primary hover:border-white/30 hover:bg-white/[0.04] transition font-medium"
					>
						<ArrowLeft size={18} />
						Voltar
					</button>
				</div>
			</div>
		</div>
	);
}


