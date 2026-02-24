import { Heading, HStack, Skeleton, VStack } from '@navikt/ds-react';
import React from 'react';

const StegBoksSkeleton: React.FC = () => {
    return (
        <VStack
            className="border-ax-border-neutral-subtle border rounded-xl"
            paddingBlock="space-12"
            paddingInline="space-16"
            gap="space-16"
        >
            <div className="flex items-center justify-between gap-2">
                <Skeleton variant="rounded" width={95} height={28} />
                <div className="flex items-center gap-2">
                    <Skeleton variant="rounded" width={32} height={32} />
                    <Skeleton variant="rounded" width={32} height={32} />
                </div>
            </div>
        </VStack>
    );
};

export const TotrinnskontrollSkeleton: React.FC = () => {
    return (
        <>
            <HStack justify="space-between" align="center">
                <Heading size="small" level="2">
                    Fatter vedtak
                </Heading>
            </HStack>
            <VStack gap="space-12" className="flex-1 overflow-y-auto scrollbar-stable">
                <VStack gap="space-12" justify="space-between" className="flex-1">
                    <VStack gap="space-12">
                        <StegBoksSkeleton />
                        <StegBoksSkeleton />
                        <StegBoksSkeleton />
                        <StegBoksSkeleton />
                    </VStack>
                    <Skeleton variant="rounded" width="100%" height={28} />
                </VStack>
            </VStack>
        </>
    );
};
