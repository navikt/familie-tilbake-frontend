import type { BehandlingApiHook } from '../../../api/behandling';
import type { BehandlingHook } from '../../../context/BehandlingContext';
import type { TogglesHook } from '../../../context/TogglesContext';
import type { IBehandling } from '../../../typer/behandling';
import type { IFagsak } from '../../../typer/fagsak';
import type { FaktaPeriode, IFeilutbetalingFakta } from '../../../typer/feilutbetalingtyper';
import type { RenderResult } from '@testing-library/react';
import type { UserEvent } from '@testing-library/user-event';
import type { NavigateFunction } from 'react-router';

import { render, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { mock } from 'jest-mock-extended';
import * as React from 'react';

import FaktaContainer from './FaktaContainer';
import { FeilutbetalingFaktaProvider } from './FeilutbetalingFaktaContext';
import { ToggleName } from '../../../context/toggles';
import { Fagsystem, HendelseType, HendelseUndertype, Ytelsetype } from '../../../kodeverk';
import { HarBrukerUttaltSegValg, Tilbakekrevingsvalg } from '../../../typer/feilutbetalingtyper';
import { type Ressurs, RessursStatus } from '../../../typer/ressurs';

const mockUseBehandling = jest.fn();
jest.mock('../../../context/BehandlingContext', () => ({
    useBehandling: (): BehandlingHook => mockUseBehandling(),
}));

const mockUseToggles = jest.fn();
jest.mock('../../../context/TogglesContext', () => ({
    useToggles: (): TogglesHook => mockUseToggles(),
}));

const mockUseBehandlingApi = jest.fn();
jest.mock('../../../api/behandling', () => ({
    useBehandlingApi: (): BehandlingApiHook => mockUseBehandlingApi(),
}));

jest.mock('react-router', () => ({
    ...jest.requireActual('react-router'),
    useNavigate: (): NavigateFunction => jest.fn(),
}));

const mockedSettIkkePersistertKomponent = jest.fn();

const renderFaktaContainer = (
    behandling: IBehandling,
    ytelse: Ytelsetype,
    fagsak: IFagsak
): RenderResult => {
    return render(
        <FeilutbetalingFaktaProvider behandling={behandling} fagsak={fagsak}>
            <FaktaContainer ytelse={ytelse} />
        </FeilutbetalingFaktaProvider>
    );
};

describe('Tester: FaktaContainer', () => {
    let user: UserEvent;

    beforeEach(() => {
        user = userEvent.setup();
        jest.clearAllMocks();
    });
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

    const setupMock = (
        behandlet: boolean,
        lesemodus: boolean,
        fakta: IFeilutbetalingFakta
    ): void => {
        mockUseBehandlingApi.mockImplementation(() => ({
            gjerFeilutbetalingFaktaKall: (): Promise<Ressurs<IFeilutbetalingFakta>> => {
                const ressurs = mock<Ressurs<IFeilutbetalingFakta>>({
                    status: RessursStatus.Suksess,
                    data: fakta,
                });
                return Promise.resolve(ressurs);
            },
            sendInnFeilutbetalingFakta: (): Promise<Ressurs<string>> => {
                const ressurs = mock<Ressurs<string>>({
                    status: RessursStatus.Suksess,
                    data: 'suksess',
                });
                return Promise.resolve(ressurs);
            },
        }));
        mockUseBehandling.mockImplementation(() => ({
            erStegBehandlet: (): boolean => behandlet,
            visVenteModal: false,
            behandlingILesemodus: lesemodus,
            hentBehandlingMedBehandlingId: (): Promise<void> => Promise.resolve(),
            settIkkePersistertKomponent: mockedSettIkkePersistertKomponent,
            nullstillIkkePersisterteKomponenter: jest.fn(),
        }));
        mockUseToggles.mockImplementation(() => ({
            toggles: { [ToggleName.Dummy]: true },
            feilmelding: '',
        }));
    };

    test('- vis og fyll ut skjema', async () => {
        setupMock(false, false, feilutbetalingFakta);
        const behandling = mock<IBehandling>({ eksternBrukId: '1' });

        const { getByText, getByRole, getAllByRole, getByTestId, queryAllByText } =
            renderFaktaContainer(behandling, Ytelsetype.Barnetrygd, fagsak);
        await waitFor(() => {
            expect(getByText('Fakta om feilutbetaling')).toBeInTheDocument();
        });

        expect(getByText('Periode med feilutbetaling')).toBeInTheDocument();
        expect(getByText('01.01.2020 - 31.10.2020')).toBeInTheDocument();
        expect(getByText('3 999')).toBeInTheDocument();
        expect(getByText('5 200')).toBeInTheDocument();

        expect(getByText('Nye opplysninger')).toBeInTheDocument();
        expect(getByText('05.02.2021')).toBeInTheDocument();
        expect(getByText('Opphør av ytelsen')).toBeInTheDocument();
        expect(getByText('Reduksjon av ytelsen, Feilutbetaling')).toBeInTheDocument();
        expect(getByText('Opprett tilbakekreving, send varsel')).toBeInTheDocument();

        expect(getByText('01.01.2020 - 31.03.2020')).toBeInTheDocument();

        expect(getByText('01.05.2020 - 31.07.2020')).toBeInTheDocument();
        expect(getByText('01.09.2020 - 31.10.2020')).toBeInTheDocument();
        expect(queryAllByText('1 333')).toHaveLength(3);

        expect(queryAllByText('Feltet må fylles ut')).toHaveLength(0);
        expect(getAllByRole('combobox')).toHaveLength(3);

        await user.click(getByTestId('brukerHarUttaltSeg.nei'));

        await user.click(
            getByRole('button', {
                name: 'Lagre og fortsett',
            })
        );
        await waitFor(() => {
            expect(queryAllByText('Feltet må fylles ut')).toHaveLength(4);
        });

        await user.selectOptions(getByTestId('perioder.0.årsak'), HendelseType.BosattIRiket);
        await user.selectOptions(getByTestId('perioder.1.årsak'), HendelseType.BorMedSøker);
        await user.selectOptions(getByTestId('perioder.2.årsak'), HendelseType.BosattIRiket);

        await user.type(
            getByRole('textbox', { name: 'Forklar årsaken(e) til feilutbetalingen' }),
            'Begrunnelse'
        );

        expect(getAllByRole('textbox')).toHaveLength(1);

        expect(getAllByRole('combobox')).toHaveLength(6);

        await user.click(
            getByRole('button', {
                name: 'Lagre og fortsett',
            })
        );
        // BorMedSøker har kun 1 underårsak og vil derfor bli automatisk satt
        await waitFor(() => {
            expect(queryAllByText('Feltet må fylles ut')).toHaveLength(2);
        });

        await user.selectOptions(
            getByTestId('perioder.0.underårsak'),
            HendelseUndertype.BrukerBorIkkeINorge
        );
        await user.selectOptions(
            getByTestId('perioder.1.underårsak'),
            HendelseUndertype.BorIkkeMedBarn
        );
        await user.selectOptions(
            getByTestId('perioder.2.underårsak'),
            HendelseUndertype.BrukerFlyttetFraNorge
        );

        await user.click(
            getByRole('button', {
                name: 'Lagre og fortsett',
            })
        );
        await waitFor(() => {
            expect(queryAllByText('Feltet må fylles ut')).toHaveLength(0);
        });
        expect(mockedSettIkkePersistertKomponent).toHaveBeenCalledWith('fakta');
    });

    test('- vis og fyll ut skjema - behandle perioder samlet', async () => {
        setupMock(false, false, feilutbetalingFakta);
        const behandling = mock<IBehandling>({ eksternBrukId: '1' });

        const { getByText, getByLabelText, getByRole, getAllByRole, getByTestId, queryAllByText } =
            renderFaktaContainer(behandling, Ytelsetype.Barnetrygd, fagsak);

        await waitFor(() => {
            expect(getByText('Fakta om feilutbetaling')).toBeInTheDocument();
        });

        expect(getByText('Periode med feilutbetaling')).toBeInTheDocument();
        expect(getByText('Opprett tilbakekreving, send varsel')).toBeInTheDocument();
        expect(getByText('01.01.2020 - 31.03.2020')).toBeInTheDocument();
        expect(queryAllByText('Feltet må fylles ut')).toHaveLength(0);
        expect(getAllByRole('combobox')).toHaveLength(3);

        await user.click(
            getByRole('button', {
                name: 'Lagre og fortsett',
            })
        );
        await waitFor(() => {
            expect(queryAllByText('Feltet må fylles ut')).toHaveLength(5);
        });

        await user.click(
            getByRole('checkbox', {
                name: 'Behandle alle perioder samlet',
            })
        );

        await user.selectOptions(getByTestId('perioder.0.årsak'), HendelseType.BosattIRiket);
        await user.type(getByLabelText('Forklar årsaken(e) til feilutbetalingen'), 'Begrunnelse');

        expect(getAllByRole('combobox')).toHaveLength(6);

        await user.click(
            getByRole('button', {
                name: 'Lagre og fortsett',
            })
        );

        expect(queryAllByText('Feltet må fylles ut')).toHaveLength(4);

        await user.selectOptions(
            getByTestId('perioder.0.underårsak'),
            HendelseUndertype.BrukerBorIkkeINorge
        );
        await user.click(getByTestId('brukerHarUttaltSeg.ja'));
        await user.type(
            getByLabelText(
                'Beskriv når og hvor bruker har uttalt seg. Gi også en kort oppsummering av uttalelsen'
            ),
            'Begrunnelse'
        );
        await user.click(
            getByRole('button', {
                name: 'Lagre og fortsett',
            })
        );
        await waitFor(() => {
            expect(queryAllByText('Feltet må fylles ut')).toHaveLength(0);
        });
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

        const { getByText, getByLabelText, getByTestId, getByRole } = renderFaktaContainer(
            behandling,
            Ytelsetype.Barnetrygd,
            fagsak
        );

        await waitFor(() => {
            expect(getByText('Fakta om feilutbetaling')).toBeInTheDocument();
        });

        expect(getByText('Periode med feilutbetaling')).toBeInTheDocument();
        expect(getByText('01.01.2020 - 31.03.2020')).toBeInTheDocument();
        expect(getByTestId('perioder.0.årsak')).toHaveValue(HendelseType.BosattIRiket);
        expect(getByTestId('perioder.1.årsak')).toHaveValue(HendelseType.Annet);
        expect(getByTestId('perioder.2.årsak')).toHaveValue(HendelseType.BarnsAlder);
        expect(getByTestId('perioder.0.underårsak')).toHaveValue(
            HendelseUndertype.BrukerBorIkkeINorge
        );
        expect(getByTestId('perioder.1.underårsak')).toHaveValue(HendelseUndertype.AnnetFritekst);
        expect(getByTestId('perioder.2.underårsak')).toHaveValue(HendelseUndertype.BarnOver6År);

        expect(getByLabelText('Forklar årsaken(e) til feilutbetalingen')).toHaveValue(
            'Dette er en test-begrunnelse'
        );

        expect(
            getByRole('button', {
                name: 'Neste',
            })
        ).toBeInTheDocument();
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

        const { getByText, getByLabelText, getByTestId, getByRole } = renderFaktaContainer(
            behandling,
            Ytelsetype.Overgangsstønad,
            fagsak
        );

        await waitFor(() => {
            expect(getByText('Fakta om feilutbetaling')).toBeInTheDocument();
        });

        expect(getByText('Periode med feilutbetaling')).toBeInTheDocument();
        expect(getByText('01.01.2020 - 31.03.2020')).toBeInTheDocument();
        expect(getByTestId('perioder.0.årsak')).toHaveValue(HendelseType.EnsligForsørger);
        expect(getByTestId('perioder.1.årsak')).toHaveValue(HendelseType.Annet);
        expect(getByTestId('perioder.2.årsak')).toHaveValue(HendelseType.YrkesrettetAktivitet);
        expect(getByTestId('perioder.0.underårsak')).toHaveValue(HendelseUndertype.Ugift);
        expect(getByTestId('perioder.1.underårsak')).toHaveValue(HendelseUndertype.AnnetFritekst);
        expect(getByTestId('perioder.2.underårsak')).toHaveValue(HendelseUndertype.Arbeid);

        expect(getByLabelText('Forklar årsaken(e) til feilutbetalingen')).toHaveValue(
            'Dette er en test-begrunnelse'
        );

        expect(
            getByRole('button', {
                name: 'Neste',
            })
        ).toBeInTheDocument();
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

        const { getByText, getByRole } = renderFaktaContainer(
            behandling,
            Ytelsetype.Barnetrygd,
            fagsak
        );

        await waitFor(() => {
            expect(getByText('Fakta om feilutbetaling')).toBeInTheDocument();
        });

        expect(getByText('Periode med feilutbetaling')).toBeInTheDocument();
        expect(getByText('01.01.2020 - 31.03.2020')).toBeInTheDocument();
        expect(getByText('Bosatt i riket')).toBeInTheDocument();
        expect(getByText('Bruker bor ikke i Norge')).toBeInTheDocument();
        expect(getByText('Annet')).toBeInTheDocument();
        expect(getByText('Annet fritekst')).toBeInTheDocument();
        expect(getByText('Barns alder')).toBeInTheDocument();
        expect(getByText('Barn over 6 år')).toBeInTheDocument();
        expect(getByText('Dette er en test-begrunnelse')).toBeInTheDocument();

        expect(
            getByRole('button', {
                name: 'Neste',
            })
        ).toBeInTheDocument();
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

        const { getByText, getByRole } = renderFaktaContainer(
            behandling,
            Ytelsetype.Overgangsstønad,
            fagsak
        );

        await waitFor(() => {
            expect(getByText('Fakta om feilutbetaling')).toBeInTheDocument();
        });

        expect(getByText('Periode med feilutbetaling')).toBeInTheDocument();
        expect(getByText('01.01.2020 - 31.03.2020')).toBeInTheDocument();
        expect(getByText('§15-4 Enslig forsørger')).toBeInTheDocument();
        expect(getByText('Ugift (3. ledd)')).toBeInTheDocument();
        expect(getByText('Annet')).toBeInTheDocument();
        expect(getByText('Annet fritekst')).toBeInTheDocument();
        expect(getByText('§15-6 Yrkesrettet aktivitet')).toBeInTheDocument();
        expect(getByText('Arbeid')).toBeInTheDocument();
        expect(getByText('Dette er en test-begrunnelse')).toBeInTheDocument();

        expect(
            getByRole('button', {
                name: 'Neste',
            })
        ).toBeInTheDocument();
    });

    test('- velg hendelsesundertype automatisk ved kun ett valg', async () => {
        setupMock(false, false, {
            ...feilutbetalingFakta,
            feilutbetaltePerioder: [
                {
                    ...perioder[0],
                },
            ],
            begrunnelse: 'Dette er en test-begrunnelse',
        });
        const behandling = mock<IBehandling>();

        const { getByTestId, getAllByRole } = renderFaktaContainer(
            behandling,
            Ytelsetype.Overgangsstønad,
            fagsak
        );

        await waitFor(() => {
            user.selectOptions(getByTestId('perioder.0.årsak'), HendelseType.Overgangsstønad);
        });

        expect(getAllByRole('combobox')).toHaveLength(1);

        await waitFor(() => {
            expect(getByTestId('perioder.0.underårsak')).toHaveValue(HendelseUndertype.Barn8År);
        });
    });
});
