type Props = {
	variant?: 'card' | 'list' | 'text' | 'avatar';
	count?: number;
	className?: string;
};

export default function SkeletonLoader({ variant = 'card', count = 1, className = '' }: Props) {
	const skeletons = Array.from({ length: count });

	if (variant === 'card') {
		return (
			<div className={`grid gap-4 md:grid-cols-2 lg:grid-cols-3 ${className}`}>
				{skeletons.map((_, i) => (
					<div key={i} className="rounded-2xl border border-border bg-surface p-6 animate-pulse">
						<div className="h-6 bg-border rounded w-3/4 mb-4"></div>
						<div className="h-4 bg-border rounded w-full mb-2"></div>
						<div className="h-4 bg-border rounded w-5/6"></div>
					</div>
				))}
			</div>
		);
	}

	if (variant === 'list') {
		return (
			<div className={`space-y-3 ${className}`}>
				{skeletons.map((_, i) => (
					<div key={i} className="rounded-lg border border-border bg-surface p-4 animate-pulse">
						<div className="h-5 bg-border rounded w-1/2 mb-2"></div>
						<div className="h-4 bg-border rounded w-full"></div>
					</div>
				))}
			</div>
		);
	}

	if (variant === 'text') {
		return (
			<div className={`space-y-2 ${className}`}>
				{skeletons.map((_, i) => (
					<div key={i} className="h-4 bg-border rounded animate-pulse" style={{ width: `${100 - i * 10}%` }}></div>
				))}
			</div>
		);
	}

	if (variant === 'avatar') {
		return (
			<div className={`flex items-center gap-3 ${className}`}>
				<div className="h-12 w-12 rounded-full bg-border animate-pulse"></div>
				<div className="flex-1 space-y-2">
					<div className="h-4 bg-border rounded w-1/3 animate-pulse"></div>
					<div className="h-3 bg-border rounded w-1/2 animate-pulse"></div>
				</div>
			</div>
		);
	}

	return null;
}




