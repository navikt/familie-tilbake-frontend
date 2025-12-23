import '@testing-library/jest-dom/vitest';

import { Crypto } from '@peculiar/webcrypto';
import { TextEncoder } from 'util';
import { vi } from 'vitest';

global.console = {
    ...console,
    // uncomment to ignore a specific log level
    log: vi.fn(),
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    // error: vi.fn(),
};

Object.assign(global, { TextEncoder });

const crypto = new Crypto();
Object.defineProperty(global, 'crypto', {
    get() {
        return crypto;
    },
});
