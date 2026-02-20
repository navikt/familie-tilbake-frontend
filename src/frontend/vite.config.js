import { sentryVitePlugin } from '@sentry/vite-plugin';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import console from 'console';
import { readdirSync, statSync } from 'fs';
import { dirname, resolve, join } from 'path';
import process from 'process';
import { fileURLToPath } from 'url';
import { defineConfig } from 'vite';
import compression from 'vite-plugin-compression';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const frontendPath = resolve(__dirname, '.');

const frontendFolders = readdirSync(frontendPath).filter(name => {
    const fullPath = join(frontendPath, name);
    return statSync(fullPath).isDirectory();
});

const aliases = frontendFolders.reduce((acc, folder) => {
    acc[`@${folder}`] = resolve(frontendPath, folder);
    return acc;
}, {});

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
                ...aliases,
            },
        },
    };
});
