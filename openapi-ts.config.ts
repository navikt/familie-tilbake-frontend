import { defineConfig } from '@hey-api/openapi-ts';

export default defineConfig({
    input: 'https://tilbakekreving-backend.intern.dev.nav.no/v3/api-docs',
    output: {
        path: 'src/frontend/generated',
        format: 'prettier',
        lint: 'eslint',
    },
    parser: {
        filters: {
            deprecated: false,
        },
    },
    plugins: [
        '@tanstack/react-query',
        {
            name: 'zod',
            requests: true,
        },
    ],
});
