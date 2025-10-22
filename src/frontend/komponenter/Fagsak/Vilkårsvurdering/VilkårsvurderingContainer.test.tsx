import type { BehandlingApiHook } from '../../../api/behandling';
import type { Http } from '../../../api/http/HttpProvider';
import type { TogglesHook } from '../../../context/TogglesContext';
import type { Behandling } from '../../../typer/behandling';
import type { Fagsak } from '../../../typer/fagsak';
import type { Ressurs } from '../../../typer/ressurs';
import type {
    VilkårsvurderingResponse,
    VilkårsvurderingPeriode,
} from '../../../typer/tilbakekrevingstyper';
import type { UseMutationResult } from '@tanstack/react-query';
import type { RenderResult } from '@testing-library/react';
import type { UserEvent } from '@testing-library/user-event';
import type { NavigateFunction } from 'react-router';

import { render, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { mock } from 'jest-mock-extended';
import * as React from 'react';

import VilkårsvurderingContainer from './VilkårsvurderingContainer';
import { VilkårsvurderingProvider } from './VilkårsvurderingContext';
import { BehandlingProvider } from '../../../context/BehandlingContext';
import { Aktsomhet, HendelseType, Vilkårsresultat, Ytelsetype } from '../../../kodeverk';
import { lagBehandling } from '../../../testdata/behandlingFactory';
import { lagFagsak } from '../../../testdata/fagsakFactory';
import {
    lagVilkårsvurderingPeriode,
    lagVilkårsvurderingResponse,
} from '../../../testdata/vilkårsvurderingFactory';
import { RessursStatus } from '../../../typer/ressurs';

const mockUseHttp = jest.fn();
jest.mock('../../../api/http/HttpProvider', () => ({
    useHttp: (): Http => mockUseHttp(),
}));

const mockUseBehandlingApi = jest.fn();
jest.mock('../../../api/behandling', () => ({
    useBehandlingApi: (): BehandlingApiHook => mockUseBehandlingApi(),
}));

const mockUseToggles = jest.fn();
jest.mock('../../../context/TogglesContext', () => ({
    useToggles: (): TogglesHook => mockUseToggles(),
}));

jest.mock('react-router', () => ({
    ...jest.requireActual('react-router'),
    useNavigate: (): NavigateFunction => jest.fn(),
}));

jest.mock('@tanstack/react-query', () => {
    return {
        useMutation: jest.fn(({ mutationFn, onSuccess }) => {
            const mutateAsync = async (behandlingId: string): Promise<UseMutationResult> => {
                const result = await mutationFn(behandlingId);
                if (onSuccess && result?.status === RessursStatus.Suksess) {
                    await onSuccess(result);
                }
                return result;
            };

            return {
                mutate: mutateAsync,
                mutateAsync: mutateAsync,
            };
        }),
        useQueryClient: jest.fn(() => ({
            invalidateQueries: jest.fn(),
        })),
    };
});

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
            const ressurs = mock<Ressurs<VilkårsvurderingResponse>>({
                status: RessursStatus.Suksess,
                data: vilkårsvurdering,
            });
            return Promise.resolve(ressurs);
        },
        sendInnVilkårsvurdering: (): Promise<Ressurs<string>> => {
            const ressurs = mock<Ressurs<string>>({
                status: RessursStatus.Suksess,
                data: 'suksess',
            });
            return Promise.resolve(ressurs);
        },
    }));
};

const setupMocks = (): void => {
    mockUseHttp.mockImplementation(() => ({
        request: (): Promise<Ressurs<Behandling>> => {
            return Promise.resolve({
                status: RessursStatus.Suksess,
                data: lagBehandling(),
            });
        },
    }));
    mockUseToggles.mockImplementation(() => ({
        toggles: {},
    }));
};

const renderVilkårsvurderingContainer = (behandling: Behandling, fagsak: Fagsak): RenderResult =>
    render(
        <BehandlingProvider>
            <VilkårsvurderingProvider behandling={behandling} fagsak={fagsak}>
                <VilkårsvurderingContainer behandling={behandling} fagsak={fagsak} />
            </VilkårsvurderingProvider>
        </BehandlingProvider>
    );

