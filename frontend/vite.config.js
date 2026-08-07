import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
    watch: {
      // Avoid watcher thrash / OOM from deps, build output, and backend uploads
      ignored: [
        '**/node_modules/**',
        '**/dist/**',
        '**/.git/**',
        '**/backend/uploads/**',
        '**/uploads/**',
      ],
    },
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'react-hot-toast', '@heroicons/react'],
  },
  build: {
    sourcemap: false,
    chunkSizeWarningLimit: 800,
  },
});
