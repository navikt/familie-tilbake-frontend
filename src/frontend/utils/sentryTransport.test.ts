import type { Envelope, Transport, TransportMakeRequestResponse } from '@sentry/core';

import { makeFetchTransport } from '@sentry/browser';
import { vi } from 'vitest';

import { lagBegrensetSentryTransport } from './sentryTransport';

vi.mock('@sentry/browser', () => ({
    makeFetchTransport: vi.fn(),
}));

const envelope: Envelope = [
    { event_id: 'test-feil', sent_at: '2026-01-01T00:00:00.000Z' },
    [[{ type: 'event' }, { message: 'En feil' }]],
];

describe('lagBegrensetSentryTransport', () => {
    const send = vi.fn();
    const flush = vi.fn();
    const recordDroppedEvent = vi.fn();

    beforeEach(() => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date('2026-01-01'));
        vi.resetAllMocks();
        send.mockResolvedValue({ statusCode: 200 });
        vi.mocked(makeFetchTransport).mockReturnValue({ send, flush });
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    const lagTransport = (): Transport =>
        lagBegrensetSentryTransport({ url: 'https://sentry.test', recordDroppedEvent });

    test('sender høyst én gang hvert femte sekund og registrerer droppede hendelser', async () => {
        const transport = lagTransport();
        await transport.send(envelope);
        for (let i = 0; i < 50; i++) {
            await transport.send(envelope);
        }
        vi.advanceTimersByTime(4_999);
        await transport.send(envelope);
        expect(send).toHaveBeenCalledTimes(1);
        expect(recordDroppedEvent).toHaveBeenCalledTimes(51);
        expect(recordDroppedEvent).toHaveBeenCalledWith('ratelimit_backoff', 'error');

        vi.advanceTimersByTime(1);
        await transport.send(envelope);
        expect(send).toHaveBeenCalledTimes(2);
    });

    test.each([500, 502, 503])('venter ett minutt etter HTTP %s', async statusCode => {
        send.mockResolvedValue({ statusCode });
        const transport = lagTransport();
        await transport.send(envelope);
        vi.advanceTimersByTime(59_999);
        await transport.send(envelope);
        expect(send).toHaveBeenCalledTimes(1);

        vi.advanceTimersByTime(1);
        await transport.send(envelope);
        expect(send).toHaveBeenCalledTimes(2);
    });

    test('propagerer nettverksfeil og venter ett minutt før neste forsøk', async () => {
        const feil = new TypeError('Failed to fetch');
        send.mockRejectedValueOnce(feil);
        const transport = lagTransport();
        await expect(transport.send(envelope)).rejects.toBe(feil);
        vi.advanceTimersByTime(59_999);
        await transport.send(envelope);
        expect(send).toHaveBeenCalledTimes(1);

        vi.advanceTimersByTime(1);
        await transport.send(envelope);
        expect(send).toHaveBeenCalledTimes(2);
    });

    test('starter ikke parallelle sendinger når et kall tar lang tid', async () => {
        let fullfør!: (respons: TransportMakeRequestResponse) => void;
        send.mockReturnValueOnce(
            new Promise<TransportMakeRequestResponse>(resolve => {
                fullfør = resolve;
            })
        );
        const transport = lagTransport();
        const sending = transport.send(envelope);
        vi.advanceTimersByTime(10_000);
        await transport.send(envelope);
        expect(send).toHaveBeenCalledTimes(1);

        fullfør({ statusCode: 200 });
        await sending;
        await transport.send(envelope);
        expect(send).toHaveBeenCalledTimes(2);
    });

    test('beholder SDK-ets flush', async () => {
        flush.mockResolvedValue(true);
        const transport = lagTransport();
        await expect(transport.flush(2_000)).resolves.toBe(true);
        expect(flush).toHaveBeenCalledWith(2_000);
    });
});