describe('VilkårsvurderingContainer', () => {
    let user: UserEvent;
    beforeEach(() => {
        user = userEvent.setup();
        jest.clearAllMocks();
        setupMocks();
        Element.prototype.scrollIntoView = jest.fn();
    });

    test('Totalbeløp under 4 rettsgebyr - ingen perioder har brukt 6.ledd', async () => {
        setupUseBehandlingApiMock(lagVilkårsvurderingResponse({ perioder }));

        const { getByText, getByRole, getByLabelText, getByTestId, queryAllByText, queryByText } =
            renderVilkårsvurderingContainer(lagBehandling(), lagFagsak());

        await waitFor(() => {
            expect(getByText(førstePeriode)).toBeInTheDocument();
        });

        expect(getByText('3 måneder')).toBeInTheDocument();
        expect(getByText('1 333')).toBeInTheDocument();
        expect(getByText('Bosatt i riket')).toBeInTheDocument();
        expect(
            getByText('Vilkårene for tilbakekreving', {
                selector: 'h2',
            })
        ).toBeInTheDocument();

        await user.type(getByLabelText('Vilkårene for tilbakekreving'), 'Begrunnelse vilkårene 1');

        await user.click(
            getByRole('button', {
                name: 'Neste periode',
            })
        );

        expect(queryAllByText('Feltet må fylles ut')).toHaveLength(1);

        await user.click(
            getByLabelText(
                'Ja, mottaker forsto eller burde forstått at utbetalingen skyldtes en feil',
                {
                    selector: 'input',
                    exact: false,
                }
            )
        );

        expect(getByText('Aktsomhet')).toBeInTheDocument();

        await user.click(
            getByRole('button', {
                name: 'Neste periode',
            })
        );
        expect(queryAllByText('Feltet må fylles ut')).toHaveLength(2);

        await user.type(
            getByLabelText(
                'Vurder hvorfor mottaker burde forstått, må ha forstått eller forsto at utbetalingen skyldtes en feil'
            ),
            'Begrunnelse aktsomhet 1'
        );
        await user.click(getByLabelText('Burde ha forstått'));

        expect(
            getByText('Totalbeløpet er under 4 rettsgebyr (6. ledd). Skal det tilbakekreves?')
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

        await user.type(getByLabelText('Vilkårene for tilbakekreving'), 'Begrunnelse vilkårene 2');
        await user.click(
            getByLabelText(
                'Ja, mottaker forsto eller burde forstått at utbetalingen skyldtes en feil',
                {
                    selector: 'input',
                    exact: false,
                }
            )
        );
        await user.type(
            getByLabelText(
                'Vurder hvorfor mottaker burde forstått, må ha forstått eller forsto at utbetalingen skyldtes en feil'
            ),
            'Begrunnelse aktsomhet 2'
        );
        await user.click(getByLabelText('Burde ha forstått'));
        expect(
            getByText('Totalbeløpet er under 4 rettsgebyr (6. ledd). Skal det tilbakekreves?')
        ).toBeInTheDocument();
        await user.click(
            getByRole('radio', {
                name: 'Ja',
            })
        );

        expect(
            getByText('Vurder særlige grunner du har vektlagt for resultatet')
        ).toBeInTheDocument();

        await user.type(
            getByLabelText('Vurder særlige grunner du har vektlagt for resultatet'),
            'Begrunnelse særlige grunner 2'
        );
        await user.click(
            getByLabelText('Graden av uaktsomhet hos den kravet retter seg mot', {
                selector: 'input',
            })
        );
        await user.click(getByTestId('harGrunnerTilReduksjon_Nei'));

        expect(getByText('100 %')).toBeInTheDocument();

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
        const { getByText, getByRole, getByLabelText } = renderVilkårsvurderingContainer(
            lagBehandling(),
            lagFagsak()
        );

        await waitFor(() => {
            expect(getByText(førstePeriode)).toBeInTheDocument();
        });

        await user.type(getByLabelText('Vilkårene for tilbakekreving'), 'Begrunnelse1');
        await user.click(
            getByLabelText('Nei, mottaker har mottatt beløpet i god tro', {
                selector: 'input',
                exact: false,
            })
        );
        await user.type(getByLabelText('Vurder om beløpet er i behold'), 'Begrunnelse2');
        await user.click(
            getByRole('radio', {
                name: 'Nei',
            })
        );

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
        expect(getByLabelText('Vilkårene for tilbakekreving')).toHaveValue(
            `${perioder[0].begrunnelse}Begrunnelse1`
        );
        expect(
            getByLabelText('Nei, mottaker har mottatt beløpet i god tro', {
                selector: 'input',
                exact: false,
            })
        ).toBeChecked();
        expect(getByLabelText('Vurder om beløpet er i behold')).toHaveValue('Begrunnelse2');
        expect(
            getByRole('radio', {
                name: 'Nei',
            })
        ).toBeChecked();
        expect(getByText('Ingen tilbakekreving')).toBeInTheDocument();

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
                            aktsomhet: Aktsomhet.Forsett,
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
        const { getByText, getByRole, getByLabelText, queryByLabelText } =
            renderVilkårsvurderingContainer(
                lagBehandling(),
                lagFagsak({ ytelsestype: Ytelsetype.Barnetrygd })
            );

        await waitFor(() => {
            expect(getByText(førstePeriode, { selector: 'label' })).toBeInTheDocument();
        });

        expect(getByLabelText('Vilkårene for tilbakekreving')).toHaveValue('Begrunnelse vilkår 1');
        expect(
            getByLabelText(
                'Ja, mottaker forsto eller burde forstått at utbetalingen skyldtes en feil',
                {
                    selector: 'input',
                    exact: false,
                }
            )
        ).toBeChecked();
        expect(
            getByLabelText(
                'Vurder hvorfor mottaker burde forstått, må ha forstått eller forsto at utbetalingen skyldtes en feil'
            )
        ).toHaveTextContent('Begrunnelse aktsomhet 1');
        expect(getByLabelText('Forsto')).toBeChecked();

        expect(queryByLabelText('Nei')).not.toBeInTheDocument();
        expect(getByText('Nei')).toBeInTheDocument();

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

        expect(getByLabelText('Vilkårene for tilbakekreving')).toHaveValue('Begrunnelse vilkår 2');
        expect(
            getByLabelText('Nei, mottaker har mottatt beløpet i god tro', {
                selector: 'input',
                exact: false,
            })
        ).toBeChecked();
        expect(getByLabelText('Vurder om beløpet er i behold')).toHaveTextContent(
            'Begrunnelse god tro 2'
        );
        expect(getByLabelText('Nei')).toBeChecked();
        expect(getByText('Ingen tilbakekreving')).toBeInTheDocument();

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
                                aktsomhet: Aktsomhet.Forsett,
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

        const { getByText, getByRole, getByLabelText } = renderVilkårsvurderingContainer(
            lagBehandling(),
            lagFagsak()
        );

        await waitFor(() => {
            expect(getByText(førstePeriode, { selector: 'label' })).toBeInTheDocument();
        });

        expect(getByText('Begrunnelse vilkår 1')).toBeInTheDocument();
        expect(
            getByLabelText(
                'Ja, mottaker forsto eller burde forstått at utbetalingen skyldtes en feil',
                {
                    selector: 'input',
                    exact: false,
                }
            )
        ).toBeChecked();
        expect(
            getByLabelText('Nei, mottaker har mottatt beløpet i god tro', {
                selector: 'input',
                exact: false,
            })
        ).not.toBeChecked();

        expect(getByText('Begrunnelse aktsomhet 1')).toBeInTheDocument();
        expect(
            getByLabelText('Forsto', {
                selector: 'input',
            })
        ).toBeChecked();
        expect(
            getByLabelText('Må ha forstått', {
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
            getByLabelText('Nei, mottaker har mottatt beløpet i god tro', {
                selector: 'input',
                exact: false,
            })
        ).toBeChecked();
        expect(
            getByLabelText(
                'Ja, mottaker forsto eller burde forstått at utbetalingen skyldtes en feil',
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
        const { getByText, getByRole, getByLabelText } = renderVilkårsvurderingContainer(
            lagBehandling(),
            lagFagsak()
        );

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
                'Ja, mottaker forsto eller burde forstått at utbetalingen skyldtes en feil',
                {
                    selector: 'input',
                    exact: false,
                }
            )
        ).not.toBeChecked();
        expect(
            getByLabelText(
                'Ja, mottaker har forårsaket feilutbetalingen ved forsett eller uaktsomt gitt feilaktige opplysninger',
                {
                    selector: 'input',
                    exact: false,
                }
            )
        ).not.toBeChecked();
        expect(
            getByLabelText(
                'Ja, mottaker har forårsaket feilutbetalingen ved forsett eller uaktsomt gitt mangelfulle opplysninger',
                {
                    selector: 'input',
                    exact: false,
                }
            )
        ).not.toBeChecked();
        expect(
            getByLabelText('Nei, mottaker har mottatt beløpet i god tro', {
                selector: 'input',
                exact: false,
            })
        ).not.toBeChecked();
    });
});
