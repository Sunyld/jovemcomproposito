import HeroMain from '../components/HeroMain';
import MentorCarousel from '../components/MentorCarousel';
import HeroSection from '../components/HeroSection';
import visionSvg from '../assets/illustrations/Milestones of business projects-cuate.svg';
import missionSvg from '../assets/illustrations/Connected world-cuate.svg';
import valuesSvg from '../assets/illustrations/Agreement-bro.svg';
import FeatureHighlights from '../components/FeatureHighlights';
import TrustedLogos from '../components/TrustedLogos';
import TestimonialsMarquee from '../components/TestimonialsMarquee';
import { useMentorias } from '../hooks/useMentorias';
import CardMentoria from '../components/CardMentoria';
import DevocionalCard from '../components/DevocionalCard';
import { Link } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import { FileText } from 'lucide-react';

export default function Home() {
	const { mentorias, loading } = useMentorias({ published: true });
	const featuredMentorias = mentorias.slice(0, 6);

	return (
		<div>
			<HeroMain />
			<TrustedLogos />
			<section className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-16">
				<div className="rounded-[28px] border border-border bg-surface p-6 sm:p-8 text-center shadow-soft-3d">
					<p className="text-sm uppercase tracking-widest text-purple">Quem Somos</p>
					<h2 className="font-display text-2xl sm:text-3xl mt-3 text-text-primary">Jovens movidos por propósito</h2>
					<p className="mt-4 text-text-secondary text-base sm:text-lg">
						Somos um movimento de jovens cristãos, comissionados a equipar outros jovens ao redor do mundo com ferramentas que os ajudem a descobrir o seu propósito,
						maximizar o seu potencial e deixar um legado impactante para a próxima geração.
					</p>
				</div>
			</section>
			<HeroSection
				eyebrow="Visão"
				title="Visão"
				description="Acelerar jornadas com conexões autênticas. Unimos mentores experientes e aprendizes motivados para criar um ambiente de crescimento contínuo, com recursos, encontros e projetos reais."
				imageUrl={visionSvg}
			/>
			<HeroSection
				eyebrow="Missão"
				title="Missão"
				description="Mentorias acessíveis e de impacto. Curadoria de mentorias de alta qualidade, com UX imersiva e ferramentas práticas para que cada encontro se transforme em resultados concretos."
				imageUrl={missionSvg}
				reverse
			/>
			<HeroSection
				eyebrow="Valores"
				title="Valores"
				description="Integridade e pureza, excelência, e servir ao próximo. Construímos relações baseadas em transparência e colaboração, celebrando conquistas e aprendizados ao longo do caminho."
				imageUrl={valuesSvg}
			/>
			<FeatureHighlights />
			<section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-12">
				<h2 className="text-xl font-medium mb-4 text-text-primary">Devocional do Dia</h2>
				<DevocionalCard />
			</section>
			<section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-12">
				<h2 className="text-xl font-medium mb-3 text-text-primary">Mentores</h2>
				<MentorCarousel />
			</section>
			<section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-10">
				<div className="flex items-center justify-between">
					<h2 className="text-xl font-medium text-text-primary">Mentorias em destaque</h2>
					<Link to="/mentorias" className="text-sm text-text-secondary hover:text-text-primary transition-colors">Ver todas</Link>
				</div>
				{loading ? (
					<div className="mt-4 flex justify-center py-12">
						<LoadingSpinner size="lg" />
					</div>
				) : featuredMentorias.length === 0 ? (
					<EmptyState
						icon={FileText}
						title="Nenhuma mentoria disponível"
						description="Em breve teremos mentorias para você."
					/>
				) : (
					<div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
						{featuredMentorias.map((m) => <CardMentoria key={m.id} m={m} />)}
					</div>
				)}
			</section>
			<section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-16">
				<div className="rounded-2xl border border-border bg-card-glow p-8 text-center">
					<h3 className="text-lg font-medium text-text-primary">Pronto para começar?</h3>
					<p className="text-text-secondary mt-1">Cadastre-se e crie sua jornada hoje mesmo.</p>
					<Link to="/signup" className="mt-4 inline-block px-6 py-3 rounded-xl bg-purple text-white hover:bg-purple-light transition-colors">Cadastrar</Link>
				</div>
			</section>
			<TestimonialsMarquee />
		</div>
	);
}


