import type { FC } from 'react';
import type { lagVilkårsvurderingSkjema, VilkårsvurderingSkjemaFelter } from './skjema/schema';

import { Button } from '@navikt/ds-react';
import { useMemo } from 'react';
import { useFormContext, useFormState, useWatch } from 'react-hook-form';

import { useVisGlobalAlert } from '@/stores/globalAlertStore';

type LagreKnappProps = {
    skjema: ReturnType<typeof lagVilkårsvurderingSkjema>;
    laster: boolean;
    lagre: () => void;
};

export const LagreKnapp: FC<LagreKnappProps> = ({ skjema, laster, lagre }: LagreKnappProps) => {
    const { control } = useFormContext<VilkårsvurderingSkjemaFelter>();
    const { isDirty } = useFormState({ control });
    const verdier = useWatch({ control });
    const visGlobalAlert = useVisGlobalAlert();
    const erSkjemaetKomplett = useMemo(() => skjema.safeParse(verdier).success, [skjema, verdier]);
    const harUlagredeEndringer = isDirty || !erSkjemaetKomplett;

    const håndterKlikk = (): void => {
        if (harUlagredeEndringer) {
            lagre();
            return;
        }
        visGlobalAlert({
            title: 'Ingen endringer å lagre',
            status: 'announcement',
        });
    };

    return (
        <Button
            type="button"
            size="xsmall"
            variant={isDirty ? 'primary' : 'tertiary'}
            loading={laster}
            onClick={håndterKlikk}
        >
            Lagre
        </Button>
    );
};
