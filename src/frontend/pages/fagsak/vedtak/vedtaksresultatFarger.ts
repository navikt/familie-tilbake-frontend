import type { TagProps } from '@navikt/ds-react';
import type { Vedtaksresultat } from '~/generated-new/types.gen';

export const vedtaksresultatFarger: Record<Vedtaksresultat, TagProps['data-color']> = {
    DelvisTilbakebetaling: 'meta-purple',
    IngenTilbakebetaling: 'brand-beige',
    FullTilbakebetaling: 'meta-lime',
};
