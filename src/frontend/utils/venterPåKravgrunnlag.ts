import type { VenterDto } from '@/generated';

export const VENTER_PÅ_KRAVGRUNNLAG_TITTEL = 'Venter på kravgrunnlag';

export const hentVentebeskrivelse = (grunn: VenterDto['grunn']): string =>
    grunn === 'SPERRET_VENTER_PÅ_OPPDATERING_FRA_ØKONOMI'
        ? 'Vi venter på tilbakekrevingsgrunnlag fra økonomi. Du kan ikke gjøre noe i behandlingen før det nye kravgrunnlaget har oppdatert seg. Du kan likevel se og lese hva som er gjort i behandlingen til nå.'
        : '';
