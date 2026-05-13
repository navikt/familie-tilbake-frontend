import type { UserEvent } from '@testing-library/user-event';
import type { RessursVarselbrevtekst } from '~/generated';
import type { ForhaandsvarselResponse } from '~/generated-new';
import type { FaktaOmFeilutbetaling } from '~/generated-new';

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

const renderForhåndsvarsel = (forhåndsvarselResponse = lagForhåndsvarselResponse()) => {
    const queryClient = createTestQueryClient();
    const pathOptions = { path: { behandlingId: BEHANDLING_ID } };

    queryClient.setQueryData(behandlingForhandsvarselQueryKey(pathOptions), forhåndsvarselResponse);
    queryClient.setQueryData(hentForhåndsvarselTekstQueryKey(pathOptions), lagVarselbrevtekster());
    queryClient.setQueryData(behandlingFaktaQueryKey(pathOptions), lagFaktaOmFeilutbetaling());

    return render(
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

    test('Viser spørsmål om forhåndsvarsel', () => {
        renderForhåndsvarsel();

        expect(
            screen.getByRole('radiogroup', {
                name: /skal det sendes forhåndsvarsel om tilbakekreving/i,
            })
        ).toBeInTheDocument();

        expect(screen.getByLabelText('Ja')).toBeInTheDocument();
        expect(screen.getByLabelText('Nei')).toBeInTheDocument();
    });

    test('Viser neste-knapp som standard', () => {
        renderForhåndsvarsel();

        expect(
            screen.getByRole('button', { name: 'Gå videre til foreldelsessteget' })
        ).toBeInTheDocument();
    });

    test('Viser "Send forhåndsvarselet" når Ja er valgt', async () => {
        renderForhåndsvarsel();

        await user.click(screen.getByLabelText('Ja'));

        expect(screen.getByRole('button', { name: 'Send forhåndsvarselet' })).toBeInTheDocument();
    });

    test('Viser feilmelding ved submit uten valg', async () => {
        renderForhåndsvarsel();

        await user.click(screen.getByRole('button', { name: 'Gå videre til foreldelsessteget' }));

        expect(
            await screen.findByText('Du må velge om det skal sendes forhåndsvarsel')
        ).toBeInTheDocument();
    });

    test('Viser brev-kort med tekstfelt når Ja er valgt', async () => {
        renderForhåndsvarsel();

        expect(screen.queryByText('Opprett forhåndsvarsel')).not.toBeInTheDocument();

        await user.click(screen.getByLabelText('Ja'));

        expect(screen.getByText('Opprett forhåndsvarsel')).toBeInTheDocument();
        expect(screen.getByText('Varsel om mulig tilbakekreving')).toBeInTheDocument();
        expect(screen.getByText('Retten til å uttale seg')).toBeInTheDocument();
    });

    test('Viser feilmelding ved submit med tom fritekst', async () => {
        renderForhåndsvarsel();

        await user.click(screen.getByLabelText('Ja'));

        const textarea = screen.getByLabelText('Legg til utdypende tekst');
        await user.clear(textarea);

        await user.click(screen.getByRole('button', { name: 'Send forhåndsvarselet' }));

        expect(await screen.findByText('Du må fylle ut teksten')).toBeInTheDocument();
    });

    test('Viser read-only radio med Ja valgt når varsel er sendt', () => {
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

        const radioGroup = screen.getByRole('radiogroup', {
            name: /skal det sendes forhåndsvarsel om tilbakekreving/i,
        });
        const jaRadio = within(radioGroup).getByLabelText('Ja');
        expect(jaRadio).toBeChecked();
    });

    test('Viser read-only radio med Nei valgt ved unntak', () => {
        renderForhåndsvarsel(
            lagForhåndsvarselResponse({
                forhaandsvarselSteg: {
                    type: 'unntak',
                    begrunnelseForUnntak: 'ÅPENBART_UNØDVENDIG',
                    beskrivelse: 'Lite beløp',
                },
            })
        );

        const radioGroup = screen.getByRole('radiogroup', {
            name: /skal det sendes forhåndsvarsel om tilbakekreving/i,
        });
        const neiRadio = within(radioGroup).getByLabelText('Nei');
        expect(neiRadio).toBeChecked();
    });

    test('Bytter tilbake til "Neste" når bruker endrer fra Ja til Nei', async () => {
        renderForhåndsvarsel();

        await user.click(screen.getByLabelText('Ja'));
        expect(screen.getByRole('button', { name: 'Send forhåndsvarselet' })).toBeInTheDocument();

        await user.click(screen.getByLabelText('Nei'));
        expect(
            screen.getByRole('button', { name: 'Gå videre til foreldelsessteget' })
        ).toBeInTheDocument();
    });
});
