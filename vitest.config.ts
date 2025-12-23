import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
    plugins: [react()],
    test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: ['./src/vitest-setup.ts'],
        css: true,
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html'],
        },
    },
    resolve: {
        alias: {
            '@navikt/ds-tokens/dist/tokens': resolve(
                __dirname,
                'src/frontend/__mocks__/@navikt/ds-tokens/dist/tokens.ts'
            ),
            '\\.svg$': resolve(__dirname, 'src/frontend/__mocks__/fileMock.ts'),
        },
    },
});
