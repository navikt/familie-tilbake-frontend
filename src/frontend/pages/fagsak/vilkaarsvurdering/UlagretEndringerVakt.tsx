import type { FC } from 'react';

import { useSynkroniserUlagretSkjema } from '@/hooks/useSynkroniserUlagretSkjema';

export const VILKÅRSVURDERING_KOMPONENT_ID = 'vilkårsvurdering';

/**
 * Rendrer ingenting, men holder abonnementet på skjemaets `isDirty` isolert fra
 * resten av skjematreet slik at endringer i dirty-tilstand ikke re-rendrer skjemaet.
 */
export const UlagretEndringerVakt: FC = () => {
    useSynkroniserUlagretSkjema(VILKÅRSVURDERING_KOMPONENT_ID);
    return null;
};
