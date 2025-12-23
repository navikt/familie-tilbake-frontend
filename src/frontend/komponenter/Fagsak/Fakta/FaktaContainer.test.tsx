import type { BehandlingApiHook } from '../../../api/behandling';
import type { BehandlingHook } from '../../../context/BehandlingContext';
import type { FagsakDto } from '../../../generated';
import type { Behandling } from '../../../typer/behandling';
import type { Ressurs } from '../../../typer/ressurs';
import type { FaktaResponse } from '../../../typer/tilbakekrevingstyper';
import type { RenderResult } from '@testing-library/react';
import type { UserEvent } from '@testing-library/user-event';
import type { NavigateFunction } from 'react-router';

import { render, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { mock } from 'jest-mock-extended';
import * as React from 'react';

import FaktaContainer from './FaktaContainer';
import { FaktaProvider } from './FaktaContext';
import { HendelseType, HendelseUndertype, Ytelsetype } from '../../../kodeverk';
import { lagBehandling } from '../../../testdata/behandlingFactory';
import { lagFagsak } from '../../../testdata/fagsakFactory';
import { lagFaktaPeriode, lagFaktaResponse } from '../../../testdata/faktaFactory';
import { RessursStatus } from '../../../typer/ressurs';

const mockUseBehandling = jest.fn();
jest.mock('../../../context/BehandlingContext', () => ({
    useBehandling: (): BehandlingHook => mockUseBehandling(),
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
    behandling: Behandling,
    ytelse: Ytelsetype,
    fagsak: FagsakDto
): RenderResult => {
    return render(
        <FaktaProvider behandling={behandling} fagsak={fagsak}>
            <FaktaContainer ytelse={ytelse} />
        </FaktaProvider>
    );
};

const feilutbetaltePerioder = [
    lagFaktaPeriode({
        periode: {
            fom: '2020-01-01',
            tom: '2020-03-31',
        },
        feilutbetaltBeløp: 1333,
    }),
    lagFaktaPeriode({
        periode: {
            fom: '2020-05-01',
            tom: '2020-07-31',
        },
        feilutbetaltBeløp: 1333,
    }),
    lagFaktaPeriode({
        periode: {
            fom: '2020-09-01',
            tom: '2020-10-31',
        },
        feilutbetaltBeløp: 1333,
    }),
];

const setupMock = (behandlet: boolean, lesemodus: boolean, fakta: FaktaResponse): void => {
    mockUseBehandlingApi.mockImplementation(() => ({
        gjerFaktaKall: (): Promise<Ressurs<FaktaResponse>> => {
            const ressurs = mock<Ressurs<FaktaResponse>>({
                status: RessursStatus.Suksess,
                data: fakta,
            });
            return Promise.resolve(ressurs);
        },
        sendInnFakta: (): Promise<Ressurs<string>> => {
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
        actionBarStegtekst: jest.fn().mockReturnValue('Steg 1 av 4'),
        harVærtPåFatteVedtakSteget: jest.fn().mockReturnValue(false),
    }));
};

describe('FaktaContainer', () => {
    let user: UserEvent;
    beforeEach(() => {
        user = userEvent.setup();
        jest.clearAllMocks();
    });

    test('Vis og fyll ut skjema', async () => {
        setupMock(false, false, lagFaktaResponse({ feilutbetaltePerioder }));

        const { getByText, getByRole, getAllByRole, getByTestId, queryAllByText } =
            renderFaktaContainer(lagBehandling(), Ytelsetype.Barnetrygd, lagFagsak());
        await waitFor(() => {
            expect(getByText('Fakta fra feilutbetalingssaken')).toBeInTheDocument();
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
                name: 'Gå videre til foreldelsessteget',
            })
        );
        await waitFor(() => {
            expect(queryAllByText('Feltet må fylles ut')).toHaveLength(4);
        });

        await user.selectOptions(getByTestId('perioder.0.årsak'), HendelseType.BosattIRiket);
        await user.selectOptions(getByTestId('perioder.1.årsak'), HendelseType.BorMedSøker);
        await user.selectOptions(getByTestId('perioder.2.årsak'), HendelseType.BosattIRiket);

        await user.type(
            getByRole('textbox', { name: 'Årsak til feilutbetalingen' }),
            'Begrunnelse'
        );

        expect(getAllByRole('textbox')).toHaveLength(1);

        expect(getAllByRole('combobox')).toHaveLength(6);

        await user.click(
            getByRole('button', {
                name: 'Gå videre til foreldelsessteget',
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
                name: 'Gå videre til foreldelsessteget',
            })
        );
        await waitFor(() => {
            expect(queryAllByText('Feltet må fylles ut')).toHaveLength(0);
        });
        expect(mockedSettIkkePersistertKomponent).toHaveBeenCalledWith('fakta');
    });

    test('Vis og fyll ut skjema - behandle perioder samlet', async () => {
        setupMock(false, false, lagFaktaResponse({ feilutbetaltePerioder }));

        const { getByText, getByLabelText, getByRole, getAllByRole, getByTestId, queryAllByText } =
            renderFaktaContainer(lagBehandling(), Ytelsetype.Barnetrygd, lagFagsak());

        await waitFor(() => {
            expect(getByText('Fakta fra feilutbetalingssaken')).toBeInTheDocument();
        });

        expect(getByText('Periode med feilutbetaling')).toBeInTheDocument();
        expect(getByText('Opprett tilbakekreving, send varsel')).toBeInTheDocument();
        expect(getByText('01.01.2020 - 31.03.2020')).toBeInTheDocument();
        expect(queryAllByText('Feltet må fylles ut')).toHaveLength(0);
        expect(getAllByRole('combobox')).toHaveLength(3);

        await user.click(
            getByRole('button', {
                name: 'Gå videre til foreldelsessteget',
            })
        );
        await waitFor(() => {
            expect(queryAllByText('Feltet må fylles ut')).toHaveLength(5);
        });

        await user.click(
            getByRole('checkbox', {
                name: 'Velg rettslig grunnlag for periodene samlet',
            })
        );

        await user.selectOptions(getByTestId('perioder.0.årsak'), HendelseType.BosattIRiket);
        await user.type(getByLabelText('Årsak til feilutbetalingen'), 'Begrunnelse');

        expect(getAllByRole('combobox')).toHaveLength(6);

        await user.click(
            getByRole('button', {
                name: 'Gå videre til foreldelsessteget',
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
                name: 'Gå videre til foreldelsessteget',
            })
        );
        await waitFor(() => {
            expect(queryAllByText('Feltet må fylles ut')).toHaveLength(0);
        });
        expect(mockedSettIkkePersistertKomponent).toHaveBeenCalledWith('fakta');
    });

    test('Vis utfylt skjema - Barnetrygd', async () => {
        const faktaResponse = lagFaktaResponse({
            begrunnelse: 'Dette er en test-begrunnelse',
            feilutbetaltePerioder: [
                {
                    ...feilutbetaltePerioder[0],
                    hendelsestype: HendelseType.BosattIRiket,
                    hendelsesundertype: HendelseUndertype.BrukerBorIkkeINorge,
                },
                {
                    ...feilutbetaltePerioder[1],
                    hendelsestype: HendelseType.Annet,
                    hendelsesundertype: HendelseUndertype.AnnetFritekst,
                },
                {
                    ...feilutbetaltePerioder[2],
                    hendelsestype: HendelseType.BarnsAlder,
                    hendelsesundertype: HendelseUndertype.BarnOver6År,
                },
            ],
        });
        setupMock(true, false, faktaResponse);

        const { getByText, getByLabelText, getByTestId, getByRole } = renderFaktaContainer(
            lagBehandling(),
            Ytelsetype.Barnetrygd,
            lagFagsak()
        );

        await waitFor(() => {
            expect(getByText('Fakta fra feilutbetalingssaken')).toBeInTheDocument();
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

        expect(getByLabelText('Årsak til feilutbetalingen')).toHaveValue(
            'Dette er en test-begrunnelse'
        );

        expect(
            getByRole('button', {
                name: 'Gå videre til foreldelsessteget',
            })
        ).toBeInTheDocument();
    });

    test('Vis utfylt skjema - Overgangsstønad', async () => {
        const faktaResponse = lagFaktaResponse({
            begrunnelse: 'Dette er en test-begrunnelse',
            feilutbetaltePerioder: [
                {
                    ...feilutbetaltePerioder[0],
                    hendelsestype: HendelseType.EnsligForsørger,
                    hendelsesundertype: HendelseUndertype.Ugift,
                },
                {
                    ...feilutbetaltePerioder[1],
                    hendelsestype: HendelseType.Annet,
                    hendelsesundertype: HendelseUndertype.AnnetFritekst,
                },
                {
                    ...feilutbetaltePerioder[2],
                    hendelsestype: HendelseType.YrkesrettetAktivitet,
                    hendelsesundertype: HendelseUndertype.Arbeid,
                },
            ],
        });
        setupMock(true, false, faktaResponse);

        const { getByText, getByLabelText, getByTestId, getByRole } = renderFaktaContainer(
            lagBehandling(),
            Ytelsetype.Overgangsstønad,
            lagFagsak()
        );

        await waitFor(() => {
            expect(getByText('Fakta fra feilutbetalingssaken')).toBeInTheDocument();
        });

        expect(getByText('Periode med feilutbetaling')).toBeInTheDocument();
        expect(getByText('01.01.2020 - 31.03.2020')).toBeInTheDocument();
        expect(getByTestId('perioder.0.årsak')).toHaveValue(HendelseType.EnsligForsørger);
        expect(getByTestId('perioder.1.årsak')).toHaveValue(HendelseType.Annet);
        expect(getByTestId('perioder.2.årsak')).toHaveValue(HendelseType.YrkesrettetAktivitet);
        expect(getByTestId('perioder.0.underårsak')).toHaveValue(HendelseUndertype.Ugift);
        expect(getByTestId('perioder.1.underårsak')).toHaveValue(HendelseUndertype.AnnetFritekst);
        expect(getByTestId('perioder.2.underårsak')).toHaveValue(HendelseUndertype.Arbeid);

        expect(getByLabelText('Årsak til feilutbetalingen')).toHaveValue(
            'Dette er en test-begrunnelse'
        );

        expect(
            getByRole('button', {
                name: 'Gå videre til foreldelsessteget',
            })
        ).toBeInTheDocument();
    });

    test('Vis utfylt skjema - lesevisning - Barnetrygd', async () => {
        const faktaResponse = lagFaktaResponse({
            begrunnelse: 'Dette er en test-begrunnelse',
            feilutbetaltePerioder: [
                {
                    ...feilutbetaltePerioder[0],
                    hendelsestype: HendelseType.BosattIRiket,
                    hendelsesundertype: HendelseUndertype.BrukerBorIkkeINorge,
                },
                {
                    ...feilutbetaltePerioder[1],
                    hendelsestype: HendelseType.Annet,
                    hendelsesundertype: HendelseUndertype.AnnetFritekst,
                },
                {
                    ...feilutbetaltePerioder[2],
                    hendelsestype: HendelseType.BarnsAlder,
                    hendelsesundertype: HendelseUndertype.BarnOver6År,
                },
            ],
        });
        setupMock(true, true, faktaResponse);

        const { getByText, getByRole } = renderFaktaContainer(
            lagBehandling(),
            Ytelsetype.Barnetrygd,
            lagFagsak()
        );

        await waitFor(() => {
            expect(getByText('Fakta fra feilutbetalingssaken')).toBeInTheDocument();
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
                name: 'Gå videre til foreldelsessteget',
            })
        ).toBeInTheDocument();
    });

    test('Vis utfylt skjema - lesevisning - Overgangsstønad', async () => {
        const faktaResponse = lagFaktaResponse({
            begrunnelse: 'Dette er en test-begrunnelse',
            feilutbetaltePerioder: [
                {
                    ...feilutbetaltePerioder[0],
                    hendelsestype: HendelseType.EnsligForsørger,
                    hendelsesundertype: HendelseUndertype.Ugift,
                },
                {
                    ...feilutbetaltePerioder[1],
                    hendelsestype: HendelseType.Annet,
                    hendelsesundertype: HendelseUndertype.AnnetFritekst,
                },
                {
                    ...feilutbetaltePerioder[2],
                    hendelsestype: HendelseType.YrkesrettetAktivitet,
                    hendelsesundertype: HendelseUndertype.Arbeid,
                },
            ],
        });
        setupMock(true, true, faktaResponse);

        const { getByText, getByRole } = renderFaktaContainer(
            lagBehandling(),
            Ytelsetype.Overgangsstønad,
            lagFagsak()
        );

        await waitFor(() => {
            expect(getByText('Fakta fra feilutbetalingssaken')).toBeInTheDocument();
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
                name: 'Gå videre til foreldelsessteget',
            })
        ).toBeInTheDocument();
    });

    test('Velg hendelsesundertype automatisk ved kun ett valg', async () => {
        setupMock(
            false,
            false,
            lagFaktaResponse({ feilutbetaltePerioder: [feilutbetaltePerioder[0]] })
        );

        const { getByTestId, getAllByRole } = renderFaktaContainer(
            lagBehandling(),
            Ytelsetype.Overgangsstønad,
            lagFagsak()
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
