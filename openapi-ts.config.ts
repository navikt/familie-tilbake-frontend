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
            postProcess: [
                {
                    name: 'Biome (Format)',
                    command: 'biome',
                    args: [
                        'format',
                        '--write',
                        '--config-path',
                        './biome.generated.json',
                        '{{path}}',
                    ],
                },
            ],
        },
    },
    {
        ...defaultConfig,
        input: 'https://raw.githubusercontent.com/navikt/tilbakekreving-kontrakter/515e270369fafffcc50adf3bdfb25331a2133601/tsp-output/schema/openapi.yaml',
        output: {
            path: 'src/frontend/generated-new',
            postProcess: [
                {
                    name: 'Biome (Format)',
                    command: 'biome',
                    args: [
                        'format',
                        '--write',
                        '--config-path',
                        './biome.generated.json',
                        '{{path}}',
                    ],
                },
            ],
        },
    },
] satisfies UserConfig[]);
