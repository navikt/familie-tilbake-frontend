import * as React from 'react';

import { Radio } from 'nav-frontend-skjema';

import { type ISkjema, Valideringsstatus } from '@navikt/familie-skjema';

import {
    Aktsomhet,
    aktsomheter,
    aktsomhetTyper,
    forstodBurdeForståttAktsomheter,
    Vilkårsresultat,
} from '../../../../../kodeverk';
import { HorisontalFamilieRadioGruppe } from '../../../../Felleskomponenter/Skjemaelementer';
import { VilkårsvurderingSkjemaDefinisjon } from '../VilkårsvurderingPeriodeSkjemaContext';
import GradForsettSkjema from './GradForsettSkjema';
import GradUaktsomhetSkjema from './GradUaktsomhetSkjema';

interface IProps {
    skjema: ISkjema<VilkårsvurderingSkjemaDefinisjon, string>;
    erLesevisning: boolean;
}

const AktsomhetsvurderingSkjema: React.FC<IProps> = ({ skjema, erLesevisning }) => {
    const erForstodBurdeForstått =
        skjema.felter.vilkårsresultatvurdering.verdi === Vilkårsresultat.FORSTO_BURDE_FORSTÅTT;

    const ugyldigAktsomhetvurderingValgt =
        skjema.visFeilmeldinger &&
        skjema.felter.aktsomhetVurdering.valideringsstatus === Valideringsstatus.FEIL;

    return (
        <>
            <HorisontalFamilieRadioGruppe
                id="handletUaktsomhetGrad"
                erLesevisning={erLesevisning}
                legend={'I hvilken grad har mottaker handlet uaktsomt?'}
                verdi={
                    skjema.felter.aktsomhetVurdering.verdi
                        ? erForstodBurdeForstått
                            ? forstodBurdeForståttAktsomheter[
                                  skjema.felter.aktsomhetVurdering.verdi
                              ]
                            : aktsomheter[skjema.felter.aktsomhetVurdering.verdi]
                        : ''
                }
                feil={
                    ugyldigAktsomhetvurderingValgt
                        ? skjema.felter.aktsomhetVurdering.feilmelding?.toString()
                        : ''
                }
            >
                {aktsomhetTyper.map(type => (
                    <Radio
                        name="handletUaktsomhetGrad"
                        key={type}
                        value={type}
                        onChange={() => skjema.felter.aktsomhetVurdering.validerOgSettFelt(type)}
                        checked={skjema.felter.aktsomhetVurdering.verdi === type}
                        label={
                            erForstodBurdeForstått
                                ? forstodBurdeForståttAktsomheter[type]
                                : aktsomheter[type]
                        }
                    />
                ))}
            </HorisontalFamilieRadioGruppe>
            {skjema.felter.aktsomhetVurdering.verdi !== '' &&
                (skjema.felter.aktsomhetVurdering.verdi === Aktsomhet.FORSETT ? (
                    <GradForsettSkjema skjema={skjema} erLesevisning={erLesevisning} />
                ) : (
                    <GradUaktsomhetSkjema skjema={skjema} erLesevisning={erLesevisning} />
                ))}
        </>
    );
};

export default AktsomhetsvurderingSkjema;
