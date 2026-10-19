import { erOvervåkingsUrl } from './overvaking';

describe('erOvervåkingsUrl', () => {
    test.each([
        'https://sentry.gc.nav.no/api/83/envelope/?sentry_version=7',
        'https://telemetry.ekstern.dev.nav.no/collect',
        'https://telemetry.nav.no/collect?session=123',
    ])('unntar overvåkingskallet %s', url => {
        expect(erOvervåkingsUrl(url)).toBe(true);
    });

    test.each([
        '/familie-tilbake/api/behandling',
        'https://familie-tilbake.intern.dev.nav.no/familie-tilbake/api/behandling',
        'https://telemetry.nav.no/collector',
    ])('beholder måling av andre kall: %s', url => {
        expect(erOvervåkingsUrl(url)).toBe(false);
    });
});
