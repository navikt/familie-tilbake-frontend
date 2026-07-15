import type { FC } from 'react';
import type { VilkårsvurderingSkjemaFelter } from './schema';

import { HStack, VStack } from '@navikt/ds-react';
import { useFormContext, useWatch } from 'react-hook-form';

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
} & (MedReduksjon | UtenReduksjon);

export const SimulertBeløp: FC<Props> = ({
    renter = false,
    reduksjonsprosent,
    reduksjon,
}: Props) => {
    const { control } = useFormContext<VilkårsvurderingSkjemaFelter>();
    const simulertBeløp = useWatch({ name: 'simulertBeløp', control: control });

    if (simulertBeløp === null && !renter && !reduksjon) {
        return null;
    }

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

            {simulertBeløp !== null && (
                <VStack gap="space-4" className="w-1/2">
                    <span className="text-ax-text-info-subtle">
                        Beløpet som skal kreves tilbake
                    </span>
                    <span className="text-xl">{formatCurrencyNoKr(simulertBeløp)} kroner</span>
                </VStack>
            )}
        </HStack>
    );
};
