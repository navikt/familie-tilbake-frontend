import type { UserEvent } from '@testing-library/user-event';
import type { RessursVarselbrevtekst } from '~/generated';
import type { FaktaOmFeilutbetaling, ForhaandsvarselResponse } from '~/generated-new';

import { QueryClientProvider } from '@tanstack/react-query';
import { render, screen, within } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { Suspense } from 'react';

import { FagsakContext } from '~/context/FagsakContext';
import { hentForhåndsvarselTekstQueryKey } from '~/generated/@tanstack/react-query.gen';
import {
    behandlingFaktaQueryKey,
    behandlingForhandsvarselQueryKey,
} from '~/generated-new/@tanstack/react-query.gen';
import { TestBehandlingProvider } from '~/testdata/behandlingContextFactory';
import { lagFagsak } from '~/testdata/fagsakFactory';
import { createTestQueryClient } from '~/testutils/queryTestUtils';

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
});

const renderForhåndsvarsel = (forhåndsvarselResponse = lagForhåndsvarselResponse()): void => {
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

describe('Forhåndsvarsel', () => {
    let user: UserEvent;

    beforeEach(() => {
        user = userEvent.setup();
    });

    const skalSendesRadiogruppe = (): HTMLElement =>
        screen.getByRole('radiogroup', {
            name: /skal det sendes forhåndsvarsel om tilbakekreving/i,
        });

    const nesteKnapp = (): HTMLElement =>
        screen.getByRole('button', { name: 'Gå videre til foreldelsessteget' });

    const sendKnapp = (): HTMLElement =>
        screen.getByRole('button', { name: 'Send forhåndsvarselet' });

    const unntakRadiogruppe = (): HTMLElement =>
        screen.getByRole('radiogroup', {
            name: /velg begrunnelse for unntak fra forhåndsvarsel/i,
        });

    const velgSendForhåndsvarsel = async (): Promise<void> => {
        await user.click(within(skalSendesRadiogruppe()).getByRole('radio', { name: 'Ja' }));
    };

    const velgUnntak = async (): Promise<void> => {
        await user.click(within(skalSendesRadiogruppe()).getByRole('radio', { name: 'Nei' }));
    };

    test('Viser feilmelding uten valg for "Skal det sendes forhåndsvarsel"', async () => {
        renderForhåndsvarsel();

        await user.click(nesteKnapp());

        expect(
            screen.getByText('Du må velge om det skal sendes forhåndsvarsel')
        ).toBeInTheDocument();
    });

    test('Ja: viser brevseksjon med preutfylt tekst, "Vis brevet" og send-knapp i actionbar', async () => {
        renderForhåndsvarsel();

        await velgSendForhåndsvarsel();

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

    test.todo('Ja: skal vise bekreftelsesmodal før sending av brev');

    test('Nei: viser tre unntaksalternativer og feilmelding uten valg', async () => {
        renderForhåndsvarsel();

        await velgUnntak();

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

        await velgUnntak();
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
