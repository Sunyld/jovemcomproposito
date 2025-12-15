import { ChevronLeft, ChevronRight } from 'lucide-react';

type Props = {
	currentPage: number;
	totalPages: number;
	onPageChange: (page: number) => void;
};

export default function Pagination({ currentPage, totalPages, onPageChange }: Props) {
	if (totalPages <= 1) return null;

	const pages = [];
	const maxVisible = 5;
	let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
	let endPage = Math.min(totalPages, startPage + maxVisible - 1);

	if (endPage - startPage < maxVisible - 1) {
		startPage = Math.max(1, endPage - maxVisible + 1);
	}

	for (let i = startPage; i <= endPage; i++) {
		pages.push(i);
	}

	return (
		<div className="flex items-center justify-center gap-2 mt-6">
			<button
				onClick={() => onPageChange(currentPage - 1)}
				disabled={currentPage === 1}
				className="p-2 rounded-lg border border-border hover:border-purple transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-text-primary"
				aria-label="Página anterior"
			>
				<ChevronLeft size={16} />
			</button>

			{startPage > 1 && (
				<>
					<button
						onClick={() => onPageChange(1)}
						className="px-3 py-1 rounded-lg border border-border hover:border-purple transition-colors text-text-primary"
					>
						1
					</button>
					{startPage > 2 && <span className="text-text-secondary">...</span>}
				</>
			)}

			{pages.map((page) => (
				<button
					key={page}
					onClick={() => onPageChange(page)}
					className={`px-3 py-1 rounded-lg border transition-colors ${
						currentPage === page
							? 'bg-purple text-white border-purple'
							: 'border-border hover:border-purple text-text-primary'
					}`}
				>
					{page}
				</button>
			))}

			{endPage < totalPages && (
				<>
					{endPage < totalPages - 1 && <span className="text-text-secondary">...</span>}
					<button
						onClick={() => onPageChange(totalPages)}
						className="px-3 py-1 rounded-lg border border-border hover:border-purple transition-colors text-text-primary"
					>
						{totalPages}
					</button>
				</>
			)}

			<button
				onClick={() => onPageChange(currentPage + 1)}
				disabled={currentPage === totalPages}
				className="p-2 rounded-lg border border-border hover:border-purple transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-text-primary"
				aria-label="Próxima página"
			>
				<ChevronRight size={16} />
			</button>
		</div>
	);
}




