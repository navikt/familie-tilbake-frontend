import type { RenderResult } from '@testing-library/react';
import type { UserEvent } from '@testing-library/user-event';
import type { BehandlingApiHook } from '~/api/behandling';
import type { BehandlingDto } from '~/generated';
import type { VergeDto } from '~/typer/api';
import type { Ressurs } from '~/typer/ressurs';

import { QueryClientProvider } from '@tanstack/react-query';
import { render, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import * as React from 'react';
import { vi } from 'vitest';

import { FagsakContext } from '~/context/FagsakContext';
import { Vergetype } from '~/kodeverk/verge';
import {
    TestBehandlingProvider,
    type BehandlingStateContextOverrides,
} from '~/testdata/behandlingContextFactory';
import { lagBehandling } from '~/testdata/behandlingFactory';
import { lagFagsak } from '~/testdata/fagsakFactory';
import { createTestQueryClient } from '~/testutils/queryTestUtils';
import { RessursStatus } from '~/typer/ressurs';

import { VergeContainer } from './VergeContainer';
import { VergeProvider } from './VergeContext';

const mockUseBehandlingApi = vi.fn();
vi.mock('~/api/behandling', () => ({
    useBehandlingApi: (): BehandlingApiHook => mockUseBehandlingApi(),
}));

const renderVergeContainer = (
    behandling: BehandlingDto,
    stateOverrides: BehandlingStateContextOverrides = {}
): RenderResult => {
    const client = createTestQueryClient();

    return render(
        <FagsakContext.Provider value={lagFagsak()}>
            <TestBehandlingProvider behandling={behandling} stateOverrides={stateOverrides}>
                <QueryClientProvider client={client}>
                    <VergeProvider>
                        <VergeContainer />
                    </VergeProvider>
                </QueryClientProvider>
            </TestBehandlingProvider>
        </FagsakContext.Provider>
    );
};

const setupMock = (verge?: VergeDto): void => {
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
};

describe('VergeContainer', () => {
    let user: UserEvent;
    beforeEach(() => {
        user = userEvent.setup();
        vi.clearAllMocks();
    });

    test('Fyller ut advokat', async () => {
        setupMock();

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
        setupMock();

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
        setupMock({
            type: Vergetype.Advokat,
            navn: 'Advokat Advokatesen',
            orgNr: 'DummyOrg',
            begrunnelse: '',
        });

        const { getByText, getByRole, getByLabelText, queryByLabelText } = renderVergeContainer(
            lagBehandling({ harVerge: true }),
            {
                erStegBehandlet: (): boolean => true,
                erStegAutoutført: (): boolean => true,
            }
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
        setupMock({
            type: Vergetype.VergeForBarn,
            navn: 'Verge Vergesen',
            ident: '27106903129',
            begrunnelse: 'Verge er opprettet',
        });
        const { getByText, getByRole, getByLabelText, queryByText, queryByLabelText } =
            renderVergeContainer(lagBehandling({ harVerge: true }), {
                erStegBehandlet: (): boolean => true,
            });

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
        setupMock({
            type: Vergetype.Advokat,
            navn: 'Advokat Advokatesen',
            orgNr: 'DummyOrg',
            begrunnelse: 'Bruker har engasjert advokat',
        });

        const { getByText, getByRole, queryByText, getByLabelText } = renderVergeContainer(
            lagBehandling({ harVerge: true }),
            {
                erStegBehandlet: (): boolean => true,
                behandlingILesemodus: true,
            }
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
        setupMock({
            type: Vergetype.VergeForBarn,
            navn: 'Verge Vergesen',
            ident: '27106903129',
            begrunnelse: '',
        });
        const { getByText, getByRole, queryByText, getByLabelText } = renderVergeContainer(
            lagBehandling({ harVerge: true }),
            {
                erStegBehandlet: (): boolean => true,
                behandlingILesemodus: true,
                erStegAutoutført: (): boolean => true,
            }
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
