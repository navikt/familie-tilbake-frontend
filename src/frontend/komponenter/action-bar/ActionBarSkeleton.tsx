import { Skeleton } from '@navikt/ds-react';
import React from 'react';

const ActionBarSkeleton: React.FC = () => {
    return (
        <Skeleton className="fixed bottom-1 rounded-2xl -ml-6 ax-lg:w-[calc((100vw*2/3)-34px)] w-[calc(100vw-32px)] min-w-96 h-25" />
    );
};

export { ActionBarSkeleton };
