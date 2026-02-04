import type { Vedtaksbrev } from '../../../generated-new';

export const vedtaksbrevDefaultValues: Vedtaksbrev = {
    innledning:
        'I brev 26. januar 2026 fikk du melding om at barnetrygden din er endret. Endringen førte til at du har fått utbetalt for mye. Du må betale tilbake 3 450 kroner, som er deler av det feilutbetalte beløpet. Du har ikke uttalt deg om feilutbetalingen.',
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
        fultNavn: 'Bruker Testesen',
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
