import type { FC } from 'react';

import { Heading, Skeleton, VStack } from '@navikt/ds-react';

export const DokumentlistingSkeleton: FC = () => {
    return (
        <VStack gap="space-16">
            <Heading level="2" size="small">
                Dokumenter
            </Heading>
            <VStack gap="space-8" aria-busy>
                <span className="sr-only">Henter dokumenter</span>
                <Skeleton variant="rounded" height={64} />
                <Skeleton variant="rounded" height={64} />
            </VStack>
        </VStack>
    );
};
