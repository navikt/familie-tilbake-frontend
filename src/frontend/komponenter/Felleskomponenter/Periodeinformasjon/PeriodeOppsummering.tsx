import * as React from 'react';

import { styled } from 'styled-components';

import { BodyShort, HGrid, HStack, Label, VStack } from '@navikt/ds-react';
import { AOrange100, ATextDanger, ASpacing3, ASpacing5 } from '@navikt/ds-tokens/dist/tokens';

import { HendelseType, hendelsetyper } from '../../../kodeverk';
import { formatterDatostring, hentPeriodelengde, formatCurrencyNoKr } from '../../../utils';

const StyledVStack = styled(VStack)`
    background-color: ${AOrange100};
    padding: ${ASpacing3} ${ASpacing5};
    margin-top: ${ASpacing3};
    max-width: 30rem;
    width: 100%;
`;

const BodyShortDanger = styled(BodyShort)`
    color: ${ATextDanger};
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
            <HGrid columns={{ md: 1, lg: '5fr 3fr' }} gap="4">
                <HStack gap="2">
                    <BodyShort size="small">Feilutbetaling:</BodyShort>
                    <BodyShortDanger weight="semibold" size="small">
                        {formatCurrencyNoKr(beløp)}
                    </BodyShortDanger>
                </HStack>
                {hendelsetype && <BodyShort size="small">{hendelsetyper[hendelsetype]}</BodyShort>}
            </HGrid>
        </StyledVStack>
    );
};

export default PeriodeOppsummering;
