import { useEffect } from 'react';
import { useFormContext, useFormState } from 'react-hook-form';

import { useBehandlingState } from '@/context/BehandlingStateContext';

/**
 * Synkroniserer `isDirty` fra react-hook-form til den globale ulagret-endringer-tilstanden,
 * slik at `UlagretDataModal` kan advare ved navigasjon.
 *
 * `isDirty` er eneste kilde til sannhet. Hooken bør kalles fra en egen liten komponent
 * inne i `FormProvider`, slik at abonnementet på skjematilstanden ikke re-rendrer hele skjemaet.
 */
export const useSynkroniserUlagretSkjema = (komponentId: string): void => {
    const { setIkkePersistertKomponent, nullstillIkkePersisterteKomponenter } =
        useBehandlingState();
    const { control } = useFormContext();
    const { isDirty } = useFormState({ control });

    useEffect(() => {
        /**
         * Nullstilling tømmer hele registeret, men bare ett steg er montert om gangen,
         * så registeret kan aldri inneholde en annen komponent enn denne.
         */
        if (isDirty) {
            setIkkePersistertKomponent(komponentId);
        } else {
            nullstillIkkePersisterteKomponenter();
        }

        return (): void => nullstillIkkePersisterteKomponenter();
    }, [isDirty, komponentId, setIkkePersistertKomponent, nullstillIkkePersisterteKomponenter]);
};
