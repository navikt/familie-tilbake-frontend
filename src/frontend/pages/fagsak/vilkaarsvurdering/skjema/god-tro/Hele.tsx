import type { FC } from 'react';
import type { VilkårsvurderingSkjemaFelter } from '../schema';

import { Textarea } from '@navikt/ds-react';
import { useFormContext } from 'react-hook-form';

import { Reduksjon } from './Reduksjon';

type Props = {
    simulertBeløp: number | null;
};

export const Hele: FC<Props> = ({ simulertBeløp }: Props) => {
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
            <Reduksjon
                navnPrefix="godTro.hele"
                beløpsbeskrivelse="hele beløpet"
                simulertBeløp={simulertBeløp}
            />
        </>
    );
};
