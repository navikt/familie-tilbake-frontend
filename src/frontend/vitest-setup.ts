import '@testing-library/jest-dom/vitest';

import { Crypto } from '@peculiar/webcrypto';
import { TextEncoder } from 'util';
import { vi } from 'vitest';

import { configureZod } from './utils/zodConfig';

configureZod();

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

// jsdom implementerer ikke ResizeObserver. Komponenter som måler tilgjengelig
// plass trenger den for å kunne rendres i test.
if (!('ResizeObserver' in global)) {
    Object.assign(global, {
        ResizeObserver: class {
            observe(): void {
                // Tester som trenger målinger stubber dette selv.
            }
            unobserve(): void {
                // Tester som trenger målinger stubber dette selv.
            }
            disconnect(): void {
                // Tester som trenger målinger stubber dette selv.
            }
        },
    });
}

const crypto = new Crypto();
Object.defineProperty(global, 'crypto', {
    get(): Crypto {
        return crypto;
    },
});

// Global mock for react-router
// Individuelle tester kan overstyre dette ved behov
vi.mock('react-router', async () => {
    const actual = await vi.importActual('react-router');
    return {
        ...actual,
        useNavigate: (): ReturnType<typeof vi.fn> => vi.fn(),
    };
});
