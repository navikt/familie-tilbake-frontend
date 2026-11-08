import { setInterval } from 'node:timers';
import express from 'express';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import { prometheusTellere } from '../metrikker';
import { konfigurerMetrikker } from './metrikker';

beforeEach(() => {
    vi.stubGlobal('setInterval', setInterval);
});

afterEach(() => {
    vi.unstubAllGlobals();
});

test('registeret eksponerer standardmetrikker og applikasjonstellere', async () => {
    const app = express();
    const register = konfigurerMetrikker(app, prometheusTellere);
    prometheusTellere.appLoad.inc();
    prometheusTellere.loginRoute.inc({ code: '200' });

    try {
        const metrikker = await register.metrics();
        expect(metrikker).toContain('process_cpu_user_seconds_total');
        expect(metrikker).toContain('nodejs_version_info');
        expect(metrikker).toMatch(/^app_load 1$/m);
        expect(metrikker).toMatch(/^login_route\{code="200"\} 1$/m);
    } finally {
        prometheusTellere.appLoad.reset();
        prometheusTellere.loginRoute.reset();
    }
});
