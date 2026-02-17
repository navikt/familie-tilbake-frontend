import React from 'react';

import { ActionBarSkeleton } from '../../komponenter/action-bar/ActionBarSkeleton';

export const BehandlingContainerSkeleton: React.FC = () => {
    return (
        <div>
            <p>Behandlingsinnholdet laster...</p>
            <ActionBarSkeleton />
        </div>
    );
};
