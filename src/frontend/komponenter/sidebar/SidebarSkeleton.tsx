import type { FC } from 'react';

import { Skeleton } from '@navikt/ds-react';

export const SidebarSkeleton: FC = () => {
    return (
        <aside
            aria-label="Laster informasjonspanelet"
            className="flex-col gap-4 hidden ax-lg:flex h-[calc(100vh-80px)]"
        >
            <div className="border border-ax-border-brand-blue-subtle rounded-2xl bg-ax-bg-default h-full flex flex-col min-h-0 p-4 gap-4">
                <Skeleton variant="rounded" height={32} />
                <Skeleton variant="rounded" height={24} width={180} />
                <Skeleton variant="rounded" height={24} />
                <Skeleton variant="rounded" height={24} />
                <Skeleton variant="rounded" height={24} />
            </div>
        </aside>
    );
};
