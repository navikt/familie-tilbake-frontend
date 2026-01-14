import type { BehandlingApiHook } from '../../../api/behandling';
import type { Http } from '../../../api/http/HttpProvider';
import type { BehandlingHook } from '../../../context/BehandlingContext';
import type { BehandlingDto } from '../../../generated';
import type { VergeDto } from '../../../typer/api';
import type { Ressurs } from '../../../typer/ressurs';
import type { RenderResult } from '@testing-library/react';
import type { UserEvent } from '@testing-library/user-event';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import * as React from 'react';
import { vi } from 'vitest';

import VergeContainer from './VergeContainer';
import { VergeProvider } from './VergeContext';
import { FagsakContext } from '../../../context/FagsakContext';
import { Vergetype } from '../../../kodeverk/verge';
import { lagBehandling } from '../../../testdata/behandlingFactory';
import { lagFagsak } from '../../../testdata/fagsakFactory';
import { RessursStatus } from '../../../typer/ressurs';

vi.mock('../../../api/http/HttpProvider', () => {
    return {
        useHttp: (): Http => ({
            systemetLaster: () => false,
            request: vi.fn(),
        }),
    };
});

const mockUseBehandling = vi.fn();
vi.mock('../../../context/BehandlingContext', () => ({
    useBehandling: (): BehandlingHook => mockUseBehandling(),
}));

const mockUseBehandlingApi = vi.fn();
vi.mock('../../../api/behandling', () => ({
    useBehandlingApi: (): BehandlingApiHook => mockUseBehandlingApi(),
}));

vi.mock('react-router', async () => {
    const actual = await vi.importActual('react-router');
    return {
        ...actual,
        useNavigate: (): ReturnType<typeof vi.fn> => vi.fn(),
    };
});

const renderVergeContainer = (behandling: BehandlingDto): RenderResult => {
    const client = new QueryClient();

    return render(
        <FagsakContext.Provider value={lagFagsak()}>
            <QueryClientProvider client={client}>
                <VergeProvider behandling={behandling}>
                    <VergeContainer />
                </VergeProvider>
            </QueryClientProvider>
        </FagsakContext.Provider>
    );
};

const setupMock = (
    behandlet: boolean,
    lesevisning: boolean,
    autoutført: boolean,
    verge?: VergeDto
): void => {
    mockUseBehandlingApi.mockImplementation(() => ({
        gjerVergeKall: (): Promise<Ressurs<VergeDto>> | undefined => {
            if (!verge) {
                return undefined;
            }
            const ressurs: Ressurs<VergeDto> = {
                status: RessursStatus.Suksess,
                data: verge,
            };
            return Promise.resolve(ressurs);
        },
        sendInnVerge: (): Promise<Ressurs<string>> => {
            const ressurs: Ressurs<string> = {
                status: RessursStatus.Suksess,
                data: 'suksess',
            };
            return Promise.resolve(ressurs);
        },
    }));
    mockUseBehandling.mockImplementation(() => ({
        behandling: lagBehandling(),
        erStegBehandlet: (): boolean => behandlet,
        erStegAutoutført: (): boolean => autoutført,
        behandlingILesemodus: lesevisning,
        settIkkePersistertKomponent: vi.fn(),
        actionBarStegtekst: vi.fn().mockReturnValue('Steg 1 av 5'),
        harVærtPåFatteVedtakSteget: vi.fn().mockReturnValue(false),
        ventegrunn: undefined,
        aktivtSteg: undefined,
    }));
};

