import type { VilkårsvurderingSkjemaDefinisjon } from '../VilkårsvurderingPeriodeSkjemaContext';

import { Radio, RadioGroup, VStack } from '@navikt/ds-react';
import * as React from 'react';

import GradForsettSkjema from './GradForsettSkjema';
import GradUaktsomhetSkjema from './GradUaktsomhetSkjema';
import { useBehandlingState } from '../../../../../context/BehandlingStateContext';
import { type Skjema, Valideringsstatus } from '../../../../../hooks/skjema';
import {
    Aktsomhet,
    aktsomheter,
    aktsomhetTyper,
    forstodBurdeForståttAktsomheter,
    Vilkårsresultat,
} from '../../../../../kodeverk';
import { OptionNEI } from '../VilkårsvurderingPeriodeSkjemaContext';

type Props = {
    skjema: Skjema<VilkårsvurderingSkjemaDefinisjon, string>;
    erLesevisning: boolean;
};

const AktsomhetsvurderingSkjema: React.FC<Props> = ({ skjema, erLesevisning }) => {
    const { settIkkePersistertKomponent } = useBehandlingState();
    const erForstodBurdeForstått =
        skjema.felter.vilkårsresultatvurdering.verdi === Vilkårsresultat.ForstoBurdeForstått;

    const ugyldigAktsomhetvurderingValgt =
        skjema.visFeilmeldinger &&
        skjema.felter.aktsomhetVurdering.valideringsstatus === Valideringsstatus.Feil;

    return (
        <VStack gap="1">
            <RadioGroup
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
                        val === Aktsomhet.Forsett &&
                        skjema.felter.forstoIlleggeRenter.verdi === '' &&
                        skjema.felter.vilkårsresultatvurdering.verdi ===
                            Vilkårsresultat.ForstoBurdeForstått;
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
            </RadioGroup>
            {skjema.felter.aktsomhetVurdering.verdi !== '' &&
                (skjema.felter.aktsomhetVurdering.verdi === Aktsomhet.Forsett ? (
                    <GradForsettSkjema skjema={skjema} erLesevisning={erLesevisning} />
                ) : (
                    <GradUaktsomhetSkjema skjema={skjema} erLesevisning={erLesevisning} />
                ))}
        </VStack>
    );
};

export default AktsomhetsvurderingSkjema;
