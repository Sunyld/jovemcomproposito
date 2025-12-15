type Props = {
	size?: 'sm' | 'md' | 'lg';
	className?: string;
	variant?: 'spinner' | 'dots' | 'pulse';
	text?: string;
};

export default function LoadingSpinner({ 
	size = 'md', 
	className = '', 
	variant = 'spinner',
	text 
}: Props) {
	const sizeClasses = {
		sm: 'h-4 w-4',
		md: 'h-8 w-8',
		lg: 'h-12 w-12',
	};

	if (variant === 'dots') {
		return (
			<div className={`flex flex-col items-center justify-center gap-2 ${className}`}>
				<div className="flex gap-1.5">
					<div className={`${sizeClasses[size]} bg-purple rounded-full animate-bounce`} style={{ animationDelay: '0ms' }} />
					<div className={`${sizeClasses[size]} bg-purple rounded-full animate-bounce`} style={{ animationDelay: '150ms' }} />
					<div className={`${sizeClasses[size]} bg-purple rounded-full animate-bounce`} style={{ animationDelay: '300ms' }} />
				</div>
				{text && <p className="text-sm text-text-secondary">{text}</p>}
			</div>
		);
	}

	if (variant === 'pulse') {
		return (
			<div className={`flex flex-col items-center justify-center gap-2 ${className}`}>
				<div className={`${sizeClasses[size]} bg-purple rounded-full animate-pulse`} />
				{text && <p className="text-sm text-text-secondary">{text}</p>}
			</div>
		);
	}

	return (
		<div className={`flex flex-col items-center justify-center gap-2 ${className}`}>
			<div 
				className={`${sizeClasses[size]} border-2 border-text-secondary/20 border-t-purple rounded-full animate-spin`}
				aria-label="Carregando"
				role="status"
			>
				<span className="sr-only">Carregando...</span>
			</div>
			{text && <p className="text-sm text-text-secondary">{text}</p>}
		</div>
	);
}

