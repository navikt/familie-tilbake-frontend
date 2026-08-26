import type { FC } from 'react';

import { Skeleton } from '@navikt/ds-react';

import { useErStorSkjerm } from '@/hooks/useErStorSkjerm';
import { useSidebarErÅpen } from '@/stores/sidebarStore';

/** Speiler oppsettet i Sidebar, slik at kolonnen ikke endrer bredde når innholdet er lastet. */
export const SidebarSkeleton: FC = () => {
    const erÅpen = useSidebarErÅpen();
    const erStorSkjerm = useErStorSkjerm();

    if (!(erÅpen && erStorSkjerm)) {
        return (
            <aside
                aria-label="Laster informasjonspanelet"
                className="flex flex-col w-16 shrink-0 items-center p-4 gap-4 rounded-2xl border border-ax-border-brand-blue-subtle bg-ax-bg-default"
            >
                <Skeleton variant="rounded" height={32} width={32} />
                <Skeleton variant="rounded" height={32} width={32} />
                <Skeleton variant="rounded" height={32} width={32} />
            </aside>
        );
    }

    return (
        <aside
            aria-label="Laster informasjonspanelet"
            className="flex flex-col min-h-0 min-w-0 gap-2"
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
