import type { VilkårsvurderingSkjemaDefinisjon } from '../VilkårsvurderingPeriodeSkjemaContext';

import { BodyShort, HGrid, Label } from '@navikt/ds-react';
import * as React from 'react';
import { styled } from 'styled-components';

import TilleggesRenterRadioGroup from './TilleggesRenterRadioGroup';
import { type Skjema } from '../../../../../hooks/skjema';
import { Vilkårsresultat } from '../../../../../kodeverk';
import ArrowBox from '../../../../Felleskomponenter/ArrowBox/ArrowBox';
import { useVilkårsvurdering } from '../../VilkårsvurderingContext';

const StyledNormaltekst = styled(BodyShort)`
    padding-top: 15px;
`;

type Props = {
    skjema: Skjema<VilkårsvurderingSkjemaDefinisjon, string>;
    erLesevisning: boolean;
};

const GradForsettSkjema: React.FC<Props> = ({ skjema, erLesevisning }) => {
    const { kanIlleggeRenter } = useVilkårsvurdering();

    const erValgtResultatTypeForstoBurdeForstått =
        skjema.felter.vilkårsresultatvurdering.verdi === Vilkårsresultat.ForstoBurdeForstått;

    const forstoBurdeForståttOffset = erValgtResultatTypeForstoBurdeForstått ? 340 : 385;

    return (
        <ArrowBox alignOffset={erLesevisning ? 5 : forstoBurdeForståttOffset}>
            {erValgtResultatTypeForstoBurdeForstått ? (
                <HGrid columns={2} gap="4">
                    <div>
                        <Label>Andel som skal tilbakekreves</Label>
                        {kanIlleggeRenter ? (
                            <StyledNormaltekst>100 %</StyledNormaltekst>
                        ) : (
                            <BodyShort>100 %</BodyShort>
                        )}
                    </div>
                    <TilleggesRenterRadioGroup
                        erLesevisning={erLesevisning}
                        kanIlleggeRenter={kanIlleggeRenter}
                        felt={skjema.felter.forstoIlleggeRenter}
                        visFeilmeldingerForSkjema={skjema.visFeilmeldinger}
                    />
                </HGrid>
            ) : (
                <HGrid columns={2} gap="4">
                    <div>
                        <Label>Andel som skal tilbakekreves</Label>
                        <BodyShort>100 %</BodyShort>
                        {kanIlleggeRenter && (
                            <BodyShort size="small">Det legges til 10 % renter</BodyShort>
                        )}
                    </div>
                    {!kanIlleggeRenter && (
                        <div>
                            <Label>Skal det tillegges renter?</Label>
                            <BodyShort>Nei</BodyShort>
                        </div>
                    )}
                </HGrid>
            )}
        </ArrowBox>
    );
};

export default GradForsettSkjema;
