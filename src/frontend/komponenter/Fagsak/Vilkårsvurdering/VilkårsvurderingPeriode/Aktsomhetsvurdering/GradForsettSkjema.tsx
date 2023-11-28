import * as React from 'react';

import { styled } from 'styled-components';

import { Column, Row } from 'nav-frontend-grid';

import { BodyShort, Label, Radio } from '@navikt/ds-react';
import { type ISkjema, Valideringsstatus } from '@navikt/familie-skjema';

import { Vilkårsresultat } from '../../../../../kodeverk';
import ArrowBox from '../../../../Felleskomponenter/ArrowBox/ArrowBox';
import { HorisontalFamilieRadioGruppe } from '../../../../Felleskomponenter/Skjemaelementer';
import { useFeilutbetalingVilkårsvurdering } from '../../FeilutbetalingVilkårsvurderingContext';
import {
    JaNeiOption,
    jaNeiOptions,
    OptionJA,
    VilkårsvurderingSkjemaDefinisjon,
} from '../VilkårsvurderingPeriodeSkjemaContext';

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

    const ugyldigIlleggRenterValgt =
        skjema.visFeilmeldinger &&
        skjema.felter.forstoIlleggeRenter.valideringsstatus === Valideringsstatus.FEIL;

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
                            <HorisontalFamilieRadioGruppe
                                id="skalDetTilleggesRenter"
                                erLesevisning={erLesevisning || !kanIlleggeRenter}
                                legend={'Skal det tillegges renter?'}
                                value={
                                    !erLesevisning && kanIlleggeRenter
                                        ? skjema.felter.forstoIlleggeRenter.verdi
                                        : skjema.felter.forstoIlleggeRenter.verdi === OptionJA
                                        ? 'Ja'
                                        : 'Nei'
                                }
                                error={
                                    ugyldigIlleggRenterValgt
                                        ? skjema.felter.forstoIlleggeRenter.feilmelding?.toString()
                                        : ''
                                }
                                marginbottom="none"
                                onChange={(val: JaNeiOption) =>
                                    skjema.felter.forstoIlleggeRenter.validerOgSettFelt(val)
                                }
                            >
                                {jaNeiOptions.map(opt => (
                                    <Radio
                                        key={opt.label}
                                        name="skalDetTilleggesRenter"
                                        value={opt}
                                    >
                                        {opt.label}
                                    </Radio>
                                ))}
                            </HorisontalFamilieRadioGruppe>
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
