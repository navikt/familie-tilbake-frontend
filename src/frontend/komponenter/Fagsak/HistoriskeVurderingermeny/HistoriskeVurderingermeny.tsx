import { LeaveIcon } from '@navikt/aksel-icons';
import { BodyLong, Heading, HStack, Link } from '@navikt/ds-react';
import * as React from 'react';
import { useLocation } from 'react-router';
import { styled } from 'styled-components';

import { useBehandling } from '../../../context/BehandlingContext';
import { useFagsak } from '../../../context/FagsakContext';
import { Behandlingsmeny } from '../meny/Meny';

const Container = styled.div`
    margin: 2rem;
`;
export const HistoriskeVurderingermeny: React.FC = () => {
    const { eksternBrukId } = useBehandling();
    const { fagsystem, eksternFagsakId } = useFagsak();
    const basePath = `/fagsystem/${fagsystem}/fagsak/${eksternFagsakId}/behandling/${eksternBrukId}`;
    const location = useLocation();
    const behandlingsPath = location.pathname.split('/').at(-1);

    return (
        <Container>
            <HStack className="mb-4 flex gap-4">
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
        </Container>
    );
};
