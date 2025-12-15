import { motion } from 'framer-motion';

type Props = {
	eyebrow: string;
	title: string;
	description: string;
	imageUrl: string;
	reverse?: boolean;
};

export default function HeroSection({ eyebrow, title, description, imageUrl, reverse }: Props) {
	return (
		<section className="relative overflow-hidden py-16 sm:py-24">
			<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-14 items-center">
				<motion.div
					className={reverse ? 'order-2 lg:order-1 space-y-5' : 'space-y-5'}
					initial={{ opacity: 0, x: reverse ? 60 : -60 }}
					whileInView={{ opacity: 1, x: 0 }}
					viewport={{ once: true, amount: 0.3 }}
					transition={{ duration: 0.6 }}
				>
					<div className="text-sm uppercase tracking-wider text-purple">{eyebrow}</div>
					<h2 className="font-display text-3xl sm:text-4xl lg:text-5xl leading-tight">
						<span className="bg-clip-text text-transparent bg-gradient-to-r from-purple to-purple-light">{title}</span>
					</h2>
					<p className="text-text-secondary max-w-prose text-base sm:text-lg">{description}</p>
					<div className="grid gap-3 sm:grid-cols-2 text-sm text-text-secondary">
						<div className="rounded-xl border border-border bg-surface p-4">
							<strong className="block text-text-primary mb-1">Experiências reais</strong>
							Mentores compartilham estudos de caso e desafios reais do mercado.
						</div>
						<div className="rounded-xl border border-border bg-surface p-4">
							<strong className="block text-text-primary mb-1">Comunidade ativa</strong>
							Networking, feedbacks e eventos quinzenais exclusivos.
						</div>
					</div>
				</motion.div>
				<motion.div
					className={reverse ? 'order-1 lg:order-2' : ''}
					initial={{ opacity: 0, x: reverse ? -60 : 60 }}
					whileInView={{ opacity: 1, x: 0 }}
					viewport={{ once: true, amount: 0.3 }}
					transition={{ duration: 0.6, delay: 0.1 }}
				>
					<div className="relative w-full max-w-xl mx-auto rounded-[36px]">
						<div className="absolute inset-0 rounded-[36px] blur-[90px] opacity-40"
							style={{ background: reverse ? 'radial-gradient(circle, rgba(124,92,255,0.35), rgba(15,17,22,0) 70%)' : 'radial-gradient(circle, rgba(70,58,255,0.35), rgba(15,17,22,0) 70%)' }} />
						<div className="relative rounded-[36px] p-[2px] bg-gradient-to-br from-purple via-purple-light/50 to-transparent shadow-elevate">
							<img src={imageUrl} alt={eyebrow} className="rounded-[34px] w-full h-auto object-cover bg-surface" loading="lazy" />
						</div>
					</div>
				</motion.div>
			</div>
		</section>
	);
}


