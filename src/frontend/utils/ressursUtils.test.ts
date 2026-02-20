import { RessursStatus, type Ressurs } from '@typer/ressurs';

import { hentFrontendFeilmelding } from './ressursUtils';

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
});
