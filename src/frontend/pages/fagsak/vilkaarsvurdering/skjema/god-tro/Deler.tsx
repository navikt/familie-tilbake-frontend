import type { FC } from 'react';
import type { VilkårsvurderingSkjemaFelter } from '../skjemaTyper';

import { Textarea, TextField } from '@navikt/ds-react';
import { useFormContext } from 'react-hook-form';

import { KrevesTilbakeVurdering } from './KrevesTilbakeVurdering';

type Props = {
    simulertBeløp: number | null;
};

export const Deler: FC<Props> = ({ simulertBeløp }: Props) => {
    const { register } = useFormContext<VilkårsvurderingSkjemaFelter>();
    return (
        <>
            <Textarea
                label="Begrunn hvorfor deler av beløpet er i behold"
                {...register('godTro.deler.begrunnelseIBehold')}
                size="small"
                className="max-w-xl"
                minRows={3}
                resize
                maxLength={3000}
            />
            <TextField
                label="Hvor mange kroner er i behold?"
                {...register('godTro.deler.beløpIBehold', {
                    setValueAs: (value: string): number | null => (value ? Number(value) : null),
                })}
                size="small"
                style={{ width: '100px' }}
                className="max-w-xl"
            />
            <KrevesTilbakeVurdering
                navnPrefix="godTro.deler"
                beløpsbeskrivelse="hele beløpet som er i behold"
                simulertBeløp={simulertBeløp}
            />
        </>
    );
};
