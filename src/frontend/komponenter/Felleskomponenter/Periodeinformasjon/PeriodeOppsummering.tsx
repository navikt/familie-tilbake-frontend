import * as React from 'react';

import classNames from 'classnames';
import styled from 'styled-components';

import { Column, Row } from 'nav-frontend-grid';

import { BodyShort, Label } from '@navikt/ds-react';
import {
    NavdsFontWeightBold,
    NavdsGlobalColorOrange100,
    NavdsSemanticColorFeedbackDangerText,
    NavdsSpacing2,
    NavdsSpacing3,
    NavdsSpacing5,
} from '@navikt/ds-tokens/dist/tokens';

import { HendelseType, hendelsetyper } from '../../../kodeverk';
import { formatterDatostring, hentPeriodelengde, formatCurrencyNoKr } from '../../../utils';

const StyledContainer = styled.div`
    background-color: ${NavdsGlobalColorOrange100};
    height: auto;
    padding: ${NavdsSpacing3} ${NavdsSpacing5};
    top: 0;
    margin-top: ${NavdsSpacing3};
`;

const SumRad = styled(Row)`
    margin-top: ${NavdsSpacing5};

    .redNumber {
        color: ${NavdsSemanticColorFeedbackDangerText};
        font-weight: ${NavdsFontWeightBold};
        margin-left: ${NavdsSpacing2};
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
                <Column xs="7">
                    <Label size="small">{`${formatterDatostring(fom)} - ${formatterDatostring(
                        tom
                    )}`}</Label>
                </Column>
                <Column xs="5">
                    <BodyShort size="small">{hentPeriodelengde(fom, tom)}</BodyShort>
                </Column>
            </Row>
            <SumRad>
                <Column xs="7">
                    <BodyShort size="small">
                        Feilutbetaling:
                        <span className={classNames('redNumber')}>{formatCurrencyNoKr(beløp)}</span>
                    </BodyShort>
                </Column>
                <Column xs="5">
                    {hendelsetype && (
                        <BodyShort size="small">{hendelsetyper[hendelsetype]}</BodyShort>
                    )}
                </Column>
            </SumRad>
        </StyledContainer>
    );
};

export default PeriodeOppsummering;
