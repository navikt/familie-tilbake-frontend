import * as React from 'react';

import { styled } from 'styled-components';

import { Column, Row } from 'nav-frontend-grid';

import { BodyShort, Label } from '@navikt/ds-react';
import { type ISkjema } from '@navikt/familie-skjema';

import { Vilkårsresultat } from '../../../../../kodeverk';
import ArrowBox from '../../../../Felleskomponenter/ArrowBox/ArrowBox';
import { useFeilutbetalingVilkårsvurdering } from '../../FeilutbetalingVilkårsvurderingContext';
import { VilkårsvurderingSkjemaDefinisjon } from '../VilkårsvurderingPeriodeSkjemaContext';
import TilleggesRenterRadioGroup from './TilleggesRenterRadioGroup';

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
                <>
                    <Row>
                        <Column md="6">
                            <Label>Andel som skal tilbakekreves</Label>
                            {kanIlleggeRenter ? (
                                <StyledNormaltekst>100 %</StyledNormaltekst>
                            ) : (
                                <BodyShort>100 %</BodyShort>
                            )}
                        </Column>
                        <Column md="6">
                            <TilleggesRenterRadioGroup
                                erLesevisning={erLesevisning}
                                kanIlleggeRenter={kanIlleggeRenter}
                                felt={skjema.felter.forstoIlleggeRenter}
                                visFeilmeldingerForSkjema={skjema.visFeilmeldinger}
                            />
                        </Column>
                    </Row>
                </>
            ) : (
                <Row>
                    <Column md={kanIlleggeRenter ? '12' : '6'}>
                        <Label>Andel som skal tilbakekreves</Label>
                        <BodyShort>100 %</BodyShort>
                        {kanIlleggeRenter && (
                            <>
                                <BodyShort size="small">Det legges til 10 % renter</BodyShort>
                            </>
                        )}
                    </Column>
                    {!kanIlleggeRenter && (
                        <Column md="6">
                            <Label>Skal det tillegges renter?</Label>
                            <BodyShort>Nei</BodyShort>
                        </Column>
                    )}
                </Row>
            )}
        </ArrowBox>
    );
};

export default GradForsettSkjema;
