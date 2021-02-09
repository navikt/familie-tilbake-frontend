import * as React from 'react';

import { useHistory, useParams } from 'react-router-dom';

import { RessursStatus } from '@navikt/familie-typer';

import { useBehandling } from '../../context/BehandlingContext';
import { useFagsak } from '../../context/FagsakContext';
import { Ytelsetype } from '../../kodeverk/ytelsetype';
import BehandlingContainer from './BehandlingContainer';
import Personlinje from './Personlinje/Personlinje';

interface IProps {
    ytelseType: Ytelsetype;
    fagsakId: string;
}

const FagsakContainer: React.FC = () => {
    const { ytelseType, fagsakId } = useParams<IProps>();
    const history = useHistory();
    const behandlingId = history.location.pathname.split('/')[6];

    const { fagsak, hentFagsak } = useFagsak();
    const { åpenBehandling, hentBehandling } = useBehandling();

    React.useEffect(() => {
        if (ytelseType !== undefined && fagsakId !== undefined) {
            hentFagsak(ytelseType, fagsakId);
        }
    }, [ytelseType, fagsakId]);

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

                    <div className={'fagsakcontainer__content'}>
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
                    </div>
                </>
            );
        }
        default:
            return (
                <div>
                    Skal vise fagsak {fagsakId} med ytelse {ytelseType} og behandling {behandlingId}
                </div>
            );
    }
};

export default FagsakContainer;
