import { useState, ReactNode } from 'react';

type Props = {
	content: string;
	children: ReactNode;
	position?: 'top' | 'bottom' | 'left' | 'right';
};

export default function Tooltip({ content, children, position = 'top' }: Props) {
	const [show, setShow] = useState(false);

	const positionClasses = {
		top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
		bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
		left: 'right-full top-1/2 -translate-y-1/2 mr-2',
		right: 'left-full top-1/2 -translate-y-1/2 ml-2',
	};

	const arrowClasses = {
		top: 'top-full left-1/2 -translate-x-1/2 border-t-border',
		bottom: 'bottom-full left-1/2 -translate-x-1/2 border-b-border',
		left: 'left-full top-1/2 -translate-y-1/2 border-l-border',
		right: 'right-full top-1/2 -translate-y-1/2 border-r-border',
	};

	return (
		<div
			className="relative inline-block"
			onMouseEnter={() => setShow(true)}
			onMouseLeave={() => setShow(false)}
			onFocus={() => setShow(true)}
			onBlur={() => setShow(false)}
		>
			{children}
			{show && (
				<div
					className={`absolute z-50 px-2 py-1 text-xs text-text-primary bg-surface border border-border rounded-lg shadow-elevate whitespace-nowrap ${positionClasses[position]}`}
					role="tooltip"
				>
					{content}
					<div
						className={`absolute w-0 h-0 border-4 border-transparent ${arrowClasses[position]}`}
					></div>
				</div>
			)}
		</div>
	);
}




