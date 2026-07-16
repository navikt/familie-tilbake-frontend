import type { FC } from 'react';
import type { VilkårsvurderingSkjemaFelter } from '../schema';

import { Radio, RadioGroup, Textarea } from '@navikt/ds-react';
import { useFormContext, useWatch } from 'react-hook-form';

import { Deler } from './Deler';
import { Hele } from './Hele';
import { Ingenting } from './Ingenting';

export const GodTroFelter: FC = () => {
    const {
        register,
        control,
        formState: { errors },
    } = useFormContext<VilkårsvurderingSkjemaFelter>();
    const beløpIBehold = useWatch({
        name: 'godTro.beløpIBehold',
        control: control,
    });
    const { name: beløpIBeholdName, ...beløpIBeholdProps } = register('godTro.beløpIBehold');

    return (
        <>
            <Textarea
                label="Begrunn hvorfor du vurderer at mottakeren har mottatt beløpet i aktsom god tro"
                {...register('godTro.begrunnelse')}
                error={errors.godTro?.begrunnelse?.message}
                size="small"
                className="max-w-xl"
                minRows={3}
                resize
                maxLength={3000}
            />
            <RadioGroup
                name={beløpIBeholdName}
                legend="Hvor mye av det feilutbetalte beløpet er i behold?"
                size="small"
                className="max-w-xl"
                value={beløpIBehold}
                error={errors.godTro?.beløpIBehold?.message}
            >
                <Radio value="ingenting" {...beløpIBeholdProps}>
                    Ingenting av beløpet
                </Radio>
                <Radio value="hele" {...beløpIBeholdProps}>
                    Hele beløpet
                </Radio>
                <Radio value="deler" {...beløpIBeholdProps}>
                    Deler av beløpet
                </Radio>
            </RadioGroup>

            {beløpIBehold === 'ingenting' && <Ingenting />}

            {beløpIBehold === 'hele' && <Hele />}

            {beløpIBehold === 'deler' && <Deler />}
        </>
    );
};
