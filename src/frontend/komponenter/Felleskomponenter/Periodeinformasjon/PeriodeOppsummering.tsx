import * as React from 'react';

import classNames from 'classnames';
import styled from 'styled-components';

import { Column, Row } from 'nav-frontend-grid';

import { BodyShort, Label } from '@navikt/ds-react';
import {
    AFontWeightBold,
    AOrange100,
    ATextDanger,
    ASpacing2,
    ASpacing3,
    ASpacing5,
} from '@navikt/ds-tokens/dist/tokens';

import { HendelseType, hendelsetyper } from '../../../kodeverk';
import { formatterDatostring, hentPeriodelengde, formatCurrencyNoKr } from '../../../utils';

const StyledContainer = styled.div`
    background-color: ${AOrange100};
    height: auto;
    padding: ${ASpacing3} ${ASpacing5};
    top: 0;
    margin-top: ${ASpacing3};
`;

const SumRad = styled(Row)`
    margin-top: ${ASpacing5};

    .redNumber {
        color: ${ATextDanger};
        font-weight: ${AFontWeightBold};
        margin-left: ${ASpacing2};
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
