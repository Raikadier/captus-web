import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import { fileURLToPath } from 'node:url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(new URL(import.meta.url)));

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@context': path.resolve(__dirname, './src/context'),
      '@lib': path.resolve(__dirname, './src/lib'),
      '@features': path.resolve(__dirname, './src/features'),
      '@ui': path.resolve(__dirname, './src/ui'),
      '@public': path.resolve(__dirname, './public'),
      'react': path.resolve(__dirname, './node_modules/react'),
      'react-dom': path.resolve(__dirname, './node_modules/react-dom'),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React runtime — loaded first, cached indefinitely
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          // Radix UI primitives — large but stable
          'vendor-radix': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-select',
            '@radix-ui/react-tabs',
            '@radix-ui/react-popover',
            '@radix-ui/react-tooltip',
            '@radix-ui/react-accordion',
            '@radix-ui/react-alert-dialog',
            '@radix-ui/react-checkbox',
            '@radix-ui/react-label',
            '@radix-ui/react-scroll-area',
            '@radix-ui/react-switch',
            '@radix-ui/react-progress',
            '@radix-ui/react-avatar',
          ],
          // Charts — heavy, only used on stats/calendar pages
          'vendor-charts': ['recharts'],
          // Animation — loaded after first paint
          'vendor-motion': ['framer-motion'],
          // Supabase client
          'vendor-supabase': ['@supabase/supabase-js'],
          // Data fetching
          'vendor-query': ['@tanstack/react-query'],
          // Diagram engines — very large, only used on diagram pages
          'vendor-diagrams': ['mermaid', '@monaco-editor/react'],
        },
      },
    },
  },
  optimizeDeps: {
    entries: ['index.html'],
    include: ['react', 'react-dom', 'react-router-dom', '@tanstack/react-query'],
  },
});
