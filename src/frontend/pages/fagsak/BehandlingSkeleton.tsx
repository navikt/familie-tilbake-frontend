import { ActionBarSkeleton } from '@komponenter/action-bar/ActionBarSkeleton';
import React from 'react';

export const BehandlingContainerSkeleton: React.FC = () => {
    return (
        <div>
            <p>Behandlingsinnholdet laster...</p>
            <ActionBarSkeleton />
        </div>
    );
};
