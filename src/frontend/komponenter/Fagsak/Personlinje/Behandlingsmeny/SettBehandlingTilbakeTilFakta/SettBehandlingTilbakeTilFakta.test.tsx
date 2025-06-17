import type { IBehandling } from '../../../../../typer/behandling';
import type { IFagsak } from '../../../../../typer/fagsak';
import type { IPerson } from '../../../../../typer/person';

import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import * as React from 'react';

import { SettBehandlingTilbakeTilFakta } from './SettBehandlingTilbakeTilFakta';
import { useSettBehandlingTilbakeTilFakta } from './useSettBehandlingTilbakeTilFakta';
import { Feil } from '../../../../../api/feil';
import { useBehandling } from '../../../../../context/BehandlingContext';
import { useRedirectEtterLagring } from '../../../../../hooks/useRedirectEtterLagring';
import { Fagsystem, Ytelsetype } from '../../../../../kodeverk';
import {
    Behandlingstatus,
    Behandlingstype,
    Saksbehandlingstype,
} from '../../../../../typer/behandling';
import { Målform } from '../../../../../typer/fagsak';
import { Kjønn } from '../../../../../typer/person';

jest.mock('../../../../../context/BehandlingContext', () => ({
    useBehandling: jest.fn(),
}));

jest.mock('../../../../../hooks/useRedirectEtterLagring', () => ({
    useRedirectEtterLagring: jest.fn(),
}));

jest.mock('./useSettBehandlingTilbakeTilFakta', () => ({
    useSettBehandlingTilbakeTilFakta: jest.fn(),
}));

describe('SettBehandlingTilbakeTilFakta', () => {
    const mockBehandling: IBehandling = {
        behandlingId: '123',
        eksternBrukId: 'ekstId123',
        kanSetteTilbakeTilFakta: true,
        kanEndres: true,
        behandlingsstegsinfo: [],
        status: Behandlingstatus.FatterVedtak,
        type: Behandlingstype.Tilbakekreving,
        opprettetDato: new Date().toISOString(),
        varselSendt: false,
        fagsystemsbehandlingId: 'fagsys123',
        erBehandlingHenlagt: false,
        saksbehandlingstype: Saksbehandlingstype.Ordinær,
        manuelleBrevmottakere: [],
        kanRevurderingOpprettes: true,
        erBehandlingPåVent: false,
        harVerge: false,
        resultatstype: undefined,
        kanHenleggeBehandling: true,
    };

    const mockPerson: IPerson = {
        personIdent: '123456789',
        navn: 'Ola Nordmann',
        fødselsdato: '1990-01-01',
        kjønn: Kjønn.Mann,
    };

    const mockFagsak: IFagsak = {
        eksternFagsakId: '456',
        fagsystem: Fagsystem.BA,
        ytelsestype: Ytelsetype.Barnetrygd,
        språkkode: Målform.Nb,
        bruker: mockPerson,
        behandlinger: [],
    };

    const mockOnListElementClick = jest.fn();
    const mockHentBehandling = jest.fn().mockResolvedValue(undefined);
    const mockNullstill = jest.fn();
    const mockUtførRedirect = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();

        (useBehandling as jest.Mock).mockReturnValue({
            hentBehandlingMedBehandlingId: mockHentBehandling,
            nullstillIkkePersisterteKomponenter: mockNullstill,
        });

        (useRedirectEtterLagring as jest.Mock).mockReturnValue({
            utførRedirect: mockUtførRedirect,
        });
    });

    test('viser feilmodal når behandling tilbake til fakta feiler', async () => {
        const mockMutate = jest.fn().mockImplementation((_, options) => {
            options.onError(
                new Feil(
                    'Du har rollen BESLUTTER og trenger rollen FORVALTER for å utføre denne handlingen',
                    403
                )
            );
        });

        (useSettBehandlingTilbakeTilFakta as jest.Mock).mockReturnValue({
            mutate: mockMutate,
            isError: true,
            error: {
                message:
                    'Du har rollen BESLUTTER og trenger rollen FORVALTER for å utføre denne handlingen',
                status: 403,
            },
            reset: jest.fn(),
        });

        render(
            <SettBehandlingTilbakeTilFakta
                behandling={mockBehandling}
                fagsak={mockFagsak}
                onListElementClick={mockOnListElementClick}
            />
        );

        const button = screen.getByText('Sett behandling tilbake til fakta');
        fireEvent.click(button);

        expect(mockOnListElementClick).toHaveBeenCalledTimes(1);

        const confirmButton = screen.getByText('Fortsett');
        fireEvent.click(confirmButton);

        expect(mockNullstill).toHaveBeenCalledTimes(1);

        expect(mockMutate).toHaveBeenCalledWith('123', expect.any(Object));

        await waitFor(() => {
            const errorText = screen.getByText(/403 Forbidden/i);
            expect(errorText).toBeInTheDocument();
        });
    });
});
