export const overvåkingsUrler = [
    /^https:\/\/sentry\.gc\.nav\.no\/api\//,
    /^https:\/\/telemetry(?:\.ekstern\.dev)?\.nav\.no\/collect(?:[/?]|$)/,
];

export const erOvervåkingsUrl = (url: string): boolean =>
    overvåkingsUrler.some(mønster => mønster.test(url));