describe('VergeContainer', () => {
    let user: UserEvent;
    beforeEach(() => {
        user = userEvent.setup();
        vi.clearAllMocks();
    });

    test('Fyller ut advokat', async () => {
        setupMock(false, false, false);

        const { getByText, getByRole, getByLabelText, queryAllByText } =
            renderVergeContainer(lagBehandling());

        await waitFor(() => {
            expect(getByText('Verge')).toBeInTheDocument();
        });

        await user.click(
            getByRole('button', {
                name: 'Gå videre til faktasteget',
            })
        );

        expect(queryAllByText('Feltet må fylles ut')).toHaveLength(2);

        await user.selectOptions(getByLabelText('Vergetype'), Vergetype.Advokat);

        await user.type(getByLabelText('Begrunn endringene'), 'Verge er advokat');

        await user.click(
            getByRole('button', {
                name: 'Gå videre til faktasteget',
            })
        );
        expect(queryAllByText('Feltet må fylles ut')).toHaveLength(2);

        await user.type(getByLabelText('Navn'), 'Advokat Advokatesen');
        await user.type(getByLabelText('Organisasjonsnummer'), 'DummyOrg');

        await user.click(
            getByRole('button', {
                name: 'Gå videre til faktasteget',
            })
        );
        expect(queryAllByText('Feltet må fylles ut')).toHaveLength(0);
    });

    test('Fyller ut verge for barn', async () => {
        setupMock(false, false, false);

        const { getByText, getByRole, getByLabelText, queryAllByText, queryByText } =
            renderVergeContainer(lagBehandling());

        await waitFor(() => {
            expect(getByText('Verge')).toBeInTheDocument();
        });

        await user.click(
            getByRole('button', {
                name: 'Gå videre til faktasteget',
            })
        );
        expect(queryAllByText('Feltet må fylles ut')).toHaveLength(2);

        await user.selectOptions(getByLabelText('Vergetype'), Vergetype.VergeForBarn);
        await user.type(getByLabelText('Begrunn endringene'), 'Verge er advokat');

        await user.click(
            getByRole('button', {
                name: 'Gå videre til faktasteget',
            })
        );
        expect(queryAllByText('Feltet må fylles ut')).toHaveLength(2);

        await user.type(getByLabelText('Navn'), 'Verge Vergesen');
        await user.type(getByLabelText('Fødselsnummer'), '12sdf678901');

        await user.click(
            getByRole('button', {
                name: 'Gå videre til faktasteget',
            })
        );
        expect(queryByText('Du må skrive minst 3 tegn')).not.toBeInTheDocument();
        expect(queryByText('Ugyldig fødselsnummer')).toBeInTheDocument();

        await user.clear(getByLabelText('Fødselsnummer'));
        await user.type(getByLabelText('Fødselsnummer'), '27106903129');

        await user.click(
            getByRole('button', {
                name: 'Gå videre til faktasteget',
            })
        );
        expect(queryAllByText('Feltet må fylles ut')).toHaveLength(0);
        expect(queryByText('Ugyldig fødselsnummer')).not.toBeInTheDocument();
    });

    test('Vis utfylt - advokat - autoutført', async () => {
        setupMock(true, false, true, {
            type: Vergetype.Advokat,
            navn: 'Advokat Advokatesen',
            orgNr: 'DummyOrg',
            begrunnelse: '',
        });

        const { getByText, getByRole, getByLabelText, queryByLabelText } = renderVergeContainer(
            lagBehandling({ harVerge: true })
        );

        await waitFor(() => {
            expect(getByText('Verge')).toBeInTheDocument();
            expect(
                getByText('Automatisk vurdert. Verge er kopiert fra fagsystemet.')
            ).toBeInTheDocument();
        });

        expect(
            getByRole('button', {
                name: 'Gå videre til faktasteget',
            })
        ).toBeEnabled();

        expect(getByLabelText('Vergetype')).toHaveValue(Vergetype.Advokat);
        expect(getByLabelText('Begrunn endringene')).toHaveValue('');
        expect(getByLabelText('Navn')).toHaveValue('Advokat Advokatesen');
        expect(getByLabelText('Organisasjonsnummer')).toHaveValue('DummyOrg');
        expect(queryByLabelText('Fødselsnummer')).not.toBeInTheDocument();
    });

    test('Vis utfylt - verge barn', async () => {
        setupMock(true, false, false, {
            type: Vergetype.VergeForBarn,
            navn: 'Verge Vergesen',
            ident: '27106903129',
            begrunnelse: 'Verge er opprettet',
        });
        const { getByText, getByRole, getByLabelText, queryByText, queryByLabelText } =
            renderVergeContainer(lagBehandling({ harVerge: true }));

        await waitFor(() => {
            expect(getByText('Verge')).toBeInTheDocument();
            expect(
                queryByText('Automatisk vurdert. Verge er kopiert fra fagsystemet.')
            ).not.toBeInTheDocument();
            expect(
                getByRole('button', {
                    name: 'Gå videre til faktasteget',
                })
            ).toBeEnabled();
        });

        expect(getByLabelText('Vergetype')).toHaveValue(Vergetype.VergeForBarn);
        expect(getByLabelText('Begrunn endringene')).toHaveValue('Verge er opprettet');
        expect(getByLabelText('Navn')).toHaveValue('Verge Vergesen');
        expect(getByLabelText('Fødselsnummer')).toHaveValue('27106903129');
        expect(queryByLabelText('Organisasjonsnummer')).not.toBeInTheDocument();
    });

    test('Vis utfylt - advokat - lesevisning', async () => {
        setupMock(true, true, false, {
            type: Vergetype.Advokat,
            navn: 'Advokat Advokatesen',
            orgNr: 'DummyOrg',
            begrunnelse: 'Bruker har engasjert advokat',
        });

        const { getByText, getByRole, queryByText, getByLabelText } = renderVergeContainer(
            lagBehandling({ harVerge: true })
        );

        await waitFor(() => {
            expect(getByText('Verge')).toBeInTheDocument();
            expect(
                queryByText('Automatisk vurdert. Verge er kopiert fra fagsystemet.')
            ).not.toBeInTheDocument();
            expect(
                getByRole('button', {
                    name: 'Gå videre til faktasteget',
                })
            ).toBeEnabled();
        });

        expect(getByText('Advokat/advokatfullmektig')).toBeInTheDocument();
        expect(getByText('Bruker har engasjert advokat')).toBeInTheDocument();
        expect(getByLabelText('Navn')).toHaveValue('Advokat Advokatesen');
        expect(getByLabelText('Organisasjonsnummer')).toHaveValue('DummyOrg');
        expect(queryByText('Fødselsnummer')).not.toBeInTheDocument();
    });

    test('Vis utfylt - verge barn - autoutført - lesevisning', async () => {
        setupMock(true, true, true, {
            type: Vergetype.VergeForBarn,
            navn: 'Verge Vergesen',
            ident: '27106903129',
            begrunnelse: '',
        });
        const { getByText, getByRole, queryByText, getByLabelText } = renderVergeContainer(
            lagBehandling({ harVerge: true })
        );

        await waitFor(() => {
            expect(getByText('Verge')).toBeInTheDocument();
            expect(
                getByText('Automatisk vurdert. Verge er kopiert fra fagsystemet.')
            ).toBeInTheDocument();
        });

        expect(
            getByRole('button', {
                name: 'Gå videre til faktasteget',
            })
        ).toBeEnabled();

        expect(getByText('Verge for barn under 18 år')).toBeInTheDocument();
        expect(getByLabelText('Navn')).toHaveValue('Verge Vergesen');
        expect(getByLabelText('Begrunn endringene')).toHaveValue('');
        expect(getByLabelText('Fødselsnummer')).toHaveValue('27106903129');
        expect(queryByText('Organisasjonsnummer')).not.toBeInTheDocument();
    });
});
