import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    server: {
        port: 5173,
        proxy: {
            '/api': {
                target: process.env.API_URL || 'http://localhost:8080',
                changeOrigin: true,
                secure: false,
            },
            '/login': {
                target: 'http://localhost:8000',
                changeOrigin: true,
            },
            '/auth': {
                target: 'http://localhost:8000',
                changeOrigin: true,
            },
            '/user': {
                target: 'http://localhost:8000',
                changeOrigin: true,
            },
            '/familie-tilbake': {
                target: 'http://localhost:8000',
                changeOrigin: true,
            },
        },
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
    build: {
        outDir: 'frontend_production',
        sourcemap: true,
        rollupOptions: {
            input: {
                main: path.resolve(__dirname, 'index.html'),
            },
            output: {
                manualChunks: {
                    'react-vendor': ['react', 'react-dom', 'react-router-dom'],
                    'navikt-vendor': ['@navikt/ds-react', '@navikt/aksel-icons'],
                    styled: ['styled-components'],
                },
            },
        },
        chunkSizeWarningLimit: 1000,
    },
});
