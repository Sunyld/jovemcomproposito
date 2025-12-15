export function Footer() {
	return (
		<footer className="mt-16 border-t border-border bg-background/80">
			<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 grid gap-8 md:grid-cols-3">
				<div>
					<div className="h-8 w-8 rounded-full bg-card-glow mb-3" />
					<p className="text-text-secondary text-sm leading-relaxed">
						Jovem com Propósito — Plataforma de mentorias com vibe futurista. Conecte-se a mentores, projetos e discipulado.
					</p>
				</div>
				<div>
					<h4 className="font-medium mb-3 text-text-primary">Links</h4>
					<ul className="text-text-secondary space-y-2">
						<li><a className="hover:text-text-primary transition-colors" href="/termos">Termos</a></li>
						<li><a className="hover:text-text-primary transition-colors" href="/politica-privacidade">Política de Privacidade</a></li>
						<li><a className="hover:text-text-primary transition-colors" href="/contato">Contato</a></li>
					</ul>
				</div>
				<div>
					<h4 className="font-medium mb-3 text-text-primary">Newsletter</h4>
					<form className="flex gap-2">
						<input className="flex-1 bg-input border border-border rounded-lg px-3 py-2 outline-none focus:border-purple text-text-primary placeholder:text-text-secondary" placeholder="Seu e-mail" />
						<button type="button" className="px-4 py-2 rounded-lg bg-purple text-white hover:bg-purple-light transition-colors">Assinar</button>
					</form>
				</div>
			</div>
			<div className="py-4 text-center text-xs text-text-secondary border-t border-border">© {new Date().getFullYear()} Jovem com Propósito</div>
		</footer>
	);
}


