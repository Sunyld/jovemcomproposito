import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const stripLucideSourcemap = () => ({
  name: 'strip-lucide-sourcemap',
  enforce: 'post',
  apply: 'serve',
  transform(code: string, id: string) {
    if (id.includes('node_modules/lucide-react/dist/esm/icons/')) {
      return { code: code.replace(/\/\/# sourceMappingURL=.*$/gm, ''), map: null };
    }
    return null;
  },
});

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), stripLucideSourcemap()],
  build: {
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          supabase: ['@supabase/supabase-js'],
          ui: ['lucide-react'],
        },
      },
    },
  },
});
