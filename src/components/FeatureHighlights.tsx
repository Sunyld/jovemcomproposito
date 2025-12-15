import { TrendingUp, BrainCircuit, Zap } from 'lucide-react';

const highlights = [
	{
		title: 'Mentorias guiadas',
		description: 'Trilhas estruturadas com encontros ao vivo, tarefas práticas e feedbacks personalizados.',
		icon: TrendingUp
	},
	{
		title: 'Recursos exclusivos',
		description: 'Biblioteca de materiais, templates e gravações protegidas por assinaturas temporárias.',
		icon: BrainCircuit
	},
	{
		title: 'Suporte em tempo real',
		description: 'Chat comunitário, notificações em tempo real e moderação ativa para manter o foco.',
		icon: Zap
	}
];

export default function FeatureHighlights() {
	return (
		<section className="py-16 sm:py-24 bg-surface/40 backdrop-blur">
			<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				<div className="text-center max-w-3xl mx-auto">
					<h2 className="font-display text-3xl sm:text-4xl">Tudo que você precisa para evoluir</h2>
					<p className="mt-3 text-text-secondary">
						Dos primeiros passos ao domínio avançado, nossa plataforma combina mentores qualificados, ferramentas e comunidade para acelerar a sua jornada.
					</p>
				</div>
				<div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
					{highlights.map((item) => {
						const Icon = item.icon;
						return (
							<div key={item.title} className="rounded-2xl border border-border bg-surface p-6 shadow-soft-3d ring-1 ring-inset ring-border hover:ring-purple transition">
								<div className="h-10 w-10 rounded-lg bg-card-glow flex items-center justify-center">
									<Icon className="text-text-primary" size={18} />
								</div>
								<h3 className="mt-4 font-semibold text-lg text-text-primary">{item.title}</h3>
								<p className="mt-2 text-sm text-text-secondary">{item.description}</p>
							</div>
						);
					})}
				</div>
			</div>
		</section>
	);
}


