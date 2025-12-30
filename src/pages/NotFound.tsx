export default function NotFound() {
	return (
		<div className="min-h-screen bg-background text-text-primary flex flex-col items-center justify-center px-4">
			<div className="max-w-md text-center space-y-4">
				<p className="text-xs uppercase tracking-[0.25em] text-purple/70">404</p>
				<h1 className="text-3xl sm:text-4xl font-display font-semibold">Página não encontrada</h1>
				<p className="text-text-secondary">
					Pareçe que este link não existe mais ou foi digitado incorretamente. Você pode voltar para a página inicial
					ou acessar o seu dashboard se já estiver autenticado.
				</p>
				<div className="flex flex-col sm:flex-row gap-3 justify-center mt-4">
					<a
						href="/"
						className="inline-flex justify-center rounded-full px-5 py-2.5 bg-purple text-background text-sm font-medium hover:bg-purple-light transition-colors"
					>
						Voltar para Home
					</a>
					<a
						href="/dashboard/user"
						className="inline-flex justify-center rounded-full px-5 py-2.5 border border-white/15 text-sm font-medium text-text-secondary hover:bg-white/5 transition-colors"
					>
						Ir para o Dashboard
					</a>
				</div>
			</div>
		</div>
	);
}

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


