import * as React from 'react';

import styled from 'styled-components';

import { Column, Row } from 'nav-frontend-grid';
import { Radio } from 'nav-frontend-skjema';
import { Normaltekst, UndertekstBold } from 'nav-frontend-typografi';

import ArrowBox from '../../../../Felleskomponenter/ArrowBox/ArrowBox';
import { Spacer8 } from '../../../../Felleskomponenter/Flytelementer';
import { HorisontalFamilieRadioGruppe } from '../../../../Felleskomponenter/Skjemaelementer';
import { useVilkårsvurderingPeriode } from '../../../../../context/VilkårsvurderingPeriodeContext';

const StyledNormaltekst = styled(Normaltekst)`
    padding-top: 15px;
`;

interface IProps {
    erValgtResultatTypeForstoBurdeForstaatt: boolean;
    erLesevisning: boolean;
}

const GradForsettSkjema: React.FC<IProps> = ({
    erValgtResultatTypeForstoBurdeForstaatt,
    erLesevisning,
}) => {
    const { aktsomhetsvurdering, oppdaterAktsomhetsvurdering } = useVilkårsvurderingPeriode();

    const onChangeRenter = (verdi: boolean) => {
        oppdaterAktsomhetsvurdering({ ileggRenter: verdi });
    };

    return (
        <ArrowBox alignOffset={erValgtResultatTypeForstoBurdeForstaatt ? 305 : 350}>
            {erValgtResultatTypeForstoBurdeForstaatt ? (
                <>
                    <Row>
                        <Column md="6">
                            <UndertekstBold>Andel som skal tilbakekreves</UndertekstBold>
                            <StyledNormaltekst>100 %</StyledNormaltekst>
                        </Column>
                        <Column md="6">
                            <HorisontalFamilieRadioGruppe
                                id="skalDetTilleggesRenter"
                                erLesevisning={erLesevisning}
                                legend={'Skal det tillegges renter?'}
                                verdi={aktsomhetsvurdering?.ileggRenter ? 'Ja' : 'Nei'}
                            >
                                <Radio
                                    name="skalDetTilleggesRenter"
                                    label={'Ja'}
                                    checked={aktsomhetsvurdering?.ileggRenter === true}
                                    onChange={() => onChangeRenter(true)}
                                />
                                <Radio
                                    name="skalDetTilleggesRenter"
                                    label={'Nei'}
                                    checked={aktsomhetsvurdering?.ileggRenter === false}
                                    value="false"
                                    onChange={() => onChangeRenter(false)}
                                />
                            </HorisontalFamilieRadioGruppe>
                        </Column>
                    </Row>
                </>
            ) : (
                <>
                    <UndertekstBold>Andel som skal tilbakekreves</UndertekstBold>
                    <Normaltekst>100 %</Normaltekst>
                    <Spacer8 />
                    <Normaltekst>Det legges til 10 % renter</Normaltekst>
                </>
            )}
        </ArrowBox>
    );
};

export default GradForsettSkjema;
