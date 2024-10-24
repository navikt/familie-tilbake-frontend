import { getWebInstrumentations, initializeFaro } from '@grafana/faro-web-sdk';

type TelemetryCollectorURL =
    | 'https://telemetry.nav.no/collect'
    | 'https://telemetry.ekstern.dev.nav.no/collect'
    | 'http://localhost:12347';

const getTelemetryCollectorURL = (): TelemetryCollectorURL => {
    if (process.env.ENV === 'production') {
        return 'https://telemetry.nav.no/collect';
    }

    if (process.env.ENV === 'preprod') {
        return 'https://telemetry.ekstern.dev.nav.no/collect';
    }

    return 'http://localhost:12347';
};

export function initGrafanaFaro() {
    (process.env.ENV === 'preprod' || process.env.ENV === 'production') &&
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
