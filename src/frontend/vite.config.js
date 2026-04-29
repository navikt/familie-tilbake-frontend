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

const frontendPath = resolve(__dirname, '.');

// https://vitejs.dev/config/
export default defineConfig(() => {
    return {
        root: __dirname,
        build: {
            outDir: resolve(__dirname, '../../dist'),
            sourcemap: true,
            emptyOutDir: true,
            rolldownOptions: {
                output: {
                    codeSplitting: {
                        groups: [
                            {
                                name: 'react-vendor',
                                test: /node_modules[\\/](react|react-dom|react-router|scheduler)[\\/]/,
                                priority: 30,
                            },
                            {
                                name: 'navikt-ds',
                                test: /node_modules[\\/]@navikt[\\/]/,
                                priority: 25,
                            },
                            {
                                name: 'sentry',
                                test: /node_modules[\\/]@sentry[\\/]/,
                                priority: 20,
                            },
                            {
                                name: 'faro',
                                test: /node_modules[\\/]@grafana[\\/]/,
                                priority: 20,
                            },
                            {
                                name: 'tanstack',
                                test: /node_modules[\\/]@tanstack[\\/]/,
                                priority: 20,
                            },
                            {
                                name: 'forms',
                                test: /node_modules[\\/](react-hook-form|@hookform)[\\/]/,
                                priority: 15,
                            },
                            {
                                name: 'zod',
                                test: /node_modules[\\/]zod[\\/]/,
                                priority: 15,
                            },
                            {
                                name: 'axios',
                                test: /node_modules[\\/]axios[\\/]/,
                                priority: 15,
                            },
                            {
                                name: 'countries-list',
                                test: /node_modules[\\/]countries-list[\\/]/,
                                priority: 15,
                            },
                            {
                                name: 'date-fns',
                                test: /node_modules[\\/]date-fns[\\/]/,
                                priority: 15,
                            },
                            {
                                name: 'vendor',
                                test: /node_modules[\\/]/,
                                priority: 1,
                                minSize: 30 * 1024,
                            },
                        ],
                    },
                },
            },
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
                        urlPrefix: `~/assets`,
                    },
                },
                errorHandler: err => {
                    console.warn('Sentry CLI Plugin: ' + err.message);
                },
            }),
        ],
        resolve: {
            alias: {
                '~': frontendPath,
            },
        },
    };
});
