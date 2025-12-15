export default function BackgroundFX() {
	return (
		<div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
			{/* Subtle radial orbs */}
			<div className="absolute -top-32 -right-20 h-96 w-96 rounded-full blur-3xl opacity-30"
				style={{ background: 'radial-gradient(circle at 30% 30%, rgba(124,92,255,0.35), rgba(15,17,22,0) 60%)' }} />
			<div className="absolute -bottom-32 -left-10 h-[28rem] w-[28rem] rounded-full blur-3xl opacity-25"
				style={{ background: 'radial-gradient(circle at 70% 70%, rgba(155,140,255,0.30), rgba(15,17,22,0) 60%)' }} />
			{/* Subtle grid */}
			<svg className="absolute inset-0 opacity-[0.06]" width="100%" height="100%">
				<defs>
					<pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse">
						<path d="M 32 0 L 0 0 0 32" fill="none" stroke="white" strokeOpacity="0.35" strokeWidth="0.5" />
					</pattern>
				</defs>
				<rect x="0" y="0" width="100%" height="100%" fill="url(#grid)" />
			</svg>
		</div>
	);
}


