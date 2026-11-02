import type { TilbakekrevingRevurderingDto } from '@/generated/types.gen';
import type { TilbakekrevingRevurderingsarsak } from '@/generated-new';

export type Revurderingsårsak = TilbakekrevingRevurderingsarsak['revurderingsarsak'];

type RevurderingsårsakDto = TilbakekrevingRevurderingDto['revurderingsarsak']['revurderingsarsak'];

export const årsaker: Record<Revurderingsårsak, string> = {
    feilutbetalt_belop_endret: 'Omgjøring av vedtaket om tilbakekreving fordi beløpet er endret',
    etter_klage: 'Omgjøring av vedtaket om tilbakekreving etter klage',
    uten_klage: 'Omgjøring av vedtaket om tilbakekreving uten klage (fvl. § 35)',
    foreldelse: 'Endring av kravet på grunn av foreldelse',
};

const revurderingsårsakFraDto: Record<RevurderingsårsakDto, Revurderingsårsak> = {
    EtterKlageDto: 'etter_klage',
    FeilutbetaltBelopEndretDto: 'feilutbetalt_belop_endret',
    ForeldelseDto: 'foreldelse',
    UtenKlageDto: 'uten_klage',
};

export const hentRevurderingsårsakTekst = (årsak: RevurderingsårsakDto): string =>
    årsaker[revurderingsårsakFraDto[årsak]];
