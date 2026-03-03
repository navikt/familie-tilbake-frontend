import type { FC } from 'react';

import { SidebarRightIcon } from '@navikt/aksel-icons';
import { Button } from '@navikt/ds-react';

import { ActionBarSkeleton } from '~/komponenter/action-bar/ActionBarSkeleton';
import { SidebarSkeleton } from '~/komponenter/sidebar/SidebarSkeleton';
import { StegflytSkeleton } from '~/komponenter/stegflyt/StegflytSkeleton';

export const BehandlingSkeleton: FC = () => {
    return (
        <div className="grid grid-cols-1 ax-lg:grid-cols-[2fr_1fr] gap-4 p-4 bg-ax-neutral-100 min-h-screen">
            <div className="flex flex-col gap-4 flex-1 min-h-0 max-h-[calc(100vh-162px)]">
                <div className="flex flex-row gap-2 ax-lg:block justify-between">
                    <StegflytSkeleton />
                    <Button
                        variant="tertiary"
                        icon={<SidebarRightIcon aria-hidden fontSize="1.5rem" />}
                        className="lg:hidden"
                    >
                        Åpne
                    </Button>
                </div>
                <div className="py-4 border-ax-border-neutral-subtle border rounded-2xl px-6 bg-ax-bg-default scrollbar-stable overflow-x-hidden overflow-y-auto flex-1 min-h-0" />
                <ActionBarSkeleton className="ml-0" />
            </div>
            <SidebarSkeleton />
        </div>
    );
};
