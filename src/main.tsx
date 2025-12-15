import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import App from './App.tsx';
import './index.css';
import { persister, queryClient } from './lib/queryClient';

const root = document.getElementById('root');

if (root) {
	createRoot(root).render(
		<StrictMode>
			{persister ? (
				<PersistQueryClientProvider client={queryClient} persistOptions={{ persister }}>
					<App />
				</PersistQueryClientProvider>
			) : (
				<QueryClientProvider client={queryClient}>
					<App />
				</QueryClientProvider>
			)}
		</StrictMode>
	);
}
