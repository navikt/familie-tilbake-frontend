import type { FC } from 'react';

import { VStack } from '@navikt/ds-react';

import { useBehandling } from '@/context/BehandlingContext';

import { Faktaboks } from './Faktaboks';
import { MottakerBoks } from './MottakerBoks';
import { Revurderingsboks } from './Revurderingsboks';
import { VenterPåKravgrunnlagBoks } from './VenterPåKravgrunnlagBoks';

export const Detaljer: FC = () => {
    const { behandlingsårsakstype, tilbakekrevingRevurdering, venter } = useBehandling();

    return (
        <VStack gap="space-16">
            {venter?.grunn === 'SPERRET_VENTER_PÅ_OPPDATERING_FRA_ØKONOMI' && (
                <VenterPåKravgrunnlagBoks />
            )}
            <Revurderingsboks
                revurdering={tilbakekrevingRevurdering}
                behandlingsårsakstype={behandlingsårsakstype}
            />
            <Faktaboks />
            <MottakerBoks />
        </VStack>
    );
};
