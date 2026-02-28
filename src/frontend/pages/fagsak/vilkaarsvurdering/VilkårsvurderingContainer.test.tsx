import type { RenderResult } from '@testing-library/react';
import type { UserEvent } from '@testing-library/user-event';
import type { BehandlingApiHook } from '~/api/behandling';
import type { BehandlingDto } from '~/generated';
import type { Ressurs } from '~/typer/ressurs';
import type {
    VilkårsvurderingResponse,
    VilkårsvurderingPeriode,
} from '~/typer/tilbakekrevingstyper';

import { QueryClientProvider } from '@tanstack/react-query';
import { render, waitFor } from '@testing-library/react';
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

const førstePeriode = '01.01.2020 - 31.03.2020';
const andrePeriode = '01.05.2020 - 30.06.2020';
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

const renderVilkårsvurderingContainer = (behandling: BehandlingDto): RenderResult => {
    const queryClient = createTestQueryClient();
    return render(
        <QueryClientProvider client={queryClient}>
            <FagsakContext.Provider value={lagFagsak({ ytelsestype: 'BARNETRYGD' })}>
                <TestBehandlingProvider
                    behandling={behandling}
                    stateOverrides={{ harKravgrunnlag: true }}
                >
                    <VilkårsvurderingProvider>
                        <VilkårsvurderingContainer />
                    </VilkårsvurderingProvider>
                </TestBehandlingProvider>
            </FagsakContext.Provider>
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
        setupUseBehandlingApiMock(lagVilkårsvurderingResponse({ perioder }));

        const { getByText, getByRole, getByLabelText, getByTestId, queryAllByText, queryByText } =
            renderVilkårsvurderingContainer(lagBehandling());

        await waitFor(() => {
            expect(getByText(førstePeriode)).toBeInTheDocument();
        });

        expect(getByText('3 måneder')).toBeInTheDocument();
        expect(getByText('1 333')).toBeInTheDocument();
        expect(getByText('Bosatt i riket')).toBeInTheDocument();

        await user.type(
            getByLabelText('Begrunn hvorfor du valgte vilkåret ovenfor'),
            'Begrunnelse vilkårene 1'
        );

        await user.click(
            getByRole('button', {
                name: 'Neste periode',
            })
        );

        await waitFor(() => {
            expect(queryAllByText('Feltet må fylles ut')).toHaveLength(1);
        });

        await user.click(
            getByLabelText(
                'Mottaker forsto eller burde forstått at utbetalingen skyldtes en feil',
                {
                    selector: 'input',
                    exact: false,
                }
            )
        );

        await user.click(
            getByRole('button', {
                name: 'Neste periode',
            })
        );
        expect(queryAllByText('Feltet må fylles ut')).toHaveLength(2);

        await user.type(
            getByLabelText('Begrunn hvorfor du valgte alternativet ovenfor'),
            'Begrunnelse aktsomhet 1'
        );
        await user.click(
            getByLabelText('Mottaker burde forstått at utbetalingen skyldtes en feil')
        );

        expect(
            getByText(
                'Totalbeløpet er under 4 ganger rettsgebyret (6. ledd). Skal det tilbakekreves?'
            )
        ).toBeInTheDocument();
        expect(
            queryByText('Når 6. ledd anvendes må alle perioder behandles likt')
        ).not.toBeInTheDocument();

        await user.click(
            getByRole('button', {
                name: 'Neste periode',
            })
        );
        expect(queryAllByText('Feltet må fylles ut')).toHaveLength(1);

        await user.click(
            getByRole('radio', {
                name: 'Nei',
            })
        );

        expect(
            queryByText('Når 6. ledd anvendes må alle perioder behandles likt')
        ).toBeInTheDocument();

        await user.click(
            getByRole('button', {
                name: 'Neste periode',
            })
        );

        expect(getByText(andrePeriode)).toBeInTheDocument();
        expect(getByText('2 måneder')).toBeInTheDocument();
        expect(getByText('1 333')).toBeInTheDocument();
        expect(getByText('Bor med søker')).toBeInTheDocument();

        await user.type(
            getByLabelText('Begrunn hvorfor du valgte vilkåret ovenfor'),
            'Begrunnelse vilkårene 2'
        );
        await user.click(
            getByLabelText(
                'Mottaker forsto eller burde forstått at utbetalingen skyldtes en feil',
                {
                    selector: 'input',
                    exact: false,
                }
            )
        );
        await user.type(
            getByLabelText('Begrunn hvorfor du valgte alternativet ovenfor'),
            'Begrunnelse aktsomhet 2'
        );
        await user.click(
            getByLabelText('Mottaker burde forstått at utbetalingen skyldtes en feil')
        );
        expect(
            getByText(
                'Totalbeløpet er under 4 ganger rettsgebyret (6. ledd). Skal det tilbakekreves?'
            )
        ).toBeInTheDocument();
        await user.click(
            getByRole('radio', {
                name: 'Ja',
            })
        );

        expect(getByText('Begrunn resultatet av vurderingen ovenfor')).toBeInTheDocument();

        await user.type(
            getByLabelText('Begrunn resultatet av vurderingen ovenfor'),
            'Begrunnelse særlige grunner 2'
        );
        await user.click(
            getByLabelText('Graden av uaktsomhet hos den som kravet retter seg mot', {
                selector: 'input',
            })
        );
        await user.click(getByTestId('harGrunnerTilReduksjon_Nei'));

        expect(getByText('100%')).toBeInTheDocument();

        await user.click(
            getByRole('button', {
                name: 'Gå videre til vedtakssteget',
            })
        );
        expect(queryAllByText('Feltet må fylles ut')).toHaveLength(0);
        expect(
            queryByText(
                'Totalbeløpet er under 4 rettsgebyr. Dersom 6.ledd skal anvendes for å frafalle tilbakekrevingen, må denne anvendes likt på alle periodene.'
            )
        ).toBeInTheDocument();
    });

    test('Vis og fyll ut perioder og send inn - god tro - bruker kopiering', async () => {
        setupUseBehandlingApiMock(lagVilkårsvurderingResponse({ perioder }));
        const { getByText, getByRole, getByLabelText } =
            renderVilkårsvurderingContainer(lagBehandling());

        await waitFor(() => {
            expect(getByText(førstePeriode)).toBeInTheDocument();
        });

        await user.type(
            getByLabelText('Begrunn hvorfor du valgte vilkåret ovenfor'),
            'Begrunnelse1'
        );
        await user.click(
            getByLabelText('Mottaker har mottatt beløpet i aktsom god tro', {
                selector: 'input',
                exact: false,
            })
        );
        await user.click(
            getByRole('radio', {
                name: 'Nei',
            })
        );
        await user.type(getByLabelText('Begrunn hvorfor beløpet ikke er i behold'), 'Begrunnelse2');

        await user.click(
            getByRole('button', {
                name: 'Neste periode',
            })
        );

        expect(getByText(andrePeriode)).toBeInTheDocument();
        await user.selectOptions(
            getByRole('combobox', {
                name: 'Kopier vilkårsvurdering fra',
            }),
            førstePeriode
        );
        expect(getByText('Er beløpet i behold?')).toBeInTheDocument();
        expect(getByLabelText('Begrunn hvorfor du valgte vilkåret ovenfor')).toHaveValue(
            `${perioder[0].begrunnelse}Begrunnelse1`
        );
        expect(
            getByLabelText('Mottaker har mottatt beløpet i aktsom god tro', {
                selector: 'input',
                exact: false,
            })
        ).toBeChecked();
        expect(
            getByRole('radio', {
                name: 'Nei',
            })
        ).toBeChecked();
        expect(getByLabelText('Begrunn hvorfor beløpet ikke er i behold')).toHaveValue(
            'Begrunnelse2'
        );

        const tilbakekrevdBeløp = getByLabelText('Beløp som skal tilbakekreves');
        expect(tilbakekrevdBeløp).toHaveValue('0');

        await user.click(
            getByRole('button', {
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
        const { getByText, getByRole, getByLabelText, getByTestId } =
            renderVilkårsvurderingContainer(lagBehandling());

        await waitFor(() => {
            expect(getByText(førstePeriode, { selector: 'label' })).toBeInTheDocument();
        });

        expect(getByLabelText('Begrunn hvorfor du valgte vilkåret ovenfor')).toHaveValue(
            'Begrunnelse vilkår 1'
        );
        expect(
            getByLabelText(
                'Mottaker forsto eller burde forstått at utbetalingen skyldtes en feil',
                {
                    selector: 'input',
                    exact: false,
                }
            )
        ).toBeChecked();
        expect(getByLabelText('Begrunn hvorfor du valgte alternativet ovenfor')).toHaveTextContent(
            'Begrunnelse aktsomhet 1'
        );
        expect(getByLabelText('Mottaker forsto at utbetalingen skyldtes en feil')).toBeChecked();

        expect(getByTestId('skalDetTilleggesRenter_Nei')).toBeChecked();

        await user.click(
            getByRole('button', {
                name: 'Suksess fra 01.05.2020 til 30.06.2020',
            })
        );

        expect(
            getByText(andrePeriode, {
                selector: 'label',
            })
        ).toBeInTheDocument();

        expect(getByLabelText('Begrunn hvorfor du valgte vilkåret ovenfor')).toHaveValue(
            'Begrunnelse vilkår 2'
        );
        expect(
            getByLabelText('Mottaker har mottatt beløpet i aktsom god tro', {
                selector: 'input',
                exact: false,
            })
        ).toBeChecked();
        expect(getByLabelText('Begrunn hvorfor beløpet ikke er i behold')).toHaveTextContent(
            'Begrunnelse god tro 2'
        );
        expect(getByLabelText('Nei')).toBeChecked();
        const tilbakekrevdBeløp = getByLabelText('Beløp som skal tilbakekreves');
        expect(tilbakekrevdBeløp).toHaveValue('0');
        await user.click(
            getByRole('button', {
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

        const { getByText, getByRole, getByLabelText } =
            renderVilkårsvurderingContainer(lagBehandling());

        await waitFor(() => {
            expect(getByText(førstePeriode, { selector: 'label' })).toBeInTheDocument();
        });

        expect(getByText('Begrunnelse vilkår 1')).toBeInTheDocument();
        expect(
            getByLabelText(
                'Mottaker forsto eller burde forstått at utbetalingen skyldtes en feil',
                {
                    selector: 'input',
                    exact: false,
                }
            )
        ).toBeChecked();
        expect(
            getByLabelText('Mottaker har mottatt beløpet i aktsom god tro', {
                selector: 'input',
                exact: false,
            })
        ).not.toBeChecked();

        expect(getByText('Begrunnelse aktsomhet 1')).toBeInTheDocument();
        expect(
            getByLabelText('Mottaker forsto at utbetalingen skyldtes en feil', {
                selector: 'input',
            })
        ).toBeChecked();
        expect(
            getByLabelText('Mottaker må ha forstått at utbetalingen skyldtes en feil', {
                selector: 'input',
                exact: false,
            })
        ).not.toBeChecked();

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

        await user.click(
            getByRole('button', {
                name: 'Suksess fra 01.05.2020 til 30.06.2020',
            })
        );

        expect(getByText(andrePeriode, { selector: 'label' })).toBeInTheDocument();
        expect(getByText('Begrunnelse vilkår 2')).toBeInTheDocument();
        expect(
            getByLabelText('Mottaker har mottatt beløpet i aktsom god tro', {
                selector: 'input',
                exact: false,
            })
        ).toBeChecked();
        expect(
            getByLabelText(
                'Mottaker forsto eller burde forstått at utbetalingen skyldtes en feil',
                {
                    selector: 'input',
                    exact: false,
                }
            )
        ).not.toBeChecked();
        expect(getByText('Begrunnelse god tro 2')).toBeInTheDocument();
        expect(
            getByLabelText('Nei', {
                selector: 'input',
                exact: true,
            })
        ).toBeChecked();
        expect(
            getByLabelText('Ja', {
                selector: 'input',
                exact: true,
            })
        ).not.toBeChecked();

        expect(
            getByRole('button', {
                name: 'Suksess fra 01.05.2020 til 30.06.2020',
            })
        ).toBeInTheDocument();
        expect(
            getByRole('button', {
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
        const { getByText, getByRole, getByLabelText } =
            renderVilkårsvurderingContainer(lagBehandling());

        await waitFor(() => {
            expect(
                getByRole('button', {
                    name: 'Advarsel fra 01.01.2020 til 31.03.2020',
                })
            ).toBeInTheDocument();
        });

        expect(getByText(førstePeriode, { selector: 'label' })).toBeInTheDocument();
        expect(
            getByLabelText(
                'Mottaker forsto eller burde forstått at utbetalingen skyldtes en feil',
                {
                    selector: 'input',
                    exact: false,
                }
            )
        ).not.toBeChecked();
        expect(
            getByLabelText(
                'Mottaker har forårsaket feilutbetalingen ved forsett eller uaktsomt gitt feilaktige opplysninger',
                {
                    selector: 'input',
                    exact: false,
                }
            )
        ).not.toBeChecked();
        expect(
            getByLabelText(
                'Mottaker har forårsaket feilutbetalingen ved forsett eller uaktsomt gitt mangelfulle opplysninger',
                {
                    selector: 'input',
                    exact: false,
                }
            )
        ).not.toBeChecked();
        expect(
            getByLabelText('Mottaker har mottatt beløpet i aktsom god tro', {
                selector: 'input',
                exact: false,
            })
        ).not.toBeChecked();
    });
});
