import type { RenderResult } from '@testing-library/react';
import type {
    Avsnitt,
    BehandlingOppdaterVedtaksbrevData,
    BrevLagSvgVedtaksbrevData,
    Brevmottaker,
    Options,
    VedtaksbrevData,
    VedtaksbrevRedigerbareData,
} from '@/generated-new';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { vi } from 'vitest';

import { behandlingHentDokumentInfoOptions } from '@/generated-new/@tanstack/react-query.gen';
import { behandlingHentDokument } from '@/generated-new/sdk.gen';
import { TestBehandlingProvider } from '@/testdata/behandlingContextFactory';

import { Vedtaksbrev } from './Vedtaksbrev';

const { lagreVedtaksbrev, lagForhåndsvisning } = vi.hoisted(() => ({
    lagreVedtaksbrev:
        vi.fn<
            (
                options: Options<BehandlingOppdaterVedtaksbrevData>
            ) => Promise<VedtaksbrevRedigerbareData>
        >(),
    lagForhåndsvisning: vi.fn<(options: Options<BrevLagSvgVedtaksbrevData>) => Promise<Blob>>(),
}));

vi.mock('@/generated-new/sdk.gen', async importOriginal => ({
    ...(await importOriginal<typeof import('@/generated-new/sdk.gen')>()),
    behandlingHentDokument: vi.fn(),
}));

vi.mock('@/generated-new/@tanstack/react-query.gen', async importOriginal => ({
    ...(await importOriginal<typeof import('@/generated-new/@tanstack/react-query.gen')>()),
    behandlingOppdaterVedtaksbrevMutation: () => ({ mutationFn: lagreVedtaksbrev }),
    brevLagSvgVedtaksbrevMutation: () => ({ mutationFn: lagForhåndsvisning }),
}));

const behandlingHentDokumentMock = vi.mocked(behandlingHentDokument);

const BEHANDLING_ID = 'uuid-1';
const JOURNALPOST_ID = 'jp-123';
const DOKUMENT_ID = 'dok-456';

const renderVedtaksbrev = (
    vedtaksbrevData: VedtaksbrevData,
    queryClient: QueryClient = new QueryClient(),
    behandlingILesemodus = false
): RenderResult =>
    render(
        <QueryClientProvider client={queryClient}>
            <TestBehandlingProvider stateOverrides={{ behandlingILesemodus }}>
                <Vedtaksbrev vedtaksbrevData={vedtaksbrevData} onSubmit={vitest.fn()} />
            </TestBehandlingProvider>
        </QueryClientProvider>
    );

const lagQueryClientMedSendtBrev = (): QueryClient => {
    const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false } },
    });
    queryClient.setQueryData(
        behandlingHentDokumentInfoOptions({
            path: { behandlingId: BEHANDLING_ID, dokumentType: 'VEDTAKSBREV' },
        }).queryKey,
        { brevSendt: '2025-01-10', journalpostId: JOURNALPOST_ID, dokumentId: DOKUMENT_ID }
    );
    return queryClient;
};

const lagBlobFeil = (innhold: string): unknown => ({
    response: { data: new Blob([innhold], { type: 'application/json' }) },
});

const renderMedFeilendeDokumenthenting = (
    feil: unknown,
    queryClient: QueryClient = lagQueryClientMedSendtBrev()
): RenderResult => {
    behandlingHentDokumentMock.mockRejectedValue(feil);
    return renderVedtaksbrev(lagVedtaksbrevData(), queryClient, true);
};

const standardTextareaDescription = 'Tekstområde med plass til 3000 tegn.';

