import type { FC } from 'react';
import type { Vilkaarsvurdering } from '@/generated-new';
import type { VilkårsvurderingSkjemaFelter } from './schema';

import { zodResolver } from '@hookform/resolvers/zod';
import { Radio, RadioGroup } from '@navikt/ds-react';
import { FormProvider, useForm, useWatch } from 'react-hook-form';

import { ForstoEllerBurdeForståttFelter } from './forsto-eller-burde-forstått/ForstoEllerBurdeForståttFelter';
import { ForårsaketAvMottakerenFelter } from './forårsaket-av-mottakeren/ForårsaketAvMottakerenFelter';
import { GodTroFelter } from './god-tro/GodTroFelter';
import { vilkårsvurderingSkjema } from './schema';
import { utledDefaultValues } from './utledDefaultValues';

type Props = {
    vilkårsvurdering: Vilkaarsvurdering;
    simulertBeløp: number | null;
};

export const VilkårsvurderingSkjema: FC<Props> = ({ vilkårsvurdering, simulertBeløp }: Props) => {
    const methods = useForm<VilkårsvurderingSkjemaFelter>({
        resolver: zodResolver(vilkårsvurderingSkjema),
        defaultValues: utledDefaultValues(vilkårsvurdering),
    });

    const valg = useWatch({
        name: 'valg',
        control: methods.control,
    });
    const { name: valgName, ...valgProps } = methods.register('valg');

    return (
        <FormProvider {...methods}>
            <form className="py-3 px-4 overflow-y-auto gap-6 flex flex-col flex-1">
                <RadioGroup
                    name={valgName}
                    legend="Hvilket vilkår etter folketrygdloven § 22-15 gjelder for perioden?"
                    size="small"
                    className="max-w-xl"
                    value={valg}
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

                {valg === 'forsto_eller_burde_forstått' && (
                    <ForstoEllerBurdeForståttFelter simulertBeløp={simulertBeløp} />
                )}

                {valg === 'forårsaket_av_mottaker' && (
                    <ForårsaketAvMottakerenFelter simulertBeløp={simulertBeløp} />
                )}

                {valg === 'god_tro' && <GodTroFelter simulertBeløp={simulertBeløp} />}
            </form>
        </FormProvider>
    );
};
