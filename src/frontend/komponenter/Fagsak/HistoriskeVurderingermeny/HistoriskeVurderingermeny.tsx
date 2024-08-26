import * as React from 'react';

import { styled } from 'styled-components';

import { Link, List } from '@navikt/ds-react';

import { IBehandling } from '../../../typer/behandling';
import { IFagsak } from '../../../typer/fagsak';

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
            <List
                as={'ol'}
                title={'Historiske verdier'}
                description={
                    'Her kan du se tidligere verdier i de forskjellige stegene. Foreløpig er det kun støtte for å se vilkårsvurdering.'
                }
            >
                <List.Item>
                    <Link href={`${basePath}/inaktiv-fakta`}>Fakta</Link>
                </List.Item>
                <List.Item>
                    <Link href={`${basePath}/inaktiv-foreldelse`}>Foreldelse</Link>
                </List.Item>
                <List.Item>
                    <Link href={`${basePath}/inaktiv-vilkaarsvurdering`}>Vilkårsvurdering</Link>
                </List.Item>
                <List.Item>
                    <Link href={`${basePath}/inaktiv-vedtak`}>Vedtak</Link>
                </List.Item>
            </List>
        </Container>
    );
};

export default HistoriskeVurderingermeny;
