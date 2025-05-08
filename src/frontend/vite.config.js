import react from '@vitejs/plugin-react';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import { defineConfig } from 'vite';
import compression from 'vite-plugin-compression';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// https://vitejs.dev/config/
export default defineConfig({
    root: __dirname,
    build: {
        outDir: resolve(__dirname, '../../frontend_production'),
        sourcemap: true,
        emptyOutDir: true,
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
