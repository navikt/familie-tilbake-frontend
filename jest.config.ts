import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
    // verbose: true,
    preset: 'ts-jest',
    testEnvironment: 'jsdom',
    globals: {
        'ts-jest': {
            tsconfig: '<rootDir>/src/frontend/tsconfig.json',
        },
    },
    setupFilesAfterEnv: ['<rootDir>/src/jest-setup.ts'],
    moduleNameMapper: {
        '.+\\.(css)$': 'identity-obj-proxy',
        '.+\\.(svg)$': '<rootDir>/src/mockFile.js',
    },
    transformIgnorePatterns: ['<rootDir>/node_modules/(?!(@navikt*|uuid|nanoid)/)'],
    transform: {
        '\\.[jt]s?$': 'babel-jest',
        '\\.[jt]sx?$': 'babel-jest',
    },
};

export default config;
