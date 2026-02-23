import type { VedtaksbrevAvsnitt, VedtaksbrevUnderavsnitt } from '~/typer/vedtakTyper';

import { Avsnittstype } from '~/kodeverk';

export const lagOppsummeringAvsnitt = (): VedtaksbrevAvsnitt => ({
    avsnittstype: Avsnittstype.Oppsummering,
    overskrift: 'Du må betale tilbake barnetrygden',
    underavsnittsliste: [
        lagVedaksbrevUnderavsnitt({
            brødtekst: `Barnetrygden din er endret. Endringen gjorde at du har fått utbetalt for mye. Du må betale tilbake 2 445 kroner, som er deler av det feilutbetalte beløpet.`,
            fritekstTillatt: true,
        }),
    ],
});

export const lagPeriodeAvsnitt = (
    underavsnittsliste: VedtaksbrevUnderavsnitt[]
): VedtaksbrevAvsnitt => ({
    avsnittstype: Avsnittstype.Periode,
    overskrift: 'Gjelder perioden fra og med 1. januar 2020 til og med 31. mars 2020',
    underavsnittsliste: underavsnittsliste,
    fom: '2020-01-01',
    tom: '2020-03-31',
});

export const lagPeriode2Avsnitt = (
    underavsnittsliste: VedtaksbrevUnderavsnitt[]
): VedtaksbrevAvsnitt => ({
    avsnittstype: Avsnittstype.Periode,
    overskrift: 'Gjelder perioden fra og med 1. mai 2020 til og med 30. juni 2020',
    underavsnittsliste: underavsnittsliste,
    fom: '2020-05-01',
    tom: '2020-06-30',
});

export const lagVedaksbrevUnderavsnitt = (
    overrides?: Partial<VedtaksbrevUnderavsnitt>
): VedtaksbrevUnderavsnitt => ({
    fritekstTillatt: false,
    fritekstPåkrevet: false,
    ...overrides,
});
