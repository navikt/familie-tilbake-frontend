import type { BehandlingHook } from '../../../context/BehandlingContext';
import type { ManuellBrevmottakerResponseDto } from '../../../typer/api';
import type { Behandling } from '../../../typer/behandling';
import type { Fagsak } from '../../../typer/fagsak';
import type { RenderResult } from '@testing-library/react';
import type { NavigateFunction } from 'react-router';

import { render, screen } from '@testing-library/react';
import * as React from 'react';

import Brevmottakere from './Brevmottakere';
import { Fagsystem, Ytelsetype } from '../../../kodeverk';
import { Behandlingstatus, Behandlingstype, Saksbehandlingstype } from '../../../typer/behandling';
import { MottakerType } from '../../../typer/Brevmottaker';
import { Kjønn } from '../../../typer/bruker';
import { Målform } from '../../../typer/fagsak';

jest.mock('react-router', () => ({
    ...jest.requireActual('react-router'),
    useNavigate: (): NavigateFunction => jest.fn(),
}));

const mockUseBehandling = jest.fn();
jest.mock('../../../context/BehandlingContext', () => ({
    useBehandling: (): BehandlingHook => mockUseBehandling(),
}));

const createMockBehandling = (
    manuelleBrevmottakere: ManuellBrevmottakerResponseDto[] = []
): Behandling => ({
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
    manuelleBrevmottakere,
    saksbehandlingstype: Saksbehandlingstype.Ordinær,
    erNyModell: true,
});

const createMockFagsak = (): Fagsak => ({
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
        dødsdato: null,
    },
    behandlinger: [],
});

const createMockManuelleBrevmottakere = (): ManuellBrevmottakerResponseDto[] => [
    {
        id: 'mottaker-1',
        brevmottaker: {
            navn: 'Fullmektig Person',
            personIdent: '10987654321',
            type: MottakerType.Fullmektig,
            manuellAdresseInfo: {
                adresselinje1: 'Testveien 1',
                postnummer: '0123',
                poststed: 'Oslo',
                landkode: 'NO',
            },
        },
    },
];

const createMockOrganisasjonsBrevmottaker = (): ManuellBrevmottakerResponseDto[] => [
    {
        id: 'org-mottaker-1',
        brevmottaker: {
            navn: 'Test Organisasjon v/ Kontaktperson',
            organisasjonsnummer: '123456789',
            type: MottakerType.Fullmektig,
        },
    },
];

const createMockDødsboBrevmottaker = (): ManuellBrevmottakerResponseDto[] => [
    {
        id: 'dodsbo-mottaker-1',
        brevmottaker: {
            navn: 'Dødsbo til Test Person',
            type: MottakerType.Dødsbo,
        },
    },
];

const setupMock = (): void => {
    mockUseBehandling.mockImplementation(() => ({
        actionBarStegtekst: jest.fn().mockReturnValue('Steg 1 av 5'),
        harVærtPåFatteVedtakSteget: jest.fn().mockReturnValue(false),
    }));
};

const renderBrevmottakere = (
    behandling: Behandling = createMockBehandling(),
    fagsak: Fagsak = createMockFagsak()
): RenderResult => {
    return render(<Brevmottakere behandling={behandling} fagsak={fagsak} />);
};

describe('Brevmottakere', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        setupMock();
    });

    describe('Default bruker brevmottaker', () => {
        it('viser default bruker som brevmottaker med korrekt informasjon', () => {
            renderBrevmottakere();

            expect(screen.getByText('Test Bruker')).toBeInTheDocument();
            expect(screen.getByText('12345678901')).toBeInTheDocument();
        });
    });

    describe('Manuelle brevmottakere', () => {
        it('viser manuelle brevmottakere med korrekt informasjon', () => {
            const behandling = createMockBehandling(createMockManuelleBrevmottakere());
            renderBrevmottakere(behandling);

            expect(screen.getByText('Fullmektig Person')).toBeInTheDocument();
            expect(screen.getByText('10987654321')).toBeInTheDocument();
        });

        it('viser fjern og endre knapper for manuelle brevmottakere', () => {
            const behandling = createMockBehandling(createMockManuelleBrevmottakere());
            renderBrevmottakere(behandling);

            expect(screen.getByText('Fullmektig Person')).toBeInTheDocument();
            expect(screen.getByText('Test Bruker')).toBeInTheDocument();
            expect(screen.getByText('Fjern')).toBeInTheDocument();
            expect(screen.getByText('Endre')).toBeInTheDocument();
        });
    });

    describe('Legg til ny mottaker funksjonalitet', () => {
        it('viser "Legg til ny mottaker" knapp når det er mulig', () => {
            renderBrevmottakere();

            expect(
                screen.getByRole('button', { name: /legg til ny mottaker/i })
            ).toBeInTheDocument();
        });

        it('viser ikke "Legg til ny mottaker" knapp når det allerede finnes manuelle mottakere', () => {
            const behandling = createMockBehandling(createMockManuelleBrevmottakere());
            renderBrevmottakere(behandling);

            expect(
                screen.queryByRole('button', { name: /legg til ny mottaker/i })
            ).not.toBeInTheDocument();
        });

        it('viser ikke "Legg til ny mottaker" knapp når det finnes dødsbo mottaker', () => {
            const behandling = createMockBehandling(createMockDødsboBrevmottaker());
            renderBrevmottakere(behandling);

            expect(
                screen.queryByRole('button', { name: /legg til ny mottaker/i })
            ).not.toBeInTheDocument();
        });
    });

    describe('Adresseinformasjon', () => {
        it('viser manuell adresse informasjon korrekt', () => {
            const behandling = createMockBehandling(createMockManuelleBrevmottakere());
            renderBrevmottakere(behandling);

            expect(screen.getByText('Testveien 1')).toBeInTheDocument();
            expect(screen.getByText('0123')).toBeInTheDocument();
            expect(screen.getByText('Oslo')).toBeInTheDocument();
        });

        it('viser organisasjonsinformasjon korrekt', () => {
            const behandling = createMockBehandling(createMockOrganisasjonsBrevmottaker());
            renderBrevmottakere(behandling);

            expect(screen.getByText('Test Organisasjon')).toBeInTheDocument();
            expect(screen.getByText('123456789')).toBeInTheDocument();
        });
    });
});
