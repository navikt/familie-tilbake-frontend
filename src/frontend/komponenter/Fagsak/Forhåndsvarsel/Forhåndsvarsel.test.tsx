import type { DokumentApiHook } from '../../../api/dokument';
import type { BehandlingHook } from '../../../context/BehandlingContext';
import type { RenderResult } from '@testing-library/react';
import type { NavigateFunction } from 'react-router';

import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';

import { Forhåndsvarsel } from './Forhåndsvarsel';
import { Fagsystem, Ytelsetype } from '../../../kodeverk';
import {
    Behandlingstatus,
    Behandlingstype,
    Saksbehandlingstype,
    type Behandling,
} from '../../../typer/behandling';
import { Målform, type Fagsak } from '../../../typer/fagsak';
import { Kjønn } from '../../../typer/person';

const mockUseBehandling = jest.fn();
const mockUseDokumentlisting = jest.fn();
const mockUseDokumentApi = jest.fn();

jest.mock('react-router', () => ({
    ...jest.requireActual('react-router'),
    useNavigate: (): NavigateFunction => jest.fn(),
}));

jest.mock('../../../context/BehandlingContext', () => ({
    useBehandling: (): BehandlingHook => mockUseBehandling(),
}));
jest.mock('../../../api/dokument', () => ({
    useDokumentApi: (): DokumentApiHook =>
        mockUseDokumentApi(
            jest.fn().mockReturnValue({ bestillBrev: jest.fn(), forhåndsvisBrev: jest.fn() })
        ),
}));
jest.mock('../Høyremeny/Dokumentlisting/DokumentlistingContext', () => ({
    useDokumentlisting: (): DokumentApiHook => mockUseDokumentlisting(),
}));

const defaultFagsakVerdier = {
    eksternFagsakId: 'test-fagsak-id',
    fagsystem: Fagsystem.BA,
    ytelsestype: Ytelsetype.Barnetrygd,
    språkkode: Målform.Nb,
    institusjon: null,
    bruker: {
        personIdent: '12345678901',
        navn: 'Test Bruker',
        fødselsdato: '1990-01-01',
        kjønn: Kjønn.Mann,
    },
    behandlinger: [],
};

const defaultBehandlingVerdier = {
    behandlingId: 'test-behandling-id',
    eksternBrukId: 'test-ekstern-id',
    opprettetDato: '2023-01-01',
    status: Behandlingstatus.Utredes,
    type: Behandlingstype.Tilbakekreving,
    kanEndres: true,
    kanSetteTilbakeTilFakta: false,
    harVerge: false,
    kanHenleggeBehandling: false,
    kanRevurderingOpprettes: false,
    varselSendt: false,
    behandlingsstegsinfo: [],
    fagsystemsbehandlingId: 'test-fagsystem-id',
    støtterManuelleBrevmottakere: true,
    manuelleBrevmottakere: [],
    saksbehandlingstype: Saksbehandlingstype.Ordinær,
    erNyModell: true,
    erBehandlingHenlagt: false,
    avsluttetDato: null,
    endretTidspunkt: '',
    vedtaksDato: null,
    enhetskode: '',
    enhetsnavn: '',
    resultatstype: null,
    ansvarligSaksbehandler: '',
    ansvarligBeslutter: null,
    erBehandlingPåVent: false,
    eksternFaksakId: '',
    behandlingsårsakstype: null,
    harManuelleBrevmottakere: false,
    begrunnelseForTilbakekreving: null,
};

const createMockBehandling: Behandling = {
    ...defaultBehandlingVerdier,
};

const createMockFagsak: Fagsak = {
    ...defaultFagsakVerdier,
};

const setupMock = (): void => {
    mockUseBehandling.mockImplementation(() => ({
        actionBarStegtekst: jest.fn().mockReturnValue('Steg 2 av 5'),
        harVærtPåFatteVedtakSteget: jest.fn().mockReturnValue(false),
        åpenHøyremeny: jest.fn(),
    }));

    mockUseDokumentApi.mockReturnValue({
        bestillBrev: jest.fn(),
        forhåndsvisBrev: jest.fn(),
    });
};

const renderForhåndsvarsel = (): RenderResult => {
    return render(<Forhåndsvarsel behandling={createMockBehandling} fagsak={createMockFagsak} />);
};

describe('Forhåndsvarsel', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        setupMock();
    });

    test('Viser alle alternativene', () => {
        renderForhåndsvarsel();

        expect(screen.getByLabelText('Ja')).toBeInTheDocument();
        expect(screen.getByLabelText('Nei')).toBeInTheDocument();
        expect(screen.getByLabelText('Forhåndsvarsel er allerede sendt')).toBeInTheDocument();
    });

    test('Viser flyt for Opprett forhåndsvarsel når man velger Ja', () => {
        renderForhåndsvarsel();
        expect(screen.queryByText(/Opprett forhåndsvarsel/)).not.toBeInTheDocument();

        fireEvent.click(screen.getByLabelText('Ja'));

        expect(screen.getByText(/Opprett forhåndsvarsel/)).toBeInTheDocument();
        expect(
            screen.getByRole('heading', {
                name: /Nav vurderer om du må betale tilbake overgangsstønad/i,
            })
        ).toBeInTheDocument();
    });

    test('Viser fritekstfelt når bruker har valgt Ja', () => {
        renderForhåndsvarsel();
        fireEvent.click(screen.getByLabelText('Ja'));

        expect(screen.getByLabelText(/Legg til utdypende tekst/)).toBeInTheDocument();
    });
});
