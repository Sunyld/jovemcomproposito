import { useEffect, useRef } from 'react';
import { useProfiles } from '../hooks/useProfiles';
import { ShieldCheck } from 'lucide-react';

export default function MentorCarousel() {
	const { profiles: mentors, loading } = useProfiles({ role: 'mentor' });
	const approvedMentors = mentors.filter((m) => m.is_mentor_approved);
	const trackRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const el = trackRef.current;
		if (!el || approvedMentors.length === 0) return;
		let raf = 0;
		let x = 0;
		let playing = true;
		const speed = 0.5;
		const animate = () => {
			if (playing) {
				x -= speed;
				if (Math.abs(x) > el.scrollWidth / 2) x = 0;
				el.style.transform = `translateX(${x}px)`;
			}
			raf = requestAnimationFrame(animate);
		};
		raf = requestAnimationFrame(animate);
		const onEnter = () => (playing = false);
		const onLeave = () => (playing = true);
		el.addEventListener('mouseenter', onEnter);
		el.addEventListener('mouseleave', onLeave);
		el.addEventListener('focusin', onEnter);
		el.addEventListener('focusout', onLeave);
		return () => {
			cancelAnimationFrame(raf);
			el.removeEventListener('mouseenter', onEnter);
			el.removeEventListener('mouseleave', onLeave);
			el.removeEventListener('focusin', onEnter);
			el.removeEventListener('focusout', onLeave);
		};
	}, [approvedMentors.length]);

	// Duplicate items for infinite scroll
	const items = approvedMentors.length > 0 ? [...approvedMentors, ...approvedMentors] : [];

	if (loading) {
		return (
			<div className="relative overflow-hidden py-6" aria-label="Carrossel de mentores">
				<div className="flex gap-4">
					{[1, 2, 3].map((i) => (
						<div key={i} className="shrink-0 w-64 rounded-[22px] border border-white/10 bg-white/[0.03] p-4 animate-pulse">
							<div className="h-12 w-12 rounded-full bg-white/10" />
						</div>
					))}
				</div>
			</div>
		);
	}

	if (approvedMentors.length === 0) {
		return null; // Don't show carousel if no approved mentors
	}

	return (
		<div className="relative overflow-hidden py-6" aria-label="Carrossel de mentores">
			<div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-background to-transparent z-10" />
			<div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-background to-transparent z-10" />
			<div className="flex gap-4 will-change-transform" ref={trackRef}>
				{items.map((m, i) => (
					<button
						key={`${m.id}-${i}`}
						className="shrink-0 w-64 text-left rounded-[22px] p-[1.5px] bg-gradient-to-br from-purple via-purple-light/40 to-transparent focus:outline-none focus:ring-0 transition-transform hover:scale-105"
					>
						<div className="rounded-[20px] border border-white/10 dark:border-white/10 bg-surface/30 dark:bg-white/[0.03] p-4 hover:bg-surface/50 dark:hover:bg-white/[0.06] transition">
							<div className="flex items-center gap-3">
								{m.avatar_url ? (
									<img src={m.avatar_url} alt={m.full_name || 'Mentor'} className="h-12 w-12 rounded-full object-cover ring-2 ring-purple/40" loading="lazy" />
								) : (
									<div className="h-12 w-12 rounded-full bg-card-glow flex items-center justify-center text-sm font-medium uppercase ring-2 ring-purple/40">
										{m.full_name?.[0] || 'M'}
									</div>
								)}
								<div className="min-w-0 flex-1">
									<div className="font-medium text-text-primary truncate">{m.full_name || 'Mentor'}</div>
									<div className="text-xs text-text-secondary truncate">{m.bio || 'Mentor aprovado'}</div>
								</div>
							</div>
							{m.is_mentor_approved && (
								<span className="mt-3 inline-flex items-center gap-1 text-[11px] text-background bg-purple px-2 py-0.5 rounded">
									<ShieldCheck size={12} /> Mentor aprovado
								</span>
							)}
						</div>
					</button>
				))}
			</div>
		</div>
	);
}


