import type { TilbakekrevingRevurderingDto } from '@/generated/types.gen';
import type { TilbakekrevingRevurderingsarsak } from '@/generated-new';

export type Revurderingsårsak = TilbakekrevingRevurderingsarsak['revurderingsarsak'];

type RevurderingsårsakDto = TilbakekrevingRevurderingDto['revurderingsarsak']['revurderingsarsak'];

export const hentRevurderingsårsak: Record<Revurderingsårsak, string> = {
    feilutbetalt_belop_endret: 'Omgjøring av vedtaket om tilbakekreving fordi beløpet er endret',
    etter_klage: 'Omgjøring av vedtaket om tilbakekreving etter klage',
    uten_klage: 'Omgjøring av vedtaket om tilbakekreving uten klage (fvl. § 35)',
    foreldelse: 'Endring av kravet på grunn av foreldelse',
};

// Backendens OpenAPI-spec oppgir klassenavnet (f.eks. `EtterKlageDto`) som årsakskode, mens
// backend faktisk sender navnet fra `@JsonSubTypes` (f.eks. `etter_klage`).
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
