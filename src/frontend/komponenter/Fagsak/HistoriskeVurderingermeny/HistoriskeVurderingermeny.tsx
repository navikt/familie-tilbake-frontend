import type { IBehandling } from '../../../typer/behandling';
import type { IFagsak } from '../../../typer/fagsak';

import { BodyLong, Heading, HStack, Link } from '@navikt/ds-react';
import * as React from 'react';
import { styled } from 'styled-components';

const Container = styled.div`
    margin: 2rem;
`;
const HistoriskeVurderingermeny: React.FC<{ fagsak: IFagsak; behandling: IBehandling }> = ({
    fagsak,
    behandling,
}) => {
    const basePath = `/fagsystem/${fagsak.fagsystem}/fagsak/${fagsak.eksternFagsakId}/behandling/${behandling.eksternBrukId}`;
    return (
        <Container>
            <Heading size="small">Historiske verdier</Heading>
            <BodyLong>
                Her kan du se tidligere lagrede verdier på stegene Fakta og Vilkårsvurdering.
            </BodyLong>
            <HStack gap="4">
                <Link href={`${basePath}/inaktiv-fakta`}>Fakta</Link>
                <Link href={`${basePath}/inaktiv-vilkaarsvurdering`}>Vilkårsvurdering</Link>
            </HStack>
        </Container>
    );
};

export default HistoriskeVurderingermeny;
