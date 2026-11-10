import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// VITE_API_URL=/api/v1 hace que el navegador llame al mismo origen y Vite reenvía /api al backend (útil detrás de un túnel).
const BACKEND = process.env.BACKEND_URL || 'http://localhost:8080';

export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: ['.trycloudflare.com'],
    proxy: { '/api': { target: BACKEND, changeOrigin: true } },
  },
});
