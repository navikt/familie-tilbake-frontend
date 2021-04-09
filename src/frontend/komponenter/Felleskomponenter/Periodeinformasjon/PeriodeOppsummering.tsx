import * as React from 'react';

import classNames from 'classnames';
import styled from 'styled-components';

import navFarger from 'nav-frontend-core';
import { Column, Row } from 'nav-frontend-grid';
import { Normaltekst } from 'nav-frontend-typografi';

import { HendelseType, hendelsetyper } from '../../../kodeverk';
import {
    formatterDatostring,
    hentPeriodelengde,
    formatCurrencyNoKr,
    NormaltekstBold,
} from '../../../utils';

const StyledContainer = styled.div`
    background-color: ${navFarger.orangeFocusLighten80};
    height: auto;
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

interface IProps {
    fom: string;
    tom: string;
    beløp: number;
    hendelsetype?: HendelseType;
}

const PeriodeOppsummering: React.FC<IProps> = ({ fom, tom, beløp, hendelsetype }) => {
    return (
        <StyledContainer>
            <Row>
                <Column xs="6">
                    <NormaltekstBold>
                        {`${formatterDatostring(fom)} - ${formatterDatostring(tom)}`}
                    </NormaltekstBold>
                </Column>
                <Column xs="6">
                    <Normaltekst>{hentPeriodelengde(fom, tom)}</Normaltekst>
                </Column>
            </Row>
            <SumRad>
                <Column xs="6">
                    <Normaltekst>
                        Feilutbetaling :
                        <span className={classNames(beløp ? 'redNumber' : 'positivNumber')}>
                            {formatCurrencyNoKr(beløp)}
                        </span>
                    </Normaltekst>
                </Column>
                <Column xs="6">
                    {hendelsetype && <Normaltekst>{hendelsetyper[hendelsetype]}</Normaltekst>}
                </Column>
            </SumRad>
        </StyledContainer>
    );
};

export default PeriodeOppsummering;
