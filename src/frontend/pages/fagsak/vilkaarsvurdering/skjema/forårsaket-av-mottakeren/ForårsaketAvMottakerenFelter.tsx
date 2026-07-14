import type { FC } from 'react';
import type { VilkårsvurderingSkjemaFelter } from '../schema';

import { Radio, RadioGroup } from '@navikt/ds-react';
import { useFormContext, useWatch } from 'react-hook-form';

import { Forsett } from './Forsett';
import { GrovtUaktsom } from './GrovtUaktsom';
import { Uaktsom } from './Uaktsom';

type Props = {
    simulertBeløp: number | null;
};

export const ForårsaketAvMottakerenFelter: FC<Props> = ({ simulertBeløp }: Props) => {
    const { control, register } = useFormContext<VilkårsvurderingSkjemaFelter>();
    const uaktsomhet = useWatch({
        name: 'forårsaketAvMottaker.aktsomhet',
        control: control,
    });
    const { name: aktsomhetName, ...aktsomhetProps } = register('forårsaketAvMottaker.aktsomhet');
    return (
        <>
            <RadioGroup
                name={aktsomhetName}
                legend="Vurder mottakerens uaktsomhet i perioden"
                size="small"
                className="max-w-xl"
                value={uaktsomhet}
            >
                <Radio value="uaktsomt" {...aktsomhetProps}>
                    Uaktsom
                </Radio>
                <Radio value="grovtUaktsomt" {...aktsomhetProps}>
                    Grovt uaktsom
                </Radio>
                <Radio value="forsettlig" {...aktsomhetProps}>
                    Forsett
                </Radio>
            </RadioGroup>

            {uaktsomhet === 'grovtUaktsomt' && <GrovtUaktsom simulertBeløp={simulertBeløp} />}

            {uaktsomhet === 'forsettlig' && <Forsett simulertBeløp={simulertBeløp} />}

            {uaktsomhet === 'uaktsomt' && <Uaktsom simulertBeløp={simulertBeløp} />}
        </>
    );
};
