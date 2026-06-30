import type { FC } from 'react';

import { HStack, VStack } from '@navikt/ds-react';

import { formatCurrencyNoKr } from '@/utils/miscUtils';

type Props = {
    renter?: boolean;
    reduksjonsprosent?: number;
    beløp: number;
};

export const SimulertBeløp: FC<Props> = ({ renter = false, reduksjonsprosent, beløp }: Props) => {
    return (
        <HStack className="border border-ax-border-info-subtle rounded-xl bg-ax-bg-info-soft p-4 font-semibold max-w-xl">
            {(!!reduksjonsprosent || renter) && (
                <HStack gap="space-4" className="w-1/2 min-w-0 flex-nowrap">
                    {!!reduksjonsprosent && (
                        <VStack gap="space-4" className="flex-1 min-w-0">
                            <span className="text-ax-text-neutral-subtle">Reduksjon</span>
                            <span className="text-xl">{reduksjonsprosent} %</span>
                        </VStack>
                    )}

                    {renter && (
                        <VStack gap="space-4" className="flex-1 min-w-0">
                            <span className="text-ax-text-neutral-subtle">Renter</span>
                            <span className="text-xl">10 %</span>
                        </VStack>
                    )}
                </HStack>
            )}

            <VStack gap="space-4" className="w-1/2">
                <span className="text-ax-text-neutral-subtle">Beløp som skal tilbakekreves</span>
                <span className="text-xl">{formatCurrencyNoKr(beløp)} kroner</span>
            </VStack>
        </HStack>
    );
};
