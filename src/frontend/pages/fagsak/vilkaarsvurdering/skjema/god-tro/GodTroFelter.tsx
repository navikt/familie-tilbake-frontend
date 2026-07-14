import type { FC } from 'react';
import type { VilkårsvurderingSkjemaFelter } from '../skjemaTyper';

import { Radio, RadioGroup, Textarea } from '@navikt/ds-react';
import { useFormContext, useWatch } from 'react-hook-form';

import { Deler } from './Deler';
import { Hele } from './Hele';
import { Ingenting } from './Ingenting';

type Props = {
    simulertBeløp: number | null;
};

export const GodTroFelter: FC<Props> = ({ simulertBeløp }: Props) => {
    const { register, control } = useFormContext<VilkårsvurderingSkjemaFelter>();
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

            {beløpIBehold === 'ingenting' && <Ingenting simulertBeløp={simulertBeløp} />}

            {beløpIBehold === 'hele' && <Hele simulertBeløp={simulertBeløp} />}

            {beløpIBehold === 'deler' && <Deler simulertBeløp={simulertBeløp} />}
        </>
    );
};
