import { getWebInstrumentations, initializeFaro } from '@grafana/faro-web-sdk';

enum TelemetryCollectorURL {
    prod = 'https://telemetry.nav.no/collect',
    dev = 'https://telemetry.ekstern.dev.nav.no/collect',
    lokalt = 'http://localhost:12347/collect',
}

const erProd = () => {
    return window.location.hostname.indexOf('intern.nav.no') > -1;
};

const erDev = () => {
    return window.location.hostname.indexOf('dev.nav.no') > -1;
};

const getTelemetryCollectorURL = (): TelemetryCollectorURL => {
    if (erProd()) {
        return TelemetryCollectorURL.prod;
    }

    if (erDev()) {
        return TelemetryCollectorURL.dev;
    }

    return TelemetryCollectorURL.lokalt;
};

export function initGrafanaFaro() {
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
