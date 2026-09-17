import type { TagProps } from '@navikt/ds-react';
import type { Vedtaksresultat } from '@/generated-new';

export const vedtaksresultater: Record<Vedtaksresultat, string> = {
    FullTilbakebetaling: 'Full tilbakekreving',
    DelvisTilbakebetaling: 'Delvis tilbakekreving',
    IngenTilbakebetaling: 'Ingen tilbakekreving',
};

export const vedtaksresultatFarger: Record<Vedtaksresultat, TagProps['data-color']> = {
    DelvisTilbakebetaling: 'meta-purple',
    IngenTilbakebetaling: 'success',
    FullTilbakebetaling: 'brand-magenta',
};
