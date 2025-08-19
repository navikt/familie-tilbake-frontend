import type { BehandlingApiHook } from '../../../api/behandling';
import type { Http } from '../../../api/http/HttpProvider';
import type { BehandlingHook } from '../../../context/BehandlingContext';
import type { VergeDto } from '../../../typer/api';
import type { IBehandling } from '../../../typer/behandling';
import type { IFagsak } from '../../../typer/fagsak';
import type { RenderResult } from '@testing-library/react';
import type { UserEvent } from '@testing-library/user-event';
import type { NavigateFunction } from 'react-router';

import { render, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { mock } from 'jest-mock-extended';
import * as React from 'react';

import VergeContainer from './VergeContainer';
import { VergeProvider } from './VergeContext';
import { Vergetype } from '../../../kodeverk/verge';
import { type Ressurs, RessursStatus } from '../../../typer/ressurs';

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

const mockUseBehandlingApi = jest.fn();
jest.mock('../../../api/behandling', () => ({
    useBehandlingApi: (): BehandlingApiHook => mockUseBehandlingApi(),
}));

jest.mock('react-router', () => ({
    ...jest.requireActual('react-router'),
    useNavigate: (): NavigateFunction => jest.fn(),
}));

const renderVergeContainer = (behandling: IBehandling, fagsak: IFagsak): RenderResult =>
    render(
        <VergeProvider behandling={behandling} fagsak={fagsak}>
            <VergeContainer />
        </VergeProvider>
    );

describe('Tester: VergeContainer', () => {
    let user: UserEvent;
    beforeEach(() => {
        user = userEvent.setup();
        jest.clearAllMocks();
    });

    const setupMock = (
        behandlet: boolean,
        lesevisning: boolean,
        autoutført: boolean,
        verge?: VergeDto
    ): void => {
        mockUseBehandlingApi.mockImplementation(() => ({
            gjerVergeKall: (): Promise<Ressurs<VergeDto>> => {
                const ressurs = mock<Ressurs<VergeDto>>({
                    status: RessursStatus.Suksess,
                    data: verge,
                });
                return Promise.resolve(ressurs);
            },
            sendInnVerge: (): Promise<Ressurs<string>> => {
                const ressurs = mock<Ressurs<string>>({
                    status: RessursStatus.Suksess,
                    data: 'suksess',
                });
                return Promise.resolve(ressurs);
            },
        }));
        mockUseBehandling.mockImplementation(() => ({
            erStegBehandlet: (): boolean => behandlet,
            erStegAutoutført: (): boolean => autoutført,
            behandlingILesemodus: lesevisning,
            hentBehandlingMedBehandlingId: (): Promise<void> => Promise.resolve(),
            settIkkePersistertKomponent: jest.fn(),
            nullstillIkkePersisterteKomponenter: jest.fn(),
        }));
    };

    test('- fyller ut advokat', async () => {
        setupMock(false, false, false);
        const behandling = mock<IBehandling>({
            harVerge: false,
        });
        const fagsak = mock<IFagsak>();

        const { getByText, getByRole, getByLabelText, queryAllByText } = renderVergeContainer(
            behandling,
            fagsak
        );

        await waitFor(() => {
            expect(getByText('Verge')).toBeInTheDocument();
        });

        await user.click(
            getByRole('button', {
                name: 'Lagre og fortsett',
            })
        );

        expect(queryAllByText('Feltet må fylles ut')).toHaveLength(2);

        await user.selectOptions(getByLabelText('Vergetype'), Vergetype.Advokat);

        await user.type(getByLabelText('Begrunn endringene'), 'Verge er advokat');

        await user.click(
            getByRole('button', {
                name: 'Lagre og fortsett',
            })
        );
        expect(queryAllByText('Feltet må fylles ut')).toHaveLength(2);

        await user.type(getByLabelText('Navn'), 'Advokat Advokatesen');
        await user.type(getByLabelText('Organisasjonsnummer'), 'DummyOrg');

        await user.click(
            getByRole('button', {
                name: 'Lagre og fortsett',
            })
        );
        expect(queryAllByText('Feltet må fylles ut')).toHaveLength(0);
    });

    test('- fyller ut verge for barn', async () => {
        setupMock(false, false, false);
        const behandling = mock<IBehandling>({
            harVerge: false,
        });
        const fagsak = mock<IFagsak>();

        const { getByText, getByRole, getByLabelText, queryAllByText, queryByText } =
            renderVergeContainer(behandling, fagsak);

        await waitFor(() => {
            expect(getByText('Verge')).toBeInTheDocument();
        });

        await user.click(
            getByRole('button', {
                name: 'Lagre og fortsett',
            })
        );
        expect(queryAllByText('Feltet må fylles ut')).toHaveLength(2);

        await user.selectOptions(getByLabelText('Vergetype'), Vergetype.VergeForBarn);
        await user.type(getByLabelText('Begrunn endringene'), 'Verge er advokat');

        await user.click(
            getByRole('button', {
                name: 'Lagre og fortsett',
            })
        );
        expect(queryAllByText('Feltet må fylles ut')).toHaveLength(2);

        await user.type(getByLabelText('Navn'), 'Verge Vergesen');
        await user.type(getByLabelText('Fødselsnummer'), '12sdf678901');

        await user.click(
            getByRole('button', {
                name: 'Lagre og fortsett',
            })
        );
        expect(queryByText('Du må skrive minst 3 tegn')).not.toBeInTheDocument();
        expect(queryByText('Ugyldig fødselsnummer')).toBeInTheDocument();

        await user.clear(getByLabelText('Fødselsnummer'));
        await user.type(getByLabelText('Fødselsnummer'), '27106903129');

        await user.click(
            getByRole('button', {
                name: 'Lagre og fortsett',
            })
        );
        expect(queryAllByText('Feltet må fylles ut')).toHaveLength(0);
        expect(queryByText('Ugyldig fødselsnummer')).not.toBeInTheDocument();
    });

    test('- vis utfylt - advokat - autoutført', async () => {
        setupMock(true, false, true, {
            type: Vergetype.Advokat,
            navn: 'Advokat Advokatesen',
            orgNr: 'DummyOrg',
            begrunnelse: '',
        });
        const behandling = mock<IBehandling>({
            harVerge: true,
        });
        const fagsak = mock<IFagsak>();

        const { getByText, getByRole, getByLabelText, queryByLabelText } = renderVergeContainer(
            behandling,
            fagsak
        );

        await waitFor(() => {
            expect(getByText('Verge')).toBeInTheDocument();
            expect(
                getByText('Automatisk vurdert. Verge er kopiert fra fagsystemet.')
            ).toBeInTheDocument();
        });

        expect(
            getByRole('button', {
                name: 'Neste',
            })
        ).toBeEnabled();

        expect(getByLabelText('Vergetype')).toHaveValue(Vergetype.Advokat);
        expect(getByLabelText('Begrunn endringene')).toHaveValue('');
        expect(getByLabelText('Navn')).toHaveValue('Advokat Advokatesen');
        expect(getByLabelText('Organisasjonsnummer')).toHaveValue('DummyOrg');
        expect(queryByLabelText('Fødselsnummer')).not.toBeInTheDocument();
    });

    test('- vis utfylt - verge barn', async () => {
        setupMock(true, false, false, {
            type: Vergetype.VergeForBarn,
            navn: 'Verge Vergesen',
            ident: '27106903129',
            begrunnelse: 'Verge er opprettet',
        });
        const behandling = mock<IBehandling>({
            harVerge: true,
        });
        const fagsak = mock<IFagsak>();

        const { getByText, getByRole, getByLabelText, queryByText, queryByLabelText } =
            renderVergeContainer(behandling, fagsak);

        await waitFor(() => {
            expect(getByText('Verge')).toBeInTheDocument();
            expect(
                queryByText('Automatisk vurdert. Verge er kopiert fra fagsystemet.')
            ).not.toBeInTheDocument();
            expect(
                getByRole('button', {
                    name: 'Neste',
                })
            ).toBeEnabled();
        });

        expect(getByLabelText('Vergetype')).toHaveValue(Vergetype.VergeForBarn);
        expect(getByLabelText('Begrunn endringene')).toHaveValue('Verge er opprettet');
        expect(getByLabelText('Navn')).toHaveValue('Verge Vergesen');
        expect(getByLabelText('Fødselsnummer')).toHaveValue('27106903129');
        expect(queryByLabelText('Organisasjonsnummer')).not.toBeInTheDocument();
    });

    test('- vis utfylt - advokat - lesevisning', async () => {
        setupMock(true, true, false, {
            type: Vergetype.Advokat,
            navn: 'Advokat Advokatesen',
            orgNr: 'DummyOrg',
            begrunnelse: 'Bruker har engasjert advokat',
        });
        const behandling = mock<IBehandling>({
            harVerge: true,
        });
        const fagsak = mock<IFagsak>();

        const { getByText, getByRole, queryByText, getByLabelText } = renderVergeContainer(
            behandling,
            fagsak
        );

        await waitFor(() => {
            expect(getByText('Verge')).toBeInTheDocument();
            expect(
                queryByText('Automatisk vurdert. Verge er kopiert fra fagsystemet.')
            ).not.toBeInTheDocument();
            expect(
                getByRole('button', {
                    name: 'Neste',
                })
            ).toBeEnabled();
        });

        expect(getByText('Advokat/advokatfullmektig')).toBeInTheDocument();
        expect(getByText('Bruker har engasjert advokat')).toBeInTheDocument();
        expect(getByLabelText('Navn')).toHaveValue('Advokat Advokatesen');
        expect(getByLabelText('Organisasjonsnummer')).toHaveValue('DummyOrg');
        expect(queryByText('Fødselsnummer')).not.toBeInTheDocument();
    });

    test('- vis utfylt - verge barn - autoutført - lesevisning', async () => {
        setupMock(true, true, true, {
            type: Vergetype.VergeForBarn,
            navn: 'Verge Vergesen',
            ident: '27106903129',
            begrunnelse: '',
        });
        const behandling = mock<IBehandling>({
            harVerge: true,
        });
        const fagsak = mock<IFagsak>();

        const { getByText, getByRole, queryByText, getByLabelText } = renderVergeContainer(
            behandling,
            fagsak
        );

        await waitFor(() => {
            expect(getByText('Verge')).toBeInTheDocument();
            expect(
                getByText('Automatisk vurdert. Verge er kopiert fra fagsystemet.')
            ).toBeInTheDocument();
        });

        expect(
            getByRole('button', {
                name: 'Neste',
            })
        ).toBeEnabled();

        expect(getByText('Verge for barn under 18 år')).toBeInTheDocument();
        expect(getByLabelText('Navn')).toHaveValue('Verge Vergesen');
        expect(getByLabelText('Begrunn endringene')).toHaveValue('');
        expect(getByLabelText('Fødselsnummer')).toHaveValue('27106903129');
        expect(queryByText('Organisasjonsnummer')).not.toBeInTheDocument();
    });
});
