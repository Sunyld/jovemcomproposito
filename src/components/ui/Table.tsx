import { HTMLAttributes, ReactNode } from 'react';

type TableProps = HTMLAttributes<HTMLTableElement> & {
	headers: Array<{ label: string; align?: 'left' | 'center' | 'right' }>;
	children: ReactNode;
	emptyMessage?: string;
	emptyIcon?: React.ComponentType<{ size?: number; className?: string }>;
};

export default function Table({ headers, children, emptyMessage, emptyIcon: EmptyIcon, className = '', ...props }: TableProps) {
	return (
		<div className="rounded-2xl border border-border bg-surface overflow-hidden">
			<div className="overflow-x-auto">
				<table className={`w-full ${className}`} {...props}>
					<thead className="bg-surface border-b border-border">
						<tr>
							{headers.map((header, index) => (
								<th
									key={index}
									className={`px-4 py-3 text-left text-sm font-semibold text-text-secondary ${
										header.align === 'center' ? 'text-center' : header.align === 'right' ? 'text-right' : ''
									}`}
								>
									{header.label}
								</th>
							))}
						</tr>
					</thead>
					<tbody className="divide-y divide-border">
						{children}
					</tbody>
				</table>
			</div>
			{emptyMessage && (
				<div className="p-8 text-center">
					{EmptyIcon && (
						<div className="flex justify-center mb-4">
							<EmptyIcon size={48} className="text-text-secondary" />
						</div>
					)}
					<p className="text-sm text-text-secondary">{emptyMessage}</p>
				</div>
			)}
		</div>
	);
}

export function TableRow({ children, className = '', ...props }: HTMLAttributes<HTMLTableRowElement>) {
	return (
		<tr className={`hover:bg-surface/50 transition-colors ${className}`} {...props}>
			{children}
		</tr>
	);
}

export function TableCell({ children, className = '', align = 'left', ...props }: HTMLAttributes<HTMLTableCellElement> & { align?: 'left' | 'center' | 'right' }) {
	const alignClass = align === 'center' ? 'text-center' : align === 'right' ? 'text-right' : 'text-left';
	return (
		<td className={`px-4 py-3 text-sm text-text-primary ${alignClass} ${className}`} {...props}>
			{children}
		</td>
	);
}

