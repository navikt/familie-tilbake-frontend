import type { BehandlingApiHook } from '../../../api/behandling';
import type { Http } from '../../../api/http/HttpProvider';
import type { BehandlingHook } from '../../../context/BehandlingContext';
import type { FagsakHook } from '../../../context/FagsakContext';
import type { ManuellBrevmottakerResponseDto } from '../../../typer/api';
import type { IBehandling } from '../../../typer/behandling';
import type { IBrevmottaker } from '../../../typer/Brevmottaker';
import type { IFagsak } from '../../../typer/fagsak';
import type { Ressurs } from '../../../typer/ressurs';
import type { RenderResult } from '@testing-library/react';
import type { NavigateFunction } from 'react-router';

import { render, screen } from '@testing-library/react';
import { mock } from 'jest-mock-extended';
import * as React from 'react';

import Brevmottakere from './Brevmottakere';
import { Fagsystem } from '../../../kodeverk';
import { Behandlingstatus, Behandlingstype } from '../../../typer/behandling';
import { MottakerType } from '../../../typer/Brevmottaker';
import { Kjønn } from '../../../typer/person';
import { RessursStatus } from '../../../typer/ressurs';

jest.mock('../../../api/http/HttpProvider', () => {
    return {
        useHttp: (): Http => ({
            systemetLaster: () => false,
            request: jest.fn(),
        }),
    };
});

const mockUseBehandling = jest.fn();
jest.mock('../../../context/BehandlingContext', () => ({
    useBehandling: (): BehandlingHook => mockUseBehandling(),
}));

const mockUseFagsak = jest.fn();
jest.mock('../../../context/FagsakContext', () => ({
    useFagsak: (): FagsakHook => mockUseFagsak(),
}));

const mockUseBehandlingApi = jest.fn();
jest.mock('../../../api/behandling', () => ({
    useBehandlingApi: (): BehandlingApiHook => mockUseBehandlingApi(),
}));

jest.mock('react-router', () => ({
    ...jest.requireActual('react-router'),
    useNavigate: (): NavigateFunction => jest.fn(),
}));

const renderBrevmottakere = (): RenderResult => {
    return render(<Brevmottakere />);
};

