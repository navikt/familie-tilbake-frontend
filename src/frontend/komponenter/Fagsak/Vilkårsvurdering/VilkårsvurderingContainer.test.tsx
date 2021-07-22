import * as React from 'react';

import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { mock } from 'jest-mock-extended';

import { Ressurs, RessursStatus } from '@navikt/familie-typer';

import { useApiKall } from '../../../api/behandling';
import { useBehandling } from '../../../context/BehandlingContext';
import { Aktsomhet, HendelseType, Vilkårsresultat, Ytelsetype } from '../../../kodeverk';
import { IBehandling } from '../../../typer/behandling';
import { IFagsak } from '../../../typer/fagsak';
import {
    IFeilutbetalingVilkårsvurdering,
    VilkårsvurderingPeriode,
} from '../../../typer/feilutbetalingtyper';
import { FeilutbetalingVilkårsvurderingProvider } from './FeilutbetalingVilkårsvurderingContext';
import VilkårsvurderingContainer from './VilkårsvurderingContainer';

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
    useApiKall: jest.fn(),
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
            useApiKall.mockImplementation(() => ({
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
        setupMock(false, false, false, feilutbetalingVilkårsvurdering);
        const behandling = mock<IBehandling>();
        const fagsak = mock<IFagsak>();

        const { getByText, getByRole, getByLabelText, getByTestId, queryAllByText, queryByText } =
            render(
                <FeilutbetalingVilkårsvurderingProvider behandling={behandling} fagsak={fagsak}>
                    <VilkårsvurderingContainer behandling={behandling} fagsak={fagsak} />
                </FeilutbetalingVilkårsvurderingProvider>
            );

        await waitFor(async () => {
            expect(getByText('Tilbakekreving')).toBeTruthy();
        });

        expect(getByText('Detaljer for valgt periode')).toBeTruthy();

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

        userEvent.click(
            getByRole('button', {
                name: 'Bekreft',
            })
        );
        expect(queryAllByText('Feltet må fylles ut')).toHaveLength(2);

        userEvent.type(getByLabelText('Vilkårene for tilbakekreving'), 'Begrunnelse vilkårene 1');
        userEvent.click(
            getByLabelText(
                'Ja, mottaker forsto eller burde forstått at utbetalingen skyldtes en feil',
                {
                    selector: 'input',
                    exact: false,
                }
            )
        );

        expect(getByText('Aktsomhet')).toBeTruthy();

        userEvent.click(
            getByRole('button', {
                name: 'Bekreft',
            })
        );
        expect(queryAllByText('Feltet må fylles ut')).toHaveLength(2);

        userEvent.type(
            getByLabelText('Vurder i hvilken grad mottaker har handlet uaktsomt'),
            'Begrunnelse aktsomhet 1'
        );
        userEvent.click(getByLabelText('Burde ha forstått'));

        expect(
            getByText('Totalbeløpet er under 4 rettsgebyr (6. ledd). Skal det tilbakekreves?')
        ).toBeTruthy();
        expect(queryByText('Når 6. ledd anvendes må alle perioder behandles likt')).toBeFalsy();

        userEvent.click(
            getByRole('button', {
                name: 'Bekreft',
            })
        );
        expect(queryAllByText('Feltet må fylles ut')).toHaveLength(1);

        userEvent.click(
            getByRole('radio', {
                name: 'Nei',
            })
        );

        expect(queryByText('Når 6. ledd anvendes må alle perioder behandles likt')).toBeTruthy();

        userEvent.click(
            getByRole('button', {
                name: 'Bekreft',
            })
        );
        expect(queryAllByText('Feltet må fylles ut')).toHaveLength(0);

        expect(getByText('01.05.2020 - 30.06.2020')).toBeTruthy();
        expect(getByText('2 måneder')).toBeTruthy();
        expect(getByText('1 333')).toBeTruthy();
        expect(getByText('Bor med søker')).toBeTruthy();

        userEvent.type(getByLabelText('Vilkårene for tilbakekreving'), 'Begrunnelse vilkårene 2');
        userEvent.click(
            getByLabelText(
                'Ja, mottaker forsto eller burde forstått at utbetalingen skyldtes en feil',
                {
                    selector: 'input',
                    exact: false,
                }
            )
        );

        userEvent.type(
            getByLabelText('Vurder i hvilken grad mottaker har handlet uaktsomt'),
            'Begrunnelse aktsomhet 2'
        );
        userEvent.click(getByLabelText('Burde ha forstått'));

        userEvent.click(
            getByRole('radio', {
                name: 'Ja',
            })
        );

        userEvent.type(
            getByLabelText('Vurder særlige grunner du har vektlagt for resultatet'),
            'Begrunnelse særlige grunner 2'
        );
        userEvent.click(
            getByLabelText('Graden av uaktsomhet hos den kravet retter seg mot', {
                selector: 'input',
            })
        );
        userEvent.click(getByTestId('harGrunnerTilReduksjon_Nei'));

        userEvent.click(
            getByRole('button', {
                name: 'Bekreft',
            })
        );
        expect(queryAllByText('Feltet må fylles ut')).toHaveLength(0);

        expect(queryByText('Detaljer for valgt periode')).toBeFalsy();
        expect(
            getByRole('button', {
                name: 'Bekreft og fortsett',
            })
        ).toBeEnabled();

        userEvent.click(
            getByRole('button', {
                name: 'Bekreft og fortsett',
            })
        );
        expect(
            getByText(
                'Totalbeløpet er under 4 rettsgebyr. Dersom 6.ledd skal anvendes for å frafalle tilbakekrevingen, må denne anvendes likt på alle periodene.'
            )
        ).toBeTruthy();
    });

    test('- vis og fyll ut perioder og send inn - god tro - bruker kopiering', async () => {
        setupMock(false, false, false, feilutbetalingVilkårsvurdering);
        const behandling = mock<IBehandling>();
        const fagsak = mock<IFagsak>();

        const { getByText, getByRole, getByLabelText, queryAllByText } = render(
            <FeilutbetalingVilkårsvurderingProvider behandling={behandling} fagsak={fagsak}>
                <VilkårsvurderingContainer behandling={behandling} fagsak={fagsak} />
            </FeilutbetalingVilkårsvurderingProvider>
        );

        await waitFor(async () => {
            expect(getByText('Tilbakekreving')).toBeTruthy();
        });

        expect(getByText('01.01.2020 - 31.03.2020')).toBeTruthy();

        userEvent.type(getByLabelText('Vilkårene for tilbakekreving'), 'Begrunnelse vilkårene');
        userEvent.click(
            getByLabelText('Nei, mottaker har mottatt beløpet i god tro', {
                selector: 'input',
                exact: false,
            })
        );
        userEvent.type(getByLabelText('Vurder om beløpet er i behold'), 'Begrunnelse god tro');
        userEvent.click(
            getByRole('radio', {
                name: 'Nei',
            })
        );

        userEvent.click(
            getByRole('button', {
                name: 'Bekreft',
            })
        );
        expect(queryAllByText('Feltet må fylles ut')).toHaveLength(0);

        expect(getByText('01.05.2020 - 30.06.2020')).toBeTruthy();

        userEvent.selectOptions(
            getByRole('combobox', {
                name: 'Kopier vilkårsvurdering fra',
            }),
            '01.01.2020 - 31.03.2020'
        );

        expect(getByLabelText('Vilkårene for tilbakekreving')).toHaveValue('Begrunnelse vilkårene');
        expect(
            getByLabelText('Nei, mottaker har mottatt beløpet i god tro', {
                selector: 'input',
                exact: false,
            })
        ).toBeChecked();
        expect(getByLabelText('Vurder om beløpet er i behold')).toHaveValue('Begrunnelse god tro');
        expect(
            getByRole('radio', {
                name: 'Nei',
            })
        ).toBeChecked();

        userEvent.click(
            getByRole('button', {
                name: 'Bekreft',
            })
        );

        await waitFor(async () => {
            userEvent.click(
                getByRole('button', {
                    name: 'Bekreft og fortsett',
                })
            );
        });
    });

    test('- vis utfylt - forstod/burde forstått - forsto', async () => {
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
        });

        expect(queryByText('Detaljer for valgt periode')).toBeFalsy();

        userEvent.click(
            getByRole('button', {
                name: 'suksess fra 01.01.2020 til og med 31.03.2020',
            })
        );

        expect(getByText('Detaljer for valgt periode')).toBeTruthy();

        expect(
            getByRole('button', {
                name: 'Neste',
            })
        ).toBeDisabled();

        expect(
            getByText('01.01.2020 - 31.03.2020', {
                selector: 'p',
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
            getByLabelText('Vurder i hvilken grad mottaker har handlet uaktsomt')
        ).toHaveTextContent('Begrunnelse aktsomhet 1');
        expect(getByLabelText('Forsto')).toBeChecked();

        expect(queryByLabelText('Nei')).toBeFalsy();
        expect(getByText('Nei')).toBeTruthy();

        userEvent.click(
            getByRole('button', {
                name: 'suksess fra 01.05.2020 til og med 30.06.2020',
            })
        );

        expect(
            getByText('01.05.2020 - 30.06.2020', {
                selector: 'p',
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

        userEvent.click(
            getByRole('button', {
                name: 'Lukk',
            })
        );

        expect(
            getByRole('button', {
                name: 'Neste',
            })
        ).toBeEnabled();
    });

    test('- vis utfylt - forstod/burde forstått - forsto - lesevisning', async () => {
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
        });

        expect(queryByText('Detaljer for valgt periode')).toBeFalsy();

        userEvent.click(
            getByRole('button', {
                name: 'suksess fra 01.01.2020 til og med 31.03.2020',
            })
        );

        expect(getByText('Detaljer for valgt periode')).toBeTruthy();

        expect(
            getByRole('button', {
                name: 'Neste',
            })
        ).toBeEnabled();

        expect(
            getByText('01.01.2020 - 31.03.2020', {
                selector: 'p',
            })
        ).toBeTruthy();

        expect(getByText('Begrunnelse vilkår 1')).toBeTruthy();
        expect(
            getByText('Ja, mottaker forsto eller burde forstått at utbetalingen skyldtes en feil')
        ).toBeTruthy();
        expect(getByText('Begrunnelse aktsomhet 1')).toBeTruthy();
        expect(getByText('Forsto')).toBeTruthy();
        expect(getByText('Nei')).toBeTruthy();

        userEvent.click(
            getByRole('button', {
                name: 'suksess fra 01.05.2020 til og med 30.06.2020',
            })
        );

        expect(
            getByText('01.05.2020 - 30.06.2020', {
                selector: 'p',
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
