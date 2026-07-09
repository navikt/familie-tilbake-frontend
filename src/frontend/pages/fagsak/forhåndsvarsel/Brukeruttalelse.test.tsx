import type { UserEvent } from '@testing-library/user-event';
import type { RessursVarselbrevtekst } from '@/generated';
import type { FaktaOmFeilutbetaling, ForhaandsvarselResponse } from '@/generated-new';

import { QueryClientProvider } from '@tanstack/react-query';
import { render, screen, within } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { Suspense } from 'react';

import { FagsakContext } from '@/context/FagsakContext';
import { hentForhåndsvarselTekstQueryKey } from '@/generated/@tanstack/react-query.gen';
import {
    behandlingFaktaQueryKey,
    behandlingForhandsvarselQueryKey,
} from '@/generated-new/@tanstack/react-query.gen';
import { TestBehandlingProvider } from '@/testdata/behandlingContextFactory';
import { lagFagsak } from '@/testdata/fagsakFactory';
import { createTestQueryClient } from '@/testutils/queryTestUtils';

import { Forhåndsvarsel } from './Forhåndsvarsel';

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
    rettsgebyrÅrFraSaksbehandler: null,
});

const renderForhåndsvarsel = (forhåndsvarselResponse: ForhaandsvarselResponse): void => {
    const queryClient = createTestQueryClient();
    const pathOptions = { path: { behandlingId: BEHANDLING_ID } };

    queryClient.setQueryData(behandlingForhandsvarselQueryKey(pathOptions), forhåndsvarselResponse);
    queryClient.setQueryData(hentForhåndsvarselTekstQueryKey(pathOptions), lagVarselbrevtekster());
    queryClient.setQueryData(behandlingFaktaQueryKey(pathOptions), lagFaktaOmFeilutbetaling());

    render(
        <FagsakContext value={lagFagsak()}>
            <TestBehandlingProvider>
                <QueryClientProvider client={queryClient}>
                    <Suspense fallback={<div>Laster...</div>}>
                        <Forhåndsvarsel />
                    </Suspense>
                </QueryClientProvider>
            </TestBehandlingProvider>
        </FagsakContext>
    );
};

const uttalelseRadiogruppe = (legend: RegExp): HTMLElement =>
    screen.getByRole('radiogroup', {
        name: legend,
    });

const uttalelseEtterSendtForhåndsvarselRadiogruppe = (): HTMLElement =>
    uttalelseRadiogruppe(/har brukeren uttalt seg etter forhåndsvarselet ble sendt\?/i);

const uttalelseRadiogruppeVedUnntak = (): HTMLElement =>
    uttalelseRadiogruppe(/har brukeren uttalt seg\?/i);

const nesteKnapp = (): HTMLElement =>
    screen.getByRole('button', { name: 'Lagre og gå videre til foreldelsessteget' });

