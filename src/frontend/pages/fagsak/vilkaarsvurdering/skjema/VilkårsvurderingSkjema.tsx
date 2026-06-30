import type { FC } from 'react';

import { Radio, RadioGroup } from '@navikt/ds-react';
import { useState } from 'react';

import { ForstoEllerBurdeForståttFelter } from './forsto-eller-burde-forstått/ForstoEllerBurdeForståttFelter';
import { ForårsaketAvMottakerenFelter } from './forårsaket-av-mottakeren/ForårsaketAvMottakerenFelter';
import { GodTroFelter } from './god-tro/GodTroFelter';

type VilkårValg = 'forsto_eller_burde_forstått' | 'forårsaket_av_mottaker' | 'god_tro';

export const VilkårsvurderingSkjema: FC = () => {
    const [valg, setValg] = useState<VilkårValg>();

    return (
        <form className="py-3 px-4 overflow-y-auto gap-6 flex flex-col flex-1">
            <RadioGroup
                legend="Hvilket vilkår etter folketrygdloven §22-15 gjelder for perioden?"
                size="small"
                className="max-w-xl"
                value={valg ?? ''}
                onChange={(value: VilkårValg): void => setValg(value)}
            >
                <Radio value="forsto_eller_burde_forstått">
                    Mottakeren <span className="font-bold">forsto eller burde forstått</span> at
                    utbetalingen skyldtes en feil (Første avsnitt første setning)
                </Radio>
                <Radio value="forårsaket_av_mottaker">
                    Mottakeren har forårsaket utbetalingen ved{' '}
                    <span className="font-bold">
                        å forsettlig eller uaktsomt gi feilaktige eller mangelfulle
                    </span>{' '}
                    opplysninger (Første avsnitt andre setning)
                </Radio>
                <Radio value="god_tro">
                    Mottakeren har mottatt beløpet i{' '}
                    <span className="font-bold">aktsom god tro</span>
                </Radio>
            </RadioGroup>

            {valg === 'forsto_eller_burde_forstått' && <ForstoEllerBurdeForståttFelter />}

            {valg === 'forårsaket_av_mottaker' && <ForårsaketAvMottakerenFelter />}

            {valg === 'god_tro' && <GodTroFelter />}
        </form>
    );
};
