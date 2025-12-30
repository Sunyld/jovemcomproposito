import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import heroImg from '../assets/illustrations/Gen Z-rafiki.svg';

export default function HeroMain() {
	return (
		<section className="relative overflow-hidden">
			<div className="absolute inset-0 hero-gradient-overlay pointer-events-none" aria-hidden />
			<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-16 pb-24 lg:pt-24 lg:pb-40 grid lg:grid-cols-2 gap-12 items-center">
				<motion.div
					className="relative z-10"
					initial={{ opacity: 0, y: 40 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.7 }}
				>
					<h1 className="font-display text-4xl sm:text-5xl lg:text-6xl leading-tight text-text-primary">
						Aprenda com mentores{' '}
						<span className="bg-clip-text text-transparent bg-gradient-to-r from-purple to-purple-light">extraordinários</span>
					</h1>
					<p className="mt-4 text-text-secondary max-w-xl">
						Conecte-se a profissionais experientes, participe de mentorias online ou presenciais e acelere sua jornada com conteúdos práticos,
						encontros ao vivo e materiais de apoio exclusivos.
					</p>
					<p className="mt-2 text-sm text-purple font-medium">
						Mais do que simplesmente viver, viva com propósito.
					</p>
					<div className="mt-8 flex flex-col sm:flex-row gap-3">
						<Link to="/signup" className="px-6 py-3 rounded-xl bg-purple text-white font-medium shadow-elevate text-center ring-1 ring-inset ring-border hover:ring-purple hover:bg-purple-light transition-colors">
							Cadastrar
						</Link>
						<Link to="/mentorias" className="px-6 py-3 rounded-xl text-text-primary text-center bg-surface hover:bg-surface/80 ring-1 ring-inset ring-border hover:ring-purple transition-colors">
							Explorar Mentorias
						</Link>
					</div>
					<div className="mt-8 grid grid-cols-2 gap-4 text-sm text-text-secondary max-w-md">
						<div>
							<div className="text-lg font-semibold text-text-primary">+120</div>
							<p>mentores certificados</p>
						</div>
						<div>
							<div className="text-lg font-semibold text-text-primary">3.5k</div>
							<p>mentorias concluídas</p>
						</div>
						<div>
							<div className="text-lg font-semibold text-text-primary">98%</div>
							<p>avaliação positiva</p>
						</div>
						<div>
							<div className="text-lg font-semibold text-text-primary">24/7</div>
							<p>suporte comunitário</p>
						</div>
					</div>
				</motion.div>
				<motion.div
					className="relative z-10"
					initial={{ opacity: 0, scale: 0.9, rotate: 4 }}
					animate={{ opacity: 1, scale: 1, rotate: 0 }}
					transition={{ duration: 0.8, delay: 0.2 }}
				>
					{/* Gradient border frame */}
					<div className="relative w-full max-w-md mx-auto rounded-[32px] p-[2px] bg-gradient-to-br from-purple via-purple-light/60 to-transparent shadow-soft-3d">
						<div className="rounded-[30px] bg-surface p-1">
						<motion.img
							src={heroImg}
							alt="Mentora em destaque"
							className="rounded-[28px] w-full h-auto object-cover"
							loading="lazy"
							initial={{ scale: 1.05 }}
							animate={{ scale: 1 }}
							transition={{ duration: 0.8, delay: 0.3 }}
						/>
						</div>
					</div>
					{/* Soft light glows */}
					<div className="absolute -z-10 -top-12 -right-6 w-80 h-80 rounded-full blur-[90px] opacity-40"
						style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.35) 0%, rgba(15,17,22,0) 65%)' }} />
					<div className="absolute -z-10 bottom-0 -left-10 w-64 h-64 rounded-full blur-[80px] opacity-35"
						style={{ background: 'radial-gradient(circle, rgba(124,92,255,0.35) 0%, rgba(15,17,22,0) 70%)' }} />
				</motion.div>
			</div>
			{/* Clean edge without bottom gradient */}
		</section>
	);
}


