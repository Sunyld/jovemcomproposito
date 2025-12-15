import { useState } from 'react';
import { Donation } from '../lib/types';
import { toast } from '../components/Toast';
import { Copy, Check } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import { useDoacoes } from '../hooks/useDoacoes';

export default function Doacao() {
	const { doacoes, loading } = useDoacoes();
	const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

	function handleCopy(index: number, method: Donation) {
		const textToCopy = `${method.title}\n${method.description}\n${method.detail}\n${method.reference}`;
		
		navigator.clipboard.writeText(textToCopy).then(() => {
			setCopiedIndex(index);
			toast({ title: 'Copiado!', description: 'Detalhes copiados para a área de transferência.', variant: 'success' });
			setTimeout(() => setCopiedIndex(null), 2000);
		}).catch(() => {
			toast({ title: 'Erro', description: 'Não foi possível copiar os detalhes.', variant: 'error' });
		});
	}

	const defaultDonations: Donation[] = [
		{ id: '1', title: 'M-Pesa', description: 'Conta empresarial', detail: '84 123 4567', reference: 'Jovem c/ Propósito', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
		{ id: '2', title: 'e-Mola', description: 'Conta pessoal', detail: '86 987 6543', reference: 'JCP Ministry', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
		{ id: '3', title: 'Conta Bancária', description: 'BCI - NIB', detail: '0002 0034 0000 1234 567 89', reference: 'IBAN: MZ59000200340000123456789', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
		{ id: '4', title: 'Visa / Mastercard', description: 'Gateway internacional', detail: 'Em breve', reference: 'Solicite link seguro', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
	];

	const displayDonations = doacoes.length > 0 ? doacoes : defaultDonations;

	return (
		<div className="min-h-screen bg-background text-text-primary">
			<section className="relative overflow-hidden py-20">
				<div className="absolute inset-0 pointer-events-none"
					style={{ background: 'radial-gradient(circle at 30% 30%, rgba(124,92,255,0.25), rgba(15,17,22,0) 70%)' }} />
				<div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 relative">
					<p className="text-sm uppercase tracking-widest text-purple">Doação</p>
					<h1 className="font-display text-3xl sm:text-4xl mt-3">Invista em jovens com propósito</h1>
					<p className="text-text-secondary mt-4 text-lg">
						Cada contribuição financia discipulados, mentorias, materiais e itinerância missionária em Moçambique.
						Você nos ajuda a levar esperança e ferramentas práticas para que novos líderes descubram seu chamado.
					</p>
				</div>
			</section>
			<section className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 pb-20 grid gap-6 sm:grid-cols-2">
				{loading ? (
					<div className="col-span-2 flex justify-center py-12">
						<LoadingSpinner size="lg" />
					</div>
				) : (
					displayDonations.map((method, index) => (
						<div key={method.id || index} className="rounded-[26px] p-[1.5px] bg-gradient-to-br from-purple via-purple-light/40 to-transparent">
							<div className="rounded-[24px] h-full bg-white/[0.04] border border-white/10 p-6">
								<p className="text-xs uppercase tracking-wider text-text-secondary">{method.description}</p>
								<h3 className="text-xl font-semibold mt-2">{method.title}</h3>
								<p className="mt-3 text-text-secondary">{method.detail}</p>
								<p className="text-sm text-text-secondary/80">{method.reference}</p>
								<button
									onClick={() => handleCopy(index, method)}
									className="mt-5 inline-flex items-center gap-2 text-sm text-purple hover:text-purple-light transition-colors"
								>
									{copiedIndex === index ? (
										<>
											<Check size={16} /> Copiado!
										</>
									) : (
										<>
											<Copy size={16} /> Copiar detalhes →
										</>
									)}
								</button>
							</div>
						</div>
					))
				)}
			</section>
		</div>
	);
}


