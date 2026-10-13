import type { AxiosResponse } from 'axios';
import type { Vilkaar, VilkaarsvurderingValg } from '@/generated-new';

import { QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { type UserEvent, userEvent } from '@testing-library/user-event';
import { AxiosHeaders } from 'axios';
import { Suspense } from 'react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { vi } from 'vitest';

import { FagsakContext } from '@/context/FagsakContext';
import { behandlingVilkaarsvurderingQueryKey } from '@/generated-new/@tanstack/react-query.gen';
import {
    behandlingLagreVilkaarsvurdering,
    behandlingVilkaarsvurdering,
} from '@/generated-new/sdk.gen';
import { TestBehandlingProvider } from '@/testdata/behandlingContextFactory';
import { lagFagsak } from '@/testdata/fagsakFactory';
import { createTestQueryClient } from '@/testutils/queryTestUtils';

import { Vilkårsvurdering } from './Vilkårsvurdering';

vi.mock('@/generated-new/sdk.gen', async importOriginal => ({
    ...(await importOriginal<typeof import('@/generated-new/sdk.gen')>()),
    behandlingVilkaarsvurdering: vi.fn(),
    behandlingLagreVilkaarsvurdering: vi.fn(),
}));

const hentVilkårsvurderingMock = vi.mocked(behandlingVilkaarsvurdering);
const lagreVilkårsvurderingMock = vi.mocked(behandlingLagreVilkaarsvurdering);

const BEHANDLING_ID = 'uuid-1';
const PERIODE_ID = 'periode-1';

const tidligereValg: VilkaarsvurderingValg = {
    vurdering: 'forsto_eller_burde_forstått',
    forståelse: {
        forståelse: 'forsto',
        begrunnelse: 'Mottaker forsto feilen',
        unnlatelse: {
            unnlatelse: 'skalUnnlates',
            begrunnelse: 'Nav skal la være å kreve beløpet tilbake',
        },
    },
};

const nyttValg: VilkaarsvurderingValg = {
    vurdering: 'forårsaket_av_mottaker',
    aktsomhet: {
        aktsomhet: 'forsettlig',
        begrunnelse: 'Mottakeren ga bevisst feil opplysninger',
    },
};

const lagVilkår = (valg: VilkaarsvurderingValg): Vilkaar => ({
    ferdigvurdert: false,
    momenterSærligeGrunner: [],
    momenterReduksjonGodTro: [],
    erUnder4xRettsgebyr: false,
    vilkårsperioder: [
        {
            feilutbetaltBeløp: 10000,
            delresultat: 'FULL_TILBAKEKREVING',
            fakta: { rettsligGrunnlag: [] },
            simulertBeløp: 10000,
            vilkårsvurdering: {
                id: PERIODE_ID,
                fom: '2023-01-01',
                tom: '2023-12-31',
                delbarePerioder: [],
                valg,
                tilbakeført: 'NyttKravgrunnlag',
            },
        },
    ],
});

const lagSvar = <T,>(data: T): AxiosResponse<T> => ({
    data,
    status: 200,
    statusText: 'OK',
    headers: {},
    config: { headers: new AxiosHeaders() },
});

const renderVilkårsvurdering = (): void => {
    const queryClient = createTestQueryClient();
    queryClient.setQueryData(
        behandlingVilkaarsvurderingQueryKey({ path: { behandlingId: BEHANDLING_ID } }),
        lagVilkår(tidligereValg)
    );

    const router = createMemoryRouter(
        [
            {
                path: '*',
                element: (
                    <FagsakContext value={lagFagsak()}>
                        <QueryClientProvider client={queryClient}>
                            <TestBehandlingProvider>
                                <Suspense fallback="Laster...">
                                    <Vilkårsvurdering />
                                </Suspense>
                            </TestBehandlingProvider>
                        </QueryClientProvider>
                    </FagsakContext>
                ),
            },
        ],
        { initialEntries: [`/vilkaarsvurdering?periode=${PERIODE_ID}`] }
    );
    render(<RouterProvider router={router} />);
};

const periodeknapp = (): HTMLElement =>
    screen.getByRole('button', { name: /Periode 01\.01\.2023 til 31\.12\.2023/ });

describe('Vilkårsvurdering', () => {
    let user: UserEvent;

    beforeEach(() => {
        user = userEvent.setup();
        hentVilkårsvurderingMock.mockReset();
        lagreVilkårsvurderingMock.mockReset();
    });

    test('viser perioden som ikke vurdert når saksbehandler starter vurderingen på nytt', async () => {
        renderVilkårsvurdering();

        expect(periodeknapp()).toHaveAccessibleName(/Vurdering: Forsto\./);

        await user.click(await screen.findByRole('button', { name: 'Start vurdering på nytt' }));

        expect(periodeknapp()).toHaveAccessibleName(/Vurdering: Ikke vurdert\./);
    });

    test('beholder ikke vurdert til ny vurdering er hentet fra serveren etter lagring', async () => {
        let svarMedNyVurdering: (svar: AxiosResponse<Vilkaar>) => void = () => undefined;
        hentVilkårsvurderingMock.mockReturnValue(
            new Promise<AxiosResponse<Vilkaar>>(resolve => {
                svarMedNyVurdering = resolve;
            })
        );
        lagreVilkårsvurderingMock.mockResolvedValue(
            lagSvar(lagVilkår(nyttValg).vilkårsperioder[0].vilkårsvurdering)
        );
        renderVilkårsvurdering();

        await user.click(await screen.findByRole('button', { name: 'Start vurdering på nytt' }));
        await user.click(
            screen.getByRole('radio', { name: /forsettlig eller uaktsomt gi feilaktige/ })
        );
        await user.click(screen.getByRole('radio', { name: 'Forsett' }));
        await user.type(
            screen.getByRole('textbox', {
                name: 'Begrunn hvorfor du vurderer at mottakeren har handlet med forsett',
            }),
            'Mottakeren ga bevisst feil opplysninger'
        );
        await user.click(screen.getByRole('button', { name: /Lagre/ }));

        await vi.waitUntil(() => hentVilkårsvurderingMock.mock.calls.length > 0);
        expect(periodeknapp()).toHaveAccessibleName(/Vurdering: Ikke vurdert\./);

        svarMedNyVurdering(lagSvar(lagVilkår(nyttValg)));

        expect(
            await screen.findByRole('button', { name: /Vurdering: Forsett\./ })
        ).toBeInTheDocument();
    });
});
