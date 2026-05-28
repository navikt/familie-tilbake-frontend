import type { UserEvent } from '@testing-library/user-event';
import type { BehandlingApiHook } from '~/api/behandling';
import type { BehandlingDto } from '~/generated';
import type { Ressurs } from '~/typer/ressurs';
import type { ForeldelsePeriode, ForeldelseResponse } from '~/typer/tilbakekrevingstyper';

import { QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { vi } from 'vitest';

import { FagsakContext } from '~/context/FagsakContext';
import { TestBehandlingProvider } from '~/testdata/behandlingContextFactory';
import { lagBehandling } from '~/testdata/behandlingFactory';
import { lagFagsak } from '~/testdata/fagsakFactory';
import { lagForeldelsePeriode, lagForeldelseResponse } from '~/testdata/foreldelseFactory';
import { createTestQueryClient } from '~/testutils/queryTestUtils';
import { RessursStatus } from '~/typer/ressurs';

import { ForeldelseContainer } from './ForeldelseContainer';
import { ForeldelseProvider } from './ForeldelseContext';

const mockUseBehandlingApi = vi.fn();
vi.mock('~/api/behandling', () => ({
    useBehandlingApi: (): BehandlingApiHook => mockUseBehandlingApi(),
}));

const renderForeldelseContainer = (
    behandling: BehandlingDto,
    behandlet: boolean = false,
    lesemodus: boolean = false,
    autoutført: boolean = false
): void => {
    const queryClient = createTestQueryClient();
    render(
        <QueryClientProvider client={queryClient}>
            <FagsakContext value={lagFagsak()}>
                <TestBehandlingProvider
                    behandling={behandling}
                    stateOverrides={{
                        behandlingILesemodus: lesemodus,
                        erStegBehandlet: (): boolean => behandlet,
                        erStegAutoutført: (): boolean => autoutført,
                    }}
                >
                    <ForeldelseProvider>
                        <ForeldelseContainer />
                    </ForeldelseProvider>
                </TestBehandlingProvider>
            </FagsakContext>
        </QueryClientProvider>
    );
};

const foreldelsesperioder = [
    lagForeldelsePeriode({
        feilutbetaltBeløp: 1333,
        periode: {
            fom: '2020-01-01',
            tom: '2020-03-31',
        },
    }),
    lagForeldelsePeriode({
        feilutbetaltBeløp: 1333,
        periode: {
            fom: '2020-05-01',
            tom: '2020-06-30',
        },
    }),
];

const setupMock = (foreldelse: ForeldelseResponse): void => {
    mockUseBehandlingApi.mockImplementation(() => ({
        gjerForeldelseKall: (): Promise<Ressurs<ForeldelseResponse>> => {
            const ressurs: Ressurs<ForeldelseResponse> = {
                status: RessursStatus.Suksess,
                data: foreldelse,
            };
            return Promise.resolve(ressurs);
        },
        sendInnForeldelse: (): Promise<Ressurs<string>> => {
            const ressurs: Ressurs<string> = {
                status: RessursStatus.Suksess,
                data: 'suksess',
            };
            return Promise.resolve(ressurs);
        },
    }));
};

describe('ForeldelseContainer', () => {
    let user: UserEvent;
    beforeEach(() => {
        user = userEvent.setup();
        vi.clearAllMocks();
    });

    test('Vis og fyll ut perioder og send inn', async () => {
        setupMock(lagForeldelseResponse({ foreldetPerioder: foreldelsesperioder }));
        renderForeldelseContainer(lagBehandling());

        expect(screen.getByText('Foreldelse')).toBeInTheDocument();
        expect(await screen.findByText('Detaljer for valgt periode')).toBeInTheDocument();

        expect(screen.getByText('01.01.2020–31.03.2020')).toBeInTheDocument();
        expect(screen.getByText('3 måneder')).toBeInTheDocument();
        expect(screen.getByText('1 333')).toBeInTheDocument();

        expect(
            screen.getByRole('button', {
                name: 'Gå videre til vilkårsvurderingssteget',
            })
        ).toBeDisabled();

        await user.click(
            screen.getByRole('button', {
                name: 'Bekreft periode',
            })
        );

        expect(screen.getAllByText('Feltet må fylles ut')).toHaveLength(2);

        await user.type(screen.getByLabelText('Begrunn valget over'), 'Begrunnelse 1');
        await user.click(screen.getByLabelText('Nei, perioden er ikke foreldet'));

        await user.click(
            screen.getByRole('button', {
                name: 'Bekreft periode',
            })
        );
        expect(screen.queryAllByText('Feltet må fylles ut')).toHaveLength(0);

        expect(
            screen.getByRole('button', {
                name: 'Lagre og gå videre til vilkårsvurderingssteget',
            })
        ).toBeDisabled();

        expect(screen.getByText('01.05.2020–30.06.2020')).toBeInTheDocument();
        expect(screen.getByText('2 måneder')).toBeInTheDocument();
        expect(screen.getByText('1 333')).toBeInTheDocument();

        await user.click(
            screen.getByRole('button', {
                name: 'Bekreft periode',
            })
        );

        expect(screen.getAllByText('Feltet må fylles ut')).toHaveLength(2);

        await user.type(screen.getByLabelText('Begrunn valget over'), 'Begrunnelse 2');
        await user.click(screen.getByLabelText('Nei, perioden er ikke foreldet'));

        await user.click(
            screen.getByRole('button', {
                name: 'Bekreft periode',
            })
        );
        expect(screen.queryAllByText('Feltet må fylles ut')).toHaveLength(0);

        expect(screen.queryByText('Detaljer for valgt periode')).not.toBeInTheDocument();
        expect(
            screen.getByRole('button', {
                name: 'Lagre og gå videre til vilkårsvurderingssteget',
            })
        ).toBeEnabled();

        await user.click(
            screen.getByRole('button', {
                name: 'Lagre og gå videre til vilkårsvurderingssteget',
            })
        );
    });

    test('Vis utfylt', async () => {
        const foreldelseResponse = lagForeldelseResponse({
            foreldetPerioder: [
                {
                    ...foreldelsesperioder[0],
                    begrunnelse: 'Begrunnelse 1',
                    foreldelsesvurderingstype: 'FORELDET',
                    foreldelsesfrist: '2021-01-01',
                },
                {
                    ...foreldelsesperioder[1],
                    begrunnelse: 'Begrunnelse 2',
                    foreldelsesvurderingstype: 'TILLEGGSFRIST',
                    foreldelsesfrist: '2021-01-01',
                    oppdagelsesdato: '2020-12-24',
                },
            ],
        });
        setupMock(foreldelseResponse);

        renderForeldelseContainer(lagBehandling(), true);

        expect(screen.getByText('Foreldelse')).toBeInTheDocument();
        expect(screen.queryByText('Detaljer for valgt periode')).not.toBeInTheDocument();
        expect(
            screen.getByRole('button', {
                name: 'Gå videre til vilkårsvurderingssteget',
            })
        ).toBeEnabled();

        await user.click(
            await screen.findByRole('button', {
                name: 'Advarsel fra 01.01.2020 til 31.03.2020',
            })
        );

        expect(
            screen.getByRole('button', {
                name: 'Gå videre til vilkårsvurderingssteget',
            })
        ).toBeEnabled();

        expect(screen.getByText('Detaljer for valgt periode')).toBeInTheDocument();

        expect(screen.getByText('01.01.2020–31.03.2020')).toBeInTheDocument();
        expect(screen.getByLabelText('Begrunn valget over')).toHaveValue('Begrunnelse 1');
        expect(screen.getByLabelText('Ja, perioden er foreldet')).toBeChecked();
        expect(
            screen.getByLabelText('Foreldelsesfrist', {
                selector: 'input',
                exact: false,
            })
        ).toHaveValue('01.01.2021');

        await user.click(
            screen.getByRole('button', {
                name: 'Suksess fra 01.05.2020 til 30.06.2020',
            })
        );

        expect(screen.getByText('01.05.2020–30.06.2020')).toBeInTheDocument();
        expect(screen.getByLabelText('Begrunn valget over')).toHaveValue('Begrunnelse 2');
        expect(
            screen.getByLabelText(
                'Nei, perioden er ikke foreldet. Tilleggsfristen på 10 år gjelder'
            )
        ).toBeChecked();
        expect(
            screen.getByLabelText('Foreldelsesfrist', {
                selector: 'input',
                exact: false,
            })
        ).toHaveValue('01.01.2021');
        expect(screen.getByLabelText('Dato for når feilutbetaling ble oppdaget')).toHaveValue(
            '24.12.2020'
        );

        expect(
            screen.getByRole('button', {
                name: 'Gå videre til vilkårsvurderingssteget',
            })
        ).toBeEnabled();
    });

    test('Vis utfylt - lesevisning', async () => {
        setupMock({
            foreldetPerioder: [
                {
                    ...foreldelsesperioder[0],
                    begrunnelse: 'Begrunnelse 1',
                    foreldelsesvurderingstype: 'FORELDET',
                    foreldelsesfrist: '2021-01-01',
                },
                {
                    ...foreldelsesperioder[1],
                    begrunnelse: 'Begrunnelse 2',
                    foreldelsesvurderingstype: 'TILLEGGSFRIST',
                    foreldelsesfrist: '2021-01-01',
                    oppdagelsesdato: '2020-12-24',
                },
            ],
        });

        renderForeldelseContainer(lagBehandling({ status: 'FATTER_VEDTAK' }), true, true);

        expect(screen.getByText('Foreldelse', { selector: 'h1' })).toBeInTheDocument();

        expect(
            await screen.findByText('Detaljer for valgt periode', { selector: 'h2' })
        ).toBeInTheDocument();

        expect(screen.getByText('01.01.2020–31.03.2020')).toBeInTheDocument();
        expect(screen.getByText('Begrunnelse 1')).toBeInTheDocument();
        expect(
            screen.getByLabelText('Perioden er foreldet', {
                selector: 'input',
                exact: false,
            })
        ).toBeChecked();
        expect(
            screen.getByLabelText(
                'Nei, perioden er ikke foreldet. Tilleggsfristen på 10 år gjelder',
                {
                    selector: 'input',
                    exact: false,
                }
            )
        ).not.toBeChecked();
        expect(screen.getByLabelText('Foreldelsesfrist')).toHaveValue('01.01.2021');

        // Alle tidslinje knappene skal alltid være synlige
        expect(
            screen.getByRole('button', {
                name: 'Advarsel fra 01.01.2020 til 31.03.2020',
            })
        ).toBeInTheDocument();
        expect(
            screen.getByRole('button', {
                name: 'Suksess fra 01.05.2020 til 30.06.2020',
            })
        ).toBeInTheDocument();

        // Knapper for navigering mellom faner skal alltid være synlige og enabled
        expect(
            screen.getByRole('button', {
                name: 'Gå tilbake til faktasteget',
            })
        ).toBeEnabled();
        expect(
            screen.getByRole('button', {
                name: 'Gå videre til vilkårsvurderingssteget',
            })
        ).toBeEnabled();

        await user.click(
            screen.getByRole('button', {
                name: 'Suksess fra 01.05.2020 til 30.06.2020',
            })
        );

        expect(screen.getByText('Foreldelse', { selector: 'h1' })).toBeInTheDocument();

        // Andre periode sitt endringspanel skal nå være åpnet, sjekker at riktige verdier er satt
        expect(
            screen.getByText('Detaljer for valgt periode', { selector: 'h2' })
        ).toBeInTheDocument();
        expect(screen.getByText('01.05.2020–30.06.2020')).toBeInTheDocument();
        expect(screen.getByText('Begrunnelse 2')).toBeInTheDocument();
        expect(
            screen.getByLabelText('Perioden er foreldet', {
                selector: 'input',
                exact: false,
            })
        ).not.toBeChecked();
        expect(
            screen.getByLabelText(
                'Nei, perioden er ikke foreldet. Tilleggsfristen på 10 år gjelder',
                {
                    selector: 'input',
                    exact: false,
                }
            )
        ).toBeChecked();
        expect(screen.getByLabelText('Dato for når feilutbetaling ble oppdaget')).toHaveValue(
            '24.12.2020'
        );
        expect(screen.getByLabelText('Foreldelsesfrist')).toHaveValue('01.01.2021');

        expect(
            screen.getByRole('button', {
                name: 'Advarsel fra 01.01.2020 til 31.03.2020',
            })
        ).toBeInTheDocument();
        expect(
            screen.getByRole('button', {
                name: 'Suksess fra 01.05.2020 til 30.06.2020',
            })
        ).toBeInTheDocument();

        expect(
            screen.getByRole('button', {
                name: 'Gå tilbake til faktasteget',
            })
        ).toBeEnabled();
        expect(
            screen.getByRole('button', {
                name: 'Gå videre til vilkårsvurderingssteget',
            })
        ).toBeEnabled();
    });

    test('Vis autoutført', async () => {
        setupMock(lagForeldelseResponse({ foreldetPerioder: [] }));
        renderForeldelseContainer(lagBehandling(), false, false, true);

        expect(screen.getByText('Foreldelse')).toBeInTheDocument();
        expect(
            screen.getByText(
                'Perioden blir automatisk vurdert dersom det er mer enn 6 måneder til den er foreldet.'
            )
        ).toBeInTheDocument();
    });

    describe('Knappetekst på neste/forrige', () => {
        const ikkeForeldetPeriode = {
            ...foreldelsesperioder[0],
            begrunnelse: 'Begrunnelse 1',
            foreldelsesvurderingstype: 'IKKE_FORELDET',
        } satisfies ForeldelsePeriode;

        test('Autoutført steg uten vurdering viser Neste/Forrige', async () => {
            setupMock(lagForeldelseResponse({ foreldetPerioder: [] }));
            renderForeldelseContainer(lagBehandling(), false, false, true);

            expect(
                screen.getByRole('button', {
                    name: 'Gå videre til vilkårsvurderingssteget',
                })
            ).toBeInTheDocument();

            expect(
                screen.getByRole('button', { name: 'Gå tilbake til faktasteget' })
            ).toBeInTheDocument();
        });

        test('Uvurdert steg viser Lagre-tekst når bruker vurderer en periode', async () => {
            setupMock(lagForeldelseResponse({ foreldetPerioder: [foreldelsesperioder[0]] }));
            renderForeldelseContainer(lagBehandling(), false);

            expect(await screen.findByLabelText('Begrunn valget over')).toBeInTheDocument();

            await user.type(screen.getByLabelText('Begrunn valget over'), 'Begrunnelse');
            await user.click(screen.getByLabelText('Nei, perioden er ikke foreldet'));
            await user.click(screen.getByRole('button', { name: 'Bekreft periode' }));

            expect(
                screen.getByRole('button', {
                    name: 'Lagre og gå videre til vilkårsvurderingssteget',
                })
            ).toBeInTheDocument();
            expect(
                screen.getByRole('button', { name: 'Lagre og gå tilbake til faktasteget' })
            ).toBeInTheDocument();
        });

        test('Vurdert steg med vurdert periode uten endringer viser Neste/Forrige', async () => {
            setupMock(lagForeldelseResponse({ foreldetPerioder: [ikkeForeldetPeriode] }));
            renderForeldelseContainer(lagBehandling(), true);

            expect(await screen.findByText('Foreldelse')).toBeInTheDocument();

            expect(
                screen.getByRole('button', {
                    name: 'Gå videre til vilkårsvurderingssteget',
                })
            ).toBeInTheDocument();
            expect(
                screen.getByRole('button', { name: 'Gå tilbake til faktasteget' })
            ).toBeInTheDocument();
        });
    });
});
