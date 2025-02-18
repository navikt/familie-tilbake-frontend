import * as React from 'react';

import { Radio, VStack } from '@navikt/ds-react';
import { type ISkjema, Valideringsstatus } from '../../../../../hooks/skjema';

import GradForsettSkjema from './GradForsettSkjema';
import GradUaktsomhetSkjema from './GradUaktsomhetSkjema';
import { useBehandling } from '../../../../../context/BehandlingContext';
import {
    Aktsomhet,
    aktsomheter,
    aktsomhetTyper,
    forstodBurdeForståttAktsomheter,
    Vilkårsresultat,
} from '../../../../../kodeverk';
import { HorisontalRadioGroup } from '../../../../Felleskomponenter/Skjemaelementer';
import {
    OptionNEI,
    VilkårsvurderingSkjemaDefinisjon,
} from '../VilkårsvurderingPeriodeSkjemaContext';

interface IProps {
    skjema: ISkjema<VilkårsvurderingSkjemaDefinisjon, string>;
    erLesevisning: boolean;
}

const AktsomhetsvurderingSkjema: React.FC<IProps> = ({ skjema, erLesevisning }) => {
    const { settIkkePersistertKomponent } = useBehandling();
    const erForstodBurdeForstått =
        skjema.felter.vilkårsresultatvurdering.verdi === Vilkårsresultat.FORSTO_BURDE_FORSTÅTT;

    const ugyldigAktsomhetvurderingValgt =
        skjema.visFeilmeldinger &&
        skjema.felter.aktsomhetVurdering.valideringsstatus === Valideringsstatus.FEIL;

    return (
        <VStack gap="1">
            <HorisontalRadioGroup
                id="handletUaktsomhetGrad"
                readOnly={erLesevisning}
                legend={
                    erForstodBurdeForstått
                        ? 'I hvilken grad burde mottaker forstått at utbetalingen skyldtes en feil?'
                        : 'I hvilken grad har mottaker handlet uaktsomt?'
                }
                value={skjema.felter.aktsomhetVurdering.verdi}
                error={
                    ugyldigAktsomhetvurderingValgt
                        ? skjema.felter.aktsomhetVurdering.feilmelding?.toString()
                        : ''
                }
                onChange={(val: Aktsomhet) => {
                    const skalPreutfylleUtenRenter =
                        val === Aktsomhet.FORSETT &&
                        skjema.felter.forstoIlleggeRenter.verdi === '' &&
                        skjema.felter.vilkårsresultatvurdering.verdi ===
                            Vilkårsresultat.FORSTO_BURDE_FORSTÅTT;
                    if (skalPreutfylleUtenRenter) {
                        skjema.felter.forstoIlleggeRenter.validerOgSettFelt(OptionNEI);
                    }
                    settIkkePersistertKomponent(`vilkårsvurdering`);
                    return skjema.felter.aktsomhetVurdering.validerOgSettFelt(val);
                }}
            >
                {aktsomhetTyper.map(type => (
                    <Radio name="handletUaktsomhetGrad" key={type} value={type}>
                        {erForstodBurdeForstått
                            ? forstodBurdeForståttAktsomheter[type]
                            : aktsomheter[type]}
                    </Radio>
                ))}
            </HorisontalRadioGroup>
            {skjema.felter.aktsomhetVurdering.verdi !== '' &&
                (skjema.felter.aktsomhetVurdering.verdi === Aktsomhet.FORSETT ? (
                    <GradForsettSkjema skjema={skjema} erLesevisning={erLesevisning} />
                ) : (
                    <GradUaktsomhetSkjema skjema={skjema} erLesevisning={erLesevisning} />
                ))}
        </VStack>
    );
};

export default AktsomhetsvurderingSkjema;