describe('Vedtaksbrev', () => {
    test('skal kunne redigere hovedavsnittet når brevet ikke har andre avsnitt', () => {
        renderVedtaksbrev(lagVedtaksbrevData({ avsnitt: null }));

        expect(screen.getAllByRole('textbox')).toHaveLength(1);
        expect(screen.getByRole('textbox', { name: 'Du må betale tilbake stønaden' })).toHaveValue(
            'Dette er et hovedavsnitt'
        );
    });

    test('skal vise vedtaksbrevtittel og hovedavsnitt-textarea', () => {
        renderVedtaksbrev(
            lagVedtaksbrevData({
                hovedavsnitt: {
                    tittel: 'Du må betale tilbake stønaden',
                    forklaring: 'Forklaring til hovedavsnitt',
                    hjemler: '22-15',
                    underavsnitt: [
                        {
                            type: 'rentekst',
                            tekst: 'Dette er første avsnitt',
                        },
                        {
                            type: 'rentekst',
                            tekst: 'Dette er andre avsnitt',
                        },
                    ],
                },
            })
        );

        expect(screen.getByRole('heading', { name: 'Lag vedtaksbrev' })).toBeInTheDocument();
        const hovedavsnitt = screen.getByRole('textbox', { name: 'Du må betale tilbake stønaden' });
        expect(hovedavsnitt).toBeInTheDocument();
        expect(hovedavsnitt).toHaveAccessibleDescription(
            `Forklaring til hovedavsnitt ${standardTextareaDescription}`
        );
        expect(hovedavsnitt).toHaveValue('Dette er første avsnitt\n\nDette er andre avsnitt');
    });

    test('skal vise avsnitt-textareas', () => {
        const tredjeAvsnittForklaring =
            'Her viser du til § 22-15 fjerde ledd, hva som kan være særlige grunner, og hvordan vi vurderer disse opp mot de faktiske forholdene i saken.';
        renderVedtaksbrev(
            lagVedtaksbrevData({
                avsnitt: [
                    {
                        id: '1',
                        tittel: 'Perioden 12.02.2025–12.03.2025',
                        forklaring: 'Forklaring til perioden',
                        meldingerTilSaksbehandler: [],
                        underavsnitt: [
                            { type: 'rentekst', tekst: 'Første textarea' },
                            {
                                type: 'påkrevd_begrunnelse',
                                tittel: 'Hvordan har vi kommet frem til at du må betale tilbake?',
                                begrunnelseType: 'SKAL_IKKE_UNNLATES_4_RETTSGEBYR',
                                forklaring: '',
                                meldingerTilSaksbehandler: [],
                                underavsnitt: [{ tekst: 'Andre textarea' }],
                            },
                            {
                                type: 'påkrevd_begrunnelse',
                                tittel: 'Hvorfor har vi ikke redusert beløpet?',
                                begrunnelseType: 'IKKE_REDUSERT_SÆRLIGE_GRUNNER',
                                forklaring: tredjeAvsnittForklaring,
                                meldingerTilSaksbehandler: [],
                                underavsnitt: [{ tekst: 'Tredje textarea' }],
                            },
                        ],
                    } satisfies Avsnitt,
                ],
            })
        );

        const førstePeriodeAvsnitt = screen.getByRole('textbox', {
            name: 'Perioden 12.02.2025–12.03.2025',
        });
        expect(førstePeriodeAvsnitt).toBeInTheDocument();
        expect(førstePeriodeAvsnitt).toHaveAccessibleDescription(
            `Forklaring til perioden ${standardTextareaDescription}`
        );
        expect(førstePeriodeAvsnitt).toHaveValue('Første textarea');

        const andrePeriodeAvsnitt = screen.getByRole('textbox', {
            name: 'Hvordan har vi kommet frem til at du må betale tilbake?',
        });
        expect(andrePeriodeAvsnitt).toBeInTheDocument();
        expect(andrePeriodeAvsnitt).toHaveValue('Andre textarea');

        const tredjePeriodeAvsnitt = screen.getByRole('textbox', {
            name: 'Hvorfor har vi ikke redusert beløpet?',
        });
        expect(tredjePeriodeAvsnitt).toBeInTheDocument();
        expect(tredjePeriodeAvsnitt).toHaveAccessibleDescription(
            `${tredjeAvsnittForklaring} ${standardTextareaDescription}`
        );
        expect(tredjePeriodeAvsnitt).toHaveValue('Tredje textarea');
    });

    test('skal ikke forhåndsvise gammel tekst når lagring oppdaterer sistOppdatert', async () => {
        const vedtaksbrevData = lagVedtaksbrevData();
        const lagretVedtaksbrev = { ...vedtaksbrevData, sistOppdatert: '2024-02-01' };
        lagForhåndsvisning.mockResolvedValue(
            new Blob([JSON.stringify({ page_count: 1, pages: ['<svg/>'] })])
        );
        lagreVedtaksbrev.mockResolvedValue(lagretVedtaksbrev);
        const queryClient = new QueryClient();
        const { rerender } = renderVedtaksbrev(vedtaksbrevData, queryClient);
        const tekstfelt = screen.getByRole('textbox', { name: 'Du må betale tilbake stønaden' });
        const forhåndsvisteTekster = (): unknown[] =>
            lagForhåndsvisning.mock.calls.map(
                ([options]) => options.body?.hovedavsnitt.underavsnitt
            );

        await userEvent.type(tekstfelt, ' endret');
        await waitFor(() => expect(lagreVedtaksbrev).toHaveBeenCalled());

        rerender(
            <QueryClientProvider client={queryClient}>
                <TestBehandlingProvider>
                    <Vedtaksbrev vedtaksbrevData={lagretVedtaksbrev} onSubmit={vitest.fn()} />
                </TestBehandlingProvider>
            </QueryClientProvider>
        );

        await userEvent.type(tekstfelt, ' igjen');
        await waitFor(() => expect(lagForhåndsvisning).toHaveBeenCalledTimes(3));

        expect(forhåndsvisteTekster()).toEqual([
            [{ type: 'rentekst', tekst: 'Dette er et hovedavsnitt' }],
            [{ type: 'rentekst', tekst: 'Dette er et hovedavsnitt endret' }],
            [{ type: 'rentekst', tekst: 'Dette er et hovedavsnitt endret igjen' }],
        ]);
    });

    describe('feilmelding for sendt vedtaksbrev', () => {
        beforeEach(() => {
            behandlingHentDokumentMock.mockReset();
        });

        test('skal vise feilmeldingen fra feilresponsens blob', async () => {
            renderMedFeilendeDokumenthenting(
                lagBlobFeil(JSON.stringify({ melding: 'Dokumentet er ikke journalført ennå.' }))
            );

            expect(
                await screen.findByText('Kunne ikke hente det sendte vedtaksbrevet')
            ).toBeInTheDocument();
            expect(
                await screen.findByText('Dokumentet er ikke journalført ennå.')
            ).toBeInTheDocument();
        });

        test('skal vise standardtekst når bloben ikke inneholder en gyldig feilmelding', async () => {
            renderMedFeilendeDokumenthenting(lagBlobFeil('ikke gyldig json'));

            expect(await screen.findByText('Prøv igjen senere.')).toBeInTheDocument();
        });

        test('skal vise standardtekst når feilen ikke har en blob-respons', async () => {
            renderMedFeilendeDokumenthenting({ response: { data: { melding: 'noe feil' } } });

            expect(await screen.findByText('Prøv igjen senere.')).toBeInTheDocument();
        });

        test('skal ikke hente dokumentet på nytt når komponenten mountes på nytt etter en feil', async () => {
            const queryClient = lagQueryClientMedSendtBrev();
            const { unmount } = renderMedFeilendeDokumenthenting(
                lagBlobFeil(JSON.stringify({ melding: 'Dokumentet er ikke journalført ennå.' })),
                queryClient
            );

            expect(
                await screen.findByText('Dokumentet er ikke journalført ennå.')
            ).toBeInTheDocument();
            expect(behandlingHentDokumentMock).toHaveBeenCalledTimes(1);

            unmount();
            renderVedtaksbrev(lagVedtaksbrevData(), queryClient, true);

            expect(
                await screen.findByText('Kunne ikke hente det sendte vedtaksbrevet')
            ).toBeInTheDocument();
            expect(behandlingHentDokumentMock).toHaveBeenCalledTimes(1);
        });
    });
});

