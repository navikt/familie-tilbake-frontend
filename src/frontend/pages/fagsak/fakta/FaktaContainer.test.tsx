import type { UserEvent } from '@testing-library/user-event';
import type { BehandlingApiHook } from '~/api/behandling';
import type { BehandlingDto, SchemaEnum4 } from '~/generated';
import type { Ressurs } from '~/typer/ressurs';
import type { FaktaResponse } from '~/typer/tilbakekrevingstyper';

import { QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { vi } from 'vitest';

import { FagsakContext } from '~/context/FagsakContext';
import { HendelseType, HendelseUndertype } from '~/kodeverk';
import { TestBehandlingProvider } from '~/testdata/behandlingContextFactory';
import { lagBehandling } from '~/testdata/behandlingFactory';
import { lagFagsak } from '~/testdata/fagsakFactory';
import { lagFaktaPeriode, lagFaktaResponse } from '~/testdata/faktaFactory';
import { createTestQueryClient } from '~/testutils/queryTestUtils';
import { RessursStatus } from '~/typer/ressurs';

import { FaktaContainer } from './FaktaContainer';
import { FaktaProvider } from './FaktaContext';

const mockUseBehandlingApi = vi.fn();
vi.mock('~/api/behandling', () => ({
    useBehandlingApi: (): BehandlingApiHook => mockUseBehandlingApi(),
}));

const mockedSettIkkePersistertKomponent = vi.fn();

const renderFaktaContainer = (
    behandling: BehandlingDto,
    ytelsestype: SchemaEnum4 = 'BARNETRYGD',
    behandlet: boolean = false,
    lesemodus: boolean = false
): void => {
    const queryClient = createTestQueryClient();
    render(
        <QueryClientProvider client={queryClient}>
            <FagsakContext value={lagFagsak({ ytelsestype })}>
                <TestBehandlingProvider
                    behandling={behandling}
                    stateOverrides={{
                        behandlingILesemodus: lesemodus,
                        erStegBehandlet: (): boolean => behandlet,
                        setIkkePersistertKomponent: mockedSettIkkePersistertKomponent,
                    }}
                >
                    <FaktaProvider>
                        <FaktaContainer />
                    </FaktaProvider>
                </TestBehandlingProvider>
            </FagsakContext>
        </QueryClientProvider>
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

const setupMock = (fakta: FaktaResponse): void => {
    mockUseBehandlingApi.mockImplementation(() => ({
        gjerFaktaKall: (): Promise<Ressurs<FaktaResponse>> => {
            const ressurs: Ressurs<FaktaResponse> = {
                status: RessursStatus.Suksess,
                data: fakta,
            };
            return Promise.resolve(ressurs);
        },
        sendInnFakta: (): Promise<Ressurs<string>> => {
            const ressurs: Ressurs<string> = {
                status: RessursStatus.Suksess,
                data: 'suksess',
            };
            return Promise.resolve(ressurs);
        },
    }));
};

const gåVidereKnapp = (): HTMLElement =>
    screen.getByRole('button', {
        name: 'Gå videre til foreldelsessteget',
    });

describe('FaktaContainer', () => {
    let user: UserEvent;
    beforeEach(() => {
        user = userEvent.setup();
        vi.clearAllMocks();
    });

    test('Vis og fyll ut skjema', async () => {
        setupMock(lagFaktaResponse({ feilutbetaltePerioder }));

        renderFaktaContainer(lagBehandling(), 'BARNETRYGD');

        expect(
            await screen.findByRole('heading', { name: 'Fakta fra feilutbetalingssaken' })
        ).toBeInTheDocument();

        expect(screen.getByText('Periode med feilutbetaling')).toBeInTheDocument();
        expect(screen.getByText('01.01.2020–31.10.2020')).toBeInTheDocument();
        expect(screen.getByText('3 999')).toBeInTheDocument();
        expect(screen.getByText('5 200')).toBeInTheDocument();

        expect(screen.getByText('Nye opplysninger')).toBeInTheDocument();
        expect(screen.getByText('05.02.2021')).toBeInTheDocument();
        expect(screen.getByText('Opphør av ytelsen')).toBeInTheDocument();
        expect(screen.getByText('Reduksjon av ytelsen, Feilutbetaling')).toBeInTheDocument();
        expect(screen.getByText('Opprett tilbakekreving, send varsel')).toBeInTheDocument();

        expect(screen.getByText('01.01.2020–31.03.2020')).toBeInTheDocument();

        expect(screen.getByText('01.05.2020–31.07.2020')).toBeInTheDocument();
        expect(screen.getByText('01.09.2020–31.10.2020')).toBeInTheDocument();
        expect(screen.getAllByText('1 333')).toHaveLength(3);

        expect(screen.queryAllByText('Feltet må fylles ut')).toHaveLength(0);
        expect(screen.getAllByRole('combobox')).toHaveLength(3);

        await user.click(screen.getByTestId('brukerHarUttaltSeg.nei'));

        await user.click(gåVidereKnapp());
        expect(screen.getAllByText('Feltet må fylles ut')).toHaveLength(4);

        await user.selectOptions(screen.getByTestId('perioder.0.årsak'), HendelseType.BosattIRiket);
        await user.selectOptions(screen.getByTestId('perioder.1.årsak'), HendelseType.BorMedSøker);
        await user.selectOptions(screen.getByTestId('perioder.2.årsak'), HendelseType.BosattIRiket);

        await user.type(
            screen.getByRole('textbox', { name: 'Årsak til feilutbetalingen' }),
            'Begrunnelse'
        );

        expect(screen.getAllByRole('textbox')).toHaveLength(1);

        expect(screen.getAllByRole('combobox')).toHaveLength(6);

        await user.click(gåVidereKnapp());
        // BorMedSøker har kun 1 underårsak og vil derfor bli automatisk satt
        expect(screen.getAllByText('Feltet må fylles ut')).toHaveLength(2);

        await user.selectOptions(
            screen.getByTestId('perioder.0.underårsak'),
            HendelseUndertype.BrukerBorIkkeINorge
        );
        await user.selectOptions(
            screen.getByTestId('perioder.1.underårsak'),
            HendelseUndertype.BorIkkeMedBarn
        );
        await user.selectOptions(
            screen.getByTestId('perioder.2.underårsak'),
            HendelseUndertype.BrukerFlyttetFraNorge
        );

        await user.click(gåVidereKnapp());
        expect(screen.queryAllByText('Feltet må fylles ut')).toHaveLength(0);

        expect(mockedSettIkkePersistertKomponent).toHaveBeenCalledWith('fakta');
    });

    test('Vis og fyll ut skjema - behandle perioder samlet', async () => {
        setupMock(lagFaktaResponse({ feilutbetaltePerioder }));

        renderFaktaContainer(lagBehandling(), 'BARNETRYGD');

        expect(
            await screen.findByRole('heading', { name: 'Fakta fra feilutbetalingssaken' })
        ).toBeInTheDocument();

        expect(screen.getByText('Periode med feilutbetaling')).toBeInTheDocument();
        expect(screen.getByText('Opprett tilbakekreving, send varsel')).toBeInTheDocument();
        expect(screen.getByText('01.01.2020–31.03.2020')).toBeInTheDocument();
        expect(screen.queryAllByText('Feltet må fylles ut')).toHaveLength(0);
        expect(screen.getAllByRole('combobox')).toHaveLength(3);

        await user.click(gåVidereKnapp());

        expect(screen.getAllByText('Feltet må fylles ut')).toHaveLength(5);

        await user.click(
            screen.getByRole('checkbox', {
                name: 'Velg rettslig grunnlag for periodene samlet',
            })
        );

        await user.selectOptions(screen.getByTestId('perioder.0.årsak'), HendelseType.BosattIRiket);
        await user.type(screen.getByLabelText('Årsak til feilutbetalingen'), 'Begrunnelse');

        expect(screen.getAllByRole('combobox')).toHaveLength(6);

        await user.click(gåVidereKnapp());
        expect(screen.getAllByText('Feltet må fylles ut')).toHaveLength(4);

        await user.selectOptions(
            screen.getByTestId('perioder.0.underårsak'),
            HendelseUndertype.BrukerBorIkkeINorge
        );
        await user.click(screen.getByTestId('brukerHarUttaltSeg.ja'));
        await user.type(
            screen.getByLabelText(
                'Beskriv når og hvor bruker har uttalt seg. Gi også en kort oppsummering av uttalelsen'
            ),
            'Begrunnelse'
        );
        await user.click(gåVidereKnapp());
        expect(screen.queryAllByText('Feltet må fylles ut')).toHaveLength(0);

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
        setupMock(faktaResponse);

        renderFaktaContainer(lagBehandling(), 'BARNETRYGD', true);

        expect(
            await screen.findByRole('heading', { name: 'Fakta fra feilutbetalingssaken' })
        ).toBeInTheDocument();

        expect(screen.getByText('Periode med feilutbetaling')).toBeInTheDocument();
        expect(screen.getByText('01.01.2020–31.03.2020')).toBeInTheDocument();
        expect(screen.getByTestId('perioder.0.årsak')).toHaveValue(HendelseType.BosattIRiket);
        expect(screen.getByTestId('perioder.1.årsak')).toHaveValue(HendelseType.Annet);
        expect(screen.getByTestId('perioder.2.årsak')).toHaveValue(HendelseType.BarnsAlder);
        expect(screen.getByTestId('perioder.0.underårsak')).toHaveValue(
            HendelseUndertype.BrukerBorIkkeINorge
        );
        expect(screen.getByTestId('perioder.1.underårsak')).toHaveValue(
            HendelseUndertype.AnnetFritekst
        );
        expect(screen.getByTestId('perioder.2.underårsak')).toHaveValue(
            HendelseUndertype.BarnOver6År
        );

        expect(screen.getByLabelText('Årsak til feilutbetalingen')).toHaveValue(
            'Dette er en test-begrunnelse'
        );

        expect(gåVidereKnapp()).toBeInTheDocument();
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
        setupMock(faktaResponse);

        renderFaktaContainer(lagBehandling(), 'OVERGANGSSTØNAD', true);

        expect(
            await screen.findByRole('heading', { name: 'Fakta fra feilutbetalingssaken' })
        ).toBeInTheDocument();

        expect(screen.getByText('Periode med feilutbetaling')).toBeInTheDocument();
        expect(screen.getByText('01.01.2020–31.03.2020')).toBeInTheDocument();
        expect(screen.getByTestId('perioder.0.årsak')).toHaveValue(HendelseType.EnsligForsørger);
        expect(screen.getByTestId('perioder.1.årsak')).toHaveValue(HendelseType.Annet);
        expect(screen.getByTestId('perioder.2.årsak')).toHaveValue(
            HendelseType.YrkesrettetAktivitet
        );
        expect(screen.getByTestId('perioder.0.underårsak')).toHaveValue(HendelseUndertype.Ugift);
        expect(screen.getByTestId('perioder.1.underårsak')).toHaveValue(
            HendelseUndertype.AnnetFritekst
        );
        expect(screen.getByTestId('perioder.2.underårsak')).toHaveValue(HendelseUndertype.Arbeid);

        expect(screen.getByLabelText('Årsak til feilutbetalingen')).toHaveValue(
            'Dette er en test-begrunnelse'
        );

        expect(gåVidereKnapp()).toBeInTheDocument();
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
        setupMock(faktaResponse);

        renderFaktaContainer(lagBehandling(), 'BARNETRYGD', true, true);

        expect(
            await screen.findByRole('heading', { name: 'Fakta fra feilutbetalingssaken' })
        ).toBeInTheDocument();

        expect(screen.getByText('Periode med feilutbetaling')).toBeInTheDocument();
        expect(screen.getByText('01.01.2020–31.03.2020')).toBeInTheDocument();
        expect(screen.getByText('Bosatt i riket')).toBeInTheDocument();
        expect(screen.getByText('Bruker bor ikke i Norge')).toBeInTheDocument();
        expect(screen.getByText('Annet')).toBeInTheDocument();
        expect(screen.getByText('Annet fritekst')).toBeInTheDocument();
        expect(screen.getByText('Barns alder')).toBeInTheDocument();
        expect(screen.getByText('Barn over 6 år')).toBeInTheDocument();
        expect(screen.getByText('Dette er en test-begrunnelse')).toBeInTheDocument();

        expect(gåVidereKnapp()).toBeInTheDocument();
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
        setupMock(faktaResponse);

        renderFaktaContainer(lagBehandling(), 'OVERGANGSSTØNAD', true, true);

        expect(
            await screen.findByRole('heading', { name: 'Fakta fra feilutbetalingssaken' })
        ).toBeInTheDocument();

        expect(screen.getByText('Periode med feilutbetaling')).toBeInTheDocument();
        expect(screen.getByText('01.01.2020–31.03.2020')).toBeInTheDocument();
        expect(screen.getByText('§15-4 Enslig forsørger')).toBeInTheDocument();
        expect(screen.getByText('Ugift (3. ledd)')).toBeInTheDocument();
        expect(screen.getByText('Annet')).toBeInTheDocument();
        expect(screen.getByText('Annet fritekst')).toBeInTheDocument();
        expect(screen.getByText('§15-6 Yrkesrettet aktivitet')).toBeInTheDocument();
        expect(screen.getByText('Arbeid')).toBeInTheDocument();
        expect(screen.getByText('Dette er en test-begrunnelse')).toBeInTheDocument();

        expect(gåVidereKnapp()).toBeInTheDocument();
    });

    test('Velg hendelsesundertype automatisk ved kun ett valg', async () => {
        setupMock(lagFaktaResponse({ feilutbetaltePerioder: [feilutbetaltePerioder[0]] }));

        renderFaktaContainer(lagBehandling(), 'OVERGANGSSTØNAD');

        user.selectOptions(
            await screen.findByTestId('perioder.0.årsak'),
            HendelseType.Overgangsstønad
        );

        expect(screen.getAllByRole('combobox')).toHaveLength(1);

        expect(await screen.findByTestId('perioder.0.underårsak')).toHaveValue(
            HendelseUndertype.Barn8År
        );
    });
});
