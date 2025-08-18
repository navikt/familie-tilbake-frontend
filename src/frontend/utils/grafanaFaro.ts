import { getWebInstrumentations, initializeFaro } from '@grafana/faro-web-sdk';

enum TelemetryCollectorURL {
    Prod = 'https://telemetry.nav.no/collect',
    Dev = 'https://telemetry.ekstern.dev.nav.no/collect',
    Lokalt = 'http://localhost:12347/collect',
}

const erProd = (): boolean => {
    return window.location.hostname.indexOf('intern.nav.no') > -1;
};

const erDev = (): boolean => {
    return window.location.hostname.indexOf('dev.nav.no') > -1;
};

const getTelemetryCollectorURL = (): TelemetryCollectorURL => {
    if (erProd()) {
        return TelemetryCollectorURL.Prod;
    }

    if (erDev()) {
        return TelemetryCollectorURL.Dev;
    }

    return TelemetryCollectorURL.Lokalt;
};

export function initGrafanaFaro(): void {
    (erDev() || erProd()) &&
        initializeFaro({
            isolate: true,
            url: getTelemetryCollectorURL(),
            app: {
                name: 'familie-tilbake-frontend',
            },
            instrumentations: [
                ...getWebInstrumentations({
                    captureConsole: false,
                }),
            ],
        });
}
