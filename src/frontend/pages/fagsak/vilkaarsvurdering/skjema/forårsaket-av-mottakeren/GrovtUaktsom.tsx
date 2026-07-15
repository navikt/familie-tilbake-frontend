import type { FC } from 'react';
import type { VilkårsvurderingSkjemaFelter } from '../schema';

import { Textarea } from '@navikt/ds-react';
import { useFormContext } from 'react-hook-form';

import { SærligeGrunner } from '../SærligeGrunner';

export const GrovtUaktsom: FC = () => {
    const { register } = useFormContext<VilkårsvurderingSkjemaFelter>();
    return (
        <>
            <Textarea
                label="Begrunn hvorfor du vurderer at mottakeren har handlet grovt uaktsomt"
                {...register('forårsaketAvMottaker.grovtUaktsomt.begrunnelse')}
                size="small"
                className="max-w-xl"
                minRows={3}
                resize
                maxLength={3000}
            />
            <SærligeGrunner
                navnPrefix="forårsaketAvMottaker.grovtUaktsomt.erDetSærligeGrunner"
                renter
                reduksjon
            />
        </>
    );
};
