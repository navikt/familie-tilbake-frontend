import * as React from 'react';

import styled from 'styled-components';

import { Column, Row } from 'nav-frontend-grid';
import { Radio } from 'nav-frontend-skjema';
import { Normaltekst, UndertekstBold } from 'nav-frontend-typografi';

import { ISkjema, Valideringsstatus } from '@navikt/familie-skjema';

import { Vilkårsresultat } from '../../../../../kodeverk';
import ArrowBox from '../../../../Felleskomponenter/ArrowBox/ArrowBox';
import { Spacer8 } from '../../../../Felleskomponenter/Flytelementer';
import { HorisontalFamilieRadioGruppe } from '../../../../Felleskomponenter/Skjemaelementer';
import { useFeilutbetalingVilkårsvurdering } from '../../FeilutbetalingVilkårsvurderingContext';
import {
    jaNeiOptions,
    OptionJA,
    VilkårsvurderingSkjemaDefinisjon,
} from '../VilkårsvurderingPeriodeSkjemaContext';

const StyledLabel = styled(UndertekstBold)`
    line-height: 1.375rem;
    font-size: 1rem;
`;

const StyledNormaltekst = styled(Normaltekst)`
    padding-top: 15px;
`;

interface IProps {
    skjema: ISkjema<VilkårsvurderingSkjemaDefinisjon, string>;
    erLesevisning: boolean;
}

const GradForsettSkjema: React.FC<IProps> = ({ skjema, erLesevisning }) => {
    const { kanIlleggeRenter } = useFeilutbetalingVilkårsvurdering();

    const erValgtResultatTypeForstoBurdeForstaatt =
        skjema.felter.vilkårsresultatvurdering.verdi === Vilkårsresultat.FORSTO_BURDE_FORSTÅTT;

    const ugyldigIlleggRenterValgt =
        skjema.visFeilmeldinger &&
        skjema.felter.forstoIlleggeRenter.valideringsstatus === Valideringsstatus.FEIL;

    return (
        <ArrowBox alignOffset={erValgtResultatTypeForstoBurdeForstaatt ? 305 : 350}>
            {erValgtResultatTypeForstoBurdeForstaatt ? (
                <>
                    <Row>
                        <Column md="6">
                            <StyledLabel>Andel som skal tilbakekreves</StyledLabel>
                            {kanIlleggeRenter ? (
                                <StyledNormaltekst>100 %</StyledNormaltekst>
                            ) : (
                                <Normaltekst>100 %</Normaltekst>
                            )}
                        </Column>
                        <Column md="6">
                            <HorisontalFamilieRadioGruppe
                                id="skalDetTilleggesRenter"
                                erLesevisning={erLesevisning || !kanIlleggeRenter}
                                legend={'Skal det tillegges renter?'}
                                verdi={
                                    skjema.felter.forstoIlleggeRenter.verdi === OptionJA
                                        ? 'Ja'
                                        : 'Nei'
                                }
                                feil={
                                    ugyldigIlleggRenterValgt
                                        ? skjema.felter.forstoIlleggeRenter.feilmelding?.toString()
                                        : ''
                                }
                            >
                                {jaNeiOptions.map(opt => (
                                    <Radio
                                        key={opt.label}
                                        name="skalDetTilleggesRenter"
                                        label={opt.label}
                                        checked={skjema.felter.forstoIlleggeRenter.verdi === opt}
                                        onChange={() =>
                                            skjema.felter.forstoIlleggeRenter.validerOgSettFelt(opt)
                                        }
                                    />
                                ))}
                            </HorisontalFamilieRadioGruppe>
                        </Column>
                    </Row>
                </>
            ) : (
                <Row>
                    <Column md={kanIlleggeRenter ? '12' : '6'}>
                        <StyledLabel>Andel som skal tilbakekreves</StyledLabel>
                        <Normaltekst>100 %</Normaltekst>
                        {kanIlleggeRenter && (
                            <>
                                <Spacer8 />
                                <Normaltekst>Det legges til 10 % renter</Normaltekst>
                            </>
                        )}
                    </Column>
                    {!kanIlleggeRenter && (
                        <Column md="6">
                            <StyledLabel>Skal det tillegges renter?</StyledLabel>
                            <Normaltekst>Nei</Normaltekst>
                        </Column>
                    )}
                </Row>
            )}
        </ArrowBox>
    );
};

export default GradForsettSkjema;
