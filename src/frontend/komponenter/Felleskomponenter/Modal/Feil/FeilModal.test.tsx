import type { RenderResult } from '@testing-library/react';

import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';

import { FeilModal } from './FeilModal';
import { Feil } from '../../../../api/feil';
import { FagsakContext } from '../../../../context/FagsakContext';
import { TestBehandlingProvider } from '../../../../testdata/behandlingContextFactory';
import { lagBehandling } from '../../../../testdata/behandlingFactory';
import { lagFagsak } from '../../../../testdata/fagsakFactory';

const mockSetVisFeilModal = vi.fn();

const renderFeilModal = (
    feil: Feil,
    behandlingId?: string,
    fagsakOverride?: ReturnType<typeof lagFagsak>
): RenderResult => {
    const behandling = behandlingId ? lagBehandling({ behandlingId }) : lagBehandling();
    return render(
        <FagsakContext.Provider value={fagsakOverride ?? lagFagsak()}>
            <TestBehandlingProvider behandling={behandling}>
                <FeilModal feil={feil} lukkFeilModal={mockSetVisFeilModal} />
            </TestBehandlingProvider>
        </FagsakContext.Provider>
    );
};

describe('FeilModal', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });
    test('Viser feil-modalen med 400 Bad Request riktig', () => {
        const feilMelding = 'Du mangler nødvendige data i forespørselen din.';
        const mockFeil = new Feil(feilMelding, 400);
        renderFeilModal(mockFeil);
        expect(screen.getByText('Ugyldig forespørsel')).toBeInTheDocument();
        expect(screen.getByText('Forespørselen din er ugyldig')).toBeInTheDocument();
        expect(screen.getByText('400 Bad Request')).toBeInTheDocument();
        expect(screen.getByText(feilMelding)).toBeInTheDocument();
        expect(
            screen.getByText('Sjekk at du har fylt ut alle nødvendige felt')
        ).toBeInTheDocument();
        expect(
            screen.getByText('Sjekk at dataene du har sendt er i riktig format')
        ).toBeInTheDocument();
        expect(screen.getByText('Prøv igjen senere hvis problemet vedvarer')).toBeInTheDocument();
        expect(screen.getByText('Meld feil i porten')).toBeInTheDocument();
    });
    //#endregion 400 Bad Request feil

    //#region 401 Unauthorized feil
    test('Viser feil-modalen med 401 Unauthorized riktig', () => {
        const feilMelding = 'Tokenet ditt er ugyldig eller utløpt.';
        const mockFeil = new Feil(feilMelding, 401);
        renderFeilModal(mockFeil);
        expect(screen.getByText('Uautorisert')).toBeInTheDocument();
        expect(screen.getByText('401 Unauthorized')).toBeInTheDocument();
        expect(screen.getByText('Du er ikke autorisert til å gjøre dette')).toBeInTheDocument();
        expect(screen.getByText(feilMelding)).toBeInTheDocument();
        expect(screen.getByText('Logg inn med riktig bruker')).toBeInTheDocument();
        expect(screen.getByText('Vent et par minutter og prøv igjen')).toBeInTheDocument();
        expect(screen.getByText('Meld feil i porten')).toBeInTheDocument();
    });
    //#endregion 401 Unauthorized feil

    //#region 403 Forbidden feil
    test('Viser feil-modalen med 403 ingen tilgang riktig', () => {
        const feilMelding = 'Du har rollen BESLUTTER og trenger rollen FORVALTER.';
        const mockFeil = new Feil(feilMelding, 403);

        renderFeilModal(mockFeil);

        expect(screen.getByText('Ingen tilgang')).toBeInTheDocument();
        expect(screen.getByText('403 Forbidden')).toBeInTheDocument();
        expect(screen.getByText('Du har ikke tilgang til å gjøre dette')).toBeInTheDocument();
        expect(screen.getByText(feilMelding)).toBeInTheDocument();
        expect(
            screen.getByText('Om du mener at du burde ha tilgang, ta kontakt med nærmeste leder')
        ).toBeInTheDocument();
        expect(screen.queryByText('Meld feil i porten')).not.toBeInTheDocument();
    });

    test('Håndterer CSRF-token feil riktig', () => {
        const mockFeil = new Feil('Ugyldig CSRF-token.', 403);

        renderFeilModal(mockFeil);

        expect(
            screen.getByText('Lagre det du holder på med, og last siden på nytt')
        ).toBeInTheDocument();
        expect(screen.getByText('Meld feil i porten')).toBeInTheDocument();
        expect(
            screen.queryByText('Om du mener at du burde ha tilgang, ta kontakt med nærmeste leder')
        ).not.toBeInTheDocument();
    });
    //#endregion 403 Forbidden feil

    //#region 404 Not Found feil
    test('Viser feil-modalen med 404 Not Found riktig', () => {
        const feilMelding = 'Finner ikke endepunktet /resettBehandling.';
        const mockFeil = new Feil(feilMelding, 404);
        renderFeilModal(mockFeil);
        expect(screen.getByText('Ikke funnet')).toBeInTheDocument();
        expect(screen.getByText('404 Not Found')).toBeInTheDocument();
        expect(screen.getByText('Ressursen du prøver å nå finnes ikke')).toBeInTheDocument();
        expect(screen.getByText(feilMelding)).toBeInTheDocument();
        expect(screen.getByText('Sjekk at du har riktig url')).toBeInTheDocument();
        expect(
            screen.getByText('Hvis du mener at dette er en feil, vennligst kontakt support')
        ).toBeInTheDocument();
        expect(screen.getByText('Meld feil i porten')).toBeInTheDocument();
    });
    //#endregion 404 Not Found feil

    //#region 500 Internal Server Error feil
    test('Viser feil-modalen med 500 Internal Server Error riktig', () => {
        const feilMelding = 'Dette er ikke din feil, det er en feil vi ikke greide å håndtere.';
        const mockFeil = new Feil(feilMelding, 500);
        renderFeilModal(mockFeil);
        expect(screen.getByText('Intern feil')).toBeInTheDocument();
        expect(screen.getByText('500 Internal Server Error')).toBeInTheDocument();
        expect(screen.getByText('Oi, dette fungerte vist ikke')).toBeInTheDocument();
        expect(screen.getByText(feilMelding)).toBeInTheDocument();
        expect(screen.getByText('Last inn siden på nytt')).toBeInTheDocument();
        expect(screen.getByText('Vent et par minutter og prøv igjen')).toBeInTheDocument();
        expect(screen.getByText('Meld feil i porten')).toBeInTheDocument();
    });
    //#endregion 500 Internal Server Error feil

    //#region 502 Bad Gateway, 503 Service Unavailable, 504 Gateway Timeout feil
    test('Viser feil-modalen med 502 Bad Gateway riktig', () => {
        const feilMelding = 'Kallet mot Gosys feilet.';
        const mockFeil = new Feil(feilMelding, 502);
        renderFeilModal(mockFeil);
        expect(screen.getByText('Feil hos noen andre')).toBeInTheDocument();
        expect(screen.getByText('502 Bad Gateway')).toBeInTheDocument();
        expect(screen.getByText(feilMelding)).toBeInTheDocument();
        expect(screen.getByText('Vent et par minutter og prøv igjen')).toBeInTheDocument();
        expect(screen.getByText('Meld feil i porten')).toBeInTheDocument();
    });

    test('Viser feil-modalen med 503 Service Unavailable riktig', () => {
        const feilMelding = 'Kallet mot Gosys feilet.';
        const mockFeil = new Feil(feilMelding, 503);
        renderFeilModal(mockFeil);
        expect(screen.getByText('Feil hos noen andre')).toBeInTheDocument();
        expect(screen.getByText('503 Service Unavailable')).toBeInTheDocument();
        expect(screen.getByText(feilMelding)).toBeInTheDocument();
        expect(screen.getByText('Vent et par minutter og prøv igjen')).toBeInTheDocument();
        expect(screen.getByText('Meld feil i porten')).toBeInTheDocument();
    });

    test('Viser feil-modalen med 504 Gateway Timeout riktig', () => {
        const feilMelding = 'Kallet mot Gosys feilet.';
        const mockFeil = new Feil(feilMelding, 504);
        renderFeilModal(mockFeil);
        expect(screen.getByText('Feil hos noen andre')).toBeInTheDocument();
        expect(screen.getByText('504 Gateway Timeout')).toBeInTheDocument();
        expect(
            screen.getByText('Noe galt har skjedd hos en annen part, prøv igjen senere')
        ).toBeInTheDocument();
        expect(screen.getByText(feilMelding)).toBeInTheDocument();
        expect(screen.getByText('Vent et par minutter og prøv igjen')).toBeInTheDocument();
        expect(screen.getByText('Meld feil i porten')).toBeInTheDocument();
    });
    //#endregion 502 Bad Gateway, 503 Service Unavailable, 504 Gateway Timeout feil

    //#region Komponentens funksjonalitet
    test('Viser fagsakId og behandlingsId når de er tilgjengelige', () => {
        const mockFeil = new Feil('Du har rollen BESLUTTER og trenger rollen FORVALTER', 403);
        const fagsakId = '12345';
        const behandlingId = '6bc22b78-4ce4-4eed-9476-247f599cef95';

        renderFeilModal(mockFeil, behandlingId, lagFagsak({ eksternFagsakId: fagsakId }));

        expect(screen.getByText(`Fagsak ID: ${fagsakId}`)).toBeInTheDocument();
        expect(screen.getByText(`Behandling ID: ${behandlingId}`)).toBeInTheDocument();
    });

    test('Viser fagsakId og behandlingsId når begge er tilgjengelige', () => {
        const mockFeil = new Feil('Du har rollen BESLUTTER og trenger rollen FORVALTER', 403);

        renderFeilModal(mockFeil);

        expect(screen.queryByText(/Fagsak ID:/)).toBeInTheDocument();
        expect(screen.queryByText(/Behandling ID:/)).toBeInTheDocument();
    });

    test('Kaller på setVisFeilModal når lukkeknappen klikkes', () => {
        const mockFeil = new Feil('Du har rollen BESLUTTER og trenger rollen FORVALTER', 403);

        renderFeilModal(mockFeil);

        const okKnapp = screen.getByText('Ok');
        fireEvent.click(okKnapp);

        expect(mockSetVisFeilModal).toHaveBeenCalled();
    });

    test('Viser default feil-objekt når feil er noe annet enn håndtert', () => {
        const feilmelding = 'Vi vet ikke hva som gikk galt.';
        const mockFeil = new Feil(feilmelding, 520);

        renderFeilModal(mockFeil);

        expect(screen.getByText('Ukjent feil')).toBeInTheDocument();
        expect(
            screen.getByText('En ukjent feil har oppstått, vennligst prøv igjen senere')
        ).toBeInTheDocument();
        expect(screen.getByText(feilmelding)).toBeInTheDocument();
        expect(screen.getByText('520 Unknown Error')).toBeInTheDocument();
        expect(screen.getByText('Last inn siden på nytt')).toBeInTheDocument();
        expect(screen.getByText('Vent et par minutter og prøv igjen')).toBeInTheDocument();
        expect(screen.getByText('Meld feil i porten')).toBeInTheDocument();
    });
    //#endregion Komponentens funksjonalitet
});
