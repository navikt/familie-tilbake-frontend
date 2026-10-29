import type { FC } from 'react';

import { VStack } from '@navikt/ds-react';

import { useBehandling } from '@/context/BehandlingContext';

import { Faktaboks } from './Faktaboks';
import { MottakerBoks } from './MottakerBoks';
import { Revurderingsboks } from './Revurderingsboks';

export const Detaljer: FC = () => {
    const { behandlingsårsakstype } = useBehandling();

    return (
        <VStack gap="space-16">
            {behandlingsårsakstype && (
                <Revurderingsboks
                    behandlingsårsakstype={'REVURDERING_OPPLYSNINGER_OM_FORELDELSE'}
                />
            )}
            <Faktaboks />
            <MottakerBoks />
        </VStack>
    );
};
