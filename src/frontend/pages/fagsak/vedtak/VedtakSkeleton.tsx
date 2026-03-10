import type { FC } from 'react';

import { Heading, HStack, Skeleton, VStack } from '@navikt/ds-react';

import { ActionBarSkeleton } from '~/komponenter/action-bar/ActionBarSkeleton';

import { VedtakstabellSkeleton } from './VedtakstabellSkeleton';

export const VedtakSkeleton: FC = () => {
    return (
        <VStack gap="space-24">
            <HStack justify="space-between" align="center">
                <Heading size="medium">Vedtak</Heading>
                <Skeleton variant="rounded" width={160} height={24} />
            </HStack>

            <VedtakstabellSkeleton />

            <div className="grid grid-cols-1 ax-md:grid-cols-2 gap-4">
                <VStack className="col-span-1 overflow-auto flex-1 min-h-0 gap-6">
                    <HStack justify="space-between" align="center">
                        <Heading size="small">Lag vedtaksbrev</Heading>
                        <Skeleton variant="rounded" width="40%" height={20} />
                    </HStack>

                    <TextAreaSkeleton />

                    <TextAreaSkeleton />

                    <TextAreaSkeleton />

                    <TextAreaSkeleton />
                </VStack>
                <VStack className="col-span-1 overflow-auto flex-1 min-h-0 gap-4">
                    <Skeleton variant="rounded" width="100%" height={990} />
                </VStack>
            </div>
            <ActionBarSkeleton />
        </VStack>
    );
};

const TextAreaSkeleton: FC = () => {
    return (
        <VStack gap="space-4">
            <Skeleton variant="rounded" width="40%" height={20} />
            <Skeleton variant="rounded" width="100%" height={20} />
            <Skeleton variant="rounded" width="30%" height={20} />
            <Skeleton variant="rounded" width="100%" height={80} />
            <Skeleton variant="rounded" width="20%" height={20} />
        </VStack>
    );
};
