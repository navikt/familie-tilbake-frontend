import type { FC } from 'react';
import type { VilkårsvurderingSkjemaFelter } from './schema';

import { Radio, RadioGroup } from '@navikt/ds-react';
import { useFormContext, useWatch } from 'react-hook-form';

import { ForstoEllerBurdeForståttFelter } from './forsto-eller-burde-forstått/ForstoEllerBurdeForståttFelter';
import { ForårsaketAvMottakerenFelter } from './forårsaket-av-mottakeren/ForårsaketAvMottakerenFelter';
import { GodTroFelter } from './god-tro/GodTroFelter';

export const VilkårsvurderingSkjema: FC = () => {
    const {
        control,
        register,
        formState: { errors },
    } = useFormContext<VilkårsvurderingSkjemaFelter>();

    const valg = useWatch({
        name: 'valg',
        control,
    });
    const { name: valgName, ...valgProps } = register('valg');

    return (
        <>
            <RadioGroup
                name={valgName}
                legend="Hvilket vilkår etter folketrygdloven § 22-15 gjelder for perioden?"
                size="small"
                className="max-w-xl"
                value={valg}
                error={errors.valg?.message}
            >
                <Radio value="forsto_eller_burde_forstått" {...valgProps}>
                    Mottakeren <span className="font-bold">forsto eller burde forstått</span> at
                    utbetalingen skyldtes en feil (første avsnitt første setning)
                </Radio>
                <Radio value="forårsaket_av_mottaker" {...valgProps}>
                    Mottakeren har forårsaket utbetalingen ved{' '}
                    <span className="font-bold">
                        å forsettlig eller uaktsomt gi feilaktige eller mangelfulle
                    </span>{' '}
                    opplysninger (første avsnitt andre setning)
                </Radio>
                <Radio value="god_tro" {...valgProps}>
                    Mottakeren har mottatt beløpet i{' '}
                    <span className="font-bold">aktsom god tro</span>
                </Radio>
            </RadioGroup>

            {valg === 'forsto_eller_burde_forstått' && <ForstoEllerBurdeForståttFelter />}

            {valg === 'forårsaket_av_mottaker' && <ForårsaketAvMottakerenFelter />}

            {valg === 'god_tro' && <GodTroFelter />}
        </>
    );
};
