import { useEffect, useState } from 'react';
import DashboardShell from '../../components/dashboard/DashboardShell';
import LoadingSpinner from '../../components/LoadingSpinner';
import { supabase } from '../../lib/supabaseClient';
import { toast } from '../../components/Toast';
import { CreditCard } from 'lucide-react';

type DonationRow = {
	id?: string;
	title: string;
	description: string;
	detail: string;
	reference: string;
};

const defaultDonations: DonationRow[] = [
	{ title: 'M-Pesa', description: 'Conta empresarial', detail: '84 123 4567', reference: 'Jovem c/ Propósito' },
               
	{ title: 'e-Mola', description: 'Conta pessoal', detail: '86 987 6543', reference: 'JCP Ministry' },
	{ title: 'Conta Bancária', description: 'BCI - NIB', detail: '0002 0034 0000 1234 567 89', reference: 'IBAN: MZ59 0002 0034 0000 1234 56789' },
	{ title: 'Visa / Mastercard', description: 'Gateway internacional', detail: 'Em breve', reference: 'Solicite link seguro' },
];

export default function AdminDoacoes() {
	const [rows, setRows] = useState<DonationRow[]>(defaultDonations);
	const [loading, setLoading] = useState(true);
	const [savingIndex, setSavingIndex] = useState<number | null>(null);

	useEffect(() => {
		let mounted = true;

		async function fetchDonations() {
			try {
				const { data, error } = await supabase.from('donations').select('*').order('created_at', { ascending: true });
				if (error) throw error;
				if (mounted && data && data.length > 0) {
					setRows(
						data.map((d) => ({
							id: d.id,
							title: d.title,
							description: d.description,
							detail: d.detail,
							reference: d.reference,
						}))
					);
				}
			} catch (err) {
				// Error loading donations - use default values
			} finally {
				if (mounted) {
					setLoading(false);
				}
			}
		}
		fetchDonations();

		return () => {
			mounted = false;
		};
	}, []);

	const handleChange = (index: number, key: keyof DonationRow, value: string) => {
		setRows((prev) => prev.map((row, idx) => (idx === index ? { ...row, [key]: value } : row)));
	};

	const handleSave = async (index: number) => {
		const donation = rows[index];
		setSavingIndex(index);
		try {
			if (donation.id) {
				const { error } = await supabase
					.from('donations')
					.update({
						title: donation.title,
						description: donation.description,
						detail: donation.detail,
						reference: donation.reference,
					})
					.eq('id', donation.id);
				if (error) throw error;
			} else {
				const { data, error } = await supabase
					.from('donations')
					.insert({
						title: donation.title,
						description: donation.description,
						detail: donation.detail,
						reference: donation.reference,
					})
					.select()
					.single();
				if (error) throw error;
				setRows((prev) => prev.map((row, idx) => (idx === index ? { ...row, id: data.id } : row)));
			}
			toast({ title: 'Doação atualizada', variant: 'success' });
		} catch (err: any) {
			toast({ title: 'Erro ao salvar', description: err.message, variant: 'error' });
		} finally {
			setSavingIndex(null);
		}
	};

	return (
		<DashboardShell role="admin" title="Gestão de Doações" subtitle="Atualize as informações exibidas na landing page e nas campanhas.">
			{loading ? (
				<LoadingSpinner size="lg" className="py-16" />
			) : (
				<div className="grid gap-4 sm:grid-cols-2">
					{rows.map((row, index) => (
						<div key={row.id ?? row.title} className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 space-y-3">
							<div className="flex items-center gap-2 text-sm font-semibold">
								<CreditCard size={16} className="text-purple" /> {row.title}
							</div>
							<input
								className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 outline-none focus:border-purple text-sm"
								value={row.title}
								onChange={(e) => handleChange(index, 'title', e.target.value)}
							/>
							<input
								className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 outline-none focus:border-purple text-sm"
								value={row.description}
								onChange={(e) => handleChange(index, 'description', e.target.value)}
							/>
							<input
								className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 outline-none focus:border-purple text-sm"
								value={row.detail}
								onChange={(e) => handleChange(index, 'detail', e.target.value)}
							/>
							<input
								className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 outline-none focus:border-purple text-sm"
								value={row.reference}
								onChange={(e) => handleChange(index, 'reference', e.target.value)}
							/>
							<button
								onClick={() => handleSave(index)}
								disabled={savingIndex === index}
								className="w-full rounded-lg bg-purple text-background py-2 text-sm font-medium hover:bg-purple-light disabled:opacity-50"
							>
								{savingIndex === index ? 'Salvando...' : 'Salvar alterações'}
							</button>
						</div>
					))}
				</div>
			)}
		</DashboardShell>
	);
}





