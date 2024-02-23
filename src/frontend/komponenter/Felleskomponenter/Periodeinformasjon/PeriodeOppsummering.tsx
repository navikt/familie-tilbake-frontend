import * as React from 'react';

import classNames from 'classnames';
import { styled } from 'styled-components';

import { BodyShort, HGrid, Label, VStack } from '@navikt/ds-react';
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

const StyledVStack = styled(VStack)`
    background-color: ${AOrange100};
    padding: ${ASpacing3} ${ASpacing5};
    margin-top: ${ASpacing3};
    max-width: 30rem;
    width: 100%;
`;

const RadTotaltFeilutbetalt = styled(HGrid)`
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
        <StyledVStack gap="5">
            <HGrid columns={{ md: 1, lg: '5fr 3fr' }} gap="4">
                <Label size="small">{`${formatterDatostring(fom)} - ${formatterDatostring(
                    tom
                )}`}</Label>
                <BodyShort size="small">{hentPeriodelengde(fom, tom)}</BodyShort>
            </HGrid>
            <RadTotaltFeilutbetalt columns={{ md: 1, lg: '5fr 3fr' }} gap="4">
                <BodyShort size="small">
                    Feilutbetaling:
                    <span className={classNames('redNumber')}>{formatCurrencyNoKr(beløp)}</span>
                </BodyShort>
                {hendelsetype && <BodyShort size="small">{hendelsetyper[hendelsetype]}</BodyShort>}
            </RadTotaltFeilutbetalt>
        </StyledVStack>
    );
};

export default PeriodeOppsummering;
