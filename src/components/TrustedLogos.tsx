const logos = ['GlobalTrade', 'MarketUp', 'OKFinance', 'MarketChat', 'StarBank'];

export default function TrustedLogos() {
	return (
		<section className="py-10 border-y border-white/5 bg-background/60 backdrop-blur">
			<div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
				<div className="text-center text-sm uppercase tracking-widest text-text-secondary mb-6">Confiança de especialistas e parceiros</div>
				<div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6 text-center text-text-secondary">
					{logos.map((logo) => (
						<div key={logo} className="rounded-xl border border-white/5 bg-white/[0.02] py-4 text-sm font-medium tracking-wide">
							{logo}
						</div>
					))}
				</div>
			</div>
		</section>
	);
}


