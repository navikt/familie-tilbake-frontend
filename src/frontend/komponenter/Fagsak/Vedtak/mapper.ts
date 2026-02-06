import type { VedtaksbrevSkjema } from './schema';
import type { Avsnitt, Hovedavsnitt, RotElement, VedtaksbrevData } from '../../../generated-new';

import { formatISO } from 'date-fns';

import { formaterPeriodeTittel, tekstTilElementArray } from './utils';

export const mapVedtaksbrevTilVedtaksbrevData = (
    ytelsestype: string,
    vedtaksbrev: VedtaksbrevSkjema
): VedtaksbrevData => {
    const hovedavsnitt: Hovedavsnitt = {
        tittel: `Tilbakekreving av ${ytelsestype}`,
        underavsnitt: tekstTilElementArray(vedtaksbrev.innledning).map(
            element =>
                ({
                    type: 'rentekst',
                    tekst: element.tekst,
                }) as RotElement
        ),
    };

    const avsnitt: Avsnitt[] = vedtaksbrev.perioder.map(periode => mapPeriodeTilAvsnitt(periode));

    return {
        hovedavsnitt,
        avsnitt,
        brevGjelder: vedtaksbrev.brevGjelder,
        sendtDato: formatISO(new Date(), { representation: 'date' }),
        ytelse: vedtaksbrev.ytelse,
        signatur: vedtaksbrev.signatur,
    };
};

const mapPeriodeTilAvsnitt = (periode: VedtaksbrevSkjema['perioder'][number]): Avsnitt => {
    const underavsnitt: RotElement[] = [];

    tekstTilElementArray(periode.beskrivelse).forEach(element => {
        underavsnitt.push({
            type: 'rentekst',
            tekst: element.tekst,
        } as RotElement);
    });

    tekstTilElementArray(periode.konklusjon).forEach(element => {
        underavsnitt.push({
            type: 'rentekst',
            tekst: element.tekst,
        } as RotElement);
    });

    periode.vurderinger.forEach(vurdering => {
        underavsnitt.push({
            type: 'underavsnitt',
            tittel: vurdering.tittel,
            underavsnitt: tekstTilElementArray(vurdering.beskrivelse),
        } as RotElement);
    });

    return {
        tittel: formaterPeriodeTittel(periode.fom, periode.tom),
        underavsnitt,
    };
};
