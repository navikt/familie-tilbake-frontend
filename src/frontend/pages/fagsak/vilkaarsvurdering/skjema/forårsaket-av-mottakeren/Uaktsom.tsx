import type { FC } from 'react';
import type { VilkårsvurderingSkjemaFelter } from '../skjemaTyper';

import { Textarea } from '@navikt/ds-react';
import { useFormContext } from 'react-hook-form';

import { useVilkårsvurderingLesedata } from '../../VilkårsvurderingLesedataContext';
import { SærligeGrunner } from '../SærligeGrunner';
import { Under4xRettsgebyr } from '../Under4xRettsgebyr';

type Props = {
    simulertBeløp: number | null;
};

export const Uaktsom: FC<Props> = ({ simulertBeløp }: Props) => {
    const { erUnder4xRettsgebyr } = useVilkårsvurderingLesedata();
    const { register } = useFormContext<VilkårsvurderingSkjemaFelter>();
    return (
        <>
            <Textarea
                label="Begrunn hvorfor du vurderer at mottakeren har handlet uaktsomt"
                {...register('forårsaketAvMottaker.uaktsomt.begrunnelse')}
                size="small"
                className="max-w-xl"
                minRows={3}
                resize
                maxLength={3000}
            />
            {erUnder4xRettsgebyr ? (
                <Under4xRettsgebyr
                    navnPrefix="forårsaketAvMottaker.uaktsomt.særligeGrunner"
                    reduksjon
                    simulertBeløp={simulertBeløp}
                />
            ) : (
                <SærligeGrunner
                    navnPrefix="forårsaketAvMottaker.uaktsomt.særligeGrunner"
                    reduksjon
                    simulertBeløp={simulertBeløp}
                />
            )}
        </>
    );
};
