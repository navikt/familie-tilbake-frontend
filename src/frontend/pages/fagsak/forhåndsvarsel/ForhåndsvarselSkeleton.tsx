import { BodyShort, Heading, Skeleton, VStack } from '@navikt/ds-react';
import React from 'react';

import { ActionBarSkeleton } from '../../../komponenter/action-bar/ActionBarSkeleton';

export const ForhåndsvarselSkeleton: React.FC = () => {
    return (
        <VStack className="gap-6">
            <Heading size="medium">Forhåndsvarsel</Heading>
            <VStack className="max-w-xl">
                <BodyShort className="text-ax-medium font-semibold">
                    Skal det sendes forhåndsvarsel om tilbakekreving?
                </BodyShort>
                <BodyShort className="text-ax-text-neutral-subtle text-ax-medium" spacing>
                    Brukeren skal som klar hovedregel varsles før vedtak om tilbakekreving fattes,
                    slik at de får mulighet til å uttale seg.
                </BodyShort>
                <VStack className="gap-1">
                    <Skeleton variant="rounded" width="10%" height={20} />
                    <Skeleton variant="rounded" width="10%" height={20} />
                </VStack>
            </VStack>
            <ActionBarSkeleton />
        </VStack>
    );
};
