import type { FC } from 'react';
import type { PeriodeKortData } from './utils';

import { BodyShort, Box, Heading, HGrid, VStack } from '@navikt/ds-react';
import { Fragment } from 'react';

import { formatCurrencyNoKr, formatterDatostring, hentPeriodelengde } from '@/utils';

type Props = {
    perioder: PeriodeKortData[];
    type: 'lagtTil' | 'fjernet' | 'uendret';
};

const kortUtseende = {
    lagtTil: {
        farge: 'success',
        bakgrunn: 'success-moderate',
        tekstfarge: 'text-ax-text-success',
        tittel: 'Lagt til',
    },
    fjernet: {
        farge: 'warning',
        bakgrunn: 'warning-moderate',
        tekstfarge: 'text-ax-text-warning',
        tittel: 'Fjernet',
    },
    uendret: {
        farge: 'neutral-subtle',
        bakgrunn: 'neutral-moderate',
        tekstfarge: 'text-ax-text-neutral',
        tittel: 'Ingen endringer',
    },
} as const;

export const PeriodeKort: FC<Props> = ({ perioder, type }: Props) => {
    const { farge, bakgrunn, tekstfarge, tittel } = kortUtseende[type];

    return (
        <Box
            as="section"
            aria-label={tittel}
            borderColor={farge}
            borderWidth="1"
            borderRadius="12"
            overflow="hidden"
        >
            <Box
                background={bakgrunn}
                borderColor={farge}
                borderWidth="0 0 1 0"
                paddingInline="space-16"
                paddingBlock="space-6"
            >
                <Heading level="2" size="xsmall" className={tekstfarge}>
                    {tittel}
                </Heading>
            </Box>
            <VStack
                gap="space-8"
                paddingInline="space-16"
                paddingBlock="space-8 space-12"
                className="bg-ax-bg-default"
            >
                <HGrid columns="1fr 1fr" gap="space-32">
                    <BodyShort weight="semibold">Periode</BodyShort>
                    <BodyShort weight="semibold">Feilutbetalt</BodyShort>
                </HGrid>
                {perioder.map((periode, indeks) => {
                    const periodelengde = hentPeriodelengde(periode.fom, periode.tom);
                    return (
                        <Fragment key={`${periode.fom}-${periode.tom}`}>
                            {indeks > 0 && <hr className="border-ax-border-neutral-subtle" />}
                            <HGrid columns="1fr 1fr" gap="space-32">
                                <VStack gap="space-8">
                                    <BodyShort>
                                        {formatterDatostring(periode.fom)}–
                                        {formatterDatostring(periode.tom)}
                                    </BodyShort>
                                    {periodelengde && (
                                        <BodyShort size="small">{periodelengde}</BodyShort>
                                    )}
                                </VStack>
                                <BodyShort className="text-ax-text-brand-magenta">
                                    {formatCurrencyNoKr(periode.beløp)}
                                </BodyShort>
                            </HGrid>
                        </Fragment>
                    );
                })}
            </VStack>
        </Box>
    );
};
