import type { FC } from 'react';

import { HStack, Skeleton } from '@navikt/ds-react';

export const ActionBarSkeleton: FC = () => {
    return (
        <div className="flex flex-row bg-ax-bg-default px-6 py-3 rounded-2xl border-ax-border-brand-blue-subtle border justify-end flex-nowrap min-w-80 gap-4">
            <HStack gap="space-16" className="flex-nowrap">
                <Skeleton width={100} height={40} variant="rounded" />
                <Skeleton width={100} height={40} variant="rounded" />
            </HStack>
        </div>
    );
};