const lagVedtaksbrevData = (overrides?: Partial<VedtaksbrevData>): VedtaksbrevData => {
    return {
        hovedavsnitt: {
            tittel: 'Du må betale tilbake stønaden',
            forklaring: 'Forklaring til hovedavsnitt',
            hjemler: '22-15',
            underavsnitt: [
                {
                    type: 'rentekst',
                    tekst: 'Dette er et hovedavsnitt',
                },
            ],
        },
        avsnitt: [],
        ...overrides,
        sistOppdatert: '2024-01-01',
        brevGjelder: {
            navn: 'Ola Nordmann',
            personIdent: '12345678910',
        } satisfies Brevmottaker,
        sendtDato: '2024-01-02',
        ytelse: {
            url: 'nav.no/tilleggsstønad',
            ubestemtEntall: 'tilleggstønad',
            bestemtEntall: 'tilleggstønaden',
        } satisfies VedtaksbrevData['ytelse'],
        signatur: {
            enhetNavn: 'Nav Oslo',
            ansvarligSaksbehandler: 'Ola Nordmann',
            besluttendeSaksbehandler: 'Kari Nordmann',
        } satisfies VedtaksbrevData['signatur'],
        oppsummeringstabell: {
            beregnerSkatt: false,
            perioder: [],
            sumFeilutbetaltBeløp: '0',
            sumTilbakekrevesBeløpEtterSkatt: '0',
        },
        bunntekster: [],
        saksnummer: '123456',
    };
};
