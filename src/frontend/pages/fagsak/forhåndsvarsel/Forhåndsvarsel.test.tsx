import type { UserEvent } from '@testing-library/user-event';
import type { RessursVarselbrevtekst } from '@/generated';
import type { FaktaOmFeilutbetaling, ForhaandsvarselResponse } from '@/generated-new';

import { type QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, within } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { Suspense } from 'react';
import { vi } from 'vitest';

import { FagsakContext } from '@/context/FagsakContext';
import { hentForhåndsvarselTekstQueryKey } from '@/generated/@tanstack/react-query.gen';
import {
    behandlingFaktaQueryKey,
    behandlingForhandsvarselQueryKey,
    behandlingHentDokumentInfoOptions,
    behandlingHentDokumentOptions,
} from '@/generated-new/@tanstack/react-query.gen';
import { TestBehandlingProvider } from '@/testdata/behandlingContextFactory';
import { lagFagsak } from '@/testdata/fagsakFactory';
import { createTestQueryClient } from '@/testutils/queryTestUtils';
import { formatterDatostring } from '@/utils';

import { ForhåndsvarselInnhold } from './Forhåndsvarsel';

vi.mock('@/komponenter/pdf-visning-modal/PdfVisningModal', () => ({
    PdfVisningModal: ({ åpen, onRequestClose }: { åpen: boolean; onRequestClose: () => void }) =>
        åpen ? (
            <dialog open onClose={onRequestClose}>
                <button onClick={onRequestClose}>Lukk</button>
            </dialog>
        ) : null,
}));

const BEHANDLING_ID = 'uuid-1';

const lagForhåndsvarselResponse = (
    overrides?: Partial<ForhaandsvarselResponse>
): ForhaandsvarselResponse => ({
    forhaandsvarselSteg: { type: 'ikke_vurdert' },
    brukeruttalelse: null,
    ...overrides,
});

const lagVarselbrevtekster = (): RessursVarselbrevtekst => ({
    data: {
        overskrift: 'Varsel om mulig tilbakekreving',
        avsnitter: [
            { title: 'Dette har skjedd', body: '' },
            { title: 'Retten til å uttale seg', body: 'Du har rett til å uttale deg.' },
        ],
    },
    status: 'SUKSESS',
    melding: 'OK',
});

const lagFaktaOmFeilutbetaling = (vedtaksdato = '2025-01-15'): FaktaOmFeilutbetaling => ({
    feilutbetaling: {
        beløp: 10000,
        fom: '2025-01-01',
        tom: '2025-06-30',
        revurdering: {
            årsak: 'Endring i inntekt',
            vedtaksdato,
            resultat: 'OPPHØRT',
        },
    },
    tidligereVarsletBeløp: null,
    muligeRettsligGrunnlag: [],
    perioder: [],
    vurdering: { årsak: null },
    ferdigvurdert: false,
    usikker4xRettsgebyr: false,
});

const lagSendtForhåndsvarselResponse = (nyFrist?: string): ForhaandsvarselResponse => ({
    forhaandsvarselSteg: {
        type: 'sendt',
        forhåndsvarselInfo: {
            tekstFraSaksbehandler: 'Varselbrev er sendt',
            varselbrevSendtTid: '2025-01-10T10:00:00Z',
        },
        uttalelsesfrist: {
            opprinneligFrist: '2025-01-22',
            nyFrist,
        },
    },
    brukeruttalelse: null,
});

const opprettQueryClientMedForhåndsvarselData = (
    forhåndsvarselResponse: ForhaandsvarselResponse
): QueryClient => {
    const queryClient = createTestQueryClient();
    const pathOptions = { path: { behandlingId: BEHANDLING_ID } };

    queryClient.setQueryData(behandlingForhandsvarselQueryKey(pathOptions), forhåndsvarselResponse);
    queryClient.setQueryData(hentForhåndsvarselTekstQueryKey(pathOptions), lagVarselbrevtekster());
    queryClient.setQueryData(behandlingFaktaQueryKey(pathOptions), lagFaktaOmFeilutbetaling());

    queryClient.setMutationDefaults(['sendVarselbrev'], {
        mutationFn: async () => undefined,
    });

    queryClient.setMutationDefaults(['forhåndsvisBrev'], {
        mutationFn: async () => ({ data: 'mock-pdf-data', status: 'SUKSESS', melding: 'OK' }),
    });

    return queryClient;
};

const leggTilSendtDokumentData = (queryClient: QueryClient): void => {
    const journalpostId = 'jp-123';
    const dokumentId = 'dok-456';

    queryClient.setQueryData(
        behandlingHentDokumentInfoOptions({
            path: { behandlingId: BEHANDLING_ID, dokumentType: 'VARSELBREV' },
        }).queryKey,
        { journalpostId, dokumentId }
    );

    queryClient.setQueryData(
        behandlingHentDokumentOptions({
            path: {
                behandlingId: BEHANDLING_ID,
                journalpostId,
                dokumentInfoId: dokumentId,
            },
        }).queryKey,
        new Blob(['PDF content'], { type: 'application/pdf' })
    );
};

