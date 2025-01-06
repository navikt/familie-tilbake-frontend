import * as React from 'react';

import { styled } from 'styled-components';

import { BodyShort, HGrid, Label } from '@navikt/ds-react';
import { type ISkjema } from '@navikt/familie-skjema';

import TilleggesRenterRadioGroup from './TilleggesRenterRadioGroup';
import { Vilkårsresultat } from '../../../../../kodeverk';
import ArrowBox from '../../../../Felleskomponenter/ArrowBox/ArrowBox';
import { useFeilutbetalingVilkårsvurdering } from '../../FeilutbetalingVilkårsvurderingContext';
import { VilkårsvurderingSkjemaDefinisjon } from '../VilkårsvurderingPeriodeSkjemaContext';

const StyledNormaltekst = styled(BodyShort)`
    padding-top: 15px;
`;

interface IProps {
    skjema: ISkjema<VilkårsvurderingSkjemaDefinisjon, string>;
    erLesevisning: boolean;
}

const GradForsettSkjema: React.FC<IProps> = ({ skjema, erLesevisning }) => {
    const { kanIlleggeRenter } = useFeilutbetalingVilkårsvurdering();

    const erValgtResultatTypeForstoBurdeForstått =
        skjema.felter.vilkårsresultatvurdering.verdi === Vilkårsresultat.FORSTO_BURDE_FORSTÅTT;

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
