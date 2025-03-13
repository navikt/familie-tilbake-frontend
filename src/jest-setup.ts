import '@testing-library/jest-dom';

import { Crypto } from '@peculiar/webcrypto';
import { TextEncoder } from 'util';

global.console = {
    ...console,
    // uncomment to ignore a specific log level
    log: jest.fn(),
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    // error: jest.fn(),
};

global.TextEncoder = TextEncoder;

const crypto = new Crypto();
Object.defineProperty(global, 'crypto', {
    get() {
        return crypto;
    },
});
