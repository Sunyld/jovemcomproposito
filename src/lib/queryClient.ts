import { QueryClient } from '@tanstack/react-query';
import { PersistedClient, persistQueryClient } from '@tanstack/react-query-persist-client';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import { toast } from '../components/Toast';

// Cria um persister seguro para ambiente browser
const localStoragePersister =
	typeof window !== 'undefined' && window.localStorage
		? createSyncStoragePersister({ storage: window.localStorage, key: 'react-query-cache' })
		: null;

export const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			retry: 2,
			staleTime: 60 * 1000, // 1 min padrão
			cacheTime: 5 * 60 * 1000, // 5 min padrão
			refetchOnWindowFocus: false,
			refetchOnReconnect: true,
			onError: (err: any) => {
				const message = err?.message ?? 'Erro ao carregar dados.';
				toast({ title: 'Erro', description: message, variant: 'error' });
			},
		},
		mutations: {
			retry: 1,
			onError: (err: any) => {
				const message = err?.message ?? 'Erro ao processar ação.';
				toast({ title: 'Erro', description: message, variant: 'error' });
			},
		},
	},
});

// Persistência do cache (apenas em browser)
if (localStoragePersister) {
	persistQueryClient({
		queryClient,
		persister: localStoragePersister,
		dehydrateOptions: {
			shouldDehydrateQuery: (query) => {
				// Evita persistir dados sensíveis (ex: auth) — usamos apenas dados públicos/gerais
				return true;
			},
		},
	});
}

export const persister = localStoragePersister as ReturnType<typeof createSyncStoragePersister> | null;


