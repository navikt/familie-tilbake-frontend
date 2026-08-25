import type { FC } from 'react';

import { Skeleton } from '@navikt/ds-react';

export const SidebarSkeleton: FC = () => {
    return (
        <aside
            aria-label="Laster informasjonspanelet"
            className="flex-col hidden ax-lg:flex min-h-0 min-w-0 gap-2"
        >
            <div className="border border-ax-border-brand-blue-subtle rounded-2xl bg-ax-bg-default flex-1 flex flex-col min-h-0 p-4 gap-4">
                <Skeleton variant="rounded" height={32} />
                <Skeleton variant="rounded" height={24} width={180} />
                <Skeleton variant="rounded" height={24} />
                <Skeleton variant="rounded" height={24} />
                <Skeleton variant="rounded" height={24} />
            </div>
        </aside>
    );
};
