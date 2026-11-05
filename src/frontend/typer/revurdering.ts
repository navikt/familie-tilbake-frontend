import type { TilbakekrevingRevurderingDto } from '@/generated/types.gen';
import type { TilbakekrevingRevurderingsarsak } from '@/generated-new';

import { zInstansEnum } from '@/generated-new/zod.gen';

export type Revurderingsårsak = TilbakekrevingRevurderingsarsak['revurderingsarsak'];

// TODO: Fjernes når behandlingen hentes fra generated-new. Da er revurderingsarsak allerede
// `TilbakekrevingRevurderingsarsak`, og Dto-typen og Dto-verdiene under er ikke lenger nødvendige.
type RevurderingsårsakDto = TilbakekrevingRevurderingDto['revurderingsarsak']['revurderingsarsak'];

export const hentRevurderingsårsak: Record<Revurderingsårsak, string> = {
    feilutbetalt_belop_endret: 'Omgjøring av vedtaket om tilbakekreving fordi beløpet er endret',
    etter_klage: 'Omgjøring av vedtaket om tilbakekreving etter klage',
    uten_klage: 'Omgjøring av vedtaket om tilbakekreving uten klage (fvl. § 35)',
    foreldelse: 'Endring av kravet på grunn av foreldelse',
};

// Backendens OpenAPI-spec oppgir klassenavnet (f.eks. `EtterKlageDto`) som årsakskode, mens
// backend faktisk sender navnet fra `@JsonSubTypes` (f.eks. `etter_klage`).
// TODO: Fjern Dto-oppføringene (og Dto-delen av unionen i hentRevurderingsårsakTekst) når behandlingen hentes fra generated-new.
// Vi tar derfor imot begge, Dto for å gjøre typescript fornøyd og Revurderingsårsak for å håndtere de faktiske verdiene.
const revurderingsårsakTekster: Record<RevurderingsårsakDto | Revurderingsårsak, string> = {
    ...hentRevurderingsårsak,
    EtterKlageDto: hentRevurderingsårsak.etter_klage,
    FeilutbetaltBelopEndretDto: hentRevurderingsårsak.feilutbetalt_belop_endret,
    ForeldelseDto: hentRevurderingsårsak.foreldelse,
    UtenKlageDto: hentRevurderingsårsak.uten_klage,
};

export const hentRevurderingsårsakTekst = (
    årsak: RevurderingsårsakDto | Revurderingsårsak
): string => revurderingsårsakTekster[årsak];

// TODO: Fjernes når behandlingen hentes fra generated-new. Brukes bare av tilRevurderingsarsak.
const revurderingsårsakFraDto: Record<RevurderingsårsakDto | Revurderingsårsak, Revurderingsårsak> =
    {
        feilutbetalt_belop_endret: 'feilutbetalt_belop_endret',
        etter_klage: 'etter_klage',
        uten_klage: 'uten_klage',
        foreldelse: 'foreldelse',
        FeilutbetaltBelopEndretDto: 'feilutbetalt_belop_endret',
        EtterKlageDto: 'etter_klage',
        UtenKlageDto: 'uten_klage',
        ForeldelseDto: 'foreldelse',
    };

// TODO: Fjernes når behandlingen hentes fra generated-new. Da kan revurderingen sendes rett inn
// i skjemaet og PATCH-kallet uten mapping (fjern også bruken i Revurderingsboks).
// Mapper revurderingen fra behandlingen til skjemaverdiene som brukes ved oppdatering.
export const tilRevurderingsarsak = (
    revurdering: TilbakekrevingRevurderingDto['revurderingsarsak']
): TilbakekrevingRevurderingsarsak => {
    const revurderingsarsak = revurderingsårsakFraDto[revurdering.revurderingsarsak];
    const { begrunnelse } = revurdering;

    if (!('instans' in revurdering) || revurderingsarsak === 'foreldelse') {
        return {
            revurderingsarsak: 'foreldelse',
            begrunnelse,
        } satisfies TilbakekrevingRevurderingsarsak;
    }
    if (revurderingsarsak === 'uten_klage') {
        return {
            revurderingsarsak,
            instans: zInstansEnum.parse(revurdering.instans),
            begrunnelse,
        } satisfies TilbakekrevingRevurderingsarsak;
    }
    return {
        revurderingsarsak,
        instans: revurdering.instans,
        begrunnelse,
    } satisfies TilbakekrevingRevurderingsarsak;
};
