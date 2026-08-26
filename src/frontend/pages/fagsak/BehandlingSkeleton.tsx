import type { FC } from 'react';

import { Heading } from '@navikt/ds-react';

import { ActionBarSkeleton } from '@/komponenter/action-bar/ActionBarSkeleton';
import { SidebarSkeleton } from '@/komponenter/sidebar/SidebarSkeleton';
import { StegflytSkeleton } from '@/komponenter/stegflyt/gammel-stegflyt/StegflytSkeleton';

import { BEHANDLING_HØYDE, BEHANDLING_MINSTEBREDDE, BehandlingGrid } from './BehandlingGrid';

export const BehandlingSkeleton: FC = () => {
    return (
        <div
            className={`bg-ax-bg-brand-blue-soft flex flex-col ${BEHANDLING_HØYDE} ${BEHANDLING_MINSTEBREDDE}`}
        >
            <BehandlingGrid>
                <div className="flex flex-col gap-4 min-h-0 min-w-0">
                    <Heading size="medium" visuallyHidden>
                        Laster inn behandling
                    </Heading>
                    <StegflytSkeleton />
                    <div className="py-4 border-ax-border-brand-blue-subtle border rounded-2xl px-6 bg-ax-bg-default scrollbar-stable overflow-x-hidden overflow-y-auto flex-1 min-h-0" />
                    <ActionBarSkeleton />
                </div>
                <SidebarSkeleton />
            </BehandlingGrid>
        </div>
    );
};
