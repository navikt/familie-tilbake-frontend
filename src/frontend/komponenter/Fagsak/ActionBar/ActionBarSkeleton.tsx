import { Skeleton } from '@navikt/ds-react';
import React from 'react';

const ActionBarSkeleton: React.FC = () => {
    return <Skeleton className="fixed bottom-1 left-4 rounded-2xl right-45 h-25" />;
};

export { ActionBarSkeleton };
