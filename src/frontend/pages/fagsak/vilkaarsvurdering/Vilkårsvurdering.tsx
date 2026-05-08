import type { FC } from 'react';

import { Heading, VStack } from '@navikt/ds-react';

export const Vilkårsvurdering: FC = () => {
    return (
        <VStack gap="space-24">
            <Heading size="medium">Vilkårsvurdering</Heading>
            <p>Dette er det nye vilkårsvurderingssteget</p>
        </VStack>
    );
};