const renderMedQueryClient = (queryClient: QueryClient): void => {
    render(
        <FagsakContext value={lagFagsak()}>
            <TestBehandlingProvider>
                <QueryClientProvider client={queryClient}>
                    <Suspense fallback={<div>Laster...</div>}>
                        <ForhåndsvarselInnhold />
                    </Suspense>
                </QueryClientProvider>
            </TestBehandlingProvider>
        </FagsakContext>
    );
};

const renderForhåndsvarsel = (forhåndsvarselResponse = lagForhåndsvarselResponse()): void => {
    const queryClient = opprettQueryClientMedForhåndsvarselData(forhåndsvarselResponse);
    renderMedQueryClient(queryClient);
};

const renderSendtForhåndsvarsel = (nyFrist?: string): void => {
    const queryClient = opprettQueryClientMedForhåndsvarselData(
        lagSendtForhåndsvarselResponse(nyFrist)
    );
    leggTilSendtDokumentData(queryClient);
    renderMedQueryClient(queryClient);
};

const skalSendesRadiogruppe = (): HTMLElement =>
    screen.getByRole('radiogroup', {
        name: /skal det sendes forhåndsvarsel om tilbakekreving/i,
    });

const nesteKnapp = (): HTMLElement =>
    screen.getByRole('button', { name: 'Gå videre til foreldelsessteget' });

const sendKnapp = (): HTMLElement => screen.getByRole('button', { name: 'Send forhåndsvarselet' });

const bekreftelsesmodal = (): Promise<HTMLElement> =>
    screen.findByRole('dialog', { name: 'Send forhåndsvarselet' });

const unntakRadiogruppe = (): HTMLElement =>
    screen.getByRole('radiogroup', {
        name: /velg begrunnelse for unntak fra forhåndsvarsel/i,
    });

const utsettFristKnapp = (): HTMLElement => screen.getByRole('button', { name: 'Utsett frist' });

const forventFristerIFristboks = (opprinneligFrist: string, nyFrist?: string): void => {
    if (nyFrist) {
        expect(screen.getByText('Opprinnelig frist')).toBeInTheDocument();
        expect(screen.getByText('Ny frist for uttalelse')).toBeInTheDocument();
        expect(screen.getByText(formatterDatostring(opprinneligFrist))).toBeInTheDocument();
        expect(screen.getByText(formatterDatostring(nyFrist))).toBeInTheDocument();
        return;
    }

    expect(screen.getByText('Frist for uttalelse')).toBeInTheDocument();
    expect(screen.getByText(formatterDatostring(opprinneligFrist))).toBeInTheDocument();
};

const åpneUtsettFristModal = async (user: UserEvent): Promise<HTMLElement> => {
    await user.click(utsettFristKnapp());
    return screen.findByRole('dialog', { name: 'Utsett frist for uttalelse' });
};

const velgSendForhåndsvarsel = async (user: UserEvent): Promise<void> => {
    await user.click(within(skalSendesRadiogruppe()).getByRole('radio', { name: 'Ja' }));
};

const velgUnntak = async (user: UserEvent): Promise<void> => {
    await user.click(within(skalSendesRadiogruppe()).getByRole('radio', { name: 'Nei' }));
};

const visBrevKnapp = (): HTMLElement => screen.getByRole('button', { name: 'Vis brevet' });

const ventPåPdfModal = async (): Promise<HTMLElement> => screen.findByRole('dialog');

