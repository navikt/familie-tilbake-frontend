import type { IBehandling } from '../../../typer/behandling';
import type { IFagsak } from '../../../typer/fagsak';
import type { FaktaPeriode, IFeilutbetalingFakta } from '../../../typer/feilutbetalingtyper';

import { act, render, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { mock } from 'jest-mock-extended';
import * as React from 'react';

import FaktaContainer from './FaktaContainer';
import { FeilutbetalingFaktaProvider } from './FeilutbetalingFaktaContext';
import { useBehandlingApi } from '../../../api/behandling';
import { useBehandling } from '../../../context/BehandlingContext';
import { ToggleName } from '../../../context/toggles';
import { useToggles } from '../../../context/TogglesContext';
import { Fagsystem, HendelseType, HendelseUndertype, Ytelsetype } from '../../../kodeverk';
import { HarBrukerUttaltSegValg, Tilbakekrevingsvalg } from '../../../typer/feilutbetalingtyper';
import { type Ressurs, RessursStatus } from '../../../typer/ressurs';

jest.mock('../../../context/BehandlingContext', () => ({
    useBehandling: jest.fn(),
}));

jest.mock('../../../context/TogglesContext', () => ({
    useToggles: jest.fn(),
}));

jest.mock('../../../api/behandling', () => ({
    useBehandlingApi: jest.fn(),
}));

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => jest.fn(),
}));

const mockedSettIkkePersistertKomponent = jest.fn();

