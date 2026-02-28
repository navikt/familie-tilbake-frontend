import type { FC } from 'react';

import { ActionBarSkeleton } from '~/komponenter/action-bar/ActionBarSkeleton';

export const BehandlingContainerSkeleton: FC = () => {
    return (
        <div>
            <p>Behandlingsinnholdet laster...</p>
            <ActionBarSkeleton />
        </div>
    );
};
