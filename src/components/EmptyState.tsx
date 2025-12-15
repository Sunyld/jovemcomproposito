import { ReactNode } from 'react';
import { Inbox } from 'lucide-react';

type Props = {
	icon?: React.ComponentType<{ size?: number; className?: string }>;
	title: string;
	description?: string;
	action?: ReactNode;
};

export default function EmptyState({ icon: Icon = Inbox, title, description, action }: Props) {
	return (
		<div className="flex flex-col items-center justify-center py-12 px-4 sm:py-16 text-center">
			<div className="h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-surface/50 border border-white/10 dark:border-white/10 flex items-center justify-center mb-4 sm:mb-6">
				<Icon size={32} className="text-text-secondary" />
			</div>
			<h3 className="text-lg sm:text-xl font-semibold text-text-primary mb-2">{title}</h3>
			{description && (
				<p className="text-sm sm:text-base text-text-secondary mb-4 sm:mb-6 max-w-sm mx-auto px-4">
					{description}
				</p>
			)}
			{action && <div className="mt-2">{action}</div>}
		</div>
	);
}

