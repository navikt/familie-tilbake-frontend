import type { VedtaksbrevFormData } from './schema';
import type { RenderResult } from '@testing-library/react';
import type { Avsnitt, Brevmottaker, VedtaksbrevData } from '~/generated-new';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { screen } from '@testing-library/react';
import { render } from '@testing-library/react';

import { Vedtaksbrev } from './Vedtaksbrev';

const renderVedtaksbrev = (vedtaksbrevData: VedtaksbrevFormData): RenderResult => {
    const client = new QueryClient();
    return render(
        <QueryClientProvider client={client}>
            <Vedtaksbrev vedtaksbrevData={vedtaksbrevData} />
        </QueryClientProvider>
    );
};

describe('Vedtaksbrev', () => {
    test('skal vise hovedavsnitt-textarea', () => {
        renderVedtaksbrev(
            lagVedtaksbrevData({
                hovedavsnitt: {
                    tittel: 'Du må betale tilbake stønaden',
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
        expect(hovedavsnitt).toHaveValue('Dette er første avsnitt\n\nDette er andre avsnitt');
    });

    test('skal vise avsnitt-textareas', () => {
        renderVedtaksbrev(
            lagVedtaksbrevData({
                avsnitt: [
                    {
                        id: '1',
                        tittel: 'Perioden 12.02.2025–12.03.2025',
                        underavsnitt: [
                            { type: 'rentekst', tekst: 'Første textarea' },
                            {
                                type: 'påkrevd_begrunnelse',
                                tittel: 'Hvordan har vi kommet frem til at du må betale tilbake?',
                                begrunnelseType: 'SKAL_IKKE_UNNLATES_4_RETTSGEBYR',
                                forklaring: '',
                                underavsnitt: [{ type: 'rentekst', tekst: 'Andre textarea' }],
                            },
                            {
                                type: 'påkrevd_begrunnelse',
                                tittel: 'Hvorfor har vi ikke redusert beløpet?',
                                begrunnelseType: 'IKKE_REDUSERT_SÆRLIGE_GRUNNER',
                                forklaring:
                                    'Her viser du til § 22-15 fjerde ledd, hva som kan være særlige grunner, og hvordan vi  vurderer disse opp mot de faktiske forholdene i saken.',
                                underavsnitt: [{ type: 'rentekst', tekst: 'Tredje textarea' }],
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
        expect(tredjePeriodeAvsnitt).toHaveValue('Tredje textarea');
    });
});

const lagVedtaksbrevData = (overrides?: Partial<VedtaksbrevData>): VedtaksbrevData => {
    return {
        hovedavsnitt: {
            tittel: 'Du må betale tilbake stønaden',
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
    };
};
