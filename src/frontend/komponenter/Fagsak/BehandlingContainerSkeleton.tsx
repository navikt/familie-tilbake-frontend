import React from 'react';

import { ActionBarSkeleton } from './ActionBar/ActionBarSkeleton';

export const BehandlingContainerSkeleton: React.FC = () => {
    return (
        <div>
            <p>Behandlingsinnholdet laster...</p>
            <ActionBarSkeleton />
        </div>
    );
};
