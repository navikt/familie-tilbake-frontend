import type { FC } from 'react';
import type { VilkårsvurderingSkjemaFelter } from '../schema';

import { Radio, RadioGroup } from '@navikt/ds-react';
import { useFormContext, useWatch } from 'react-hook-form';

import { Forsett } from './Forsett';
import { GrovtUaktsom } from './GrovtUaktsom';
import { Uaktsom } from './Uaktsom';

export const ForårsaketAvMottakerenFelter: FC = () => {
    const { control, register, formState } = useFormContext<VilkårsvurderingSkjemaFelter>();
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
                error={formState.errors.forårsaketAvMottaker?.aktsomhet?.message}
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

            {uaktsomhet === 'grovtUaktsomt' && <GrovtUaktsom />}

            {uaktsomhet === 'forsettlig' && <Forsett />}

            {uaktsomhet === 'uaktsomt' && <Uaktsom />}
        </>
    );
};
