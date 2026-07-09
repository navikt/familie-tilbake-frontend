import type { FC } from 'react';

import { HStack, VStack } from '@navikt/ds-react';

import { formatCurrencyNoKr } from '@/utils/miscUtils';

type MedReduksjon = {
    reduksjon: true;
    reduksjonsprosent: number;
};

type UtenReduksjon = {
    reduksjon?: false;
    reduksjonsprosent?: never;
};

type Props = {
    renter?: boolean;
    beløp: number;
} & (MedReduksjon | UtenReduksjon);

export const SimulertBeløp: FC<Props> = ({
    renter = false,
    reduksjonsprosent,
    reduksjon,
    beløp,
}: Props) => {
    return (
        <HStack className="border border-ax-border-info-subtle rounded-xl bg-ax-bg-info-soft p-4 font-semibold">
            {(reduksjon || renter) && (
                <HStack gap="space-4" className="w-1/2 min-w-0 flex-nowrap">
                    {reduksjon && (
                        <VStack gap="space-4" className="flex-1 min-w-0">
                            <span className="text-ax-text-info-subtle">Reduksjon</span>
                            <span className="text-xl">{reduksjonsprosent} %</span>
                        </VStack>
                    )}

                    {renter && (
                        <VStack gap="space-4" className="flex-1 min-w-0">
                            <span className="text-ax-text-info-subtle">Renter</span>
                            <span className="text-xl">10 %</span>
                        </VStack>
                    )}
                </HStack>
            )}

            <VStack gap="space-4" className="w-1/2">
                <span className="text-ax-text-info-subtle">Beløpet som skal kreves tilbake</span>
                <span className="text-xl">{formatCurrencyNoKr(beløp)} kroner</span>
            </VStack>
        </HStack>
    );
};
