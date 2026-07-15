import type { FC } from 'react';
import type { VilkårsvurderingSkjemaFelter } from '../schema';

import { Textarea, TextField } from '@navikt/ds-react';
import { useFormContext } from 'react-hook-form';

import { Reduksjon } from './Reduksjon';

export const Deler: FC = () => {
    const { register } = useFormContext<VilkårsvurderingSkjemaFelter>();
    return (
        <>
            <Textarea
                label="Begrunn hvorfor deler av beløpet er i behold"
                {...register('godTro.deler.begrunnelse')}
                size="small"
                className="max-w-xl"
                minRows={3}
                resize
                maxLength={3000}
            />
            <TextField
                label="Hvor mange kroner er i behold?"
                {...register('godTro.deler.beløp', {
                    setValueAs: (value: string): number | null => (value ? Number(value) : null),
                })}
                size="small"
                style={{ width: '100px' }}
                className="max-w-xl"
            />
            <Reduksjon navnPrefix="godTro.deler" beløpsbeskrivelse="hele beløpet som er i behold" />
        </>
    );
};
