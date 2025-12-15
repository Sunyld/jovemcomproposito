import { useNavigate } from 'react-router-dom';
import { BookOpen, Users, Heart } from 'lucide-react';

const resources = [
	{ 
		title: 'Círculos de discipulado', 
		description: 'Grupos semanais com mentores certificados, roteiros e desafios práticos.',
		icon: Users,
		action: 'Em breve',
		link: null
	},
	{ 
		title: 'Devocionais guiados', 
		description: 'Biblioteca com vídeos, leituras e perguntas para reflexão individual ou em grupo.',
		icon: BookOpen,
		action: 'Ver devocionais',
		link: '/devocional'
	},
	{ 
		title: 'Mentorias espirituais', 
		description: 'Sessões individuais para aprofundar valores, propósito e vocação.',
		icon: Heart,
		action: 'Ver mentorias',
		link: '/mentorias'
	}
];

const heroImage = 'https://illustrations.popsy.co/black/sunrise.svg';

export default function Discipulado() {
	const navigate = useNavigate();

	function handleAction(link: string | null) {
		if (link) {
			navigate(link);
		} else {
			// Show coming soon message
			alert('Esta funcionalidade estará disponível em breve!');
		}
	}

	return (
		<div className="min-h-screen bg-background text-text-primary">
			<section className="relative overflow-hidden py-16">
				<div className="absolute inset-0 pointer-events-none"
					style={{ background: 'radial-gradient(circle at 80% 20%, rgba(124,92,255,0.3), rgba(15,17,22,0) 65%)' }} />
				<div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-10 items-center">
					<div>
						<p className="text-sm uppercase tracking-widest text-purple">Discipulado</p>
						<h1 className="font-display text-3xl sm:text-4xl mt-3 leading-tight">Forma equipes que discipulam com profundidade e propósito</h1>
						<p className="mt-4 text-text-secondary text-lg">
							Modelos presenciais e híbridos com roteiros semanais, leituras guiadas e encontros que conectam jovens em todo Moçambique.
						</p>
					</div>
					<div className="rounded-[32px] p-[2px] bg-gradient-to-br from-purple via-purple-light/40 to-transparent">
						<div className="rounded-[30px] bg-surface p-6">
							<img src={heroImage} alt="Discipulado" className="w-full h-auto object-contain" loading="lazy" />
						</div>
					</div>
				</div>
			</section>
			<section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pb-16">
				<div className="grid gap-6 md:grid-cols-3">
					{resources.map((item) => {
						const Icon = item.icon;
						return (
							<div key={item.title} className="rounded-[26px] p-[1.5px] bg-gradient-to-br from-purple via-purple-light/30 to-transparent">
								<div className="rounded-[24px] bg-white/[0.04] border border-white/10 p-5 h-full flex flex-col">
									<div className="flex items-center gap-3 mb-2">
										<Icon size={24} className="text-purple" />
										<h3 className="text-lg font-semibold">{item.title}</h3>
									</div>
									<p className="text-sm text-text-secondary mt-2 flex-1">{item.description}</p>
									<button
										onClick={() => handleAction(item.link)}
										className="mt-4 text-sm text-purple hover:text-purple-light transition-colors text-left"
									>
										{item.action} →
									</button>
								</div>
							</div>
						);
					})}
				</div>
				<div className="mt-10 rounded-[28px] border border-white/10 bg-white/[0.02] p-8">
					<h2 className="text-2xl font-display">Calendário e Materiais</h2>
					<p className="text-text-secondary mt-3">Organize encontros híbridos, compartilhe planos de leitura e acompanhe metas com check-ins semanais.</p>
					<ul className="mt-4 list-disc pl-5 text-text-secondary space-y-2">
						<li>Templates de reuniões com roteiros prontos (PDF/Canva).</li>
						<li>Uploads protegidos com links temporários pelo Supabase Storage.</li>
						<li>Integração com notificações em tempo real para lembrar os participantes.</li>
					</ul>
				</div>
			</section>
		</div>
	);
}



