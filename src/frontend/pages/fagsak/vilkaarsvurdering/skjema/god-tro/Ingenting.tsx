import type { FC } from 'react';
import type { VilkårsvurderingSkjemaFelter } from '../schema';

import { Textarea } from '@navikt/ds-react';
import { useFormContext } from 'react-hook-form';

import { SimulertBeløp } from '../SimulertBeløp';

export const Ingenting: FC = () => {
    const { register } = useFormContext<VilkårsvurderingSkjemaFelter>();
    return (
        <>
            <Textarea
                label="Begrunn hvorfor ingenting av beløpet er i behold"
                {...register('godTro.ingenting.begrunnelse')}
                size="small"
                className="max-w-xl"
                minRows={3}
                resize
                maxLength={3000}
            />
            <SimulertBeløp />
        </>
    );
};
