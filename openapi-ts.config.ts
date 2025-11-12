import { defineConfig } from '@hey-api/openapi-ts';

export default defineConfig({
    input: [
        'https://tilbakekreving-backend.intern.dev.nav.no/v3/api-docs',
        'https://raw.githubusercontent.com/navikt/tilbakekreving-kontrakter/refs/heads/main/tsp-output/schema/openapi.yaml',
    ],
    output: [
        {
            path: 'src/frontend/generated',
            format: 'prettier',
            lint: 'eslint',
        },
        {
            path: 'src/frontend/kontrakter',
            format: 'prettier',
            lint: 'eslint',
        },
    ],
    parser: {
        transforms: {
            enums: 'root',
        },
    },
    plugins: [
        {
            name: '@hey-api/typescript',
            enums: 'typescript',
        },
        '@tanstack/react-query',
        {
            name: 'zod',
            requests: true,
        },
        {
            name: '@hey-api/client-axios',
            baseUrl: '/familie-tilbake',
        },
    ],
});
