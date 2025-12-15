type Props = {
	icon: React.ReactNode;
	title: string;
	description: string;
};

export default function HeroInfoCard({ icon, title, description }: Props) {
	return (
		<div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 hover:bg-white/[0.05] transition shadow-soft-3d">
			<div className="h-10 w-10 rounded-lg bg-card-glow flex items-center justify-center mb-3">
				{icon}
			</div>
			<div className="font-medium">{title}</div>
			<p className="text-sm text-text-secondary mt-1">{description}</p>
		</div>
	);
}


