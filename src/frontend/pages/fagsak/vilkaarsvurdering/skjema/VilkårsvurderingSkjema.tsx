import type { FC } from 'react';

import { Radio, RadioGroup } from '@navikt/ds-react';
import { useState } from 'react';

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
                    Mottaker <span className="font-bold">forsto eller burde forstått</span> at
                    utbetalingen skyldtes en feil (Første avsnitt første setning)
                </Radio>
                <Radio value="forårsaket_av_mottaker">
                    Mottaker har forårsaket utbetalingen ved{' '}
                    <span className="font-bold">
                        å forsettlig eller uaktsomt gi feilaktige eller mangelfulle
                    </span>{' '}
                    opplysninger (Første avsnitt andre setning)
                </Radio>
                <Radio value="god_tro">
                    Mottaker har mottatt beløpet i <span className="font-bold">aktsom god tro</span>
                </Radio>
            </RadioGroup>

            {valg === 'god_tro' && <GodTroFelter />}
        </form>
    );
};
