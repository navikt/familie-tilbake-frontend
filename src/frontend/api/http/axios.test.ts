import { RessursStatus } from '@/typer/ressurs';

import { håndterApiRespons } from './axios';

describe('håndterApiRespons', () => {
    test('Beholder feiltittel og melding fra API-ressurs', () => {
        const resultat = håndterApiRespons({
            ressurs: {
                data: '',
                frontendFeilmelding: 'Alternativ frontend-feilmelding.',
                melding: 'API-melding.',
                stacktrace: '',
                status: RessursStatus.FunksjonellFeil,
                tittel: 'API-tittel.',
            },
        });

        expect(resultat).toMatchObject({
            frontendFeilmelding: 'Alternativ frontend-feilmelding.',
            apiFeilmelding: {
                melding: 'API-melding.',
                tittel: 'API-tittel.',
            },
            status: RessursStatus.FunksjonellFeil,
        });
    });
});
