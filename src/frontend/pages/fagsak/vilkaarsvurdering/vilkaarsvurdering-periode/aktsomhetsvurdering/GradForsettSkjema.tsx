import type { FC } from 'react';

import { Select } from '@navikt/ds-react';

import { type Skjema } from '~/hooks/skjema';
import { Vilkårsresultat } from '~/kodeverk';
import { type VilkårsvurderingSkjemaDefinisjon } from '~/pages/fagsak/vilkaarsvurdering/vilkaarsvurdering-periode/VilkårsvurderingPeriodeSkjemaContext';
import { useVilkårsvurdering } from '~/pages/fagsak/vilkaarsvurdering/VilkårsvurderingContext';

import { TilleggesRenterRadioGroup } from './TilleggesRenterRadioGroup';

type Props = {
    skjema: Skjema<VilkårsvurderingSkjemaDefinisjon, string>;
    erLesevisning: boolean;
};

export const GradForsettSkjema: FC<Props> = ({ skjema, erLesevisning }) => {
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
