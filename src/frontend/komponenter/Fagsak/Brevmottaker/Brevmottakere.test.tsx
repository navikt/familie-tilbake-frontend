import type { BehandlingHook } from '../../../context/BehandlingContext';
import type { ManuellBrevmottakerResponseDto } from '../../../typer/api';
import type { Behandling } from '../../../typer/behandling';
import type { RenderResult } from '@testing-library/react';
import type { NavigateFunction } from 'react-router';

import { render, screen } from '@testing-library/react';
import * as React from 'react';

import Brevmottakere from './Brevmottakere';
import { FagsakContext } from '../../../context/FagsakContext';
import { lagBehandling } from '../../../testdata/behandlingFactory';
import { lagFagsak } from '../../../testdata/fagsakFactory';
import { MottakerType } from '../../../typer/Brevmottaker';

jest.mock('react-router', () => ({
    ...jest.requireActual('react-router'),
    useNavigate: (): NavigateFunction => jest.fn(),
}));

const mockUseBehandling = jest.fn();
jest.mock('../../../context/BehandlingContext', () => ({
    useBehandling: (): BehandlingHook => mockUseBehandling(),
}));

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

const renderBrevmottakere = (behandling: Behandling): RenderResult => {
    mockUseBehandling.mockImplementation(() => ({
        actionBarStegtekst: jest.fn().mockReturnValue('Steg 1 av 5'),
        harVærtPåFatteVedtakSteget: jest.fn().mockReturnValue(false),
        erStegBehandlet: jest.fn().mockReturnValue(false),
    }));

    const fagsakValue = {
        fagsak: lagFagsak(),
    };

    return render(
        <FagsakContext.Provider value={fagsakValue}>
            <Brevmottakere behandling={behandling} />
        </FagsakContext.Provider>
    );
};

describe('Brevmottakere', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Default bruker brevmottaker', () => {
        test('Viser default bruker som brevmottaker med korrekt informasjon', () => {
            renderBrevmottakere(lagBehandling());

            expect(screen.getByText('Test Bruker')).toBeInTheDocument();
            expect(screen.getByText('12345678901')).toBeInTheDocument();
        });
    });

    describe('Manuelle brevmottakere', () => {
        test('Viser manuelle brevmottakere med korrekt informasjon', () => {
            const behandling = lagBehandling({
                manuelleBrevmottakere: createMockManuelleBrevmottakere(),
            });
            renderBrevmottakere(behandling);

            expect(screen.getByText('Fullmektig Person')).toBeInTheDocument();
            expect(screen.getByText('10987654321')).toBeInTheDocument();
        });

        test('Viser fjern og endre knapper for manuelle brevmottakere', () => {
            const behandling = lagBehandling({
                manuelleBrevmottakere: createMockManuelleBrevmottakere(),
            });
            renderBrevmottakere(behandling);

            expect(screen.getByText('Fullmektig Person')).toBeInTheDocument();
            expect(screen.getByText('Test Bruker')).toBeInTheDocument();
            expect(screen.getByText('Fjern')).toBeInTheDocument();
            expect(screen.getByText('Endre')).toBeInTheDocument();
        });
    });

    describe('Legg til ny mottaker funksjonalitet', () => {
        test('Viser "Legg til ny mottaker" knapp når det er mulig', () => {
            renderBrevmottakere(lagBehandling());

            expect(
                screen.getByRole('button', { name: /legg til ny mottaker/i })
            ).toBeInTheDocument();
        });

        test('Viser ikke "Legg til ny mottaker" knapp når det allerede finnes manuelle mottakere', () => {
            const behandling = lagBehandling({
                manuelleBrevmottakere: createMockManuelleBrevmottakere(),
            });
            renderBrevmottakere(behandling);

            expect(
                screen.queryByRole('button', { name: /legg til ny mottaker/i })
            ).not.toBeInTheDocument();
        });

        test('Viser ikke "Legg til ny mottaker" knapp når det finnes dødsbo mottaker', () => {
            const behandling = lagBehandling({
                manuelleBrevmottakere: createMockDødsboBrevmottaker(),
            });
            renderBrevmottakere(behandling);

            expect(
                screen.queryByRole('button', { name: /legg til ny mottaker/i })
            ).not.toBeInTheDocument();
        });
    });

    describe('Adresseinformasjon', () => {
        test('Viser manuell adresse informasjon korrekt', () => {
            const behandling = lagBehandling({
                manuelleBrevmottakere: createMockManuelleBrevmottakere(),
            });
            renderBrevmottakere(behandling);

            expect(screen.getByText('Testveien 1')).toBeInTheDocument();
            expect(screen.getByText('0123')).toBeInTheDocument();
            expect(screen.getByText('Oslo')).toBeInTheDocument();
        });

        test('Viser organisasjonsinformasjon korrekt', () => {
            const behandling = lagBehandling({
                manuelleBrevmottakere: createMockOrganisasjonsBrevmottaker(),
            });
            renderBrevmottakere(behandling);

            expect(screen.getByText('Test Organisasjon')).toBeInTheDocument();
            expect(screen.getByText('123456789')).toBeInTheDocument();
        });
    });
});
