import type { FC } from 'react';
import type { VilkårsvurderingSkjemaFelter } from '../schema';

import { Textarea } from '@navikt/ds-react';
import { useFormContext } from 'react-hook-form';

import { useVilkårsvurderingLesedata } from '../../VilkårsvurderingLesedataContext';
import { SærligeGrunner } from '../SærligeGrunner';
import { Under4xRettsgebyr } from '../Under4xRettsgebyr';

export const BurdeForstått: FC = () => {
    const { erUnder4xRettsgebyr } = useVilkårsvurderingLesedata();
    const { register } = useFormContext<VilkårsvurderingSkjemaFelter>();
    return (
        <>
            <Textarea
                label="Begrunn hvorfor du vurderer at mottakeren burde forstått at utbetalingen skyldtes en feil"
                size="small"
                className="max-w-xl"
                minRows={3}
                resize
                maxLength={3000}
                {...register('forstoEllerBurdeForstått.burdeForstått.begrunnelse')}
            />
            {erUnder4xRettsgebyr ? (
                <Under4xRettsgebyr
                    navnPrefix="forstoEllerBurdeForstått.burdeForstått.unnlatelse"
                    reduksjon
                />
            ) : (
                <SærligeGrunner
                    navnPrefix="forstoEllerBurdeForstått.burdeForstått.unnlatelse.ikkeAktuelt.erDetSærligeGrunner"
                    reduksjon
                />
            )}
        </>
    );
};
