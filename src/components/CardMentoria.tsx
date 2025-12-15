import { Link } from 'react-router-dom';
import { Mentoria } from '../lib/types';
import { BadgeCheck, DollarSign, MapPin, FileText } from 'lucide-react';

export default function CardMentoria({ m }: { m: Mentoria }) {
	const isFree = m.price === 0;
	return (
		<article className="rounded-[22px] p-[1.5px] bg-gradient-to-br from-purple via-purple-light/40 to-transparent hover:via-purple-light/60 transition">
			<div className="rounded-[20px] overflow-hidden bg-surface hover:bg-surface/80 border border-border transition">
				<div className="relative">
					<img src={m.cover_url} alt={m.title} className="w-full h-40 object-cover" loading="lazy" />
					<div className="absolute top-3 left-3 flex items-center gap-2">
						<span className={`text-[11px] px-2 py-1 rounded-full backdrop-blur ring-1 ring-inset ${isFree ? 'bg-success/90 text-white ring-border' : 'bg-purple text-white ring-border'}`}>
							{isFree ? 'Grátis' : 'Pago'}
						</span>
						{m.published && (
							<span className="hidden sm:inline-flex items-center gap-1 text-[11px] px-2 py-1 rounded-full bg-surface ring-1 ring-inset ring-border text-text-primary">
								<BadgeCheck size={12} /> Publicada
							</span>
						)}
					</div>
				</div>
				<div className="p-4">
					<div className="flex items-center gap-2 text-xs text-text-secondary">
						{m.type === 'online' && <span className="inline-flex items-center gap-1"><DollarSign size={12} /> Online</span>}
						{m.type === 'presencial' && <span className="inline-flex items-center gap-1"><MapPin size={12} /> Presencial</span>}
						{m.type === 'documento' && <span className="inline-flex items-center gap-1"><FileText size={12} /> Documento</span>}
					</div>
					<h3 className="font-medium mt-1 text-text-primary">{m.title}</h3>
					<p className="text-sm text-text-secondary line-clamp-2 mt-1">{m.description}</p>
					<Link to={`/mentorias/${m.id}`} className="mt-3 inline-block text-sm px-3 py-2 rounded-lg ring-1 ring-inset ring-border hover:ring-purple transition-colors text-text-primary">
						Ver detalhes
					</Link>
				</div>
			</div>
		</article>
	);
}


