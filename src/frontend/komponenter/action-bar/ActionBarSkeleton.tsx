import type { FC } from 'react';

import { MenuElipsisHorizontalIcon } from '@navikt/aksel-icons';
import { Button, HStack, Skeleton } from '@navikt/ds-react';

export const ActionBarSkeleton: FC = () => {
    return (
        <div className="flex flex-row bg-ax-bg-default px-6 py-3 rounded-2xl border-ax-border-neutral-subtle border justify-between flex-nowrap min-w-80">
            <Button
                variant="tertiary"
                size="small"
                icon={<MenuElipsisHorizontalIcon fontSize="1.5rem" aria-hidden />}
            >
                Meny
            </Button>

            <HStack gap="space-32" align="center">
                <Skeleton width={80} variant="rounded" />
                <HStack gap="space-16" className="flex-nowrap">
                    <Skeleton width={100} height={40} variant="rounded" />
                    <Skeleton width={100} height={40} variant="rounded" />
                </HStack>
            </HStack>
        </div>
    );
};
