import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
    plugins: [react()],
    cacheDir: '.vitest-cache',
    test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: ['./src/vitest-setup.ts'],
        css: false,
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html'],
        },
        pool: 'vmThreads',
        isolate: true,
        maxConcurrency: 10,
        includeSource: ['src/**/*.{js,ts,jsx,tsx}'],
        exclude: [
            '**/node_modules/**',
            '**/dist/**',
            '**/cypress/**',
            '**/.{idea,git,cache,output,temp}/**',
            '**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build}.config.*',
        ],
        deps: {
            optimizer: {
                web: {
                    enabled: true,
                    include: [
                        'react',
                        'react-dom',
                        '@testing-library/react',
                        '@testing-library/user-event',
                        '@testing-library/dom',
                    ],
                },
            },
        },
    },
    resolve: {
        alias: {
            '@navikt/ds-tokens/dist/tokens': resolve(
                __dirname,
                'src/frontend/__mocks__/@navikt/ds-tokens/dist/tokens.ts'
            ),
        },
    },
});