describe('Brevmottakere', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    const setupMock = (
        manuelleBrevmottakere: ManuellBrevmottakerResponseDto[] = [],
        kanEndres: boolean = true,
        behandlingILesemodus: boolean = false
    ): void => {
        const behandling = mock<IBehandling>({
            behandlingId: '1',
            status: Behandlingstatus.Opprettet,
            type: Behandlingstype.Tilbakekreving,
            kanEndres,
            manuelleBrevmottakere,
        });

        const fagsak = mock<IFagsak>({
            eksternFagsakId: '123',
            fagsystem: Fagsystem.BA,
            bruker: {
                navn: 'Test Bruker',
                personIdent: '12345678901',
                fødselsdato: '1990-01-01',
                kjønn: Kjønn.Mann,
                dødsdato: undefined,
            },
        });

        mockUseBehandling.mockImplementation(() => ({
            behandling: mock<Ressurs<IBehandling>>({
                status: RessursStatus.Suksess,
                data: behandling,
            }),
            behandlingILesemodus,
            hentBehandlingMedBehandlingId: jest.fn().mockResolvedValue(undefined),
        }));

        mockUseFagsak.mockImplementation(() => ({
            fagsak: mock<Ressurs<IFagsak>>({
                status: RessursStatus.Suksess,
                data: fagsak,
            }),
        }));

        mockUseBehandlingApi.mockImplementation(() => ({
            fjernManuellBrevmottaker: jest.fn().mockResolvedValue(
                mock<Ressurs<string>>({
                    status: RessursStatus.Suksess,
                    data: 'suksess',
                })
            ),
        }));
    };

    describe('Default bruker brevmottaker', () => {
        it('viser default bruker som brevmottaker med korrekt informasjon', () => {
            setupMock();
            renderBrevmottakere();

            expect(screen.getByText('Test Bruker')).toBeInTheDocument();
            expect(screen.getByText('12345678901')).toBeInTheDocument();
        });
    });

    describe('Manuelle brevmottakere', () => {
        it('viser manuelle brevmottakere med korrekt informasjon', () => {
            const manuellBrevmottaker: ManuellBrevmottakerResponseDto = {
                id: 'manual-1',
                brevmottaker: {
                    type: MottakerType.Fullmektig,
                    navn: 'Fullmektig Person',
                    personIdent: '10987654321',
                    manuellAdresseInfo: undefined,
                    organisasjonsnummer: undefined,
                },
            };

            setupMock([manuellBrevmottaker]);
            renderBrevmottakere();

            expect(screen.getByText('Fullmektig Person')).toBeInTheDocument();
            expect(screen.getByText('10987654321')).toBeInTheDocument();
        });

        it('viser fjern og endre knapper for manuelle brevmottakere', () => {
            const manuellBrevmottaker: ManuellBrevmottakerResponseDto = {
                id: 'manual-1',
                brevmottaker: {
                    type: MottakerType.Fullmektig,
                    navn: 'Fullmektig Person',
                    personIdent: '10987654321',
                    manuellAdresseInfo: undefined,
                    organisasjonsnummer: undefined,
                } as IBrevmottaker,
            };

            setupMock([manuellBrevmottaker], true, false);
            renderBrevmottakere();

            expect(screen.getByText('Fullmektig Person')).toBeInTheDocument();
            expect(screen.getByText('Test Bruker')).toBeInTheDocument();
            expect(screen.getByText('Fjern')).toBeInTheDocument();
            expect(screen.getByText('Endre')).toBeInTheDocument();
        });
    });

    describe('Legg til ny mottaker funksjonalitet', () => {
        it('viser "Legg til ny mottaker" knapp når det er mulig', () => {
            setupMock();

            renderBrevmottakere();

            expect(
                screen.getByRole('button', { name: /legg til ny mottaker/i })
            ).toBeInTheDocument();
        });

        it('viser ikke "Legg til ny mottaker" knapp når det allerede finnes manuelle mottakere', () => {
            const manuellBrevmottaker: ManuellBrevmottakerResponseDto = {
                id: 'manual-1',
                brevmottaker: {
                    type: MottakerType.Fullmektig,
                    navn: 'Fullmektig Person',
                    personIdent: '10987654321',
                    manuellAdresseInfo: undefined,
                    organisasjonsnummer: undefined,
                },
            };

            setupMock([manuellBrevmottaker]);
            renderBrevmottakere();

            expect(
                screen.queryByRole('button', { name: /legg til ny mottaker/i })
            ).not.toBeInTheDocument();
        });

        it('viser ikke "Legg til ny mottaker" knapp når det finnes dødsbo mottaker', () => {
            const manuellBrevmottaker: ManuellBrevmottakerResponseDto = {
                id: 'manual-1',
                brevmottaker: {
                    type: MottakerType.Dødsbo,
                    navn: 'Dødsbo Test Bruker',
                    personIdent: '12345678901',
                    manuellAdresseInfo: undefined,
                    organisasjonsnummer: undefined,
                },
            };

            setupMock([manuellBrevmottaker]);
            renderBrevmottakere();

            expect(
                screen.queryByRole('button', { name: /legg til ny mottaker/i })
            ).not.toBeInTheDocument();
        });
    });

    describe('Lesevisning', () => {
        it('viser ikke handlingsknapper i lesevisning', () => {
            const manuellBrevmottaker: ManuellBrevmottakerResponseDto = {
                id: 'manual-1',
                brevmottaker: {
                    type: MottakerType.Fullmektig,
                    navn: 'Fullmektig Person',
                    personIdent: '10987654321',
                    manuellAdresseInfo: undefined,
                    organisasjonsnummer: undefined,
                },
            };

            setupMock([manuellBrevmottaker], true, true);
            renderBrevmottakere();

            expect(screen.queryByRole('button', { name: /fjern/i })).not.toBeInTheDocument();
            expect(screen.queryByRole('button', { name: /endre/i })).not.toBeInTheDocument();
            expect(
                screen.queryByRole('button', { name: /legg til ny mottaker/i })
            ).not.toBeInTheDocument();
        });

        it('viser fortsatt neste knapp i lesevisning', () => {
            setupMock([], true, true);
            renderBrevmottakere();

            expect(screen.getByRole('button', { name: /neste/i })).toBeInTheDocument();
        });
    });

    describe('Adresseinformasjon', () => {
        it('viser manuell adresse informasjon korrekt', () => {
            const manuellBrevmottaker: ManuellBrevmottakerResponseDto = {
                id: 'manual-1',
                brevmottaker: {
                    type: MottakerType.Fullmektig,
                    navn: 'Fullmektig Person',
                    personIdent: '10987654321',
                    manuellAdresseInfo: {
                        adresselinje1: 'Testveien 1',
                        adresselinje2: '',
                        postnummer: '0123',
                        poststed: 'Oslo',
                        landkode: 'NO',
                    },
                    organisasjonsnummer: undefined,
                },
            };

            setupMock([manuellBrevmottaker]);
            renderBrevmottakere();

            expect(screen.getByText('Testveien 1')).toBeInTheDocument();
            expect(screen.getByText('0123')).toBeInTheDocument();
            expect(screen.getByText('Oslo')).toBeInTheDocument();
        });

        it('viser organisasjonsinformasjon korrekt', () => {
            const manuellBrevmottaker: ManuellBrevmottakerResponseDto = {
                id: 'manual-1',
                brevmottaker: {
                    type: MottakerType.Fullmektig,
                    navn: 'Test Organisasjon',
                    personIdent: undefined,
                    manuellAdresseInfo: undefined,
                    organisasjonsnummer: '123456789',
                },
            };

            setupMock([manuellBrevmottaker]);
            renderBrevmottakere();

            expect(screen.getByText('Test Organisasjon')).toBeInTheDocument();
            expect(screen.getByText('123456789')).toBeInTheDocument();
        });
    });
});
