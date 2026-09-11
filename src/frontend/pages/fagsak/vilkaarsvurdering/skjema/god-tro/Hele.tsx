import type { FC } from 'react';
import type { VilkårsvurderingSkjemaFelter } from '../schema';

import { Textarea } from '@navikt/ds-react';
import { useFormContext } from 'react-hook-form';

import { useBehandlingState } from '@/context/BehandlingStateContext';

import { Reduksjon } from './Reduksjon';

export const Hele: FC = () => {
    const { behandlingILesemodus } = useBehandlingState();
    const {
        register,
        formState: { errors },
    } = useFormContext<VilkårsvurderingSkjemaFelter>();
    return (
        <>
            <Textarea
                label="Begrunn hvorfor hele det feilutbetalte beløpet er i behold"
                {...register('godTro.hele.begrunnelse')}
                error={errors.godTro?.hele?.begrunnelse?.message}
                size="small"
                className="max-w-xl"
                minRows={3}
                resize
                maxLength={3000}
                readOnly={behandlingILesemodus}
            />
            <Reduksjon navnPrefix="godTro.hele" />
        </>
    );
};
