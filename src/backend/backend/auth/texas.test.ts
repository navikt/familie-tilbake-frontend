import type { InternalAxiosRequestConfig } from 'axios';
import type { TexasConfig } from '../typer';

import { inspect } from 'node:util';
import axios, { AxiosError, AxiosHeaders } from 'axios';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { stdoutLogger } from '../../logging/logging';
import { TexasClient } from './texas';

const brukertoken = 'syntetisk-brukertoken-som-ikke-skal-logges';

const config: TexasConfig = {
    tokenEndpoint: 'http://texas/token',
    tokenExchangeEndpoint: 'http://texas/exchange',
    tokenIntrospectionEndpoint: 'http://texas/introspect',
};

const lagAxiosFeil = (status?: number): AxiosError => {
    const requestConfig: InternalAxiosRequestConfig = {
        url: config.tokenIntrospectionEndpoint,
        method: 'post',
        headers: new AxiosHeaders({ 'Content-Type': 'application/json' }),
        data: JSON.stringify({ identity_provider: 'azuread', token: brukertoken }),
    };
    if (status === undefined) {
        return new AxiosError('connect ECONNREFUSED', 'ECONNREFUSED', requestConfig, {});
    }
    return new AxiosError(
        `Request failed with status code ${status}`,
        'ERR_BAD_RESPONSE',
        requestConfig,
        {},
        {
            status,
            statusText: 'Feil',
            headers: {},
            config: requestConfig,
            data: { error: 'noe gikk galt' },
        }
    );
};

// Tilsvarer console.error(err) i Express 5.3.0, men uten dybdebegrensning
const somExpressLogger = (feil: unknown): string => inspect(feil, { depth: Infinity });

const hentKastetFeil = async (kall: () => Promise<unknown>): Promise<unknown> => {
    try {
        await kall();
    } catch (feil: unknown) {
        return feil;
    }
    throw new Error('Forventet at kallet skulle feile');
};

describe('TexasClient', () => {
    let loggSpy: ReturnType<typeof vi.spyOn>;
    const loggetInnhold = (): string => JSON.stringify(loggSpy.mock.calls);

    beforeEach(() => {
        loggSpy = vi.spyOn(stdoutLogger, 'error').mockImplementation(() => stdoutLogger);
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('validateLogin', () => {
        test('burde returnere null uten å logge brukertoken når Texas svarer med HTTP-feil', async () => {
            vi.spyOn(axios, 'post').mockRejectedValue(lagAxiosFeil(500));

            const resultat = await new TexasClient(config).validateLogin(brukertoken);

            expect(resultat).toBeNull();
            expect(loggetInnhold()).toContain('statuskode 500');
            expect(loggetInnhold()).not.toContain(brukertoken);
        });

        test('burde kaste feil uten brukertoken ved nettverksfeil', async () => {
            vi.spyOn(axios, 'post').mockRejectedValue(lagAxiosFeil());

            const feil = await hentKastetFeil(() =>
                new TexasClient(config).validateLogin(brukertoken)
            );

            expect(axios.isAxiosError(feil)).toBe(false);
            expect(somExpressLogger(feil)).toContain('ECONNREFUSED');
            expect(somExpressLogger(feil)).not.toContain(brukertoken);
            expect(loggetInnhold()).not.toContain(brukertoken);
        });

        test('burde ikke logge eller kaste brukertoken ved feil som ikke kommer fra Axios', async () => {
            const uventetFeil = Object.assign(new Error('uventet feil'), { token: brukertoken });
            vi.spyOn(axios, 'post').mockRejectedValue(uventetFeil);

            const feil = await hentKastetFeil(() =>
                new TexasClient(config).validateLogin(brukertoken)
            );

            expect(somExpressLogger(feil)).toContain('uventet feil');
            expect(somExpressLogger(feil)).not.toContain(brukertoken);
            expect(loggetInnhold()).not.toContain(brukertoken);
        });
    });

    describe('hentOnBehalfOfToken', () => {
        test.each([
            ['HTTP-feil', 400],
            ['nettverksfeil', undefined],
        ])('burde kaste feil uten brukertoken ved %s', async (_, status) => {
            vi.spyOn(axios, 'post').mockRejectedValue(lagAxiosFeil(status));

            const feil = await hentKastetFeil(() =>
                new TexasClient(config).hentOnBehalfOfToken(brukertoken, 'api://scope')
            );

            expect(axios.isAxiosError(feil)).toBe(false);
            expect(somExpressLogger(feil)).toContain('Feil ved veksling av token');
            expect(somExpressLogger(feil)).not.toContain(brukertoken);
        });
    });
});
