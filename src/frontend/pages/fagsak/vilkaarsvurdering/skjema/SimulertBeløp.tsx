import type { FC } from 'react';

import { VStack } from '@navikt/ds-react';

type Props = {
    beløp: number;
};

export const SimulertBeløp: FC<Props> = ({ beløp }: Props) => {
    return (
        <VStack
            gap="space-4"
            className="border border-ax-border-info-subtle rounded-xl bg-ax-bg-info-soft p-4"
        >
            <span className="font-semibold text-ax-text-neutral-subtle">
                Beløp som skal tilbakekreves
            </span>
            <span className="font-semibold text-xl">{beløp} kroner</span>
        </VStack>
    );
};
