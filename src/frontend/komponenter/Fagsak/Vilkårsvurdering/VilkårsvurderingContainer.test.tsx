import type { IBehandling } from '../../../typer/behandling';
import type { IFagsak } from '../../../typer/fagsak';
import type {
    IFeilutbetalingVilkårsvurdering,
    VilkårsvurderingPeriode,
} from '../../../typer/feilutbetalingtyper';

import { render, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { mock } from 'jest-mock-extended';
import * as React from 'react';

import VilkårsvurderingContainer from './VilkårsvurderingContainer';
import { VilkårsvurderingProvider } from './VilkårsvurderingContext';
import { BehandlingProvider } from '../../../context/BehandlingContext';
import { Aktsomhet, Fagsystem, HendelseType, Vilkårsresultat, Ytelsetype } from '../../../kodeverk';
import { Behandlingstatus } from '../../../typer/behandling';
import { type Ressurs, RessursStatus } from '../../../typer/ressurs';

jest.setTimeout(25000);

const mockUseHttp = jest.fn();
jest.mock('../../../api/http/HttpProvider', () => ({
    useHttp: () => mockUseHttp(),
}));

const mockUseBehandlingApi = jest.fn();
jest.mock('../../../api/behandling', () => ({
    useBehandlingApi: () => mockUseBehandlingApi(),
}));

jest.mock('react-router', () => ({
    ...jest.requireActual('react-router'),
    useNavigate: () => jest.fn(),
}));

jest.mock('@tanstack/react-query', () => {
    return {
        useMutation: jest.fn(({ mutationFn, onSuccess }) => {
            const mutateAsync = async (behandlingId: string) => {
                const result = await mutationFn(behandlingId);
                if (onSuccess && result?.status === RessursStatus.Suksess) {
                    await onSuccess(result);
                }
                return result;
            };

            return {
                mutate: mutateAsync,
                mutateAsync: mutateAsync,
                isError: false,
                error: null,
            };
        }),
        useQueryClient: jest.fn(() => ({
            invalidateQueries: jest.fn(),
        })),
    };
});

beforeEach(() => {
    Element.prototype.scrollIntoView = jest.fn();
});

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
        mockUseBehandlingApi.mockImplementation(() => ({
            gjerFeilutbetalingVilkårsvurderingKall: () => {
                const ressurs = mock<Ressurs<IFeilutbetalingVilkårsvurdering>>({
                    status: RessursStatus.Suksess,
                    data: vilkårsvurdering,
                });
                return Promise.resolve(ressurs);
            },
            sendInnVilkårsvurdering: () => {
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
    mockUseHttp.mockImplementation(() => ({
        request: () => {
            return Promise.resolve({
                status: RessursStatus.Suksess,
                data: mock<IBehandling>({ eksternBrukId: '1' }),
            });
        },
    }));
};

const renderVilkårsvurderingContainer = (behandling: IBehandling, fagsak: IFagsak) =>
    render(
        <BehandlingProvider>
            <VilkårsvurderingProvider behandling={behandling} fagsak={fagsak}>
                <VilkårsvurderingContainer behandling={behandling} fagsak={fagsak} />
            </VilkårsvurderingProvider>
        </BehandlingProvider>
    );

describe('Tester: VilkårsvurderingContainer', () => {
    let user: ReturnType<typeof userEvent.setup>;

    beforeEach(() => {
        user = userEvent.setup();
        jest.clearAllMocks();
        setupHttpMock();
    });

    test('- totalbeløp under 4 rettsgebyr - alle perioder har ikke brukt 6.ledd', async () => {
        setupUseBehandlingApiMock(feilutbetalingVilkårsvurdering);
        const behandling = mock<IBehandling>();
        const fagsak = mock<IFagsak>({ ytelsestype: Ytelsetype.Barnetilsyn });

        const { getByText, getByRole, getByLabelText, getByTestId, queryAllByText, queryByText } =
            renderVilkårsvurderingContainer(behandling, fagsak);

        await waitFor(() => {
            expect(getByText('Tilbakekreving')).toBeInTheDocument();
            expect(getByText('Detaljer for valgt periode')).toBeInTheDocument();
        });

        expect(getByText('01.01.2020 - 31.03.2020')).toBeInTheDocument();
        expect(getByText('3 måneder')).toBeInTheDocument();
        expect(getByText('1 333')).toBeInTheDocument();
        expect(getByText('Bosatt i riket')).toBeInTheDocument();
        expect(
            getByText('Vilkårene for tilbakekreving', {
                selector: 'h2',
            })
        ).toBeInTheDocument();

        expect(
            getByRole('button', {
                name: 'Gå videre til neste periode',
            })
        ).toBeEnabled();

        await user.type(getByLabelText('Vilkårene for tilbakekreving'), 'Begrunnelse vilkårene 1');

        expect(
            getByRole('button', {
                name: 'Lagre og gå videre til neste periode',
            })
        ).toBeEnabled();

        await user.click(
            getByRole('button', {
                name: 'Lagre og gå videre til neste periode',
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

        expect(
            getByRole('button', {
                name: 'Lagre og gå videre til neste periode',
            })
        ).toBeEnabled();

        await user.click(
            getByRole('button', {
                name: 'Lagre og gå videre til neste periode',
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
                name: 'Lagre og gå videre til neste periode',
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
                name: 'Lagre og gå videre til neste periode',
            })
        );
        expect(queryAllByText('Feltet må fylles ut')).toHaveLength(0);
        expect(getByText('01.05.2020 - 30.06.2020')).toBeInTheDocument();

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
                name: 'Lagre og gå videre til vedtak',
            })
        );
        expect(queryAllByText('Feltet må fylles ut')).toHaveLength(0);
        expect(
            queryByText(
                'Totalbeløpet er under 4 rettsgebyr. Dersom 6.ledd skal anvendes for å frafalle tilbakekrevingen, må denne anvendes likt på alle periodene.'
            )
        ).toBeInTheDocument();
    });

    test('- vis og fyll ut perioder og send inn - god tro - bruker kopiering', async () => {
        setupUseBehandlingApiMock(feilutbetalingVilkårsvurdering);

        const fagsak = mock<IFagsak>({
            fagsystem: Fagsystem.EF,
            eksternFagsakId: '1',
            ytelsestype: Ytelsetype.Barnetilsyn,
        });
        const behandling = mock<IBehandling>({ eksternBrukId: '1' });

        const { getByText, getByRole, getByLabelText, queryAllByText } =
            renderVilkårsvurderingContainer(behandling, fagsak);

        await waitFor(() => {
            expect(getByText('Tilbakekreving')).toBeInTheDocument();
            expect(getByText('01.01.2020 - 31.03.2020')).toBeInTheDocument();
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
                name: 'Lagre og gå videre til neste periode',
            })
        );
        expect(queryAllByText('Feltet må fylles ut')).toHaveLength(0);

        expect(getByText('01.05.2020 - 30.06.2020')).toBeInTheDocument();

        await user.selectOptions(
            getByRole('combobox', {
                name: 'Kopier vilkårsvurdering fra',
            }),
            '01.01.2020 - 31.03.2020'
        );

        expect(getByText('Er beløpet i behold?')).toBeInTheDocument();

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

        expect(getByText('Ingen tilbakekreving')).toBeInTheDocument();

        await user.click(
            getByRole('button', {
                name: 'Lagre og gå videre til vedtak',
            })
        );
    });

    test('- vis utfylt - forstod/burde forstått - forsto', async () => {
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

        const { getByText, getByRole, getByLabelText, queryByText, queryByLabelText } =
            renderVilkårsvurderingContainer(behandling, fagsak);

        await waitFor(() => {
            expect(getByText('Tilbakekreving')).toBeInTheDocument();
            expect(queryByText('Detaljer for valgt periode')).toBeInTheDocument();
        });
        expect(
            getByRole('button', {
                name: 'Suksess fra 01.01.2020 til 31.03.2020',
            })
        ).toBeInTheDocument();

        await user.click(
            getByRole('button', {
                name: 'Suksess fra 01.01.2020 til 31.03.2020',
            })
        );

        expect(getByText('Detaljer for valgt periode')).toBeInTheDocument();

        expect(
            getByRole('button', {
                name: 'Gå videre til neste periode',
            })
        ).toBeEnabled();
        expect(
            getByRole('button', {
                name: 'Gå tilbake til foreldelse',
            })
        ).toBeEnabled();

        expect(getByText('01.01.2020 - 31.03.2020', { selector: 'label' })).toBeInTheDocument();

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
            getByText('01.05.2020 - 30.06.2020', {
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

        expect(
            getByRole('button', {
                name: 'Gå videre til vedtak',
            })
        ).toBeEnabled();
        expect(
            getByRole('button', {
                name: 'Gå tilbake til forrige periode',
            })
        ).toBeEnabled();

        await user.click(
            getByRole('button', {
                name: 'Gå tilbake til forrige periode',
            })
        );

        expect(
            getByRole('button', {
                name: 'Gå videre til neste periode',
            })
        ).toBeEnabled();
        expect(
            getByRole('button', {
                name: 'Gå tilbake til foreldelse',
            })
        ).toBeEnabled();
    });

    test('- vis utfylt - forstod/burde forstått - forsto - lesevisning', async () => {
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
        const behandling = mock<IBehandling>({ status: Behandlingstatus.FatterVedtak });
        const fagsak = mock<IFagsak>({
            ytelsestype: Ytelsetype.Barnetrygd,
        });

        const { getByText, getByRole, getByLabelText } = renderVilkårsvurderingContainer(
            behandling,
            fagsak
        );

        await waitFor(() => {
            // Tittel skal alltid være synlig
            expect(getByText('Tilbakekreving', { selector: 'h2' })).toBeInTheDocument();
            // Første periode sitt endringspanel skal være åpnet by default i lesevisning, sjekker at riktige verdier er satt
            expect(getByText('Detaljer for valgt periode', { selector: 'h2' })).toBeInTheDocument();
        });

        expect(getByText('01.01.2020 - 31.03.2020', { selector: 'label' })).toBeInTheDocument();
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

        expect(
            getByRole('button', {
                name: 'Gå tilbake til foreldelse',
            })
        ).toBeEnabled();

        expect(
            getByRole('button', {
                name: 'Gå videre til neste periode',
            })
        ).toBeEnabled();

        await user.click(
            getByRole('button', {
                name: 'Suksess fra 01.05.2020 til 30.06.2020',
            })
        );

        // Tittel skal alltid være synlig
        expect(getByText('Tilbakekreving', { selector: 'h2' })).toBeInTheDocument();

        // Andre periode sitt endringspanel skal nå være åpnet, sjekker at riktige verdier er satt
        expect(getByText('Detaljer for valgt periode', { selector: 'h2' })).toBeInTheDocument();
        expect(getByText('01.05.2020 - 30.06.2020', { selector: 'label' })).toBeInTheDocument();
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

        // Alle tidslinje knappene skal alltid være synlige
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

        expect(
            getByRole('button', {
                name: 'Gå tilbake til forrige periode',
            })
        ).toBeEnabled();

        expect(
            getByRole('button', {
                name: 'Gå videre til vedtak',
            })
        ).toBeEnabled();

        await user.click(
            getByRole('button', {
                name: 'Gå tilbake til forrige periode',
            })
        );

        expect(
            getByRole('button', {
                name: 'Gå tilbake til foreldelse',
            })
        ).toBeEnabled();

        expect(
            getByRole('button', {
                name: 'Gå videre til neste periode',
            })
        ).toBeEnabled();
    });

    test('- periode med udefinert resultat er ikke behandlet', async () => {
        setupUseBehandlingApiMock({
            perioder: [
                {
                    ...perioder[0],
                    begrunnelse: 'Begrunnelse vilkår 1',
                    vilkårsvurderingsresultatInfo: {
                        vilkårsvurderingsresultat: Vilkårsresultat.Udefinert,
                        aktsomhet: undefined,
                        godTro: undefined,
                    },
                },
                {
                    ...perioder[1],
                    begrunnelse: 'Begrunnelse vilkår 2',
                    vilkårsvurderingsresultatInfo: {
                        vilkårsvurderingsresultat: Vilkårsresultat.GodTro,
                        aktsomhet: {
                            begrunnelse: 'Begrunnelse aktsomhet 2',
                            aktsomhet: Aktsomhet.Forsett,
                            særligeGrunner: [],
                        },
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
            ytelsestype: Ytelsetype.Overgangsstønad,
        });

        const { getByText, getByRole, getByLabelText } = renderVilkårsvurderingContainer(
            behandling,
            fagsak
        );

        await waitFor(() => {
            expect(getByText('Tilbakekreving')).toBeInTheDocument();
            expect(getByText('Detaljer for valgt periode')).toBeInTheDocument();
        });
        expect(
            getByRole('button', {
                name: 'Advarsel fra 01.01.2020 til 31.03.2020',
            })
        ).toBeInTheDocument();
        expect(
            getByRole('button', {
                name: 'Gå videre til neste periode',
            })
        ).toBeEnabled();
        expect(
            getByRole('button', {
                name: 'Gå tilbake til foreldelse',
            })
        ).toBeEnabled();

        expect(getByText('01.01.2020 - 31.03.2020', { selector: 'label' })).toBeInTheDocument();

        expect(getByLabelText('Vilkårene for tilbakekreving')).toHaveValue('Begrunnelse vilkår 1');
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
