import type { UserEvent } from '@testing-library/user-event';
import type { BehandlingApiHook } from '~/api/behandling';
import type { BehandlingDto } from '~/generated';
import type { VergeDto } from '~/typer/api';
import type { Ressurs } from '~/typer/ressurs';

import { QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
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
): void => {
    const client = createTestQueryClient();
    render(
        <FagsakContext value={lagFagsak()}>
            <TestBehandlingProvider behandling={behandling} stateOverrides={stateOverrides}>
                <QueryClientProvider client={client}>
                    <VergeProvider>
                        <VergeContainer />
                    </VergeProvider>
                </QueryClientProvider>
            </TestBehandlingProvider>
        </FagsakContext>
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

        renderVergeContainer(lagBehandling());

        expect(screen.getByText('Verge')).toBeInTheDocument();

        await user.click(
            screen.getByRole('button', {
                name: 'Gå videre til faktasteget',
            })
        );

        expect(screen.getAllByText('Feltet må fylles ut')).toHaveLength(2);

        await user.selectOptions(screen.getByLabelText('Vergetype'), Vergetype.Advokat);

        await user.type(screen.getByLabelText('Begrunn endringene'), 'Verge er advokat');

        await user.click(
            screen.getByRole('button', {
                name: 'Gå videre til faktasteget',
            })
        );
        expect(screen.getAllByText('Feltet må fylles ut')).toHaveLength(2);

        await user.type(screen.getByLabelText('Navn'), 'Advokat Advokatesen');
        await user.type(screen.getByLabelText('Organisasjonsnummer'), 'DummyOrg');

        await user.click(
            screen.getByRole('button', {
                name: 'Gå videre til faktasteget',
            })
        );
        expect(screen.queryAllByText('Feltet må fylles ut')).toHaveLength(0);
    });

    test('Fyller ut verge for barn', async () => {
        setupMock();

        renderVergeContainer(lagBehandling());

        expect(screen.getByText('Verge')).toBeInTheDocument();

        await user.click(
            screen.getByRole('button', {
                name: 'Gå videre til faktasteget',
            })
        );
        expect(screen.getAllByText('Feltet må fylles ut')).toHaveLength(2);

        await user.selectOptions(screen.getByLabelText('Vergetype'), Vergetype.VergeForBarn);
        await user.type(screen.getByLabelText('Begrunn endringene'), 'Verge er advokat');

        await user.click(
            screen.getByRole('button', {
                name: 'Gå videre til faktasteget',
            })
        );
        expect(screen.getAllByText('Feltet må fylles ut')).toHaveLength(2);

        await user.type(screen.getByLabelText('Navn'), 'Verge Vergesen');
        await user.type(screen.getByLabelText('Fødselsnummer'), '12sdf678901');

        await user.click(
            screen.getByRole('button', {
                name: 'Gå videre til faktasteget',
            })
        );
        expect(screen.queryByText('Du må skrive minst 3 tegn')).not.toBeInTheDocument();
        expect(screen.getByText('Ugyldig fødselsnummer')).toBeInTheDocument();

        await user.clear(screen.getByLabelText('Fødselsnummer'));
        await user.type(screen.getByLabelText('Fødselsnummer'), '27106903129');

        await user.click(
            screen.getByRole('button', {
                name: 'Gå videre til faktasteget',
            })
        );
        expect(screen.queryAllByText('Feltet må fylles ut')).toHaveLength(0);
        expect(screen.queryByText('Ugyldig fødselsnummer')).not.toBeInTheDocument();
    });

    test('Vis utfylt - advokat - autoutført', async () => {
        setupMock({
            type: Vergetype.Advokat,
            navn: 'Advokat Advokatesen',
            orgNr: 'DummyOrg',
            begrunnelse: '',
        });

        renderVergeContainer(lagBehandling({ harVerge: true }), {
            erStegBehandlet: (): boolean => true,
            erStegAutoutført: (): boolean => true,
        });

        expect(screen.getByText('Verge')).toBeInTheDocument();
        expect(
            await screen.findByText('Automatisk vurdert. Verge er kopiert fra fagsystemet.')
        ).toBeInTheDocument();

        expect(
            screen.getByRole('button', {
                name: 'Gå videre til faktasteget',
            })
        ).toBeEnabled();

        expect(screen.getByLabelText('Vergetype')).toHaveValue(Vergetype.Advokat);
        expect(screen.getByLabelText('Begrunn endringene')).toHaveValue('');
        expect(screen.getByLabelText('Navn')).toHaveValue('Advokat Advokatesen');
        expect(screen.getByLabelText('Organisasjonsnummer')).toHaveValue('DummyOrg');
        expect(screen.queryByLabelText('Fødselsnummer')).not.toBeInTheDocument();
    });

    test('Vis utfylt - verge barn', async () => {
        setupMock({
            type: Vergetype.VergeForBarn,
            navn: 'Verge Vergesen',
            ident: '27106903129',
            begrunnelse: 'Verge er opprettet',
        });
        renderVergeContainer(lagBehandling({ harVerge: true }), {
            erStegBehandlet: (): boolean => true,
        });

        expect(screen.getByText('Verge')).toBeInTheDocument();
        expect(
            screen.queryByText('Automatisk vurdert. Verge er kopiert fra fagsystemet.')
        ).not.toBeInTheDocument();
        expect(
            await screen.findByRole('button', {
                name: 'Gå videre til faktasteget',
            })
        ).toBeEnabled();

        expect(screen.getByLabelText('Vergetype')).toHaveValue(Vergetype.VergeForBarn);
        expect(screen.getByLabelText('Begrunn endringene')).toHaveValue('Verge er opprettet');
        expect(screen.getByLabelText('Navn')).toHaveValue('Verge Vergesen');
        expect(screen.getByLabelText('Fødselsnummer')).toHaveValue('27106903129');
        expect(screen.queryByLabelText('Organisasjonsnummer')).not.toBeInTheDocument();
    });

    test('Vis utfylt - advokat - lesevisning', async () => {
        setupMock({
            type: Vergetype.Advokat,
            navn: 'Advokat Advokatesen',
            orgNr: 'DummyOrg',
            begrunnelse: 'Bruker har engasjert advokat',
        });

        renderVergeContainer(lagBehandling({ harVerge: true }), {
            erStegBehandlet: (): boolean => true,
            behandlingILesemodus: true,
        });

        expect(screen.getByText('Verge')).toBeInTheDocument();
        expect(
            screen.queryByText('Automatisk vurdert. Verge er kopiert fra fagsystemet.')
        ).not.toBeInTheDocument();
        expect(
            await screen.findByRole('button', {
                name: 'Gå videre til faktasteget',
            })
        ).toBeEnabled();

        expect(screen.getByText('Advokat/advokatfullmektig')).toBeInTheDocument();
        expect(screen.getByText('Bruker har engasjert advokat')).toBeInTheDocument();
        expect(screen.getByLabelText('Navn')).toHaveValue('Advokat Advokatesen');
        expect(screen.getByLabelText('Organisasjonsnummer')).toHaveValue('DummyOrg');
        expect(screen.queryByLabelText('Fødselsnummer')).not.toBeInTheDocument();
    });

    test('Vis utfylt - verge barn - autoutført - lesevisning', async () => {
        setupMock({
            type: Vergetype.VergeForBarn,
            navn: 'Verge Vergesen',
            ident: '27106903129',
            begrunnelse: '',
        });
        renderVergeContainer(lagBehandling({ harVerge: true }), {
            erStegBehandlet: (): boolean => true,
            behandlingILesemodus: true,
            erStegAutoutført: (): boolean => true,
        });

        expect(screen.getByText('Verge')).toBeInTheDocument();
        expect(
            await screen.findByText('Automatisk vurdert. Verge er kopiert fra fagsystemet.')
        ).toBeInTheDocument();

        expect(
            screen.getByRole('button', {
                name: 'Gå videre til faktasteget',
            })
        ).toBeEnabled();

        expect(screen.getByText('Verge for barn under 18 år')).toBeInTheDocument();
        expect(screen.getByLabelText('Navn')).toHaveValue('Verge Vergesen');
        expect(screen.getByLabelText('Begrunn endringene')).toHaveValue('');
        expect(screen.getByLabelText('Fødselsnummer')).toHaveValue('27106903129');
        expect(screen.queryByText('Organisasjonsnummer')).not.toBeInTheDocument();
    });
});
