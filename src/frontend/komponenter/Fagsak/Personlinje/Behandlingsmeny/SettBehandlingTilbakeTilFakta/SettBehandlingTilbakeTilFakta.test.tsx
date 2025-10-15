import type { SettBehandlingTilbakeTilFaktaHook } from './useSettBehandlingTilbakeTilFakta';
import type { BehandlingHook } from '../../../../../context/BehandlingContext';
import type { RedirectEtterLagringHook } from '../../../../../hooks/useRedirectEtterLagring';
import type { FagsakState } from '../../../../../stores/fagsakStore';
import type { Behandling } from '../../../../../typer/behandling';
import type { StoreApi, UseBoundStore } from 'zustand';

import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import * as React from 'react';

import { SettBehandlingTilbakeTilFakta } from './SettBehandlingTilbakeTilFakta';
import { Feil } from '../../../../../api/feil';
import { Fagsystem } from '../../../../../kodeverk';
import {
    Behandlingstatus,
    Behandlingstype,
    Saksbehandlingstype,
} from '../../../../../typer/behandling';

const mockUseBehandling = jest.fn();
jest.mock('../../../../../context/BehandlingContext', () => ({
    useBehandling: (): BehandlingHook => mockUseBehandling(),
}));

const mockUseFagsakStore = jest.fn();
jest.mock('../../../../../stores/fagsakStore', () => ({
    useFagsakStore: (): UseBoundStore<StoreApi<FagsakState>> => mockUseFagsakStore(),
}));

const mockUseRedirectEtterLagring = jest.fn();
jest.mock('../../../../../hooks/useRedirectEtterLagring', () => ({
    useRedirectEtterLagring: (): RedirectEtterLagringHook => mockUseRedirectEtterLagring(),
}));

const mockUseSettBehandlingTilbakeTilFakta = jest.fn();
jest.mock('./useSettBehandlingTilbakeTilFakta', () => ({
    useSettBehandlingTilbakeTilFakta: (): SettBehandlingTilbakeTilFaktaHook =>
        mockUseSettBehandlingTilbakeTilFakta(),
}));

const mockBehandling: Behandling = {
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
    resultatstype: null,
    kanHenleggeBehandling: true,
    erNyModell: false,
    avsluttetDato: null,
    endretTidspunkt: '',
    vedtaksDato: null,
    enhetskode: '',
    enhetsnavn: '',
    ansvarligSaksbehandler: '',
    ansvarligBeslutter: null,
    eksternFaksakId: '',
    behandlingsårsakstype: null,
    støtterManuelleBrevmottakere: false,
    harManuelleBrevmottakere: false,
    begrunnelseForTilbakekreving: null,
};

const mockHentBehandling = jest.fn().mockResolvedValue(undefined);
const mockNullstill = jest.fn();
const mockUtførRedirect = jest.fn();

describe('SettBehandlingTilbakeTilFakta', () => {
    beforeEach(() => {
        jest.clearAllMocks();

        mockUseBehandling.mockReturnValue({
            hentBehandlingMedBehandlingId: mockHentBehandling,
            nullstillIkkePersisterteKomponenter: mockNullstill,
        });

        mockUseFagsakStore.mockReturnValue({
            eksternFagsakId: '123',
            fagsystem: Fagsystem.BA,
        });

        mockUseRedirectEtterLagring.mockReturnValue({
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

        mockUseSettBehandlingTilbakeTilFakta.mockReturnValue({
            mutate: mockMutate,
            isError: true,
            error: {
                message:
                    'Du har rollen BESLUTTER og trenger rollen FORVALTER for å utføre denne handlingen',
                status: 403,
            },
            reset: jest.fn(),
        });

        render(<SettBehandlingTilbakeTilFakta behandling={mockBehandling} />);

        const button = screen.getByText('Sett behandling tilbake til fakta');
        fireEvent.click(button);

        const fortsettKnapp = screen.getByText('Fortsett');
        fireEvent.click(fortsettKnapp);

        expect(mockNullstill).toHaveBeenCalledTimes(1);

        expect(mockMutate).toHaveBeenCalledWith('123', expect.any(Object));

        await waitFor(() => {
            const errorText = screen.getByText(/403 Forbidden/i);
            expect(errorText).toBeInTheDocument();
        });
    });
});
