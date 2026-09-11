import type { FC } from 'react';
import type { VilkårsvurderingSkjemaFelter } from '../schema';

import { Textarea } from '@navikt/ds-react';
import { useFormContext } from 'react-hook-form';

import { useBehandlingState } from '@/context/BehandlingStateContext';

import { SimulertBeløp } from '../SimulertBeløp';

export const Forsett: FC = () => {
    const { behandlingILesemodus } = useBehandlingState();
    const {
        register,
        formState: { errors },
    } = useFormContext<VilkårsvurderingSkjemaFelter>();
    return (
        <>
            <Textarea
                label="Begrunn hvorfor du vurderer at mottakeren har handlet med forsett"
                {...register('forårsaketAvMottaker.forsettlig.begrunnelse')}
                error={errors.forårsaketAvMottaker?.forsettlig?.begrunnelse?.message}
                size="small"
                className="max-w-xl"
                minRows={3}
                resize
                maxLength={3000}
                readOnly={behandlingILesemodus}
            />
            <SimulertBeløp renter />
        </>
    );
};
