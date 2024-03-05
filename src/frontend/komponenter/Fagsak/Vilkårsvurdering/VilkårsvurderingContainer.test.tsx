import * as React from 'react';

import { act, render, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { mock } from 'jest-mock-extended';

import { type Ressurs, RessursStatus } from '@navikt/familie-typer';

import { FeilutbetalingVilkårsvurderingProvider } from './FeilutbetalingVilkårsvurderingContext';
import VilkårsvurderingContainer from './VilkårsvurderingContainer';
import { useBehandlingApi } from '../../../api/behandling';
import { useBehandling } from '../../../context/BehandlingContext';
import { Aktsomhet, HendelseType, Vilkårsresultat, Ytelsetype } from '../../../kodeverk';
import { IBehandling } from '../../../typer/behandling';
import { IFagsak } from '../../../typer/fagsak';
import {
    IFeilutbetalingVilkårsvurdering,
    VilkårsvurderingPeriode,
} from '../../../typer/feilutbetalingtyper';

jest.setTimeout(25000);

jest.mock('@navikt/familie-http', () => {
    return {
        useHttp: () => ({
            request: () => jest.fn(),
        }),
    };
});

jest.mock('../../../context/BehandlingContext', () => ({
    useBehandling: jest.fn(),
}));

jest.mock('../../../api/behandling', () => ({
    useBehandlingApi: jest.fn(),
}));

describe('Tester: VilkårsvurderingContainer', () => {
    const perioder: VilkårsvurderingPeriode[] = [
        {
            feilutbetaltBeløp: 1333,
            periode: {
                fom: '2020-01-01',
                tom: '2020-03-31',
            },
            hendelsestype: HendelseType.BOSATT_I_RIKET,
            foreldet: false,
            begrunnelse: undefined,
        },
        {
            feilutbetaltBeløp: 1333,
            periode: {
                fom: '2020-05-01',
                tom: '2020-06-30',
            },
            hendelsestype: HendelseType.BOR_MED_SØKER,
            foreldet: false,
            begrunnelse: undefined,
        },
    ];
    const feilutbetalingVilkårsvurdering: IFeilutbetalingVilkårsvurdering = {
        perioder: perioder,
        rettsgebyr: 1199,
    };

    const setupMock = (
        behandlet: boolean,
        lesevisning: boolean,
        autoutført: boolean,
        vilkårsvurdering?: IFeilutbetalingVilkårsvurdering
    ) => {
        if (vilkårsvurdering) {
            // @ts-ignore
            useBehandlingApi.mockImplementation(() => ({
                gjerFeilutbetalingVilkårsvurderingKall: () => {
                    const ressurs = mock<Ressurs<IFeilutbetalingVilkårsvurdering>>({
                        status: RessursStatus.SUKSESS,
                        data: vilkårsvurdering,
                    });
                    return Promise.resolve(ressurs);
                },
                sendInnFeilutbetalingVilkårsvurdering: () => {
                    const ressurs = mock<Ressurs<string>>({
                        status: RessursStatus.SUKSESS,
                        data: 'suksess',
                    });
                    return Promise.resolve(ressurs);
                },
            }));
        }
        // @ts-ignore
        useBehandling.mockImplementation(() => ({
            erStegBehandlet: () => behandlet,
            erStegAutoutført: () => autoutført,
            visVenteModal: false,
            behandlingILesemodus: lesevisning,
            hentBehandlingMedBehandlingId: jest.fn(),
        }));
    };

    test('- totalbeløp under 4 rettsgebyr - alle perioder har ikke brukt 6.ledd', async () => {
        const user = userEvent.setup();
        setupMock(false, false, false, feilutbetalingVilkårsvurdering);
        const behandling = mock<IBehandling>();
        const fagsak = mock<IFagsak>();
        fagsak.ytelsestype = Ytelsetype.BARNETILSYN;

        const { getByText, getByRole, getByLabelText, getByTestId, queryAllByText, queryByText } =
            render(
                <FeilutbetalingVilkårsvurderingProvider behandling={behandling} fagsak={fagsak}>
                    <VilkårsvurderingContainer behandling={behandling} fagsak={fagsak} />
                </FeilutbetalingVilkårsvurderingProvider>
            );

        await waitFor(async () => {
            expect(getByText('Tilbakekreving')).toBeTruthy();
            expect(getByText('Detaljer for valgt periode')).toBeTruthy();
        });

        expect(getByText('01.01.2020 - 31.03.2020')).toBeTruthy();
        expect(getByText('3 måneder')).toBeTruthy();
        expect(getByText('1 333')).toBeTruthy();
        expect(getByText('Bosatt i riket')).toBeTruthy();
        expect(
            getByText('Vilkårene for tilbakekreving', {
                selector: 'h2',
            })
        ).toBeTruthy();

        expect(
            getByRole('button', {
                name: 'Bekreft og fortsett',
            })
        ).toBeDisabled();

        await act(() =>
            user.click(
                getByRole('button', {
                    name: 'Bekreft',
                })
            )
        );

        expect(queryAllByText('Feltet må fylles ut')).toHaveLength(2);

        await act(() =>
            user.type(getByLabelText('Vilkårene for tilbakekreving'), 'Begrunnelse vilkårene 1')
        );
        await act(() =>
            user.click(
                getByLabelText(
                    'Ja, mottaker forsto eller burde forstått at utbetalingen skyldtes en feil',
                    {
                        selector: 'input',
                        exact: false,
                    }
                )
            )
        );

        expect(getByText('Aktsomhet')).toBeTruthy();

        await act(() =>
            user.click(
                getByRole('button', {
                    name: 'Bekreft',
                })
            )
        );
        expect(queryAllByText('Feltet må fylles ut')).toHaveLength(2);

        await act(() =>
            user.type(
                getByLabelText(
                    'Vurder hvorfor mottaker burde forstått, må ha forstått eller forsto at utbetalingen skyldtes en feil'
                ),
                'Begrunnelse aktsomhet 1'
            )
        );
        await act(() => user.click(getByLabelText('Burde ha forstått')));

        expect(
            getByText('Totalbeløpet er under 4 rettsgebyr (6. ledd). Skal det tilbakekreves?')
        ).toBeTruthy();
        expect(queryByText('Når 6. ledd anvendes må alle perioder behandles likt')).toBeFalsy();

        await act(() =>
            user.click(
                getByRole('button', {
                    name: 'Bekreft',
                })
            )
        );
        expect(queryAllByText('Feltet må fylles ut')).toHaveLength(1);

        await act(() =>
            user.click(
                getByRole('radio', {
                    name: 'Nei',
                })
            )
        );

        expect(queryByText('Når 6. ledd anvendes må alle perioder behandles likt')).toBeTruthy();

        await act(() =>
            user.click(
                getByRole('button', {
                    name: 'Bekreft',
                })
            )
        );
        expect(queryAllByText('Feltet må fylles ut')).toHaveLength(0);
        expect(getByText('01.05.2020 - 30.06.2020')).toBeTruthy();

        expect(getByText('2 måneder')).toBeTruthy();
        expect(getByText('1 333')).toBeTruthy();
        expect(getByText('Bor med søker')).toBeTruthy();

        await act(() =>
            user.type(getByLabelText('Vilkårene for tilbakekreving'), 'Begrunnelse vilkårene 2')
        );
        await act(() =>
            user.click(
                getByLabelText(
                    'Ja, mottaker forsto eller burde forstått at utbetalingen skyldtes en feil',
                    {
                        selector: 'input',
                        exact: false,
                    }
                )
            )
        );

        await act(() =>
            user.type(
                getByLabelText(
                    'Vurder hvorfor mottaker burde forstått, må ha forstått eller forsto at utbetalingen skyldtes en feil'
                ),
                'Begrunnelse aktsomhet 2'
            )
        );
        await act(() => user.click(getByLabelText('Burde ha forstått')));

        expect(
            getByText('Totalbeløpet er under 4 rettsgebyr (6. ledd). Skal det tilbakekreves?')
        ).toBeTruthy();

        await act(() =>
            user.click(
                getByRole('radio', {
                    name: 'Ja',
                })
            )
        );

        expect(getByText('Vurder særlige grunner du har vektlagt for resultatet')).toBeTruthy();

        await act(() =>
            user.type(
                getByLabelText('Vurder særlige grunner du har vektlagt for resultatet'),
                'Begrunnelse særlige grunner 2'
            )
        );
        await act(() =>
            user.click(
                getByLabelText('Graden av uaktsomhet hos den kravet retter seg mot', {
                    selector: 'input',
                })
            )
        );
        await act(() => user.click(getByTestId('harGrunnerTilReduksjon_Nei')));

        expect(getByText('100 %')).toBeTruthy();

        await act(() =>
            user.click(
                getByRole('button', {
                    name: 'Bekreft',
                })
            )
        );
        expect(queryAllByText('Feltet må fylles ut')).toHaveLength(0);
        expect(queryByText('Detaljer for valgt periode')).toBeFalsy;

        expect(
            getByRole('button', {
                name: 'Bekreft og fortsett',
            })
        ).toBeEnabled();

        await act(() =>
            user.click(
                getByRole('button', {
                    name: 'Bekreft og fortsett',
                })
            )
        );
        expect(
            queryByText(
                'Totalbeløpet er under 4 rettsgebyr. Dersom 6.ledd skal anvendes for å frafalle tilbakekrevingen, må denne anvendes likt på alle periodene.'
            )
        ).toBeTruthy();
    });

    test('- vis og fyll ut perioder og send inn - god tro - bruker kopiering', async () => {
        const user = userEvent.setup();
        setupMock(false, false, false, feilutbetalingVilkårsvurdering);
        const behandling = mock<IBehandling>();

        const fagsak = mock<IFagsak>();
        fagsak.ytelsestype = Ytelsetype.BARNETILSYN;

        const { getByText, getByRole, getByLabelText, queryAllByText } = render(
            <FeilutbetalingVilkårsvurderingProvider behandling={behandling} fagsak={fagsak}>
                <VilkårsvurderingContainer behandling={behandling} fagsak={fagsak} />
            </FeilutbetalingVilkårsvurderingProvider>
        );

        await waitFor(async () => {
            expect(getByText('Tilbakekreving')).toBeTruthy();
            expect(getByText('01.01.2020 - 31.03.2020')).toBeTruthy();
        });

        await act(() => user.type(getByLabelText('Vilkårene for tilbakekreving'), 'Begrunnelse1'));
        await act(() =>
            user.click(
                getByLabelText('Nei, mottaker har mottatt beløpet i god tro', {
                    selector: 'input',
                    exact: false,
                })
            )
        );
        await act(() => user.type(getByLabelText('Vurder om beløpet er i behold'), 'Begrunnelse2'));
        await act(() =>
            user.click(
                getByRole('radio', {
                    name: 'Nei',
                })
            )
        );

        await act(() =>
            user.click(
                getByRole('button', {
                    name: 'Bekreft',
                })
            )
        );
        expect(queryAllByText('Feltet må fylles ut')).toHaveLength(0);

        expect(getByText('01.05.2020 - 30.06.2020')).toBeTruthy();

        await act(() =>
            user.selectOptions(
                getByRole('combobox', {
                    name: 'Kopier vilkårsvurdering fra',
                }),
                '01.01.2020 - 31.03.2020'
            )
        );

        expect(getByText('Er beløpet i behold?')).toBeTruthy();

        expect(getByLabelText('Vilkårene for tilbakekreving')).toHaveValue('Begrunnelse1');
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

        expect(getByText('Ingen tilbakekreving')).toBeTruthy();

        await act(() =>
            user.click(
                getByRole('button', {
                    name: 'Bekreft',
                })
            )
        );

        expect(
            getByRole('button', {
                name: 'Bekreft og fortsett',
            })
        ).toBeEnabled();

        await act(() =>
            user.click(
                getByRole('button', {
                    name: 'Bekreft og fortsett',
                })
            )
        );
    });

    test('- vis utfylt - forstod/burde forstått - forsto', async () => {
        const user = userEvent.setup();
        setupMock(true, false, false, {
            perioder: [
                {
                    ...perioder[0],
                    begrunnelse: 'Begrunnelse vilkår 1',
                    vilkårsvurderingsresultatInfo: {
                        vilkårsvurderingsresultat: Vilkårsresultat.FORSTO_BURDE_FORSTÅTT,
                        aktsomhet: {
                            begrunnelse: 'Begrunnelse aktsomhet 1',
                            aktsomhet: Aktsomhet.FORSETT,
                            særligeGrunner: [],
                        },
                        godTro: undefined,
                    },
                },
                {
                    ...perioder[1],
                    begrunnelse: 'Begrunnelse vilkår 2',
                    vilkårsvurderingsresultatInfo: {
                        vilkårsvurderingsresultat: Vilkårsresultat.GOD_TRO,
                        aktsomhet: undefined,
                        godTro: {
                            begrunnelse: 'Begrunnelse god tro 2',
                            beløpErIBehold: false,
                        },
                    },
                },
            ],
            rettsgebyr: 1199,
        });
        const behandling = mock<IBehandling>();
        const fagsak = mock<IFagsak>({
            ytelsestype: Ytelsetype.BARNETRYGD,
        });

        const { getByText, getByRole, getByLabelText, queryByText, queryByLabelText } = render(
            <FeilutbetalingVilkårsvurderingProvider behandling={behandling} fagsak={fagsak}>
                <VilkårsvurderingContainer behandling={behandling} fagsak={fagsak} />
            </FeilutbetalingVilkårsvurderingProvider>
        );

        await waitFor(async () => {
            expect(getByText('Tilbakekreving')).toBeTruthy();
            expect(queryByText('Detaljer for valgt periode')).toBeFalsy();
            expect(
                getByRole('button', {
                    name: 'suksess fra 01.01.2020 til og med 31.03.2020',
                })
            ).toBeTruthy();
        });

        await act(() =>
            user.click(
                getByRole('button', {
                    name: 'suksess fra 01.01.2020 til og med 31.03.2020',
                })
            )
        );

        expect(getByText('Detaljer for valgt periode')).toBeTruthy();

        expect(
            getByRole('button', {
                name: 'Neste',
            })
        ).toBeDisabled();

        expect(
            getByText('01.01.2020 - 31.03.2020', {
                selector: 'label',
            })
        ).toBeTruthy();

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

        expect(queryByLabelText('Nei')).toBeFalsy();
        expect(getByText('Nei')).toBeTruthy();

        await act(() =>
            user.click(
                getByRole('button', {
                    name: 'suksess fra 01.05.2020 til og med 30.06.2020',
                })
            )
        );

        expect(
            getByText('01.05.2020 - 30.06.2020', {
                selector: 'label',
            })
        ).toBeTruthy();

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
        expect(getByText('Ingen tilbakekreving')).toBeTruthy();

        await act(() =>
            user.click(
                getByRole('button', {
                    name: 'Lukk',
                })
            )
        );

        expect(
            getByRole('button', {
                name: 'Neste',
            })
        ).toBeEnabled();
    });

    test('- vis utfylt - forstod/burde forstått - forsto - lesevisning', async () => {
        const user = userEvent.setup();
        setupMock(true, true, false, {
            perioder: [
                {
                    ...perioder[0],
                    begrunnelse: 'Begrunnelse vilkår 1',
                    vilkårsvurderingsresultatInfo: {
                        vilkårsvurderingsresultat: Vilkårsresultat.FORSTO_BURDE_FORSTÅTT,
                        aktsomhet: {
                            begrunnelse: 'Begrunnelse aktsomhet 1',
                            aktsomhet: Aktsomhet.FORSETT,
                            særligeGrunner: [],
                        },
                        godTro: undefined,
                    },
                },
                {
                    ...perioder[1],
                    begrunnelse: 'Begrunnelse vilkår 2',
                    vilkårsvurderingsresultatInfo: {
                        vilkårsvurderingsresultat: Vilkårsresultat.GOD_TRO,
                        aktsomhet: undefined,
                        godTro: {
                            begrunnelse: 'Begrunnelse god tro 2',
                            beløpErIBehold: false,
                        },
                    },
                },
            ],
            rettsgebyr: 1199,
        });
        const behandling = mock<IBehandling>();
        const fagsak = mock<IFagsak>({
            ytelsestype: Ytelsetype.BARNETRYGD,
        });

        const { getByText, getByRole, queryByText } = render(
            <FeilutbetalingVilkårsvurderingProvider behandling={behandling} fagsak={fagsak}>
                <VilkårsvurderingContainer behandling={behandling} fagsak={fagsak} />
            </FeilutbetalingVilkårsvurderingProvider>
        );

        await waitFor(async () => {
            expect(getByText('Tilbakekreving')).toBeTruthy();
            expect(queryByText('Detaljer for valgt periode')).toBeFalsy();
            expect(
                getByRole('button', {
                    name: 'suksess fra 01.01.2020 til og med 31.03.2020',
                })
            ).toBeTruthy();
        });

        await act(() =>
            user.click(
                getByRole('button', {
                    name: 'suksess fra 01.01.2020 til og med 31.03.2020',
                })
            )
        );

        expect(getByText('Detaljer for valgt periode')).toBeTruthy();

        expect(
            getByRole('button', {
                name: 'Neste',
            })
        ).toBeEnabled();

        expect(
            getByText('01.01.2020 - 31.03.2020', {
                selector: 'label',
            })
        ).toBeTruthy();

        expect(getByText('Begrunnelse vilkår 1')).toBeTruthy();
        expect(
            getByText('Ja, mottaker forsto eller burde forstått at utbetalingen skyldtes en feil')
        ).toBeTruthy();
        expect(getByText('Begrunnelse aktsomhet 1')).toBeTruthy();
        expect(getByText('Forsto')).toBeTruthy();
        expect(getByText('Nei')).toBeTruthy();

        await act(() =>
            user.click(
                getByRole('button', {
                    name: 'suksess fra 01.05.2020 til og med 30.06.2020',
                })
            )
        );

        expect(
            getByText('01.05.2020 - 30.06.2020', {
                selector: 'label',
            })
        ).toBeTruthy();

        expect(getByText('Begrunnelse vilkår 2')).toBeTruthy();
        expect(getByText('Nei, mottaker har mottatt beløpet i god tro')).toBeTruthy();
        expect(getByText('Begrunnelse god tro 2')).toBeTruthy();
        expect(getByText('Nei')).toBeTruthy();
        expect(getByText('Ingen tilbakekreving')).toBeTruthy();
    });

    test('- vis autoutført', async () => {
        setupMock(false, false, true);

        const behandling = mock<IBehandling>();
        const fagsak = mock<IFagsak>();
        fagsak.ytelsestype = Ytelsetype.BARNETILSYN;

        const { getByText, getByRole } = render(
            <FeilutbetalingVilkårsvurderingProvider behandling={behandling} fagsak={fagsak}>
                <VilkårsvurderingContainer behandling={behandling} fagsak={fagsak} />
            </FeilutbetalingVilkårsvurderingProvider>
        );

        await waitFor(async () => {
            expect(getByText('Tilbakekreving')).toBeTruthy();
        });

        expect(getByText('Automatisk vurdert. Alle perioder er foreldet.')).toBeTruthy();

        expect(
            getByRole('button', {
                name: 'Neste',
            })
        ).toBeEnabled();
    });
});
