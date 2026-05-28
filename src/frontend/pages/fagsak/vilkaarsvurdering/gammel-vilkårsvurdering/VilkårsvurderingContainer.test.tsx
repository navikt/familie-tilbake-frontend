import type { UserEvent } from '@testing-library/user-event';
import type { BehandlingApiHook } from '~/api/behandling';
import type { BehandlingDto } from '~/generated';
import type { Ressurs } from '~/typer/ressurs';
import type {
    VilkårsvurderingResponse,
    VilkårsvurderingPeriode,
} from '~/typer/tilbakekrevingstyper';

import { QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { vi } from 'vitest';

import { FagsakContext } from '~/context/FagsakContext';
import { Aktsomhet, HendelseType, Vilkårsresultat } from '~/kodeverk';
import { TestBehandlingProvider } from '~/testdata/behandlingContextFactory';
import { lagBehandling } from '~/testdata/behandlingFactory';
import { lagFagsak } from '~/testdata/fagsakFactory';
import {
    lagVilkårsvurderingPeriode,
    lagVilkårsvurderingResponse,
} from '~/testdata/vilkårsvurderingFactory';
import { createTestQueryClient } from '~/testutils/queryTestUtils';
import { RessursStatus } from '~/typer/ressurs';

import { VilkårsvurderingContainer } from './VilkårsvurderingContainer';
import { VilkårsvurderingProvider } from './VilkårsvurderingContext';

vi.setConfig({ testTimeout: 10000 });

const mockUseBehandlingApi = vi.fn();
vi.mock('~/api/behandling', () => ({
    useBehandlingApi: (): BehandlingApiHook => mockUseBehandlingApi(),
}));

const førstePeriode = '01.01.2020–31.03.2020';
const andrePeriode = '01.05.2020–30.06.2020';
const perioder: VilkårsvurderingPeriode[] = [
    lagVilkårsvurderingPeriode({
        begrunnelse: 'Begrunnelse vilkår 1',
        feilutbetaltBeløp: 1333,
        periode: {
            fom: '2020-01-01',
            tom: '2020-03-31',
        },
        hendelsestype: HendelseType.BosattIRiket,
    }),
    lagVilkårsvurderingPeriode({
        begrunnelse: 'Begrunnelse vilkår 2',
        feilutbetaltBeløp: 1333,
        periode: {
            fom: '2020-05-01',
            tom: '2020-06-30',
        },
        hendelsestype: HendelseType.BorMedSøker,
    }),
];

const setupUseBehandlingApiMock = (vilkårsvurdering: VilkårsvurderingResponse): void => {
    mockUseBehandlingApi.mockImplementation(() => ({
        gjerVilkårsvurderingKall: (): Promise<Ressurs<VilkårsvurderingResponse>> => {
            const ressurs: Ressurs<VilkårsvurderingResponse> = {
                status: RessursStatus.Suksess,
                data: vilkårsvurdering,
            };
            return Promise.resolve(ressurs);
        },
        sendInnVilkårsvurdering: (): Promise<Ressurs<string>> => {
            const ressurs: Ressurs<string> = {
                status: RessursStatus.Suksess,
                data: 'suksess',
            };
            return Promise.resolve(ressurs);
        },
    }));
};

const renderVilkårsvurderingContainer = (behandling: BehandlingDto): void => {
    const queryClient = createTestQueryClient();
    render(
        <QueryClientProvider client={queryClient}>
            <FagsakContext value={lagFagsak({ ytelsestype: 'BARNETRYGD' })}>
                <TestBehandlingProvider
                    behandling={behandling}
                    stateOverrides={{ harKravgrunnlag: true }}
                >
                    <VilkårsvurderingProvider>
                        <VilkårsvurderingContainer />
                    </VilkårsvurderingProvider>
                </TestBehandlingProvider>
            </FagsakContext>
        </QueryClientProvider>
    );
};

describe('VilkårsvurderingContainer', () => {
    let user: UserEvent;
    beforeEach(() => {
        user = userEvent.setup();
        vi.clearAllMocks();
        Element.prototype.scrollIntoView = vi.fn();
    });

    test('Totalbeløp under 4 rettsgebyr - ingen perioder har brukt 6.ledd', async () => {
        setupUseBehandlingApiMock(
            lagVilkårsvurderingResponse({
                perioder,
                kanUnnlates4xRettsgebyr: true,
            })
        );

        renderVilkårsvurderingContainer(lagBehandling());

        expect(await screen.findByText(førstePeriode, { selector: 'p' })).toBeInTheDocument();

        await user.type(
            screen.getByLabelText('Begrunn hvorfor du valgte vilkåret ovenfor'),
            'Begrunnelse vilkårene 1'
        );

        await user.click(
            screen.getByRole('button', {
                name: 'Neste periode',
            })
        );

        expect(screen.queryAllByText('Feltet må fylles ut')).toHaveLength(1);

        await user.click(
            screen.getByLabelText(
                'Mottaker forsto eller burde forstått at utbetalingen skyldtes en feil',
                {
                    selector: 'input',
                    exact: false,
                }
            )
        );

        await user.click(
            screen.getByRole('button', {
                name: 'Neste periode',
            })
        );
        expect(screen.queryAllByText('Feltet må fylles ut')).toHaveLength(2);

        await user.type(
            screen.getByLabelText('Begrunn hvorfor du valgte alternativet ovenfor'),
            'Begrunnelse aktsomhet 1'
        );
        await user.click(
            screen.getByLabelText('Mottaker burde forstått at utbetalingen skyldtes en feil')
        );

        expect(
            screen.getByText(
                'Totalbeløpet kan være under 4 ganger rettsgebyret (6. ledd). Skal det tilbakekreves?'
            )
        ).toBeInTheDocument();
        expect(
            screen.queryByText('Når 6. ledd anvendes må alle perioder behandles likt')
        ).not.toBeInTheDocument();

        await user.click(
            screen.getByRole('button', {
                name: 'Neste periode',
            })
        );
        expect(screen.queryAllByText('Feltet må fylles ut')).toHaveLength(1);

        await user.click(
            screen.getByRole('radio', {
                name: 'Nei',
            })
        );

        expect(
            screen.getByText('Når 6. ledd anvendes må alle perioder behandles likt')
        ).toBeInTheDocument();

        await user.click(
            screen.getByRole('button', {
                name: 'Neste periode',
            })
        );

        expect(screen.getByText(andrePeriode, { selector: 'p' })).toBeInTheDocument();

        await user.type(
            screen.getByLabelText('Begrunn hvorfor du valgte vilkåret ovenfor'),
            'Begrunnelse vilkårene 2'
        );
        await user.click(
            screen.getByLabelText(
                'Mottaker forsto eller burde forstått at utbetalingen skyldtes en feil',
                {
                    selector: 'input',
                    exact: false,
                }
            )
        );
        await user.type(
            screen.getByLabelText('Begrunn hvorfor du valgte alternativet ovenfor'),
            'Begrunnelse aktsomhet 2'
        );
        await user.click(
            screen.getByLabelText('Mottaker burde forstått at utbetalingen skyldtes en feil')
        );
        expect(
            screen.getByText(
                'Totalbeløpet kan være under 4 ganger rettsgebyret (6. ledd). Skal det tilbakekreves?'
            )
        ).toBeInTheDocument();
        await user.click(
            screen.getByRole('radio', {
                name: 'Ja',
            })
        );

        expect(screen.getByText('Begrunn resultatet av vurderingen ovenfor')).toBeInTheDocument();

        await user.type(
            screen.getByLabelText('Begrunn resultatet av vurderingen ovenfor'),
            'Begrunnelse særlige grunner 2'
        );
        await user.click(
            screen.getByLabelText('Graden av uaktsomhet hos den som kravet retter seg mot', {
                selector: 'input',
            })
        );
        await user.click(screen.getByTestId('harGrunnerTilReduksjon_Nei'));

        expect(screen.getByText('100%')).toBeInTheDocument();

        await user.click(
            screen.getByRole('button', {
                name: 'Gå videre til vedtakssteget',
            })
        );
        expect(screen.queryAllByText('Feltet må fylles ut')).toHaveLength(0);
        expect(
            screen.queryByText(
                'Totalbeløpet kan være under 4 rettsgebyr. Dersom 6.ledd skal anvendes for å frafalle tilbakekrevingen, må denne anvendes likt på alle periodene.'
            )
        ).toBeInTheDocument();
    });

    test('Vis og fyll ut perioder og send inn - god tro - bruker kopiering', async () => {
        setupUseBehandlingApiMock(lagVilkårsvurderingResponse({ perioder }));
        renderVilkårsvurderingContainer(lagBehandling());

        expect(await screen.findByText(førstePeriode, { selector: 'p' })).toBeInTheDocument();

        await user.type(
            screen.getByLabelText('Begrunn hvorfor du valgte vilkåret ovenfor'),
            'Begrunnelse1'
        );
        await user.click(
            screen.getByLabelText('Mottaker har mottatt beløpet i aktsom god tro', {
                selector: 'input',
                exact: false,
            })
        );
        await user.click(
            screen.getByRole('radio', {
                name: 'Nei',
            })
        );
        await user.type(
            screen.getByLabelText('Begrunn hvorfor beløpet ikke er i behold'),
            'Begrunnelse2'
        );

        await user.click(
            screen.getByRole('button', {
                name: 'Neste periode',
            })
        );

        expect(screen.getByText(andrePeriode)).toBeInTheDocument();
        await user.selectOptions(
            screen.getByRole('combobox', {
                name: 'Kopier vilkårsvurdering fra',
            }),
            førstePeriode
        );
        expect(screen.getByText('Er beløpet i behold?')).toBeInTheDocument();
        expect(screen.getByLabelText('Begrunn hvorfor du valgte vilkåret ovenfor')).toHaveValue(
            `${perioder[0].begrunnelse}Begrunnelse1`
        );
        expect(
            screen.getByLabelText('Mottaker har mottatt beløpet i aktsom god tro', {
                selector: 'input',
                exact: false,
            })
        ).toBeChecked();
        expect(
            screen.getByRole('radio', {
                name: 'Nei',
            })
        ).toBeChecked();
        expect(screen.getByLabelText('Begrunn hvorfor beløpet ikke er i behold')).toHaveValue(
            'Begrunnelse2'
        );

        const tilbakekrevdBeløp = screen.getByLabelText('Beløp som skal tilbakekreves');
        expect(tilbakekrevdBeløp).toHaveValue('0');

        await user.click(
            screen.getByRole('button', {
                name: 'Gå videre til vedtakssteget',
            })
        );
    });

    test('Vis utfylt - forstod/burde forstått - forsto', async () => {
        const vilkårsvurderingResponse = lagVilkårsvurderingResponse({
            perioder: [
                {
                    ...perioder[0],
                    vilkårsvurderingsresultatInfo: {
                        vilkårsvurderingsresultat: Vilkårsresultat.ForstoBurdeForstått,
                        aktsomhet: {
                            begrunnelse: 'Begrunnelse aktsomhet 1',
                            aktsomhet: Aktsomhet.Forsettlig,
                            særligeGrunner: [],
                        },
                        godTro: undefined,
                    },
                },
                {
                    ...perioder[1],
                    vilkårsvurderingsresultatInfo: {
                        vilkårsvurderingsresultat: Vilkårsresultat.GodTro,
                        godTro: {
                            begrunnelse: 'Begrunnelse god tro 2',
                            beløpErIBehold: false,
                        },
                    },
                },
            ],
        });
        setupUseBehandlingApiMock(vilkårsvurderingResponse);
        renderVilkårsvurderingContainer(lagBehandling());

        expect(await screen.findByText(førstePeriode, { selector: 'p' })).toBeInTheDocument();

        expect(screen.getByLabelText('Begrunn hvorfor du valgte vilkåret ovenfor')).toHaveValue(
            'Begrunnelse vilkår 1'
        );
        expect(
            screen.getByLabelText(
                'Mottaker forsto eller burde forstått at utbetalingen skyldtes en feil',
                {
                    selector: 'input',
                    exact: false,
                }
            )
        ).toBeChecked();
        expect(
            screen.getByLabelText('Begrunn hvorfor du valgte alternativet ovenfor')
        ).toHaveTextContent('Begrunnelse aktsomhet 1');
        expect(
            screen.getByLabelText('Mottaker forsto at utbetalingen skyldtes en feil')
        ).toBeChecked();

        expect(screen.getByTestId('skalDetTilleggesRenter_Nei')).toBeChecked();

        await user.click(
            screen.getByRole('button', {
                name: 'Suksess fra 01.05.2020 til 30.06.2020',
            })
        );

        expect(
            screen.getByText(andrePeriode, {
                selector: 'p',
            })
        ).toBeInTheDocument();

        expect(screen.getByLabelText('Begrunn hvorfor du valgte vilkåret ovenfor')).toHaveValue(
            'Begrunnelse vilkår 2'
        );
        expect(
            screen.getByLabelText('Mottaker har mottatt beløpet i aktsom god tro', {
                selector: 'input',
                exact: false,
            })
        ).toBeChecked();
        expect(screen.getByLabelText('Begrunn hvorfor beløpet ikke er i behold')).toHaveTextContent(
            'Begrunnelse god tro 2'
        );
        expect(screen.getByLabelText('Nei')).toBeChecked();
        const tilbakekrevdBeløp = screen.getByLabelText('Beløp som skal tilbakekreves');
        expect(tilbakekrevdBeløp).toHaveValue('0');
        await user.click(
            screen.getByRole('button', {
                name: 'Forrige periode',
            })
        );
    });

    test('Vis utfylt - forstod/burde forstått - forsto - lesevisning', async () => {
        setupUseBehandlingApiMock(
            lagVilkårsvurderingResponse({
                perioder: [
                    lagVilkårsvurderingPeriode({
                        ...perioder[0],
                        vilkårsvurderingsresultatInfo: {
                            vilkårsvurderingsresultat: Vilkårsresultat.ForstoBurdeForstått,
                            aktsomhet: {
                                begrunnelse: 'Begrunnelse aktsomhet 1',
                                aktsomhet: Aktsomhet.Forsettlig,
                                særligeGrunner: [],
                            },
                            godTro: undefined,
                        },
                    }),
                    lagVilkårsvurderingPeriode({
                        ...perioder[1],
                        vilkårsvurderingsresultatInfo: {
                            vilkårsvurderingsresultat: Vilkårsresultat.GodTro,
                            godTro: {
                                begrunnelse: 'Begrunnelse god tro 2',
                                beløpErIBehold: false,
                            },
                        },
                    }),
                ],
            })
        );

        renderVilkårsvurderingContainer(lagBehandling());

        expect(await screen.findByText(førstePeriode, { selector: 'p' })).toBeInTheDocument();

        expect(screen.getByText('Begrunnelse vilkår 1')).toBeInTheDocument();
        expect(
            screen.getByLabelText(
                'Mottaker forsto eller burde forstått at utbetalingen skyldtes en feil',
                {
                    selector: 'input',
                    exact: false,
                }
            )
        ).toBeChecked();
        expect(
            screen.getByLabelText('Mottaker har mottatt beløpet i aktsom god tro', {
                selector: 'input',
                exact: false,
            })
        ).not.toBeChecked();

        expect(screen.getByText('Begrunnelse aktsomhet 1')).toBeInTheDocument();
        expect(
            screen.getByLabelText('Mottaker forsto at utbetalingen skyldtes en feil', {
                selector: 'input',
            })
        ).toBeChecked();
        expect(
            screen.getByLabelText('Mottaker må ha forstått at utbetalingen skyldtes en feil', {
                selector: 'input',
                exact: false,
            })
        ).not.toBeChecked();

        expect(
            screen.getByRole('button', {
                name: 'Suksess fra 01.01.2020 til 31.03.2020',
            })
        ).toBeInTheDocument();
        expect(
            screen.getByRole('button', {
                name: 'Suksess fra 01.05.2020 til 30.06.2020',
            })
        ).toBeInTheDocument();

        await user.click(
            screen.getByRole('button', {
                name: 'Suksess fra 01.05.2020 til 30.06.2020',
            })
        );

        expect(screen.getByText(andrePeriode, { selector: 'p' })).toBeInTheDocument();
        expect(screen.getByText('Begrunnelse vilkår 2')).toBeInTheDocument();
        expect(
            screen.getByLabelText('Mottaker har mottatt beløpet i aktsom god tro', {
                selector: 'input',
                exact: false,
            })
        ).toBeChecked();
        expect(
            screen.getByLabelText(
                'Mottaker forsto eller burde forstått at utbetalingen skyldtes en feil',
                {
                    selector: 'input',
                    exact: false,
                }
            )
        ).not.toBeChecked();
        expect(screen.getByText('Begrunnelse god tro 2')).toBeInTheDocument();
        expect(
            screen.getByLabelText('Nei', {
                selector: 'input',
                exact: true,
            })
        ).toBeChecked();
        expect(
            screen.getByLabelText('Ja', {
                selector: 'input',
                exact: true,
            })
        ).not.toBeChecked();

        expect(
            screen.getByRole('button', {
                name: 'Suksess fra 01.05.2020 til 30.06.2020',
            })
        ).toBeInTheDocument();
        expect(
            screen.getByRole('button', {
                name: 'Suksess fra 01.05.2020 til 30.06.2020',
            })
        ).toBeInTheDocument();
    });

    test('Periode med udefinert resultat er ikke behandlet', async () => {
        const vilkårsvurderingResponse = lagVilkårsvurderingResponse({
            perioder: [
                lagVilkårsvurderingPeriode({
                    ...perioder[0],
                    vilkårsvurderingsresultatInfo: {
                        vilkårsvurderingsresultat: Vilkårsresultat.Udefinert,
                    },
                }),
            ],
        });
        setupUseBehandlingApiMock(vilkårsvurderingResponse);
        renderVilkårsvurderingContainer(lagBehandling());

        expect(
            await screen.findByRole('button', {
                name: 'Nøytral fra 01.01.2020 til 31.03.2020',
            })
        ).toBeInTheDocument();

        expect(screen.getByText(førstePeriode, { selector: 'p' })).toBeInTheDocument();
        expect(
            screen.getByLabelText(
                'Mottaker forsto eller burde forstått at utbetalingen skyldtes en feil',
                {
                    selector: 'input',
                    exact: false,
                }
            )
        ).not.toBeChecked();
        expect(
            screen.getByLabelText(
                'Mottaker har forårsaket feilutbetalingen ved forsett eller uaktsomt gitt feilaktige opplysninger',
                {
                    selector: 'input',
                    exact: false,
                }
            )
        ).not.toBeChecked();
        expect(
            screen.getByLabelText(
                'Mottaker har forårsaket feilutbetalingen ved forsett eller uaktsomt gitt mangelfulle opplysninger',
                {
                    selector: 'input',
                    exact: false,
                }
            )
        ).not.toBeChecked();
        expect(
            screen.getByLabelText('Mottaker har mottatt beløpet i aktsom god tro', {
                selector: 'input',
                exact: false,
            })
        ).not.toBeChecked();
    });
});
