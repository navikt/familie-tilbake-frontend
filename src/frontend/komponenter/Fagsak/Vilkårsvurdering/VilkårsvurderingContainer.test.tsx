import type { IBehandling } from '../../../typer/behandling';
import type { IFagsak } from '../../../typer/fagsak';
import type {
    IFeilutbetalingVilkårsvurdering,
    VilkårsvurderingPeriode,
} from '../../../typer/feilutbetalingtyper';

import { act, render, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { mock } from 'jest-mock-extended';
import * as React from 'react';

import { FeilutbetalingVilkårsvurderingProvider } from './FeilutbetalingVilkårsvurderingContext';
import VilkårsvurderingContainer from './VilkårsvurderingContainer';
import { useBehandlingApi } from '../../../api/behandling';
import { useHttp } from '../../../api/http/HttpProvider';
import { BehandlingProvider } from '../../../context/BehandlingContext';
import { Aktsomhet, Fagsystem, HendelseType, Vilkårsresultat, Ytelsetype } from '../../../kodeverk';
import { Behandlingstatus } from '../../../typer/behandling';
import { type Ressurs, RessursStatus } from '../../../typer/ressurs';

jest.setTimeout(25000);

jest.mock('../../../api/http/HttpProvider', () => ({
    useHttp: jest.fn(),
}));

jest.mock('../../../api/behandling', () => ({
    useBehandlingApi: jest.fn(),
}));

jest.mock('react-router', () => ({
    ...jest.requireActual('react-router'),
    useNavigate: () => jest.fn(),
}));

describe('Tester: VilkårsvurderingContainer', () => {
    const perioder: VilkårsvurderingPeriode[] = [
        {
            feilutbetaltBeløp: 1333,
            periode: {
                fom: '2020-01-01',
                tom: '2020-03-31',
            },
            hendelsestype: HendelseType.BosattIRiket,
            foreldet: false,
            begrunnelse: undefined,
        },
        {
            feilutbetaltBeløp: 1333,
            periode: {
                fom: '2020-05-01',
                tom: '2020-06-30',
            },
            hendelsestype: HendelseType.BorMedSøker,
            foreldet: false,
            begrunnelse: undefined,
        },
    ];
    const feilutbetalingVilkårsvurdering: IFeilutbetalingVilkårsvurdering = {
        perioder: perioder,
        rettsgebyr: 1199,
    };

    const setupUseBehandlingApiMock = (vilkårsvurdering?: IFeilutbetalingVilkårsvurdering) => {
        if (vilkårsvurdering) {
            // @ts-expect-error mock
            useBehandlingApi.mockImplementation(() => ({
                gjerFeilutbetalingVilkårsvurderingKall: () => {
                    const ressurs = mock<Ressurs<IFeilutbetalingVilkårsvurdering>>({
                        status: RessursStatus.Suksess,
                        data: vilkårsvurdering,
                    });
                    return Promise.resolve(ressurs);
                },
                sendInnFeilutbetalingVilkårsvurdering: () => {
                    const ressurs = mock<Ressurs<string>>({
                        status: RessursStatus.Suksess,
                        data: 'suksess',
                    });
                    return Promise.resolve(ressurs);
                },
            }));
        }
    };

    const setupHttpMock = () => {
        // @ts-expect-error mock
        useHttp.mockImplementation(() => ({
            request: () => {
                return Promise.resolve({
                    status: RessursStatus.Suksess,
                    data: mock<IBehandling>({ eksternBrukId: '1' }),
                });
            },
        }));
    };

    test('- totalbeløp under 4 rettsgebyr - alle perioder har ikke brukt 6.ledd', async () => {
        const user = userEvent.setup();
        setupUseBehandlingApiMock(feilutbetalingVilkårsvurdering);
        setupHttpMock();
        const behandling = mock<IBehandling>();
        const fagsak = mock<IFagsak>();
        fagsak.ytelsestype = Ytelsetype.Barnetilsyn;

        const { getByText, getByRole, getByLabelText, getByTestId, queryAllByText, queryByText } =
            render(
                <BehandlingProvider>
                    <FeilutbetalingVilkårsvurderingProvider behandling={behandling} fagsak={fagsak}>
                        <VilkårsvurderingContainer behandling={behandling} fagsak={fagsak} />
                    </FeilutbetalingVilkårsvurderingProvider>
                </BehandlingProvider>
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
                name: 'Bekreft',
            })
        ).toBeDisabled();

        await act(() =>
            user.type(getByLabelText('Vilkårene for tilbakekreving'), 'Begrunnelse vilkårene 1')
        );

        expect(
            getByRole('button', {
                name: 'Bekreft',
            })
        ).toBeEnabled();

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

        expect(
            getByRole('button', {
                name: 'Bekreft',
            })
        ).toBeEnabled();

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
                name: 'Lagre og fortsett',
            })
        ).toBeEnabled();

        await act(() =>
            user.click(
                getByRole('button', {
                    name: 'Lagre og fortsett',
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
        setupUseBehandlingApiMock(feilutbetalingVilkårsvurdering);
        setupHttpMock();

        const fagsak = mock<IFagsak>({ fagsystem: Fagsystem.EF, eksternFagsakId: '1' });
        const behandling = mock<IBehandling>({ eksternBrukId: '1' });

        fagsak.ytelsestype = Ytelsetype.Barnetilsyn;

        const { getByText, getByRole, getByLabelText, queryAllByText } = render(
            <BehandlingProvider>
                <FeilutbetalingVilkårsvurderingProvider behandling={behandling} fagsak={fagsak}>
                    <VilkårsvurderingContainer behandling={behandling} fagsak={fagsak} />
                </FeilutbetalingVilkårsvurderingProvider>
            </BehandlingProvider>
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
                name: 'Lagre og fortsett',
            })
        ).toBeEnabled();

        await act(() =>
            user.click(
                getByRole('button', {
                    name: 'Lagre og fortsett',
                })
            )
        );
    });

    test('- vis utfylt - forstod/burde forstått - forsto', async () => {
        const user = userEvent.setup();
        setupUseBehandlingApiMock({
            perioder: [
                {
                    ...perioder[0],
                    begrunnelse: 'Begrunnelse vilkår 1',
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
                    begrunnelse: 'Begrunnelse vilkår 2',
                    vilkårsvurderingsresultatInfo: {
                        vilkårsvurderingsresultat: Vilkårsresultat.GodTro,
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
            ytelsestype: Ytelsetype.Barnetrygd,
        });

        const { getByText, getByRole, getByLabelText, queryByText, queryByLabelText } = render(
            <BehandlingProvider>
                <FeilutbetalingVilkårsvurderingProvider behandling={behandling} fagsak={fagsak}>
                    <VilkårsvurderingContainer behandling={behandling} fagsak={fagsak} />
                </FeilutbetalingVilkårsvurderingProvider>
            </BehandlingProvider>
        );

        await waitFor(async () => {
            expect(getByText('Tilbakekreving')).toBeTruthy();
            expect(queryByText('Detaljer for valgt periode')).toBeFalsy();
            expect(
                getByRole('button', {
                    name: 'Suksess fra 01.01.2020 til 31.03.2020',
                })
            ).toBeTruthy();
        });

        await act(() =>
            user.click(
                getByRole('button', {
                    name: 'Suksess fra 01.01.2020 til 31.03.2020',
                })
            )
        );

        expect(getByText('Detaljer for valgt periode')).toBeTruthy();

        expect(
            getByRole('button', {
                name: 'Neste',
            })
        ).toBeDisabled();

        expect(getByText('01.01.2020 - 31.03.2020', { selector: 'label' })).toBeTruthy();

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
                    name: 'Suksess fra 01.05.2020 til 30.06.2020',
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
        setupUseBehandlingApiMock({
            perioder: [
                {
                    ...perioder[0],
                    begrunnelse: 'Begrunnelse vilkår 1',
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
                    begrunnelse: 'Begrunnelse vilkår 2',
                    vilkårsvurderingsresultatInfo: {
                        vilkårsvurderingsresultat: Vilkårsresultat.GodTro,
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
        setupHttpMock();
        const behandling = mock<IBehandling>({ status: Behandlingstatus.FatterVedtak });
        const fagsak = mock<IFagsak>({
            ytelsestype: Ytelsetype.Barnetrygd,
        });

        const { getByText, getByRole, getByLabelText } = render(
            <BehandlingProvider>
                <FeilutbetalingVilkårsvurderingProvider behandling={behandling} fagsak={fagsak}>
                    <VilkårsvurderingContainer behandling={behandling} fagsak={fagsak} />
                </FeilutbetalingVilkårsvurderingProvider>
            </BehandlingProvider>
        );

        await waitFor(async () => {
            // Tittel skal alltid være synlig
            expect(getByText('Tilbakekreving', { selector: 'h2' })).toBeTruthy();

            // Første periode sitt endringspanel skal være åpnet by default i lesevisning, sjekker at riktige verdier er satt
            expect(getByText('Detaljer for valgt periode', { selector: 'h2' })).toBeTruthy();
            expect(getByText('01.01.2020 - 31.03.2020', { selector: 'label' })).toBeTruthy();
            expect(getByText('Begrunnelse vilkår 1')).toBeTruthy();
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
            expect(getByText('Begrunnelse aktsomhet 1')).toBeTruthy();
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

            // Alle tidslinje knappene skal alltid være synlige
            expect(
                getByRole('button', {
                    name: 'Suksess fra 01.01.2020 til 31.03.2020',
                })
            ).toBeTruthy();
            expect(
                getByRole('button', {
                    name: 'Suksess fra 01.05.2020 til 30.06.2020',
                })
            ).toBeTruthy();

            // Knapp for navigering tilbake mellom faner skal alltid være synlig enabled
            expect(
                getByRole('button', {
                    name: 'Forrige',
                })
            ).toBeEnabled();

            // Knapp for navigering til neste fane skal være synlig men disabled når vilkårspanel er åpent
            expect(
                getByRole('button', {
                    name: 'Neste',
                })
            ).toBeDisabled();
        });

        await act(() =>
            // Bruker klikker seg videre til den andre perioden
            user.click(
                getByRole('button', {
                    name: 'Suksess fra 01.05.2020 til 30.06.2020',
                })
            )
        );

        // Tittel skal alltid være synlig
        expect(getByText('Tilbakekreving', { selector: 'h2' })).toBeTruthy();

        // Andre periode sitt endringspanel skal nå være åpnet, sjekker at riktige verdier er satt
        expect(getByText('Detaljer for valgt periode', { selector: 'h2' })).toBeTruthy();
        expect(getByText('01.05.2020 - 30.06.2020', { selector: 'label' })).toBeTruthy();
        expect(getByText('Begrunnelse vilkår 2')).toBeTruthy();
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
        expect(getByText('Begrunnelse god tro 2')).toBeTruthy();
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

        // Alle tidslinje knappene skal alltid være synlige
        expect(
            getByRole('button', {
                name: 'Suksess fra 01.05.2020 til 30.06.2020',
            })
        ).toBeTruthy();
        expect(
            getByRole('button', {
                name: 'Suksess fra 01.05.2020 til 30.06.2020',
            })
        ).toBeTruthy();

        // Knapp for navigering tilbake mellom faner skal alltid være synlig enabled
        expect(
            getByRole('button', {
                name: 'Forrige',
            })
        ).toBeEnabled();

        // Knapp for navigering til neste fane skal være synlig men disabled når vilkårspanel er åpent
        expect(
            getByRole('button', {
                name: 'Neste',
            })
        ).toBeDisabled();

        await act(() =>
            // Bruker klikker på lukk knapp
            user.click(
                getByRole('button', {
                    name: 'Lukk',
                })
            )
        );

        // Knapp for navigering tilbake mellom faner skal alltid være synlig enabled
        expect(
            getByRole('button', {
                name: 'Forrige',
            })
        ).toBeEnabled();

        // Knapp for navigering til neste fane skal nå være synlig og enabled
        expect(
            getByRole('button', {
                name: 'Neste',
            })
        ).toBeEnabled();
    });
});
