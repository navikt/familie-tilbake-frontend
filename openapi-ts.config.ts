import type { UserConfig } from '@hey-api/openapi-ts';

import { defineConfig } from '@hey-api/openapi-ts';

const defaultConfig: Partial<UserConfig> = {
    parser: {
        transforms: {
            enums: 'root',
        },
    },
    plugins: [
        '@hey-api/typescript',
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
};

export default defineConfig([
    {
        ...defaultConfig,
        input: 'https://tilbakekreving-backend.intern.dev.nav.no/v3/api-docs',
        output: {
            path: 'src/frontend/generated',
            format: 'prettier',
            lint: 'eslint',
        },
    },
    {
        ...defaultConfig,
        input: 'https://raw.githubusercontent.com/navikt/tilbakekreving-kontrakter/bf206cbef421ae11e0faf4efab75bdb3dbd95773/tsp-output/schema/openapi.yaml',
        output: {
            path: 'src/frontend/generated-new',
            format: 'prettier',
            lint: 'eslint',
        },
    },
] as UserConfig[]);
