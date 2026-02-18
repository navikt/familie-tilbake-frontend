import { ActionBarSkeleton } from '@komponenter/action-bar/ActionBarSkeleton';
import { BodyShort, Heading, Skeleton, VStack } from '@navikt/ds-react';
import * as React from 'react';

export const OpprettVedtaksbrevSkeleton: React.FC = () => {
    return (
        <>
            <div className="grid grid-cols-1 ax-md:grid-cols-2 gap-4">
                <VStack className="col-span-1 overflow-auto flex-1 min-h-0 gap-4">
                    <Heading size="small">Opprett vedtaksbrev</Heading>
                    <Skeleton variant="rounded" width="40%" height={20} />
                    <BodyShort className="text-ax-text-neutral-subtle text-ax-medium">
                        Beskriv kort hva som har skjedd i denne perioden
                    </BodyShort>
                    <Skeleton variant="rounded" width="100%" height={100} />
                    <BodyShort className="text-ax-medium font-semibold">
                        Hvordan har vi kommet fram til at du må betale tilbake?
                    </BodyShort>
                    <Skeleton variant="rounded" width="100%" height={100} />
                </VStack>
                <VStack className="col-span-1 overflow-auto flex-1 min-h-0 gap-4">
                    <Skeleton variant="rounded" width="100%" height={400} />
                </VStack>
            </div>
            <ActionBarSkeleton />
        </>
    );
};
