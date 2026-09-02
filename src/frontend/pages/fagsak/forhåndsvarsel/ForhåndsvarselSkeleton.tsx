import type { FC } from 'react';

import { BodyShort, Heading, HStack, Skeleton, VStack } from '@navikt/ds-react';

export const ForhåndsvarselSkeleton: FC = () => {
    return (
        <VStack gap="space-24">
            <HStack className="justify-between" align="center">
                <Heading size="medium">Forhåndsvarsel</Heading>
                <Skeleton variant="rounded" width="120px" height={32} />
            </HStack>
            <VStack gap="space-8" className="max-w-xl" aria-busy>
                <BodyShort size="small" className="font-ax-bold">
                    Skal det sendes forhåndsvarsel om tilbakekreving?
                </BodyShort>
                <BodyShort size="small" className="text-ax-text-neutral-subtle">
                    Brukeren skal som klar hovedregel varsles før vedtak om tilbakekreving fattes,
                    slik at de får mulighet til å uttale seg.
                </BodyShort>
                <Skeleton variant="rounded" width="60px" height={24} />
                <Skeleton variant="rounded" width="60px" height={24} />
            </VStack>
        </VStack>
    );
};
