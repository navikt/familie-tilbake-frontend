import type { FC } from 'react';

import { Skeleton } from '@navikt/ds-react';

type Props = {
    className?: string;
};

const ActionBarSkeleton: FC<Props> = ({ className }) => {
    return (
        <Skeleton
            className={`fixed bottom-1 rounded-2xl -ml-6 ax-lg:w-[calc((100vw*2/3)-34px)] w-[calc(100vw-32px)] min-w-96 h-25 ${className}`}
        />
    );
};

export { ActionBarSkeleton };
