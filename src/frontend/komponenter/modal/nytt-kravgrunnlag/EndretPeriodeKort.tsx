import type { FC } from 'react';
import type { EndretPeriode } from '@/generated-new';

import { ArrowRightIcon } from '@navikt/aksel-icons';
import { BodyShort, Box, Heading, HGrid, HStack, Tag, VStack } from '@navikt/ds-react';

import { formatCurrencyNoKr, formatterDatostring, hentPeriodelengde } from '@/utils';

import { hentVarighetsendring } from './utils';

type Props = {
    periode: EndretPeriode;
};

export const EndretPeriodeKort: FC<Props> = ({ periode }: Props) => {
    const gammelPeriodelengde = hentPeriodelengde(
        periode.gammelPeriode.fom,
        periode.gammelPeriode.tom
    );
    const nyPeriodelengde = hentPeriodelengde(periode.fom, periode.tom);
    const varighetsendring = hentVarighetsendring(periode);
    const beløpsendring = periode.nyttBeløp - periode.gammeltBeløp;

    return (
        <Box
            as="section"
            aria-label="Endringer"
            borderColor="info"
            borderWidth="1"
            borderRadius="12"
            overflow="hidden"
        >
            <Box
                background="info-moderate"
                borderColor="info"
                borderWidth="0 0 1 0"
                paddingInline="space-16"
                paddingBlock="space-6"
            >
                <Heading level="2" size="xsmall" className="text-ax-text-info">
                    Endringer
                </Heading>
            </Box>
            <HGrid
                columns="1fr auto 1fr"
                gap="space-16"
                align="center"
                paddingInline="space-16"
                paddingBlock="space-8 space-12"
                className="bg-ax-bg-default"
            >
                <VStack gap="space-8" className="min-w-0">
                    <BodyShort weight="semibold">Før</BodyShort>
                    <BodyShort>
                        {formatterDatostring(periode.gammelPeriode.fom)}–
                        {formatterDatostring(periode.gammelPeriode.tom)}
                    </BodyShort>
                    {gammelPeriodelengde && <BodyShort>{gammelPeriodelengde}</BodyShort>}
                    <BodyShort className="text-ax-text-brand-magenta">
                        {formatCurrencyNoKr(periode.gammeltBeløp)} kr
                    </BodyShort>
                </VStack>
                <ArrowRightIcon aria-hidden fontSize="1.5rem" />
                <VStack gap="space-8" className="min-w-0">
                    <BodyShort weight="semibold">Etter endring</BodyShort>
                    <BodyShort>
                        {formatterDatostring(periode.fom)}–{formatterDatostring(periode.tom)}
                    </BodyShort>
                    {nyPeriodelengde && (
                        <HStack gap="space-8" align="center">
                            <BodyShort>{nyPeriodelengde}</BodyShort>
                            {varighetsendring && (
                                <Tag
                                    variant="moderate"
                                    data-color={
                                        varighetsendring.startsWith('–') ? 'danger' : 'success'
                                    }
                                    size="small"
                                >
                                    {varighetsendring}
                                </Tag>
                            )}
                        </HStack>
                    )}
                    <HStack gap="space-8" align="center">
                        <BodyShort className="text-ax-text-brand-magenta">
                            {formatCurrencyNoKr(periode.nyttBeløp)} kr
                        </BodyShort>
                        {beløpsendring !== 0 && (
                            <Tag
                                variant="moderate"
                                data-color={beløpsendring < 0 ? 'danger' : 'success'}
                                size="small"
                            >
                                {beløpsendring > 0 ? '+' : '–'}
                                {formatCurrencyNoKr(Math.abs(beløpsendring))} kr
                            </Tag>
                        )}
                    </HStack>
                </VStack>
            </HGrid>
        </Box>
    );
};
