import { sentryVitePlugin } from '@sentry/vite-plugin';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import console from 'console';
import { dirname, resolve } from 'path';
import process from 'process';
import { fileURLToPath } from 'url';
import { defineConfig } from 'vite';
import compression from 'vite-plugin-compression';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// https://vitejs.dev/config/
export default defineConfig(() => {
    return {
        root: __dirname,
        build: {
            outDir: resolve(__dirname, '../../dist'),
            sourcemap: true,
            emptyOutDir: true,
        },
        plugins: [
            tailwindcss(),
            react(),
            compression(),
            sentryVitePlugin({
                org: 'nav',
                project: 'familie-tilbake-frontend',
                authToken: process.env.SENTRY_AUTH_TOKEN,
                url: 'https://sentry.gc.nav.no/',
                release: {
                    name: process.env.SENTRY_RELEASE,
                    uploadLegacySourcemaps: {
                        paths: ['./dist'],
                        ignore: ['./node_modules'],
                    },
                },
                errorHandler: err => {
                    console.warn('Sentry CLI Plugin: ' + err.message);
                },
            }),
        ],
    };
});
