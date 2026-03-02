import type { FC } from 'react';

import { MenuElipsisHorizontalIcon } from '@navikt/aksel-icons';
import { Button, HStack, Skeleton } from '@navikt/ds-react';

type Props = {
    className?: string;
};

export const ActionBarSkeleton: FC<Props> = ({ className }) => {
    return (
        <div
            className={`flex flex-row fixed bottom-4 bg-ax-bg-default px-6 py-3 rounded-2xl border-ax-border-neutral-subtle border justify-between z-10 flex-nowrap ax-lg:w-[calc((100vw*2/3)-34px)] w-[calc(100vw-32px)] min-w-96 -ml-6 ${className}`}
        >
            <Button
                variant="tertiary"
                icon={<MenuElipsisHorizontalIcon fontSize="1.5rem" aria-hidden />}
            >
                Meny
            </Button>

            <HStack gap="space-32" className="flex items-center">
                <Skeleton width={100} variant="rounded" />
                <HStack gap="space-16" className="flex-nowrap">
                    <Skeleton width={50} height={40} variant="rounded" />
                    <Skeleton width={50} height={40} variant="rounded" />
                </HStack>
            </HStack>
        </div>
    );
};
