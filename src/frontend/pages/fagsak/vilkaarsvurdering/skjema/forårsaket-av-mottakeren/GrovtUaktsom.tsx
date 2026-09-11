import type { FC } from 'react';
import type { VilkårsvurderingSkjemaFelter } from '../schema';

import { Textarea } from '@navikt/ds-react';
import { useFormContext } from 'react-hook-form';

import { useBehandlingState } from '@/context/BehandlingStateContext';

import { SærligeGrunner } from '../SærligeGrunner';

export const GrovtUaktsom: FC = () => {
    const { behandlingILesemodus } = useBehandlingState();
    const {
        register,
        formState: { errors },
    } = useFormContext<VilkårsvurderingSkjemaFelter>();
    return (
        <>
            <Textarea
                label="Begrunn hvorfor du vurderer at mottakeren har handlet grovt uaktsomt"
                {...register('forårsaketAvMottaker.grovtUaktsomt.begrunnelse')}
                error={errors.forårsaketAvMottaker?.grovtUaktsomt?.begrunnelse?.message}
                size="small"
                className="max-w-xl"
                minRows={3}
                resize
                maxLength={3000}
                readOnly={behandlingILesemodus}
            />
            <SærligeGrunner
                navnPrefix="forårsaketAvMottaker.grovtUaktsomt.erDetSærligeGrunner"
                renter
                reduksjon
            />
        </>
    );
};
