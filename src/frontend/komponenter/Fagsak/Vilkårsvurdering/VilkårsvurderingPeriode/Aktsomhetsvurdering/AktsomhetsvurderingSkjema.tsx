import * as React from 'react';

import { Radio } from '@navikt/ds-react';
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
                legend={
                    erForstodBurdeForstått
                        ? 'I hvilken grad burde mottaker forstått at utbetalingen skyldtes en feil?'
                        : 'I hvilken grad har mottaker handlet uaktsomt?'
                }
                value={
                    !erLesevisning
                        ? skjema.felter.aktsomhetVurdering.verdi
                        : skjema.felter.aktsomhetVurdering.verdi
                        ? erForstodBurdeForstått
                            ? forstodBurdeForståttAktsomheter[
                                  skjema.felter.aktsomhetVurdering.verdi
                              ]
                            : aktsomheter[skjema.felter.aktsomhetVurdering.verdi]
                        : ''
                }
                error={
                    ugyldigAktsomhetvurderingValgt
                        ? skjema.felter.aktsomhetVurdering.feilmelding?.toString()
                        : ''
                }
                onChange={(val: Aktsomhet) =>
                    skjema.felter.aktsomhetVurdering.validerOgSettFelt(val)
                }
            >
                {aktsomhetTyper.map(type => (
                    <Radio name="handletUaktsomhetGrad" key={type} value={type}>
                        {erForstodBurdeForstått
                            ? forstodBurdeForståttAktsomheter[type]
                            : aktsomheter[type]}
                    </Radio>
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
