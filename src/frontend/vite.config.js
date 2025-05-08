import react from '@vitejs/plugin-react';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { defineConfig } from 'vite';
import compression from 'vite-plugin-compression';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// https://vitejs.dev/config/
export default defineConfig({
    root: __dirname, // 👈 This tells Vite where the project root is
    build: {
        outDir: 'frontend_production',
        sourcemap: true,
    },
    server: {
        proxy: {
            '/familie-tilbake/api': {
                target: 'http://localhost:4000',
                changeOrigin: true,
            },
        },
    },
    plugins: [react(), compression()],
});
