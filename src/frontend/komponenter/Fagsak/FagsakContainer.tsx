import * as React from 'react';

import { useHistory, useParams } from 'react-router-dom';
import styled from 'styled-components';

import { RessursStatus } from '@navikt/familie-typer';

import { useBehandling } from '../../context/BehandlingContext';
import { useFagsak } from '../../context/FagsakContext';
import { Fagsystem } from '../../kodeverk';
import BehandlingContainer from './BehandlingContainer';
import Personlinje from './Personlinje/Personlinje';

const FagsakContainerContent = styled.div`
    display: flex;
    height: calc(100vh - 6rem);
`;

interface IProps {
    fagsystem: string;
    fagsakId: string;
}

const FagsakContainer: React.FC = () => {
    const { fagsystem: fagsystemParam, fagsakId } = useParams<IProps>();
    const fagsystem = Fagsystem[fagsystemParam as keyof typeof Fagsystem];

    const history = useHistory();
    const behandlingId = history.location.pathname.split('/')[6];

    const { fagsak, hentFagsak } = useFagsak();
    const { åpenBehandling, hentBehandling } = useBehandling();

    React.useEffect(() => {
        if (fagsystem !== undefined && fagsakId !== undefined) {
            hentFagsak(fagsystem, fagsakId);
        }
    }, [fagsystem, fagsakId]);

    React.useEffect(() => {
        if (fagsak?.status === RessursStatus.SUKSESS && behandlingId) {
            const fagsakBehandling = fagsak.data.behandlinger.find(
                behandling => behandling.eksternBrukId === behandlingId
            );
            if (fagsakBehandling?.eksternBrukId === behandlingId) {
                hentBehandling(fagsakBehandling.id);
            }
        }
    }, [fagsak]);

    switch (fagsak?.status) {
        case RessursStatus.SUKSESS: {
            return (
                <>
                    <Personlinje bruker={fagsak.data.bruker} fagsak={fagsak.data} />

                    <FagsakContainerContent>
                        {åpenBehandling ? (
                            åpenBehandling?.status === RessursStatus.SUKSESS ? (
                                <BehandlingContainer
                                    fagsak={fagsak.data}
                                    åpenBehandling={åpenBehandling.data}
                                />
                            ) : (
                                <div>Ingen ressurs</div>
                            )
                        ) : behandlingId ? (
                            <div>Ingen ressurs</div>
                        ) : (
                            <div>Saksoversikt?</div>
                        )}
                    </FagsakContainerContent>
                </>
            );
        }
        default:
            return fagsystem ? (
                <div>
                    Skal vise fagsak {fagsakId} fra fagssystem {fagsystem} og behandling{' '}
                    {behandlingId}
                </div>
            ) : (
                <div>Ukjent fagssystem: {fagsystemParam}</div>
            );
    }
};

export default FagsakContainer;
