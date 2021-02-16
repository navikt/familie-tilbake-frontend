import * as React from 'react';

import classNames from 'classnames';
import styled from 'styled-components';

import navFarger from 'nav-frontend-core';
import { Column, Row } from 'nav-frontend-grid';
import { Normaltekst } from 'nav-frontend-typografi';

import { ForeldelsePeriode } from '../../../../typer/feilutbetalingtyper';
import { formatterDatostring, hentPeriodelengde } from '../../../../utils/dateUtils';

const StyledContainer = styled.div`
    background-color: ${navFarger.orangeFocusLighten80};
    height: auto;
    max-width: 500px;
    padding: 10px 20px 10px;
    top: 0;
    margin-top: 10px;
`;

const SumRad = styled(Row)`
    margin-top: 20px;

    .positivNumber {
        font-weight: bold;
        margin-left: 8px;
    }

    .redNumber {
        color: ${navFarger.navRod};
        font-weight: bold;
        margin-left: 8px;
    }
`;

const NormaltekstBold = styled(Normaltekst)`
    font-weight: bold;
`;

interface IProps {
    periode: ForeldelsePeriode;
}

const PeriodeOppsummering: React.FC<IProps> = ({ periode }) => {
    return (
        <StyledContainer>
            <Row>
                <Column xs="6">
                    <NormaltekstBold>
                        {`${formatterDatostring(periode.fom)} - ${formatterDatostring(
                            periode.tom
                        )}`}
                    </NormaltekstBold>
                </Column>
                <Column xs="6">
                    <Normaltekst>{hentPeriodelengde(periode.fom, periode.tom)}</Normaltekst>
                </Column>
            </Row>
            <SumRad>
                <Column xs="6">
                    <Normaltekst>
                        Feilutbetaling :
                        <span className={classNames(periode.belop ? 'redNumber' : 'positivNumber')}>
                            {periode.belop}
                        </span>
                    </Normaltekst>
                </Column>
            </SumRad>
        </StyledContainer>
    );
};

export default PeriodeOppsummering;