describe('Forhåndsvarsel', () => {
    let user: UserEvent;

    beforeEach(() => {
        user = userEvent.setup();
    });

    test('Viser feilmelding uten valg for "Skal det sendes forhåndsvarsel"', async () => {
        renderForhåndsvarsel();

        await user.click(nesteKnapp());

        expect(
            screen.getByText('Du må velge om det skal sendes forhåndsvarsel')
        ).toBeInTheDocument();
    });

    test('Ja: viser brevseksjon med preutfylt tekst, "Vis brevet" og send-knapp i actionbar', async () => {
        renderForhåndsvarsel();

        await velgSendForhåndsvarsel(user);

        expect(sendKnapp()).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Vis brevet' })).toBeInTheDocument();

        expect(screen.getByText('Opprett forhåndsvarsel')).toBeInTheDocument();
        const utdypendeTekst = screen.getByRole('textbox', {
            name: /legg til utdypende tekst/i,
        }) as HTMLTextAreaElement;
        expect(utdypendeTekst.value).toContain('Det er gjort en endring i saken din');
        expect(screen.getByText('Varsel om mulig tilbakekreving')).toBeInTheDocument();
        expect(screen.getByText('Retten til å uttale seg')).toBeInTheDocument();
    });

    test('Ja: skal vise bekreftelsesmodal før sending av brev', async () => {
        renderForhåndsvarsel();

        await velgSendForhåndsvarsel(user);
        await user.click(sendKnapp());

        const modal = await bekreftelsesmodal();
        expect(
            within(modal).getByText(
                'Er du sikker på at du vil sende forhåndsvarselet? Dette kan ikke angres.'
            )
        ).toBeInTheDocument();
        expect(
            within(modal).getByRole('button', { name: 'Send forhåndsvarselet' })
        ).toBeInTheDocument();
        expect(within(modal).getByRole('button', { name: 'Avbryt' })).toBeInTheDocument();
    });

    test('Ja: forblir på forhåndsvarsel-steget etter sending av varselbrev', async () => {
        renderForhåndsvarsel();

        await velgSendForhåndsvarsel(user);
        await user.click(sendKnapp());

        const modal = await bekreftelsesmodal();
        await user.click(within(modal).getByRole('button', { name: 'Send forhåndsvarselet' }));

        expect(screen.getByText('Forhåndsvarsel')).toBeInTheDocument();
    });

    describe('Forhåndsvis varselbrev', () => {
        test('burde vise "Vis brevet"-knapp når forhåndsvarsel skal sendes', async () => {
            renderForhåndsvarsel();

            await velgSendForhåndsvarsel(user);

            expect(visBrevKnapp()).toBeInTheDocument();
        });

        test('burde åpne PDF-modal ved klikk på "Vis brevet"', async () => {
            renderForhåndsvarsel();

            await velgSendForhåndsvarsel(user);
            await user.click(visBrevKnapp());

            expect(await ventPåPdfModal()).toBeInTheDocument();
        });

        test('burde ikke vise "Vis brevet"-knapp når forhåndsvarsel ikke skal sendes', async () => {
            renderForhåndsvarsel();

            await velgUnntak(user);

            expect(screen.queryByRole('button', { name: 'Vis brevet' })).not.toBeInTheDocument();
        });
    });

    describe('Vis sendt varselbrev', () => {
        test('burde vise "Vis brevet"-knapp når varsel er sendt', () => {
            renderSendtForhåndsvarsel();

            expect(visBrevKnapp()).toBeInTheDocument();
        });

        test('burde åpne PDF-modal ved klikk på "Vis brevet" når varsel er sendt', async () => {
            renderSendtForhåndsvarsel();

            await user.click(visBrevKnapp());

            expect(await ventPåPdfModal()).toBeInTheDocument();
        });

        test('burde ikke vise "Vis brevet"-knapp når varsel ikke er sendt', () => {
            renderForhåndsvarsel();

            expect(screen.queryByRole('button', { name: 'Vis brevet' })).not.toBeInTheDocument();
        });
    });

    test('Sendt varsel: viser opprinnelig frist i fristboksen', () => {
        const opprinneligFrist = '2025-01-22';
        renderSendtForhåndsvarsel();

        forventFristerIFristboks(opprinneligFrist);
    });

    describe('UtsettFristModal', () => {
        test('Sendt varsel: bruker kan klikke utsett frist og modal viser dato- og begrunnelsesfelt', async () => {
            renderSendtForhåndsvarsel();

            const dialog = await åpneUtsettFristModal(user);

            expect(
                within(dialog).getByRole('textbox', { name: 'Sett ny dato for frist' })
            ).toBeInTheDocument();
            expect(
                within(dialog).getByRole('textbox', { name: 'Begrunnelse for utsatt frist' })
            ).toBeInTheDocument();
        });

        test('Sendt varsel: ny frist vises under opprinnelig frist', () => {
            const opprinneligFrist = '2025-01-22';
            const nyFrist = '2025-01-29';
            renderSendtForhåndsvarsel(nyFrist);

            forventFristerIFristboks(opprinneligFrist, nyFrist);
        });
    });

    test('Nei: viser tre unntaksalternativer og feilmelding uten valg', async () => {
        renderForhåndsvarsel();

        await velgUnntak(user);

        expect(
            within(unntakRadiogruppe()).getByRole('radio', { name: /ikke praktisk mulig/i })
        ).toBeInTheDocument();
        expect(
            within(unntakRadiogruppe()).getByRole('radio', { name: /ukjent adresse/i })
        ).toBeInTheDocument();
        expect(
            within(unntakRadiogruppe()).getByRole('radio', { name: /åpenbart unødvendig/i })
        ).toBeInTheDocument();

        await user.click(nesteKnapp());

        expect(
            screen.getByText('Du må velge en begrunnelse for unntak fra forhåndsvarsel')
        ).toBeInTheDocument();
    });

    test('Nei: de to første begrunnelsene krever utfylt tekst', async () => {
        renderForhåndsvarsel();

        await velgUnntak(user);
        await user.click(
            within(unntakRadiogruppe()).getByRole('radio', { name: /ikke praktisk mulig/i })
        );

        const begrunnelse = screen.getByRole('textbox', {
            name: /forklar hvorfor forhåndsvarselet ikke skal bli sendt/i,
        });
        await user.clear(begrunnelse);
        await user.click(nesteKnapp());

        expect(screen.getByText('Du må fylle inn en verdi')).toBeInTheDocument();

        await user.click(
            within(unntakRadiogruppe()).getByRole('radio', { name: /ukjent adresse/i })
        );
        await user.clear(begrunnelse);
        await user.click(nesteKnapp());

        expect(screen.getByText('Du må fylle inn en verdi')).toBeInTheDocument();
    });
});
