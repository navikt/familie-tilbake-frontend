import type { Vedtaksbrev } from '../../../generated-new';

import { elementArrayTilTekst } from './utils';

/**
 * Skjema-type hvor Element[] er transformert til string for bruk i Textarea.
 * Transformeres tilbake til Vedtaksbrev ved sending via mapper.
 * Erstattes senere med zod-skjema som kan håndtere Element[] direkte i Textarea, og da kan denne typen fjernes.
 */
export type VedtaksbrevSkjema = {
    innledning: string;
    perioder: {
        fom: string;
        tom: string;
        beskrivelse: string;
        konklusjon: string;
        vurderinger: {
            tittel: string;
            beskrivelse: string;
        }[];
    }[];
    brevGjelder: Vedtaksbrev['brevGjelder'];
    ytelse: Vedtaksbrev['ytelse'];
    signatur: Vedtaksbrev['signatur'];
};

const vedtaksbrevMockData: Vedtaksbrev = {
    innledning: [
        {
            type: 'rentekst',
            tekst: 'I brev 26. januar 2026 fikk du melding om at barnetrygden din er endret. Endringen førte til at du har fått utbetalt for mye. Du må betale tilbake 3 450 kroner, som er deler av det feilutbetalte beløpet.',
        },
        { type: 'rentekst', tekst: 'Du har ikke uttalt deg om feilutbetalingen.' },
    ],
    perioder: [
        {
            fom: '2025-02-01',
            tom: '2025-02-28',
            beskrivelse: [
                {
                    type: 'rentekst',
                    tekst: 'Vi har fått melding om at barnet ditt døde. Barnetrygden skulle vært stanset fra og med 1. februar 2025.',
                },
                {
                    type: 'rentekst',
                    tekst: 'Fordi barnetrygden er utbetalt etter denne datoen er det utbetalt 6 900 kroner for mye',
                },
            ],
            konklusjon: [
                {
                    type: 'rentekst',
                    tekst: 'Du har fått vite om du har rett til barnetrygd og hvor mye du har rett til. Selv hvis du har meldt fra til oss, kan vi kreve tilbake det du har fått for mye hvis du burde forstått at beløpet var feil. At du må betale tilbake, betyr ikke at du selv har skyld i feilutbetalingen.',
                },
                {
                    type: 'rentekst',
                    tekst: 'Ut fra informasjonen du har fått, burde du etter vår vurdering forstått at du fikk for mye utbetalt. Derfor kan vi kreve tilbake.',
                },
            ],
            vurderinger: [
                {
                    tittel: 'Er det særlige grunner til å redusere beløpet?',
                    beskrivelse: [
                        {
                            type: 'rentekst',
                            tekst: 'Vi har lagt vekt på at du burde forstått at du fikk penger du ikke har rett til. Vi har likevel redusert beløpet du må betale tilbake fordi det er lenge siden feilutbetalingen skjedde.',
                        },
                    ],
                },
            ],
        },
        {
            fom: '2025-03-01',
            tom: '2025-03-31',
            beskrivelse: [
                {
                    type: 'rentekst',
                    tekst: 'Vi har fått melding om at barnet ditt døde. Barnetrygden skulle vært stanset fra og med 1. februar 2025.',
                },
                {
                    type: 'rentekst',
                    tekst: 'Fordi barnetrygden er utbetalt etter denne datoen er det utbetalt 6 900 kroner for mye',
                },
            ],
            konklusjon: [
                {
                    type: 'rentekst',
                    tekst: 'Du har fått vite om du har rett til barnetrygd og hvor mye du har rett til. Selv hvis du har meldt fra til oss, kan vi kreve tilbake det du har fått for mye hvis du burde forstått at beløpet var feil.',
                },
            ],
            vurderinger: [],
        },
    ],

    brevGjelder: {
        navn: 'Bruker Testesen',
        personIdent: '04206912345',
    },
    ytelse: {
        url: 'nav.no/barnetrygd',
        ubestemtEntall: 'barnetrygd',
        bestemtEntall: 'barnetrygden',
    },
    signatur: {
        enhetNavn: 'Nav Solør',
        ansvarligSaksbehandler: 'Saks Behandler',
        besluttendeSaksbehandler: null,
    },
};

export const vedtaksbrevDefaultValues: VedtaksbrevSkjema = {
    innledning: elementArrayTilTekst(vedtaksbrevMockData.innledning),
    perioder: vedtaksbrevMockData.perioder.map(periode => ({
        fom: periode.fom,
        tom: periode.tom,
        beskrivelse: elementArrayTilTekst(periode.beskrivelse),
        konklusjon: elementArrayTilTekst(periode.konklusjon),
        vurderinger: periode.vurderinger.map(vurdering => ({
            tittel: vurdering.tittel,
            beskrivelse: elementArrayTilTekst(vurdering.beskrivelse),
        })),
    })),
    brevGjelder: vedtaksbrevMockData.brevGjelder,
    ytelse: vedtaksbrevMockData.ytelse,
    signatur: vedtaksbrevMockData.signatur,
};
