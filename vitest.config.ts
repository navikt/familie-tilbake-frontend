import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { defineConfig } from 'vitest/config';

const frontendPath = resolve(__dirname, 'src/frontend');

export default defineConfig({
    plugins: [react()],
    cacheDir: '.vitest-cache',
    resolve: {
        alias: {
            '@api': resolve(frontendPath, 'api'),
            '@context': resolve(frontendPath, 'context'),
            '@generated': resolve(frontendPath, 'generated'),
            '@generated-new': resolve(frontendPath, 'generated-new'),
            '@hooks': resolve(frontendPath, 'hooks'),
            '@images': resolve(frontendPath, 'images'),
            '@kodeverk': resolve(frontendPath, 'kodeverk'),
            '@komponenter': resolve(frontendPath, 'komponenter'),
            '@pages': resolve(frontendPath, 'pages'),
            '@stores': resolve(frontendPath, 'stores'),
            '@testdata': resolve(frontendPath, 'testdata'),
            '@testutils': resolve(frontendPath, 'testutils'),
            '@typer': resolve(frontendPath, 'typer'),
            '@utils': resolve(frontendPath, 'utils'),
        },
    },
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
});
