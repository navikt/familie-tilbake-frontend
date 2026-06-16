import type { FieldValues, UseFormReturn } from 'react-hook-form';

import { useEffect, useRef } from 'react';

import { useBehandlingState } from '@/context/BehandlingStateContext';

export const useUlagretForhåndsvarsel = <T extends FieldValues>(
    methods: UseFormReturn<T>
): void => {
    const { setIkkePersistertKomponent, nullstillIkkePersisterteKomponenter } =
        useBehandlingState();

    const { isDirty } = methods.formState;
    const forrigeDirty = useRef(isDirty);

    useEffect(() => {
        if (isDirty === forrigeDirty.current) return;
        forrigeDirty.current = isDirty;

        if (isDirty) {
            setIkkePersistertKomponent('forhåndsvarsel');
        } else {
            nullstillIkkePersisterteKomponenter();
        }
    }, [isDirty, setIkkePersistertKomponent, nullstillIkkePersisterteKomponenter]);
};
