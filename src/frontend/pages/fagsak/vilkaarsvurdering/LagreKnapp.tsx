import type { FC } from 'react';
import type { lagVilkårsvurderingSkjema, VilkårsvurderingSkjemaFelter } from './skjema/schema';

import { Button } from '@navikt/ds-react';
import { useMemo } from 'react';
import { useFormContext, useFormState, useWatch } from 'react-hook-form';

type LagreKnappProps = {
    skjema: ReturnType<typeof lagVilkårsvurderingSkjema>;
    laster: boolean;
    lagre: () => void;
};

export const LagreKnapp: FC<LagreKnappProps> = ({ skjema, laster, lagre }: LagreKnappProps) => {
    const { control } = useFormContext<VilkårsvurderingSkjemaFelter>();
    const { isDirty } = useFormState({ control });
    const verdier = useWatch({ control });
    const erSkjemaetKomplett = useMemo(() => skjema.safeParse(verdier).success, [skjema, verdier]);
    const kanLagre = isDirty || !erSkjemaetKomplett;

    return (
        <Button
            size="xsmall"
            variant={kanLagre ? 'primary' : 'tertiary'}
            loading={laster}
            onClick={kanLagre ? lagre : undefined}
        >
            Lagre
        </Button>
    );
};
