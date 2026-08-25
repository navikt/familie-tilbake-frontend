import type { FC } from 'react';

import { VStack } from '@navikt/ds-react';

import { Faktaboks } from './Faktaboks';
import { MottakerBoks } from './MottakerBoks';

export const Detaljer: FC = () => {
    return (
        <VStack gap="space-16">
            <Faktaboks />
            <MottakerBoks />
        </VStack>
    );
};
