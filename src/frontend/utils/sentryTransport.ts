import type { Envelope, Transport } from '@sentry/core';

import { makeFetchTransport } from '@sentry/browser';
import { envelopeItemTypeToDataCategory, forEachEnvelopeItem } from '@sentry/core';

const MINSTE_SENDEINTERVALL_MS = 5_000;
const FEILPAUSE_MS = 60_000;

export const lagBegrensetSentryTransport = (
    options: Parameters<typeof makeFetchTransport>[0]
): Transport => {
    const transport = makeFetchTransport(options);
    let nesteSending = 0;
    let sender = false;

    return {
        flush: (timeout?: number) => transport.flush(timeout),
        send: (envelope: Envelope) => {
            if (sender || Date.now() < nesteSending) {
                forEachEnvelopeItem(envelope, (_item, type) => {
                    options.recordDroppedEvent(
                        'ratelimit_backoff',
                        envelopeItemTypeToDataCategory(type)
                    );
                });
                return Promise.resolve({});
            }

            sender = true;
            nesteSending = Date.now() + MINSTE_SENDEINTERVALL_MS;

            return transport.send(envelope).then(
                respons => {
                    sender = false;
                    if (respons.statusCode !== undefined && respons.statusCode >= 500) {
                        nesteSending = Date.now() + FEILPAUSE_MS;
                    }
                    return respons;
                },
                (feil: unknown) => {
                    sender = false;
                    nesteSending = Date.now() + FEILPAUSE_MS;
                    throw feil;
                }
            );
        },
    };
};
