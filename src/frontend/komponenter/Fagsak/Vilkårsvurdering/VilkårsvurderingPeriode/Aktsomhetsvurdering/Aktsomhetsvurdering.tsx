import * as React from 'react';

import { Radio } from 'nav-frontend-skjema';

import {
    Aktsomhet,
    aktsomheter,
    aktsomhetTyper,
    forstodBurdeForståttAktsomheter,
    Vilkårsresultat,
} from '../../../../../kodeverk';
import { Aktsomhetsvurdering } from '../../../../../typer/feilutbetalingtyper';
import { HorisontalFamilieRadioGruppe } from '../../../../Felleskomponenter/Skjemaelementer';
import { useVilkårsvurderingPeriode } from '../VilkårsvurderingPeriodeContext';
import GradForsettSkjema from './GradForsettSkjema';
import GradUaktsomhetSkjema from './GradUaktsomhetSkjema';

interface IProps {
    erTotalbeløpUnder4Rettsgebyr: boolean;
    erLesevisning: boolean;
}

const Aktsomhetsvurdering: React.FC<IProps> = ({ erTotalbeløpUnder4Rettsgebyr, erLesevisning }) => {
    const {
        vilkårsresultat,
        aktsomhetsvurdering,
        oppdaterAktsomhetsvurdering,
    } = useVilkårsvurderingPeriode();
    const erForstodBurdeForstått =
        vilkårsresultat?.vilkårsresultat === Vilkårsresultat.FORSTO_BURDE_FORSTÅTT;

    const onChangeAktsomhet = (type: Aktsomhet) => {
        oppdaterAktsomhetsvurdering({ aktsomhet: type });
    };

    return (
        <>
            <HorisontalFamilieRadioGruppe
                id="handletUaktsomhetGrad"
                erLesevisning={erLesevisning}
                legend={'I hvilken grad har mottaker handlet uaktsomt?'}
            >
                {aktsomhetTyper.map(type => (
                    <Radio
                        name="handletUaktsomhetGrad"
                        key={type}
                        value={type}
                        onChange={() => onChangeAktsomhet(type)}
                        checked={aktsomhetsvurdering?.aktsomhet === type}
                        label={
                            erForstodBurdeForstått
                                ? forstodBurdeForståttAktsomheter[type]
                                : aktsomheter[type]
                        }
                    />
                ))}
            </HorisontalFamilieRadioGruppe>
            {aktsomhetsvurdering?.aktsomhet &&
                (aktsomhetsvurdering.aktsomhet === Aktsomhet.FORSETT ? (
                    <GradForsettSkjema
                        erLesevisning={erLesevisning}
                        erValgtResultatTypeForstoBurdeForstaatt={erForstodBurdeForstått}
                    />
                ) : (
                    <GradUaktsomhetSkjema
                        uaktsomhetGrad={aktsomhetsvurdering.aktsomhet}
                        erValgtResultatTypeForstoBurdeForstaatt={erForstodBurdeForstått}
                        erLesevisning={erLesevisning}
                        erTotalbeløpUnder4Rettsgebyr={erTotalbeløpUnder4Rettsgebyr}
                    />
                ))}
        </>
    );
};

export default Aktsomhetsvurdering;
