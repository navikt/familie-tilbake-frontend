import eslint from '@eslint/js';
import { defineConfig, globalIgnores } from 'eslint/config';
import * as importPlugin from 'eslint-plugin-import';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import { readdirSync, statSync } from 'fs';
import { join } from 'path';
import tseslint from 'typescript-eslint';

function relativeImportPattern(frontendPath) {
    const folders = readdirSync(frontendPath).filter(navn =>
        statSync(join(frontendPath, navn)).isDirectory()
    );
    const relativeDybder = Array.from({ length: 10 }, (_, i) => '../'.repeat(i + 1));

    return folders.map(folder => ({
        group: relativeDybder.flatMap(d => [`${d}${folder}`, `${d}${folder}/*`]),
        message: `Bruk @${folder}/* i stedet for relative imports.`,
    }));
}

const relativeImportPatterns = relativeImportPattern('./src/frontend');

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
