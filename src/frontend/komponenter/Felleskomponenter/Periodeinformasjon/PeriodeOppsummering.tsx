import * as React from 'react';

import classNames from 'classnames';
import { styled } from 'styled-components';

import { BodyShort, HGrid, Label } from '@navikt/ds-react';
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

const RadTotaltFeilutbetalt = styled(HGrid)`
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
            <HGrid columns={2} gap="4">
                <Label size="small">{`${formatterDatostring(fom)} - ${formatterDatostring(
                    tom
                )}`}</Label>
                <BodyShort size="small">{hentPeriodelengde(fom, tom)}</BodyShort>
            </HGrid>
            <RadTotaltFeilutbetalt columns={2} gap="4">
                <BodyShort size="small">
                    Feilutbetaling:
                    <span className={classNames('redNumber')}>{formatCurrencyNoKr(beløp)}</span>
                </BodyShort>
                {hendelsetype && <BodyShort size="small">{hendelsetyper[hendelsetype]}</BodyShort>}
            </RadTotaltFeilutbetalt>
        </StyledContainer>
    );
};

export default PeriodeOppsummering;
