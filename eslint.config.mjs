import eslint from '@eslint/js';
import { defineConfig, globalIgnores } from 'eslint/config';
import * as importPlugin from 'eslint-plugin-import';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import tseslint from 'typescript-eslint';

const relativeImportPatterns = [
    {
        group: ['../../../api', '../../../api/*'],
        message: 'Bruk ~/api/* i stedet for relative imports.',
    },
    {
        group: ['../../../context', '../../../context/*'],
        message: 'Bruk ~/context/* i stedet for relative imports.',
    },
    {
        group: ['../../../generated', '../../../generated/*'],
        message: 'Bruk ~/generated/* i stedet for relative imports.',
    },
    {
        group: ['../../../generated-new', '../../../generated-new/*'],
        message: 'Bruk ~/generated-new/* i stedet for relative imports.',
    },
    {
        group: ['../../../hooks', '../../../hooks/*'],
        message: 'Bruk ~/hooks/* i stedet for relative imports.',
    },
    {
        group: ['../../../images', '../../../images/*'],
        message: 'Bruk ~/images/* i stedet for relative imports.',
    },
    {
        group: ['../../../kodeverk', '../../../kodeverk/*'],
        message: 'Bruk ~/kodeverk/* i stedet for relative imports.',
    },
    {
        group: ['../../../komponenter', '../../../komponenter/*'],
        message: 'Bruk ~/komponenter/* i stedet for relative imports.',
    },
    {
        group: ['../../../pages', '../../../pages/*'],
        message: 'Bruk ~/pages/* i stedet for relative imports.',
    },
    {
        group: ['../../../stores', '../../../stores/*'],
        message: 'Bruk ~/stores/* i stedet for relative imports.',
    },
    {
        group: ['../../../testdata', '../../../testdata/*'],
        message: 'Bruk ~/testdata/* i stedet for relative imports.',
    },
    {
        group: ['../../../testutils', '../../../testutils/*'],
        message: 'Bruk ~/testutils/* i stedet for relative imports.',
    },
    {
        group: ['../../../typer', '../../../typer/*'],
        message: 'Bruk ~/typer/* i stedet for relative imports.',
    },
    {
        group: ['../../../utils', '../../../utils/*'],
        message: 'Bruk ~/utils/* i stedet for relative imports.',
    },
];

export default defineConfig(
    eslint.configs.recommended,
    ...tseslint.configs.recommended,
    react.configs.flat.recommended,
    jsxA11y.flatConfigs.recommended,
    eslintPluginPrettierRecommended,
    {
        languageOptions: {
            parserOptions: {
                ecmaFeatures: { jsx: true },
            },
        },
    },
    {
        plugins: { 'react-hooks': reactHooks, import: importPlugin },
        rules: {
            ...reactHooks.configs.recommended.rules,
            'no-restricted-imports': ['error', { patterns: relativeImportPatterns }],
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
            'react/no-unescaped-entities': 'off',
            '@typescript-eslint/no-unused-expressions': 'off',
            'react/jsx-curly-brace-presence': [
                'warn',
                {
                    props: 'never',
                    children: 'never',
                },
            ],
            '@typescript-eslint/adjacent-overload-signatures': 'warn',
            '@typescript-eslint/array-type': 'warn',
            '@typescript-eslint/no-confusing-non-null-assertion': 'error',
            '@typescript-eslint/no-non-null-asserted-optional-chain': 'error',
            '@typescript-eslint/no-non-null-assertion': 'error',
            '@typescript-eslint/no-explicit-any': 'warn',
            '@typescript-eslint/sort-type-constituents': 'warn',
        },
        settings: {
            react: {
                version: 'detect',
            },
        },
    },
    [globalIgnores(['src/frontend/generated/', 'src/frontend/generated-new/'])]
);
