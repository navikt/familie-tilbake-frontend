import type { EventType, FieldValues, FormState, InternalFieldName } from 'react-hook-form';

import { useEffect } from 'react';
import { useFormContext } from 'react-hook-form';

import { useBehandlingState } from '@/context/BehandlingStateContext';

export const useUlagretForhåndsvarsel = (): void => {
    const { setIkkePersistertKomponent, nullstillIkkePersisterteKomponenter } =
        useBehandlingState();

    const methods = useFormContext();

    useEffect(() => {
        const unsubscribe = methods.subscribe({
            formState: { isDirty: true },
            callback: (
                data: Partial<FormState<FieldValues>> & {
                    values: FieldValues;
                    name?: InternalFieldName;
                    type?: EventType;
                }
            ): void => {
                if (data.isDirty) {
                    setIkkePersistertKomponent('forhåndsvarsel');
                } else {
                    nullstillIkkePersisterteKomponenter();
                }
            },
        });
        return unsubscribe;
    }, [methods, setIkkePersistertKomponent, nullstillIkkePersisterteKomponenter]);
};
