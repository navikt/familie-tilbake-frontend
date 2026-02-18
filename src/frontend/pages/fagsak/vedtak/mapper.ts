import type { VedtaksbrevFormData } from './schema';
import type { Avsnitt, Hovedavsnitt, RotElement, VedtaksbrevData } from '@generated-new';

import { formatISO } from 'date-fns';

import { formaterPeriodeTittel } from './utils';

export const mapFormDataTilVedtaksbrevData = (
    ytelsestype: string,
    vedtaksbrev: VedtaksbrevFormData
): VedtaksbrevData => {
    const hovedavsnitt: Hovedavsnitt = {
        tittel: `Tilbakekreving av ${ytelsestype}`,
        underavsnitt: vedtaksbrev.innledning.map(
            element =>
                ({
                    type: 'rentekst',
                    tekst: element.tekst,
                }) satisfies RotElement
        ),
    };

    const avsnitt: Avsnitt[] = vedtaksbrev.perioder.map(periode => mapPeriodeTilAvsnitt(periode));

    return {
        hovedavsnitt,
        avsnitt,
        brevGjelder: vedtaksbrev.brevGjelder, // TODO fjern ved ny oppdatering
        sendtDato: formatISO(new Date(), { representation: 'date' }), // TODO fjern ved ny oppdatering
        ytelse: vedtaksbrev.ytelse, // TODO fjern ved ny oppdatering
        signatur: vedtaksbrev.signatur, // TODO fjern ved ny oppdatering
    };
};

const mapPeriodeTilAvsnitt = (periode: VedtaksbrevFormData['perioder'][number]): Avsnitt => {
    const underavsnitt: RotElement[] = [];

    periode.beskrivelse.forEach(element => {
        underavsnitt.push({
            type: 'rentekst',
            tekst: element.tekst,
        } satisfies RotElement);
    });

    periode.konklusjon.forEach(element => {
        underavsnitt.push({
            type: 'rentekst',
            tekst: element.tekst,
        } satisfies RotElement);
    });

    periode.vurderinger.forEach(vurdering => {
        underavsnitt.push({
            type: 'underavsnitt',
            tittel: vurdering.tittel,
            underavsnitt: vurdering.beskrivelse,
        } satisfies RotElement);
    });

    return {
        tittel: formaterPeriodeTittel(periode.fom, periode.tom),
        underavsnitt,
    };
};
