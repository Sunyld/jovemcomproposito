import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getActiveDevocional, ActiveDevocional } from '../lib/devocionalService';
import { toast } from '../components/Toast';

type DevocionalContextType = {
	activeDevocional: ActiveDevocional | null;
	loading: boolean;
	refetch: () => Promise<void>;
};

const DevocionalContext = createContext<DevocionalContextType | undefined>(undefined);

export function DevocionalProvider({ children }: { children: ReactNode }) {
	const [activeDevocional, setActiveDevocional] = useState<ActiveDevocional | null>(null);
	const [loading, setLoading] = useState(true);

	const refetch = async () => {
		try {
			const devocional = await getActiveDevocional();
			setActiveDevocional(devocional);
		} catch (err: any) {
			// Silent fail - devocional will be null
			setActiveDevocional(null);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		refetch();

		// Check every minute for expiration/activation
		const interval = setInterval(() => {
			refetch();
		}, 60000); // 1 minute

		return () => clearInterval(interval);
	}, []);

	return (
		<DevocionalContext.Provider value={{ activeDevocional, loading, refetch }}>
			{children}
		</DevocionalContext.Provider>
	);
}

export function useDevocional() {
	const context = useContext(DevocionalContext);
	if (context === undefined) {
		// Return default values if context is not available (for pages outside provider)
		return { activeDevocional: null, loading: false, refetch: async () => {} };
	}
	return context;
}

