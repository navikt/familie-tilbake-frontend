import { Select } from '@navikt/ds-react';
import * as React from 'react';

import TilleggesRenterRadioGroup from './TilleggesRenterRadioGroup';
import { type Skjema } from '../../../../../hooks/skjema';
import { Vilkårsresultat } from '../../../../../kodeverk';
import { useVilkårsvurdering } from '../../VilkårsvurderingContext';
import { type VilkårsvurderingSkjemaDefinisjon } from '../VilkårsvurderingPeriodeSkjemaContext';

type Props = {
    skjema: Skjema<VilkårsvurderingSkjemaDefinisjon, string>;
    erLesevisning: boolean;
};

const GradForsettSkjema: React.FC<Props> = ({ skjema, erLesevisning }) => {
    const { kanIlleggeRenter } = useVilkårsvurdering();

    const erValgtResultatTypeForstoBurdeForstått =
        skjema.felter.vilkårsresultatvurdering.verdi === Vilkårsresultat.ForstoBurdeForstått;

    return (
        <>
            <Select
                label="Andel som skal tilbakekreves"
                size="small"
                readOnly
                className="w-55"
                aria-live="polite"
            >
                <option>100%</option>
            </Select>
            <TilleggesRenterRadioGroup
                kanIlleggeRenter={kanIlleggeRenter}
                felt={skjema.felter.forstoIlleggeRenter}
                visFeilmeldingerForSkjema={skjema.visFeilmeldinger}
                readOnly={
                    erLesevisning || !kanIlleggeRenter || !erValgtResultatTypeForstoBurdeForstått
                }
                feilaktigForsett={!erValgtResultatTypeForstoBurdeForstått}
            />
        </>
    );
};

export default GradForsettSkjema;
