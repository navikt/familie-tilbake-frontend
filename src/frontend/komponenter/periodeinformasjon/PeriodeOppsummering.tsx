import type { HendelseType } from '../../kodeverk';

import { BodyShort, HGrid, HStack, Label, VStack } from '@navikt/ds-react';
import * as React from 'react';

import { hendelsetyper } from '../../kodeverk';
import { formatterDatostring, hentPeriodelengde, formatCurrencyNoKr } from '../../utils';

type Props = {
    fom: string;
    tom: string;
    beløp: number;
    hendelsetype?: HendelseType;
};

export const PeriodeOppsummering: React.FC<Props> = ({ fom, tom, beløp, hendelsetype }) => {
    return (
        <VStack
            gap="space-20"
            className="text-ax-text-info rounded-xl bg-ax-bg-info-moderate px-4 py-3"
        >
            <HGrid columns={{ md: 1, lg: '5fr 3fr' }} gap="space-16">
                <Label size="small">{`${formatterDatostring(fom)} - ${formatterDatostring(
                    tom
                )}`}</Label>
                <BodyShort size="small">{hentPeriodelengde(fom, tom)}</BodyShort>
            </HGrid>
            <HGrid columns={{ md: 1, lg: '5fr 3fr' }} gap="space-16">
                <HStack gap="space-8">
                    <BodyShort size="small">Feilutbetaling:</BodyShort>
                    <BodyShort className="text-ax-text-danger" weight="semibold" size="small">
                        {formatCurrencyNoKr(beløp)}
                    </BodyShort>
                </HStack>
                {hendelsetype && <BodyShort size="small">{hendelsetyper[hendelsetype]}</BodyShort>}
            </HGrid>
        </VStack>
    );
};
