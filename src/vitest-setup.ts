import '@testing-library/jest-dom/vitest';

import type { TogglesHook } from './frontend/context/TogglesContext';

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

// Global mock for react-router
// Individuelle tester kan overstyre dette ved behov
vi.mock('react-router', async () => {
    const actual = await vi.importActual('react-router');
    return {
        ...actual,
        useNavigate: (): ReturnType<typeof vi.fn> => vi.fn(),
    };
});

// Global mock for TogglesContext - fjernes når utsettelse er ute
vi.mock('./frontend/context/TogglesContext', () => ({
    useToggles: (): TogglesHook => ({
        toggles: {
            'familie-tilbake-frontend.forhaandsvarselsteg': true,
        },
        feilmelding: '',
    }),
}));
