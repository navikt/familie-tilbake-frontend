import type { FC } from 'react';

import { Heading, InlineMessage, VStack } from '@navikt/ds-react';
import { useQuery } from '@tanstack/react-query';

import { useBehandling } from '@/context/BehandlingContext';
import { behandlingHentHistorikkOptions } from '@/generated-new/@tanstack/react-query.gen';

import { Hendelser } from './Hendelser';
import { HendelserSkeleton } from './HendelserSkeleton';

export const Historikk: FC = () => {
    const { behandlingId } = useBehandling();
    const {
        data: hendelser,
        isPending,
        error,
    } = useQuery(behandlingHentHistorikkOptions({ path: { behandlingId } }));

    return (
        <VStack gap="space-16" className="min-h-full flex">
            <Heading size="small" level="2">
                Historikk
            </Heading>
            {isPending && <HendelserSkeleton />}
            {error && (
                <InlineMessage status="error" size="small">
                    {error.response?.data?.melding ?? 'Kunne ikke hente historikk.'}
                </InlineMessage>
            )}
            {hendelser && <Hendelser hendelser={hendelser} />}
        </VStack>
    );
};
