import * as React from 'react';

import { Radio } from 'nav-frontend-skjema';

import { useVilkårsvurderingPeriode } from '../../../../../context/VilkårsvurderingPeriodeContext';
import {
    Aktsomhet,
    aktsomheter,
    aktsomhetTyper,
    forstodBurdeForståttAktsomheter,
    Vilkårsresultat,
} from '../../../../../kodeverk';
import { HorisontalFamilieRadioGruppe } from '../../../../Felleskomponenter/Skjemaelementer';
import GradForsettSkjema from './GradForsettSkjema';
import GradUaktsomhetSkjema from './GradUaktsomhetSkjema';

interface IProps {
    erTotalbeløpUnder4Rettsgebyr: boolean;
    erLesevisning: boolean;
}

const AktsomhetsvurderingSkjema: React.FC<IProps> = ({
    erTotalbeløpUnder4Rettsgebyr,
    erLesevisning,
}) => {
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
                verdi={
                    aktsomhetsvurdering?.aktsomhet
                        ? erForstodBurdeForstått
                            ? forstodBurdeForståttAktsomheter[aktsomhetsvurdering.aktsomhet]
                            : aktsomheter[aktsomhetsvurdering.aktsomhet]
                        : ''
                }
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
                        erValgtResultatTypeForstoBurdeForstaatt={erForstodBurdeForstått}
                        erLesevisning={erLesevisning}
                        erTotalbeløpUnder4Rettsgebyr={erTotalbeløpUnder4Rettsgebyr}
                    />
                ))}
        </>
    );
};

export default AktsomhetsvurderingSkjema;