describe('Tester: FaktaContainer', () => {
    const perioder: FaktaPeriode[] = [
        {
            feilutbetaltBeløp: 1333,
            periode: {
                fom: '2020-01-01',
                tom: '2020-03-31',
            },
            hendelsestype: undefined,
            hendelsesundertype: undefined,
        },
        {
            feilutbetaltBeløp: 1333,
            periode: {
                fom: '2020-05-01',
                tom: '2020-07-31',
            },
            hendelsestype: undefined,
            hendelsesundertype: undefined,
        },
        {
            feilutbetaltBeløp: 1333,
            periode: {
                fom: '2020-09-01',
                tom: '2020-10-31',
            },
            hendelsestype: undefined,
            hendelsesundertype: undefined,
        },
    ];
    const feilutbetalingFakta: IFeilutbetalingFakta = {
        feilutbetaltePerioder: perioder,
        revurderingsvedtaksdato: '2021-02-05',
        totalFeilutbetaltPeriode: {
            fom: '2020-01-01',
            tom: '2020-10-31',
        },
        totaltFeilutbetaltBeløp: 3999,
        varsletBeløp: 5200,
        faktainfo: {
            revurderingsårsak: 'Nye opplysninger',
            revurderingsresultat: 'Opphør av ytelsen',
            tilbakekrevingsvalg: Tilbakekrevingsvalg.OpprettTilbakekrevingMedVarsel,
            konsekvensForYtelser: ['Reduksjon av ytelsen', 'Feilutbetaling'],
        },
        begrunnelse: undefined,
        vurderingAvBrukersUttalelse: {
            harBrukerUttaltSeg: HarBrukerUttaltSegValg.IkkeVurdert,
        },
        opprettetTid: '2020-01-01',
    };
    const fagsak = mock<IFagsak>({
        institusjon: undefined,
        fagsystem: Fagsystem.EF,
        eksternFagsakId: '1',
    });

    const setupMock = (behandlet: boolean, lesemodus: boolean, fakta: IFeilutbetalingFakta) => {
        // @ts-expect-error mocking
        useBehandlingApi.mockImplementation(() => ({
            gjerFeilutbetalingFaktaKall: () => {
                const ressurs = mock<Ressurs<IFeilutbetalingFakta>>({
                    status: RessursStatus.Suksess,
                    data: fakta,
                });
                return Promise.resolve(ressurs);
            },
            sendInnFeilutbetalingFakta: () => {
                const ressurs = mock<Ressurs<string>>({
                    status: RessursStatus.Suksess,
                    data: 'suksess',
                });
                return Promise.resolve(ressurs);
            },
        }));
        // @ts-expect-error mocking
        useBehandling.mockImplementation(() => ({
            erStegBehandlet: () => behandlet,
            visVenteModal: false,
            behandlingILesemodus: lesemodus,
            hentBehandlingMedBehandlingId: () => Promise.resolve(),
            settIkkePersistertKomponent: mockedSettIkkePersistertKomponent,
            nullstillIkkePersisterteKomponenter: jest.fn(),
        }));
        // @ts-expect-error mocking
        useToggles.mockImplementation(() => ({
            toggles: { [ToggleName.Dummy]: true },
            feilmelding: '',
        }));
    };

    test('- vis og fyll ut skjema', async () => {
        const user = userEvent.setup();
        setupMock(false, false, feilutbetalingFakta);
        const behandling = mock<IBehandling>({ eksternBrukId: '1' });

        const { getByText, getByRole, getAllByRole, getByTestId, queryAllByText } = render(
            <FeilutbetalingFaktaProvider behandling={behandling} fagsak={fagsak}>
                <FaktaContainer ytelse={Ytelsetype.Barnetrygd} />
            </FeilutbetalingFaktaProvider>
        );

        await waitFor(async () => {
            expect(getByText('Fakta om feilutbetaling')).toBeTruthy();
            expect(getByText('Periode med feilutbetaling')).toBeTruthy();
        });

        expect(getByText('01.01.2020 - 31.10.2020')).toBeTruthy();
        expect(getByText('3 999')).toBeTruthy();
        expect(getByText('5 200')).toBeTruthy();

        expect(getByText('Nye opplysninger')).toBeTruthy();
        expect(getByText('05.02.2021')).toBeTruthy();
        expect(getByText('Opphør av ytelsen')).toBeTruthy();
        expect(getByText('Reduksjon av ytelsen, Feilutbetaling')).toBeTruthy();
        expect(getByText('Opprett tilbakekreving, send varsel')).toBeTruthy();

        await waitFor(async () => {
            expect(getByText('01.01.2020 - 31.03.2020')).toBeTruthy();
        });
        expect(getByText('01.05.2020 - 31.07.2020')).toBeTruthy();
        expect(getByText('01.09.2020 - 31.10.2020')).toBeTruthy();
        expect(queryAllByText('1 333')).toHaveLength(3);

        expect(queryAllByText('Feltet må fylles ut')).toHaveLength(0);
        expect(getAllByRole('combobox')).toHaveLength(3);

        await act(() => user.click(getByTestId('brukerHarUttaltSeg.nei')));

        await act(() =>
            user.click(
                getByRole('button', {
                    name: 'Bekreft og fortsett',
                })
            )
        );
        expect(queryAllByText('Feltet må fylles ut')).toHaveLength(4);

        act(() => {
            user.selectOptions(getByTestId('perioder.0.årsak'), HendelseType.BosattIRiket);
            user.selectOptions(getByTestId('perioder.1.årsak'), HendelseType.BorMedSøker);
            user.selectOptions(getByTestId('perioder.2.årsak'), HendelseType.BosattIRiket);
        });
        await act(() =>
            user.type(
                getByRole('textbox', { name: 'Forklar årsaken(e) til feilutbetalingen' }),
                'Begrunnelse'
            )
        );

        expect(getAllByRole('textbox')).toHaveLength(1);

        expect(getAllByRole('combobox')).toHaveLength(6);

        await act(() =>
            user.click(
                getByRole('button', {
                    name: 'Bekreft og fortsett',
                })
            )
        );
        expect(queryAllByText('Feltet må fylles ut')).toHaveLength(3);

        act(() => {
            user.selectOptions(
                getByTestId('perioder.0.underårsak'),
                HendelseUndertype.BrukerBorIkkeINorge
            );
            user.selectOptions(
                getByTestId('perioder.1.underårsak'),
                HendelseUndertype.BorIkkeMedBarn
            );
            user.selectOptions(
                getByTestId('perioder.2.underårsak'),
                HendelseUndertype.BrukerFlyttetFraNorge
            );
        });

        await act(() =>
            user.click(
                getByRole('button', {
                    name: 'Bekreft og fortsett',
                })
            )
        );
        expect(queryAllByText('Feltet må fylles ut')).toHaveLength(0);
        expect(mockedSettIkkePersistertKomponent).toHaveBeenCalledWith('fakta');
    });

    test('- vis og fyll ut skjema - behandle perioder samlet', async () => {
        const user = userEvent.setup();
        setupMock(false, false, feilutbetalingFakta);
        const behandling = mock<IBehandling>({ eksternBrukId: '1' });

        const { getByText, getByLabelText, getByRole, getAllByRole, getByTestId, queryAllByText } =
            render(
                <FeilutbetalingFaktaProvider behandling={behandling} fagsak={fagsak}>
                    <FaktaContainer ytelse={Ytelsetype.Barnetrygd} />
                </FeilutbetalingFaktaProvider>
            );

        await waitFor(async () => {
            expect(getByText('Fakta om feilutbetaling')).toBeTruthy();
            expect(getByText('Periode med feilutbetaling')).toBeTruthy();
        });

        expect(getByText('Opprett tilbakekreving, send varsel')).toBeTruthy();

        await waitFor(async () => {
            expect(getByText('01.01.2020 - 31.03.2020')).toBeTruthy();
        });

        expect(queryAllByText('Feltet må fylles ut')).toHaveLength(0);
        expect(getAllByRole('combobox')).toHaveLength(3);

        await act(() =>
            user.click(
                getByRole('button', {
                    name: 'Bekreft og fortsett',
                })
            )
        );
        expect(queryAllByText('Feltet må fylles ut')).toHaveLength(5);

        await act(() =>
            user.click(
                getByRole('checkbox', {
                    name: 'Behandle alle perioder samlet',
                })
            )
        );

        await act(() =>
            user.selectOptions(getByTestId('perioder.0.årsak'), HendelseType.BosattIRiket)
        );
        await act(() =>
            user.type(getByLabelText('Forklar årsaken(e) til feilutbetalingen'), 'Begrunnelse')
        );

        expect(getAllByRole('combobox')).toHaveLength(6);

        await act(() =>
            user.click(
                getByRole('button', {
                    name: 'Bekreft og fortsett',
                })
            )
        );
        expect(queryAllByText('Feltet må fylles ut')).toHaveLength(4);

        await act(() =>
            user.selectOptions(
                getByTestId('perioder.0.underårsak'),
                HendelseUndertype.BrukerBorIkkeINorge
            )
        );
        await act(() => user.click(getByTestId('brukerHarUttaltSeg.ja')));
        await act(() =>
            user.type(
                getByLabelText(
                    'Beskriv når og hvor bruker har uttalt seg. Gi også en kort oppsummering av uttalelsen'
                ),
                'Begrunnelse'
            )
        );

        await act(() =>
            user.click(
                getByRole('button', {
                    name: 'Bekreft og fortsett',
                })
            )
        );
        expect(queryAllByText('Feltet må fylles ut')).toHaveLength(0);
        expect(mockedSettIkkePersistertKomponent).toHaveBeenCalledWith('fakta');
    });

    test('- vis utfylt skjema - Barnetrygd', async () => {
        setupMock(true, false, {
            ...feilutbetalingFakta,
            feilutbetaltePerioder: [
                {
                    ...perioder[0],
                    hendelsestype: HendelseType.BosattIRiket,
                    hendelsesundertype: HendelseUndertype.BrukerBorIkkeINorge,
                },
                {
                    ...perioder[1],
                    hendelsestype: HendelseType.Annet,
                    hendelsesundertype: HendelseUndertype.AnnetFritekst,
                },
                {
                    ...perioder[2],
                    hendelsestype: HendelseType.BarnsAlder,
                    hendelsesundertype: HendelseUndertype.BarnOver6År,
                },
            ],
            begrunnelse: 'Dette er en test-begrunnelse',
        });
        const behandling = mock<IBehandling>();

        const { getByText, getByLabelText, getByTestId, getByRole } = render(
            <FeilutbetalingFaktaProvider behandling={behandling} fagsak={fagsak}>
                <FaktaContainer ytelse={Ytelsetype.Barnetrygd} />
            </FeilutbetalingFaktaProvider>
        );

        await waitFor(async () => {
            expect(getByText('Fakta om feilutbetaling')).toBeTruthy();
            expect(getByText('Periode med feilutbetaling')).toBeTruthy();
            expect(getByText('01.01.2020 - 31.03.2020')).toBeTruthy();
        });

        expect(getByTestId('perioder.0.årsak')).toHaveValue(HendelseType.BosattIRiket);
        expect(getByTestId('perioder.1.årsak')).toHaveValue(HendelseType.Annet);
        expect(getByTestId('perioder.2.årsak')).toHaveValue(HendelseType.BarnsAlder);

        await waitFor(async () => {
            expect(getByTestId('perioder.0.underårsak')).toHaveValue(
                HendelseUndertype.BrukerBorIkkeINorge
            );
        });
        expect(getByTestId('perioder.1.underårsak')).toHaveValue(HendelseUndertype.AnnetFritekst);
        expect(getByTestId('perioder.2.underårsak')).toHaveValue(HendelseUndertype.BarnOver6År);

        expect(getByLabelText('Forklar årsaken(e) til feilutbetalingen')).toHaveValue(
            'Dette er en test-begrunnelse'
        );

        expect(
            getByRole('button', {
                name: 'Neste',
            })
        ).toBeTruthy();
    });

    test('- vis utfylt skjema - Overgangsstønad', async () => {
        setupMock(true, false, {
            ...feilutbetalingFakta,
            feilutbetaltePerioder: [
                {
                    ...perioder[0],
                    hendelsestype: HendelseType.EnsligForsørger,
                    hendelsesundertype: HendelseUndertype.Ugift,
                },
                {
                    ...perioder[1],
                    hendelsestype: HendelseType.Annet,
                    hendelsesundertype: HendelseUndertype.AnnetFritekst,
                },
                {
                    ...perioder[2],
                    hendelsestype: HendelseType.YrkesrettetAktivitet,
                    hendelsesundertype: HendelseUndertype.Arbeid,
                },
            ],
            begrunnelse: 'Dette er en test-begrunnelse',
        });
        const behandling = mock<IBehandling>();

        const { getByText, getByLabelText, getByTestId, getByRole } = render(
            <FeilutbetalingFaktaProvider behandling={behandling} fagsak={fagsak}>
                <FaktaContainer ytelse={Ytelsetype.Overganggstønad} />
            </FeilutbetalingFaktaProvider>
        );

        await waitFor(async () => {
            expect(getByText('Fakta om feilutbetaling')).toBeTruthy();
            expect(getByText('Periode med feilutbetaling')).toBeTruthy();
            expect(getByText('01.01.2020 - 31.03.2020')).toBeTruthy();
        });

        expect(getByTestId('perioder.0.årsak')).toHaveValue(HendelseType.EnsligForsørger);
        expect(getByTestId('perioder.1.årsak')).toHaveValue(HendelseType.Annet);
        expect(getByTestId('perioder.2.årsak')).toHaveValue(HendelseType.YrkesrettetAktivitet);

        await waitFor(async () => {
            expect(getByTestId('perioder.0.underårsak')).toHaveValue(HendelseUndertype.Ugift);
        });
        expect(getByTestId('perioder.1.underårsak')).toHaveValue(HendelseUndertype.AnnetFritekst);
        expect(getByTestId('perioder.2.underårsak')).toHaveValue(HendelseUndertype.Arbeid);

        expect(getByLabelText('Forklar årsaken(e) til feilutbetalingen')).toHaveValue(
            'Dette er en test-begrunnelse'
        );

        expect(
            getByRole('button', {
                name: 'Neste',
            })
        ).toBeTruthy();
    });

    test('- vis utfylt skjema - lesevisning - Barnetrygd', async () => {
        setupMock(true, true, {
            ...feilutbetalingFakta,
            feilutbetaltePerioder: [
                {
                    ...perioder[0],
                    hendelsestype: HendelseType.BosattIRiket,
                    hendelsesundertype: HendelseUndertype.BrukerBorIkkeINorge,
                },
                {
                    ...perioder[1],
                    hendelsestype: HendelseType.Annet,
                    hendelsesundertype: HendelseUndertype.AnnetFritekst,
                },
                {
                    ...perioder[2],
                    hendelsestype: HendelseType.BarnsAlder,
                    hendelsesundertype: HendelseUndertype.BarnOver6År,
                },
            ],
            begrunnelse: 'Dette er en test-begrunnelse',
        });
        const behandling = mock<IBehandling>();

        const { getByText, getByRole } = render(
            <FeilutbetalingFaktaProvider behandling={behandling} fagsak={fagsak}>
                <FaktaContainer ytelse={Ytelsetype.Barnetrygd} />
            </FeilutbetalingFaktaProvider>
        );

        await waitFor(async () => {
            expect(getByText('Fakta om feilutbetaling')).toBeTruthy();
            expect(getByText('Periode med feilutbetaling')).toBeTruthy();
            expect(getByText('01.01.2020 - 31.03.2020')).toBeTruthy();

            expect(getByText('Bosatt i riket')).toBeTruthy();
            expect(getByText('Bruker bor ikke i Norge')).toBeTruthy();
            expect(getByText('Annet')).toBeTruthy();
        });

        expect(getByText('Annet fritekst')).toBeTruthy();
        expect(getByText('Barns alder')).toBeTruthy();
        expect(getByText('Barn over 6 år')).toBeTruthy();
        expect(getByText('Dette er en test-begrunnelse')).toBeTruthy();

        expect(
            getByRole('button', {
                name: 'Neste',
            })
        ).toBeTruthy();
    });

    test('- vis utfylt skjema - lesevisning - Overgangsstønad', async () => {
        setupMock(true, true, {
            ...feilutbetalingFakta,
            feilutbetaltePerioder: [
                {
                    ...perioder[0],
                    hendelsestype: HendelseType.EnsligForsørger,
                    hendelsesundertype: HendelseUndertype.Ugift,
                },
                {
                    ...perioder[1],
                    hendelsestype: HendelseType.Annet,
                    hendelsesundertype: HendelseUndertype.AnnetFritekst,
                },
                {
                    ...perioder[2],
                    hendelsestype: HendelseType.YrkesrettetAktivitet,
                    hendelsesundertype: HendelseUndertype.Arbeid,
                },
            ],
            begrunnelse: 'Dette er en test-begrunnelse',
        });
        const behandling = mock<IBehandling>();

        const { getByText, getByRole } = render(
            <FeilutbetalingFaktaProvider behandling={behandling} fagsak={fagsak}>
                <FaktaContainer ytelse={Ytelsetype.Overganggstønad} />
            </FeilutbetalingFaktaProvider>
        );

        await waitFor(async () => {
            expect(getByText('Fakta om feilutbetaling')).toBeTruthy();
            expect(getByText('Periode med feilutbetaling')).toBeTruthy();
            expect(getByText('01.01.2020 - 31.03.2020')).toBeTruthy();

            expect(getByText('§15-4 Enslig forsørger')).toBeTruthy();
            expect(getByText('Ugift (3. ledd)')).toBeTruthy();
            expect(getByText('Annet')).toBeTruthy();
        });

        expect(getByText('Annet fritekst')).toBeTruthy();
        expect(getByText('§15-6 Yrkesrettet aktivitet')).toBeTruthy();
        expect(getByText('Arbeid')).toBeTruthy();
        expect(getByText('Dette er en test-begrunnelse')).toBeTruthy();

        expect(
            getByRole('button', {
                name: 'Neste',
            })
        ).toBeTruthy();
    });
});
