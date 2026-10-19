// @vitest-environment-options {"url": "https://familie-tilbake.intern.dev.nav.no"}

import { initializeFaro } from '@grafana/faro-web-sdk';
import { vi } from 'vitest';

import { initGrafanaFaro } from './grafanaFaro';
import { overvåkingsUrler } from './overvaking';

vi.mock('@grafana/faro-web-sdk', () => ({
    initializeFaro: vi.fn(),
    getWebInstrumentations: vi.fn(() => []),
}));

describe('initGrafanaFaro', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    test('samler sendinger og unngår isolert ressursmåling i dev', () => {
        initGrafanaFaro();

        expect(initializeFaro).toHaveBeenCalledExactlyOnceWith(
            expect.objectContaining({
                url: 'https://telemetry.ekstern.dev.nav.no/collect',
                ignoreUrls: overvåkingsUrler,
                batching: {
                    enabled: true,
                    sendTimeout: 10_000,
                    itemLimit: 100,
                },
            })
        );
        expect(vi.mocked(initializeFaro).mock.calls[0][0].isolate).not.toBe(true);
    });
});
