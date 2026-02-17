import type { BehandlingApiHook } from '../../../api/behandling';
import type { BehandlingDto } from '../../../generated';
import type { Ressurs } from '../../../typer/ressurs';
import type { ForeldelseResponse } from '../../../typer/tilbakekrevingstyper';
import type { RenderResult } from '@testing-library/react';
import type { UserEvent } from '@testing-library/user-event';

import { QueryClientProvider } from '@tanstack/react-query';
import { render, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import * as React from 'react';
import { vi } from 'vitest';

import { ForeldelseContainer } from './ForeldelseContainer';
import { ForeldelseProvider } from './ForeldelseContext';
import { FagsakContext } from '../../../context/FagsakContext';
import { Foreldelsevurdering } from '../../../kodeverk';
import { TestBehandlingProvider } from '../../../testdata/behandlingContextFactory';
import { lagBehandling } from '../../../testdata/behandlingFactory';
import { lagFagsak } from '../../../testdata/fagsakFactory';
import { lagForeldelsePeriode, lagForeldelseResponse } from '../../../testdata/foreldelseFactory';
import { createTestQueryClient } from '../../../testutils/queryTestUtils';
import { RessursStatus } from '../../../typer/ressurs';

const mockUseBehandlingApi = vi.fn();
vi.mock('../../../api/behandling', () => ({
    useBehandlingApi: (): BehandlingApiHook => mockUseBehandlingApi(),
}));

const renderForeldelseContainer = (
    behandling: BehandlingDto,
    behandlet: boolean = false,
    lesemodus: boolean = false,
    autoutført: boolean = false
): RenderResult => {
    const queryClient = createTestQueryClient();
    return render(
        <QueryClientProvider client={queryClient}>
            <FagsakContext.Provider value={lagFagsak()}>
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
            </FagsakContext.Provider>
        </QueryClientProvider>
    );
};

const foreldetPerioder = [
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

const setupMock = (foreldelse?: ForeldelseResponse): void => {
    if (foreldelse) {
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
    }
};

describe('ForeldelseContainer', () => {
    let user: UserEvent;
    beforeEach(() => {
        user = userEvent.setup();
        vi.clearAllMocks();
    });

    test('Vis og fyll ut perioder og send inn', async () => {
        setupMock(lagForeldelseResponse({ foreldetPerioder }));
        const { getByText, getByRole, getByLabelText, queryAllByText, queryByText } =
            renderForeldelseContainer(lagBehandling());

        await waitFor(() => {
            expect(getByText('Foreldelse')).toBeInTheDocument();
            expect(getByText('Detaljer for valgt periode')).toBeInTheDocument();
        });

        expect(getByText('01.01.2020 - 31.03.2020')).toBeInTheDocument();
        expect(getByText('3 måneder')).toBeInTheDocument();
        expect(getByText('1 333')).toBeInTheDocument();

        expect(
            getByRole('button', {
                name: 'Gå videre til vilkårsvurderingssteget',
            })
        ).toBeDisabled();

        await user.click(
            getByRole('button', {
                name: 'Bekreft periode',
            })
        );
        await waitFor(() => {
            expect(queryAllByText('Feltet må fylles ut')).toHaveLength(2);
        });
        await user.type(getByLabelText('Vurdering'), 'Begrunnelse 1');
        await user.click(getByLabelText('Perioden er ikke foreldet'));

        await user.click(
            getByRole('button', {
                name: 'Bekreft periode',
            })
        );
        await waitFor(() => {
            expect(queryAllByText('Feltet må fylles ut')).toHaveLength(0);
        });

        expect(
            getByRole('button', {
                name: 'Gå videre til vilkårsvurderingssteget',
            })
        ).toBeDisabled();

        expect(getByText('01.05.2020 - 30.06.2020')).toBeInTheDocument();
        expect(getByText('2 måneder')).toBeInTheDocument();
        expect(getByText('1 333')).toBeInTheDocument();

        await user.click(
            getByRole('button', {
                name: 'Bekreft periode',
            })
        );
        await waitFor(() => {
            expect(queryAllByText('Feltet må fylles ut')).toHaveLength(2);
        });

        await user.type(getByLabelText('Vurdering'), 'Begrunnelse 2');
        await user.click(getByLabelText('Perioden er ikke foreldet'));

        await user.click(
            getByRole('button', {
                name: 'Bekreft periode',
            })
        );
        await waitFor(() => {
            expect(queryAllByText('Feltet må fylles ut')).toHaveLength(0);
        });

        expect(queryByText('Detaljer for valgt periode')).not.toBeInTheDocument();
        expect(
            getByRole('button', {
                name: 'Gå videre til vilkårsvurderingssteget',
            })
        ).toBeEnabled();

        await user.click(
            getByRole('button', {
                name: 'Gå videre til vilkårsvurderingssteget',
            })
        );
    });

    test('Vis utfylt', async () => {
        const foreldelseResponse = lagForeldelseResponse({
            foreldetPerioder: [
                {
                    ...foreldetPerioder[0],
                    begrunnelse: 'Begrunnelse 1',
                    foreldelsesvurderingstype: Foreldelsevurdering.Foreldet,
                    foreldelsesfrist: '2021-01-01',
                },
                {
                    ...foreldetPerioder[1],
                    begrunnelse: 'Begrunnelse 2',
                    foreldelsesvurderingstype: Foreldelsevurdering.Tilleggsfrist,
                    foreldelsesfrist: '2021-01-01',
                    oppdagelsesdato: '2020-12-24',
                },
            ],
        });
        setupMock(foreldelseResponse);

        const { getByText, getByRole, getByLabelText, queryByText } = renderForeldelseContainer(
            lagBehandling(),
            true
        );

        await waitFor(() => {
            expect(getByText('Foreldelse')).toBeInTheDocument();
            expect(queryByText('Detaljer for valgt periode')).not.toBeInTheDocument();
            expect(
                getByRole('button', {
                    name: 'Gå videre til vilkårsvurderingssteget',
                })
            ).toBeEnabled();
        });

        await waitFor(() => {
            user.click(
                getByRole('button', {
                    name: 'Suksess fra 01.01.2020 til 31.03.2020',
                })
            );
        });

        expect(
            getByRole('button', {
                name: 'Gå videre til vilkårsvurderingssteget',
            })
        ).toBeEnabled();

        await waitFor(() => {
            expect(queryByText('Detaljer for valgt periode')).toBeInTheDocument();
        });

        expect(getByText('01.01.2020 - 31.03.2020')).toBeInTheDocument();
        expect(getByLabelText('Vurdering')).toHaveValue('Begrunnelse 1');
        expect(getByLabelText('Perioden er foreldet')).toBeChecked();
        expect(
            getByLabelText('Foreldelsesfrist', {
                selector: 'input',
                exact: false,
            })
        ).toHaveValue('01.01.2021');

        await user.click(
            getByRole('button', {
                name: 'Suksess fra 01.05.2020 til 30.06.2020',
            })
        );

        expect(getByText('01.05.2020 - 30.06.2020')).toBeInTheDocument();
        expect(getByLabelText('Vurdering')).toHaveValue('Begrunnelse 2');
        expect(
            getByLabelText('Perioden er ikke foreldet, regel om tilleggsfrist (10 år) benyttes')
        ).toBeChecked();
        expect(
            getByLabelText('Foreldelsesfrist', {
                selector: 'input',
                exact: false,
            })
        ).toHaveValue('01.01.2021');
        expect(getByLabelText('Dato for når feilutbetaling ble oppdaget')).toHaveValue(
            '24.12.2020'
        );

        expect(
            getByRole('button', {
                name: 'Gå videre til vilkårsvurderingssteget',
            })
        ).toBeEnabled();
    });

    test('Vis utfylt - lesevisning', async () => {
        setupMock({
            foreldetPerioder: [
                {
                    ...foreldetPerioder[0],
                    begrunnelse: 'Begrunnelse 1',
                    foreldelsesvurderingstype: Foreldelsevurdering.Foreldet,
                    foreldelsesfrist: '2021-01-01',
                },
                {
                    ...foreldetPerioder[1],
                    begrunnelse: 'Begrunnelse 2',
                    foreldelsesvurderingstype: Foreldelsevurdering.Tilleggsfrist,
                    foreldelsesfrist: '2021-01-01',
                    oppdagelsesdato: '2020-12-24',
                },
            ],
        });

        const { getByText, getByRole, getByLabelText } = renderForeldelseContainer(
            lagBehandling({ status: 'FATTER_VEDTAK' }),
            true,
            true
        );

        await waitFor(() => {
            // Tittel skal alltid være synlig
            expect(getByText('Foreldelse', { selector: 'h1' })).toBeInTheDocument();
            // Første periode sitt endringspanel skal være åpnet by default i lesevisning, sjekker at riktige verdier er satt
            expect(getByText('Detaljer for valgt periode', { selector: 'h2' })).toBeInTheDocument();
        });
        expect(getByText('01.01.2020 - 31.03.2020', { selector: 'label' })).toBeInTheDocument();
        expect(getByText('Begrunnelse 1')).toBeInTheDocument();
        expect(
            getByLabelText('Perioden er foreldet', {
                selector: 'input',
                exact: false,
            })
        ).toBeChecked();
        expect(
            getByLabelText('Perioden er ikke foreldet, regel om tilleggsfrist (10 år) benyttes', {
                selector: 'input',
                exact: false,
            })
        ).not.toBeChecked();
        expect(getByLabelText('Foreldelsesfrist')).toHaveValue('01.01.2021');

        // Alle tidslinje knappene skal alltid være synlige
        expect(
            getByRole('button', {
                name: 'Suksess fra 01.01.2020 til 31.03.2020',
            })
        ).toBeInTheDocument();
        expect(
            getByRole('button', {
                name: 'Suksess fra 01.05.2020 til 30.06.2020',
            })
        ).toBeInTheDocument();

        // Knapper for navigering mellom faner skal alltid være synlige og enabled
        expect(
            getByRole('button', {
                name: 'Gå tilbake til faktasteget',
            })
        ).toBeEnabled();
        expect(
            getByRole('button', {
                name: 'Gå videre til vilkårsvurderingssteget',
            })
        ).toBeEnabled();

        await user.click(
            getByRole('button', {
                name: 'Suksess fra 01.05.2020 til 30.06.2020',
            })
        );

        // Tittel skal alltid være synlig
        await waitFor(() => {
            expect(getByText('Foreldelse', { selector: 'h1' })).toBeInTheDocument();
        });

        // Andre periode sitt endringspanel skal nå være åpnet, sjekker at riktige verdier er satt
        expect(getByText('Detaljer for valgt periode', { selector: 'h2' })).toBeInTheDocument();
        expect(getByText('01.05.2020 - 30.06.2020', { selector: 'label' })).toBeInTheDocument();
        expect(getByText('Begrunnelse 2')).toBeInTheDocument();
        expect(
            getByLabelText('Perioden er foreldet', {
                selector: 'input',
                exact: false,
            })
        ).not.toBeChecked();
        expect(
            getByLabelText('Perioden er ikke foreldet, regel om tilleggsfrist (10 år) benyttes', {
                selector: 'input',
                exact: false,
            })
        ).toBeChecked();
        expect(getByLabelText('Dato for når feilutbetaling ble oppdaget')).toHaveValue(
            '24.12.2020'
        );
        expect(getByLabelText('Foreldelsesfrist')).toHaveValue('01.01.2021');

        expect(
            getByRole('button', {
                name: 'Suksess fra 01.01.2020 til 31.03.2020',
            })
        ).toBeInTheDocument();
        expect(
            getByRole('button', {
                name: 'Suksess fra 01.05.2020 til 30.06.2020',
            })
        ).toBeInTheDocument();

        expect(
            getByRole('button', {
                name: 'Gå tilbake til faktasteget',
            })
        ).toBeEnabled();
        expect(
            getByRole('button', {
                name: 'Gå videre til vilkårsvurderingssteget',
            })
        ).toBeEnabled();
    });

    test('Vis autoutført', async () => {
        setupMock();
        const { getByText } = renderForeldelseContainer(lagBehandling(), false, false, true);

        await waitFor(() => {
            expect(getByText('Foreldelse')).toBeInTheDocument();
        });
        expect(getByText('Perioden er ikke foreldet')).toBeInTheDocument();
    });
});
