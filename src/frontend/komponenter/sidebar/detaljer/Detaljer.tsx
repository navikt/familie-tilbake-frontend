import type { FC } from 'react';

import { PlusIcon } from '@navikt/aksel-icons';
import { Button, Heading, HStack, VStack } from '@navikt/ds-react';

import { useBehandling } from '@/context/BehandlingContext';
import { ToggleName, useToggle } from '@/context/TogglesContext';

import { Faktaboks } from './Faktaboks';
import { MottakerBoks } from './MottakerBoks';
import { Revurderingsboks } from './Revurderingsboks';
import { VenterPåKravgrunnlagBoks } from './VenterPåKravgrunnlagBoks';

export const Detaljer: FC = () => {
    const { behandlingsårsakstype, kanEndres, tilbakekrevingRevurdering, venter } = useBehandling();
    const brevmottakereEnabled = useToggle(ToggleName.Brevmottakere);
    return (
        <VStack gap="space-24">
            {venter?.grunn === 'SPERRET_VENTER_PÅ_OPPDATERING_FRA_ØKONOMI' && (
                <VenterPåKravgrunnlagBoks />
            )}
            {(tilbakekrevingRevurdering || behandlingsårsakstype) && (
                <Revurderingsboks
                    revurdering={tilbakekrevingRevurdering}
                    behandlingsårsakstype={behandlingsårsakstype}
                    kanEndres={kanEndres}
                />
            )}
            <Faktaboks />
            <VStack gap="space-16">
                {brevmottakereEnabled && (
                    <HStack justify="space-between">
                        <Heading level="2" size="small">
                            Brevmottakere
                        </Heading>
                        <Button variant="tertiary" size="xsmall" icon={<PlusIcon aria-hidden />}>
                            Legg til
                        </Button>
                    </HStack>
                )}
                <MottakerBoks />
            </VStack>
        </VStack>
    );
};