describe('Brukeruttalelse i forhåndsvarsel', () => {
    let user: UserEvent;

    beforeEach(() => {
        user = userEvent.setup();
    });

    test('Sendt brev: viser spørsmål med Ja/Nei', () => {
        renderForhåndsvarsel(
            lagForhåndsvarselResponse({
                forhaandsvarselSteg: {
                    type: 'sendt',
                    forhåndsvarselInfo: {
                        tekstFraSaksbehandler: 'Tekst',
                        varselbrevSendtTid: '2025-01-20T10:00:00',
                    },
                    uttalelsesfrist: { opprinneligFrist: '2025-02-20' },
                },
            })
        );

        const radiogruppe = uttalelseEtterSendtForhåndsvarselRadiogruppe();

        expect(within(radiogruppe).getByRole('radio', { name: 'Ja' })).toBeInTheDocument();
        expect(within(radiogruppe).getByRole('radio', { name: 'Nei' })).toBeInTheDocument();
    });

    test('Sendt brev: Nei deaktivert når frist ikke er utløpt', () => {
        renderForhåndsvarsel(
            lagForhåndsvarselResponse({
                forhaandsvarselSteg: {
                    type: 'sendt',
                    forhåndsvarselInfo: {
                        tekstFraSaksbehandler: 'Tekst',
                        varselbrevSendtTid: '2025-01-20T10:00:00',
                    },
                    uttalelsesfrist: { opprinneligFrist: '2099-02-20' },
                },
            })
        );

        const radiogruppe = uttalelseEtterSendtForhåndsvarselRadiogruppe();

        expect(within(radiogruppe).getByRole('radio', { name: 'Nei' })).toBeDisabled();
    });

    test('Sendt brev: Ja/Nei aktiv når frist er utløpt', () => {
        renderForhåndsvarsel(
            lagForhåndsvarselResponse({
                forhaandsvarselSteg: {
                    type: 'sendt',
                    forhåndsvarselInfo: {
                        tekstFraSaksbehandler: 'Tekst',
                        varselbrevSendtTid: '2025-01-20T10:00:00',
                    },
                    uttalelsesfrist: { opprinneligFrist: '2020-02-20' },
                },
            })
        );

        const radiogruppe = uttalelseEtterSendtForhåndsvarselRadiogruppe();

        expect(within(radiogruppe).getByRole('radio', { name: 'Ja' })).toBeEnabled();
        expect(within(radiogruppe).getByRole('radio', { name: 'Nei' })).toBeEnabled();
    });

    test('Sendt brev: Ja viser dato, kanal og beskrivelse', async () => {
        renderForhåndsvarsel(
            lagForhåndsvarselResponse({
                forhaandsvarselSteg: {
                    type: 'sendt',
                    forhåndsvarselInfo: {
                        tekstFraSaksbehandler: 'Tekst',
                        varselbrevSendtTid: '2025-01-20T10:00:00',
                    },
                    uttalelsesfrist: { opprinneligFrist: '2020-02-20' },
                },
            })
        );

        await user.click(
            within(uttalelseEtterSendtForhåndsvarselRadiogruppe()).getByRole('radio', {
                name: 'Ja',
            })
        );

        expect(
            screen.getByRole('textbox', { name: /når uttalte brukeren seg\?/i })
        ).toBeInTheDocument();
        expect(
            screen.getByRole('textbox', { name: /hvordan uttalte brukeren seg\?/i })
        ).toBeInTheDocument();
        expect(
            screen.getByRole('textbox', { name: /beskriv hva brukeren har uttalt seg om/i })
        ).toBeInTheDocument();
    });

    test('Sendt brev: Nei viser kommentarfelt', async () => {
        renderForhåndsvarsel(
            lagForhåndsvarselResponse({
                forhaandsvarselSteg: {
                    type: 'sendt',
                    forhåndsvarselInfo: {
                        tekstFraSaksbehandler: 'Tekst',
                        varselbrevSendtTid: '2025-01-20T10:00:00',
                    },
                    uttalelsesfrist: { opprinneligFrist: '2020-02-20' },
                },
            })
        );

        await user.click(
            within(uttalelseEtterSendtForhåndsvarselRadiogruppe()).getByRole('radio', {
                name: 'Nei',
            })
        );

        expect(
            screen.getByRole('textbox', { name: /kommentar til valget over/i })
        ).toBeInTheDocument();
    });

    test('Unntak §16c: viser spørsmål "Har brukeren uttalt seg?" og feilmelding uten valg', async () => {
        renderForhåndsvarsel(
            lagForhåndsvarselResponse({
                forhaandsvarselSteg: {
                    type: 'unntak',
                    begrunnelseForUnntak: 'ÅPENBART_UNØDVENDIG',
                    beskrivelse: 'Kort begrunnelse',
                },
            })
        );

        const radiogruppe = uttalelseRadiogruppeVedUnntak();
        expect(within(radiogruppe).getByRole('radio', { name: 'Ja' })).toBeInTheDocument();
        expect(within(radiogruppe).getByRole('radio', { name: 'Nei' })).toBeInTheDocument();

        await user.click(nesteKnapp());

        expect(screen.getByText('Du må velge om brukeren har uttalt seg')).toBeInTheDocument();
    });

    test('Unntak §16c + Ja: viser felter og feilmeldinger uten verdier', async () => {
        renderForhåndsvarsel(
            lagForhåndsvarselResponse({
                forhaandsvarselSteg: {
                    type: 'unntak',
                    begrunnelseForUnntak: 'ÅPENBART_UNØDVENDIG',
                    beskrivelse: 'Kort begrunnelse',
                },
            })
        );

        await user.click(
            within(uttalelseRadiogruppeVedUnntak()).getByRole('radio', {
                name: 'Ja',
            })
        );
        await user.click(nesteKnapp());

        expect(
            screen.getByText('Du må skrive en dato på denne måten: dd.mm.åååå')
        ).toBeInTheDocument();
        expect(screen.getAllByText('Du må fylle inn en verdi').length).toBeGreaterThanOrEqual(2);
    });

    test('Unntak §16c + Nei: viser kommentarfelt og feilmelding uten verdi', async () => {
        renderForhåndsvarsel(
            lagForhåndsvarselResponse({
                forhaandsvarselSteg: {
                    type: 'unntak',
                    begrunnelseForUnntak: 'ÅPENBART_UNØDVENDIG',
                    beskrivelse: 'Kort begrunnelse',
                },
            })
        );

        await user.click(
            within(uttalelseRadiogruppeVedUnntak()).getByRole('radio', {
                name: 'Nei',
            })
        );

        const kommentar = screen.getByRole('textbox', { name: /kommentar til valget over/i });
        await user.clear(kommentar);
        await user.click(nesteKnapp());

        expect(screen.getByText('Du må fylle inn en verdi')).toBeInTheDocument();
    });
});
