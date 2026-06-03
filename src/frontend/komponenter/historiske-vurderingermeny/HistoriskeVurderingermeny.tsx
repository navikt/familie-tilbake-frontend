import type { FC } from 'react';

import { LeaveIcon } from '@navikt/aksel-icons';
import { BodyLong, Heading, HStack, Link, VStack } from '@navikt/ds-react';
import { useLocation } from 'react-router';

import { useBehandling } from '@/context/BehandlingContext';
import { useFagsak } from '@/context/FagsakContext';
import { Behandlingsmeny } from '@/komponenter/meny/Meny';

export const HistoriskeVurderingermeny: FC = () => {
    const { eksternBrukId } = useBehandling();
    const { fagsystem, eksternFagsakId } = useFagsak();
    const basePath = `/fagsystem/${fagsystem}/fagsak/${eksternFagsakId}/behandling/${eksternBrukId}`;
    const location = useLocation();
    const behandlingsPath = location.pathname.split('/').at(-1);

    return (
        <VStack gap="space-8">
            <HStack gap="space-16">
                <Behandlingsmeny />
                {behandlingsPath && (
                    <Link href={`${location.pathname.replace(behandlingsPath, '')}`}>
                        Gå til behandling
                        <LeaveIcon title="Tilbake til behandlingen" fontSize="1.375rem" />
                    </Link>
                )}
            </HStack>
            <Heading size="small">Historiske verdier</Heading>
            <BodyLong>
                Her kan du se tidligere lagrede verdier på stegene Fakta og Vilkårsvurdering.
            </BodyLong>
            <HStack gap="space-16">
                <Link href={`${basePath}/inaktiv-fakta`}>Fakta</Link>
                <Link href={`${basePath}/inaktiv-vilkaarsvurdering`}>Vilkårsvurdering</Link>
            </HStack>
        </VStack>
    );
};
