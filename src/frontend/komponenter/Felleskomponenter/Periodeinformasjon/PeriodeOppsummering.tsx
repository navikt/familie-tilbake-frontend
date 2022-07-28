import * as React from 'react';

import classNames from 'classnames';
import styled from 'styled-components';

import { Column, Row } from 'nav-frontend-grid';

import { BodyShort, Label } from '@navikt/ds-react';

import { HendelseType, hendelsetyper } from '../../../kodeverk';
import { formatterDatostring, hentPeriodelengde, formatCurrencyNoKr } from '../../../utils';

const StyledContainer = styled.div`
    background-color: var(--navds-global-color-orange-100);
    height: auto;
    padding: 10px 20px 10px;
    top: 0;
    margin-top: 10px;
`;

const SumRad = styled(Row)`
    margin-top: 20px;

    .positivNumber {
        font-weight: var(--navds-font-weight-bold);
        margin-left: 8px;
    }

    .redNumber {
        color: var(--navds-semantic-color-feedback-danger-text);
        font-weight: var(--navds-font-weight-bold);
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
                        <span className={classNames(beløp ? 'redNumber' : 'positivNumber')}>
                            {formatCurrencyNoKr(beløp)}
                        </span>
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
