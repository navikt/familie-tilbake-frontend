import { type Ressurs, RessursStatus } from '@/typer/ressurs';

import { hentFrontendFeilmelding, hentGlobalAlertFeilmelding } from './ressursUtils';

describe('hentFrontendFeilmelding', () => {
    test('Returnerer feilmelding for ServerFeil status', () => {
        const ressurs: Ressurs<string> = {
            status: RessursStatus.ServerFeil,
            frontendFeilmelding: 'Organisasjon 123456789 er ikke gyldig',
            httpStatusCode: 500,
        };

        const result = hentFrontendFeilmelding(ressurs);

        expect(result).toBe('Organisasjon 123456789 er ikke gyldig');
    });

    test('Returnerer tittel og melding fra feilet ressurs for GlobalAlert', () => {
        const ressurs: Ressurs<string> = {
            status: RessursStatus.ServerFeil,
            frontendFeilmelding: 'Alternativ frontend-feilmelding.',
            apiFeilmelding: {
                tittel: 'Kunne ikke behandle vedtaket',
                melding: 'En teknisk feil oppstod.',
            },
        };

        expect(hentGlobalAlertFeilmelding(ressurs, 'Standardtittel')).toEqual({
            title: 'Kunne ikke behandle vedtaket',
            message: 'En teknisk feil oppstod.',
        });
    });

    test('Bruker standardtittel når feilet ressurs ikke har tittel', () => {
        const ressurs: Ressurs<string> = {
            status: RessursStatus.ServerFeil,
            frontendFeilmelding: 'Feilmelding.',
        };

        expect(hentGlobalAlertFeilmelding(ressurs, 'Standardtittel')).toEqual({
            title: 'Standardtittel',
            message: 'Feilmelding.',
        });
    });
});
