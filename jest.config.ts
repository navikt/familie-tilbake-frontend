import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
    // verbose: true,
    preset: 'ts-jest',
    testEnvironment: 'jsdom',
    setupFilesAfterEnv: ['<rootDir>/src/jest-setup.ts'],
    moduleNameMapper: {
        '.+\\.(css)$': 'identity-obj-proxy',
        '^@navikt/ds-tokens/dist/tokens$':
            '<rootDir>/src/__mocks__/@navikt/ds-tokens/dist/tokens.js',
        '.+\\.(svg)$': '<rootDir>/src/frontend/__mocks__/fileMock.ts',
    },
    transformIgnorePatterns: ['<rootDir>/node_modules/(?!(@navikt*|uuid|nanoid)/)'],
    transform: {
        '\\.[jt]s?$': [
            'ts-jest',
            {
                tsconfig: '<rootDir>/src/frontend/tsconfig.json',
            },
        ],
        '\\.[jt]sx?$': [
            'ts-jest',
            {
                tsconfig: '<rootDir>/src/frontend/tsconfig.json',
            },
        ],
    },
};

export default config;
