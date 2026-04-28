import eslintReact from '@eslint-react/eslint-plugin';
import eslint from '@eslint/js';
import { defineConfig, globalIgnores } from 'eslint/config';
import * as importPlugin from 'eslint-plugin-import';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import reactHooks from 'eslint-plugin-react-hooks';
import tseslint from 'typescript-eslint';

export default defineConfig(
    eslint.configs.recommended,
    ...tseslint.configs.recommendedTypeChecked,
    eslintReact.configs['recommended-typescript'],
    jsxA11y.flatConfigs.recommended,
    eslintPluginPrettierRecommended,
    {
        languageOptions: {
            parserOptions: {
                ecmaFeatures: { jsx: true },
                projectService: {
                    allowDefaultProject: [
                        'src/vitest-setup.ts',
                        'src/frontend/tailwind.config.js',
                        'src/frontend/vite.config.js',
                    ],
                },
                tsconfigRootDir: import.meta.dirname,
            },
        },
    },
    {
        plugins: { 'react-hooks': reactHooks, import: importPlugin },
        rules: {
            ...reactHooks.configs.recommended.rules,
            'no-restricted-imports': [
                'error',
                {
                    patterns: [
                        {
                            group: ['../../../*', '../../../**/*'],
                            message: 'Bruk ~/* i stedet for dype relative imports.',
                        },
                    ],
                },
            ],
            '@typescript-eslint/explicit-function-return-type': 'warn',
            '@typescript-eslint/consistent-type-imports': [
                'warn',
                {
                    prefer: 'type-imports',
                    disallowTypeAnnotations: true,
                },
            ],
            'import/order': [
                'error',
                {
                    groups: [
                        ['type'],
                        ['builtin', 'external'],
                        ['internal'],
                        ['parent', 'sibling', 'index'],
                    ],
                    pathGroups: [
                        {
                            pattern: '~/**',
                            group: 'internal',
                        },
                    ],
                    pathGroupsExcludedImportTypes: ['type'],
                    'newlines-between': 'always',
                    alphabetize: {
                        order: 'asc',
                        caseInsensitive: true,
                    },
                },
            ],
            '@typescript-eslint/naming-convention': [
                'warn',
                {
                    selector: 'interface',
                    format: ['PascalCase'],
                },
                {
                    selector: 'enum',
                    format: ['PascalCase'],
                },
                {
                    selector: 'enumMember',
                    format: ['PascalCase'],
                },
            ],
            '@typescript-eslint/no-unused-expressions': 'off',
            '@typescript-eslint/adjacent-overload-signatures': 'warn',
            '@typescript-eslint/array-type': 'warn',
            '@typescript-eslint/no-confusing-non-null-assertion': 'error',
            '@typescript-eslint/no-non-null-asserted-optional-chain': 'error',
            '@typescript-eslint/no-non-null-assertion': 'error',
            '@typescript-eslint/no-explicit-any': 'warn',
            '@typescript-eslint/sort-type-constituents': 'warn',
            // Type-aware regler nedgradert til 'warn' inntil eksisterende
            // brudd er ryddet opp i. Se sporings-issue.
            '@typescript-eslint/no-redundant-type-constituents': 'warn',
            '@typescript-eslint/no-floating-promises': 'warn',
            '@typescript-eslint/no-unsafe-member-access': 'warn',
            '@typescript-eslint/no-misused-promises': 'warn',
            '@typescript-eslint/no-unsafe-assignment': 'warn',
            '@typescript-eslint/no-unsafe-enum-comparison': 'warn',
            '@typescript-eslint/no-unsafe-return': 'warn',
            '@typescript-eslint/no-unsafe-call': 'warn',
            '@typescript-eslint/no-unsafe-argument': 'warn',
            '@typescript-eslint/require-await': 'warn',
            '@typescript-eslint/no-base-to-string': 'warn',
            '@typescript-eslint/restrict-template-expressions': 'warn',
            '@typescript-eslint/no-unnecessary-type-assertion': 'warn',
            '@typescript-eslint/no-duplicate-type-constituents': 'warn',
            '@typescript-eslint/prefer-promise-reject-errors': 'warn',
        },
    },
    [globalIgnores(['src/frontend/generated/', 'src/frontend/generated-new/'])]
);
