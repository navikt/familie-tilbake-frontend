// Merk: openapi-ts kjøres via `pnpm generate-types` med en isolert TypeScript 6
// (se package.json). TS 7 (native) fjernet det klassiske compiler-API-et som
// openapi-ts er avhengig av. Derfor importeres kun typer herfra (som fjernes ved
// kjøring) – ingen verdi-import av `@hey-api/openapi-ts`, slik at prosjektets
// egen TS 7-lenkede openapi-ts ikke lastes inn og krasjer.
import type { UserConfig } from '@hey-api/openapi-ts';

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

export default [
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
        input: 'https://raw.githubusercontent.com/navikt/tilbakekreving-kontrakter/2044df925bb94850f095058b6bf193c4cfeed5f8/tsp-output/schema/openapi.yaml',
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
] satisfies UserConfig[];
