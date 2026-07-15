import type { FC } from 'react';
import type { VilkårsvurderingSkjemaFelter } from '../schema';

import { Radio, RadioGroup } from '@navikt/ds-react';
import { useFormContext, useWatch } from 'react-hook-form';

import { BurdeForstått } from './BurdeForstått';
import { Forsto } from './Forsto';

type Props = {
    simulertBeløp: number | null;
};

export const ForstoEllerBurdeForståttFelter: FC<Props> = ({ simulertBeløp }: Props) => {
    const { control, register } = useFormContext<VilkårsvurderingSkjemaFelter>();
    const forståelse = useWatch({
        name: 'forstoEllerBurdeForstått.forståelse',
        control: control,
    });
    const { name: forståelseName, ...forståelseProps } = register(
        'forstoEllerBurdeForstått.forståelse'
    );
    return (
        <>
            <RadioGroup
                name={forståelseName}
                legend="Vurder mottakerens forståelse på utbetalingstidspunktet"
                size="small"
                className="max-w-xl"
                value={forståelse}
            >
                <Radio value="forsto" {...forståelseProps}>
                    Mottakeren <span className="font-bold">forsto</span> at utbetalingen skyldtes en
                    feil
                </Radio>
                <Radio value="burdeForstått" {...forståelseProps}>
                    Mottakeren <span className="font-bold">burde forstått</span> at utbetalingen
                    skyldtes en feil
                </Radio>
            </RadioGroup>

            {forståelse === 'forsto' && <Forsto simulertBeløp={simulertBeløp} />}

            {forståelse === 'burdeForstått' && <BurdeForstått simulertBeløp={simulertBeløp} />}
        </>
    );
};
