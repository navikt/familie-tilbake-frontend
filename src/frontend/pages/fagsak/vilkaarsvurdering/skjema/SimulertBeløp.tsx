import type { FC } from 'react';

import { HStack, VStack } from '@navikt/ds-react';

import { formatCurrencyNoKr } from '@/utils/miscUtils';

type Props = {
    renter?: boolean;
    beløp: number;
};

export const SimulertBeløp: FC<Props> = ({ renter, beløp }: Props) => {
    return (
        <HStack
            justify="space-between"
            className="border border-ax-border-info-subtle rounded-xl bg-ax-bg-info-soft p-4 font-semibold max-w-xl"
        >
            {renter && (
                <VStack gap="space-4">
                    <span className="text-ax-text-neutral-subtle">Renter</span>
                    <span className="text-xl">10 %</span>
                </VStack>
            )}
            <VStack gap="space-4">
                <span className="text-ax-text-neutral-subtle">Beløp som skal tilbakekreves</span>
                <span className="text-xl">{formatCurrencyNoKr(beløp)} kroner</span>
            </VStack>
        </HStack>
    );
};
