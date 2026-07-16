import type { FC } from 'react';
import type { VilkårsvurderingSkjemaFelter } from '../schema';

import { Textarea } from '@navikt/ds-react';
import { useFormContext } from 'react-hook-form';

import { useVilkårsvurderingLesedata } from '../../VilkårsvurderingLesedataContext';
import { SærligeGrunner } from '../SærligeGrunner';
import { Under4xRettsgebyr } from '../Under4xRettsgebyr';

export const Forsto: FC = () => {
    const { erUnder4xRettsgebyr } = useVilkårsvurderingLesedata();
    const {
        register,
        formState: { errors },
    } = useFormContext<VilkårsvurderingSkjemaFelter>();
    return (
        <>
            <Textarea
                label="Begrunn hvorfor du vurderer at mottakeren forsto at utbetalingen skyldtes en feil"
                size="small"
                className="max-w-xl"
                minRows={3}
                resize
                maxLength={3000}
                {...register('forstoEllerBurdeForstått.forsto.begrunnelse')}
                error={errors.forstoEllerBurdeForstått?.forsto?.begrunnelse?.message}
            />
            {erUnder4xRettsgebyr ? (
                <Under4xRettsgebyr
                    navnPrefix="forstoEllerBurdeForstått.forsto.unnlatelse"
                    reduksjon
                />
            ) : (
                <SærligeGrunner
                    navnPrefix="forstoEllerBurdeForstått.forsto.unnlatelse.ikkeAktuelt.erDetSærligeGrunner"
                    reduksjon
                />
            )}
        </>
    );
};
