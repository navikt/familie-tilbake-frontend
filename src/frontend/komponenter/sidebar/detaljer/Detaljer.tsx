import type { FC } from 'react';

import { VStack } from '@navikt/ds-react';

import { useBehandling } from '@/context/BehandlingContext';

import { Faktaboks } from './Faktaboks';
import { MottakerBoks } from './MottakerBoks';
import { Revurderingsboks } from './Revurderingsboks';

export const Detaljer: FC = () => {
    const { behandlingsårsakstype, tilbakekrevingRevurdering } = useBehandling();

    return (
        <VStack gap="space-16">
            <Revurderingsboks
                revurdering={tilbakekrevingRevurdering}
                behandlingsårsakstype={behandlingsårsakstype}
            />
            <Faktaboks />
            <MottakerBoks />
        </VStack>
    );
};
