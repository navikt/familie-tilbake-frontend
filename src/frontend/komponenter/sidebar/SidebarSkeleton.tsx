import type { FC } from 'react';

import { Skeleton } from '@navikt/ds-react';

import { useSidebarErÅpen } from '@/stores/sidebarStore';

export const SidebarSkeleton: FC = () => {
    const erÅpen = useSidebarErÅpen();

    return (
        <aside
            aria-label="Laster informasjonspanelet"
            className={`flex-col hidden ax-lg:flex min-h-0 ${
                erÅpen
                    ? 'min-w-0 gap-2'
                    : 'w-16 shrink-0 items-center p-4 gap-4 rounded-2xl border border-ax-border-brand-blue-subtle bg-ax-bg-default'
            }`}
        >
            {erÅpen ? (
                <div className="border border-ax-border-brand-blue-subtle rounded-2xl bg-ax-bg-default flex-1 flex flex-col min-h-0 p-4 gap-4">
                    <Skeleton variant="rounded" height={32} />
                    <Skeleton variant="rounded" height={24} width={180} />
                    <Skeleton variant="rounded" height={24} />
                    <Skeleton variant="rounded" height={24} />
                    <Skeleton variant="rounded" height={24} />
                </div>
            ) : (
                <>
                    <Skeleton variant="rounded" height={32} width={32} />
                    <Skeleton variant="rounded" height={32} width={32} />
                    <Skeleton variant="rounded" height={32} width={32} />
                </>
            )}
        </aside>
    );
};
