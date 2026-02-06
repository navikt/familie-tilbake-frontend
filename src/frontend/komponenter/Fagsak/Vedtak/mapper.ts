import type {
    Avsnitt,
    Hovedavsnitt,
    RotElement,
    Vedtaksbrev,
    VedtaksbrevData,
    VedtaksbrevPeriode,
} from '../../../generated-new';

import { formatISO } from 'date-fns';

import { formaterPeriodeTittel } from './utils';

export const mapVedtaksbrevTilVedtaksbrevData = (
    ytelsestype: string,
    vedtaksbrev: Vedtaksbrev
): VedtaksbrevData => {
    const hovedavsnitt: Hovedavsnitt = {
        tittel: `Tilbakekreving av ${ytelsestype}`,
        underavsnitt: vedtaksbrev.innledning.map(
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

const mapPeriodeTilAvsnitt = (periode: VedtaksbrevPeriode): Avsnitt => {
    const underavsnitt: RotElement[] = [];

    periode.beskrivelse.forEach(element => {
        underavsnitt.push({
            type: 'rentekst',
            tekst: element.tekst,
        } as RotElement);
    });

    periode.konklusjon.forEach(element => {
        underavsnitt.push({
            type: 'rentekst',
            tekst: element.tekst,
        } as RotElement);
    });

    periode.vurderinger.forEach(vurdering => {
        underavsnitt.push({
            type: 'underavsnitt',
            tittel: vurdering.tittel,
            underavsnitt: vurdering.beskrivelse,
        } as RotElement);
    });

    return {
        tittel: formaterPeriodeTittel(periode.fom, periode.tom),
        underavsnitt,
    };
};
