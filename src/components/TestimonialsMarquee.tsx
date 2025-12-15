import { useEffect, useRef } from 'react';

const testimonials = [
	{ name: 'Lara M.', role: 'Maputo', avatar: 'https://i.pravatar.cc/100?img=47', text: 'Mentoria que desbloqueou minha fé e carreira.' },
	{ name: 'Carlos P.', role: 'Beira', avatar: 'https://i.pravatar.cc/100?img=12', text: 'Programa sério, com mentores atenciosos.' },
	{ name: 'Flávia T.', role: 'Nampula', avatar: 'https://i.pravatar.cc/100?img=34', text: 'Descobri meu chamado e novos amigos.' },
	{ name: 'Joel B.', role: 'Tete', avatar: 'https://i.pravatar.cc/100?img=59', text: 'Conteúdo prático e discipulado autêntico.' },
	{ name: 'Sara K.', role: 'Quelimane', avatar: 'https://i.pravatar.cc/100?img=24', text: 'Os encontros semanais transformaram minha visão.' },
];

export default function TestimonialsMarquee() {
	const trackRef = useRef<HTMLDivElement | null>(null);
	useEffect(() => {
		const el = trackRef.current;
		if (!el) return;
		let frame = 0;
		let x = 0;
		const speed = 0.4;
		const animate = () => {
			x -= speed;
			if (Math.abs(x) > el.scrollWidth / 2) x = 0;
			el.style.transform = `translateX(${x}px)`;
			frame = requestAnimationFrame(animate);
		};
		frame = requestAnimationFrame(animate);
		return () => cancelAnimationFrame(frame);
	}, []);

	const items = [...testimonials, ...testimonials];

	return (
		<section className="mt-20 overflow-hidden border-t border-b border-white/5 bg-background/80 py-10">
			<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				<h3 className="text-lg font-semibold">Comentários</h3>
				<div className="relative mt-6">
					<div className="flex gap-4 will-change-transform" ref={trackRef}>
						{items.map((item, idx) => (
							<div key={`${item.name}-${idx}`} className="shrink-0 w-72 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
								<div className="flex items-center gap-3">
									<img src={item.avatar} alt={item.name} className="h-10 w-10 rounded-full object-cover" loading="lazy" />
									<div>
										<div className="font-medium text-sm">{item.name}</div>
										<div className="text-xs text-text-secondary">{item.role}</div>
									</div>
								</div>
								<p className="mt-3 text-sm text-text-secondary italic">“{item.text}”</p>
							</div>
						))}
					</div>
				</div>
			</div>
		</section>
	);
}


