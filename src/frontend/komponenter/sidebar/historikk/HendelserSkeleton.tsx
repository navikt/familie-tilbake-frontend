import type { FC } from 'react';

import { Process, Skeleton } from '@navikt/ds-react';

export const HendelserSkeleton: FC = () => (
    <>
        <span className="sr-only">Henter historikk</span>
        <Process aria-hidden>
            <Process.Event status="completed">
                <Skeleton variant="text" width={160} />
                <Skeleton variant="text" width={200} />
            </Process.Event>
            <Process.Event status="completed">
                <Skeleton variant="text" width={160} />
                <Skeleton variant="text" width={200} />
            </Process.Event>
            <Process.Event status="completed">
                <Skeleton variant="text" width={160} />
                <Skeleton variant="text" width={200} />
            </Process.Event>
            <Process.Event status="completed">
                <Skeleton variant="text" width={160} />
                <Skeleton variant="text" width={200} />
            </Process.Event>
            <Process.Event status="completed">
                <Skeleton variant="text" width={160} />
                <Skeleton variant="text" width={200} />
            </Process.Event>
        </Process>
    </>
);
