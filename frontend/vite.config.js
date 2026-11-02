import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    strictPort: true,
    // Same-origin requests in dev keep HTTP-only auth cookies simple.
    proxy: {
      '/api': 'http://localhost:5000',
    },
  },
});
