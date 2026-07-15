import type { FC } from 'react';
import type { VilkårsvurderingSkjemaFelter } from '../schema';

import { Textarea } from '@navikt/ds-react';
import { useFormContext } from 'react-hook-form';

import { Reduksjon } from './Reduksjon';

export const Hele: FC = () => {
    const { register } = useFormContext<VilkårsvurderingSkjemaFelter>();
    return (
        <>
            <Textarea
                label="Begrunn hvorfor hele beløpet er i behold"
                {...register('godTro.hele.begrunnelse')}
                size="small"
                className="max-w-xl"
                minRows={3}
                resize
                maxLength={3000}
            />
            <Reduksjon navnPrefix="godTro.hele" beløpsbeskrivelse="hele beløpet" />
        </>
    );
};
