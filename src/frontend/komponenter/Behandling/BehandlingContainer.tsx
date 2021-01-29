import * as React from 'react';

import { useParams } from 'react-router-dom';

import { useBehandling } from '../../context/BehandlingContext';
import { useFagsakRessurser } from '../../context/FagsakContext';
import Høyremeny from '../Fagsak/Høyremeny/Høyremeny';
import Personlinje from '../Fagsak/Personlinje/Personlinje';
import Venstremeny from '../Felleskomponenter/Venstremeny/Venstremeny';

interface IProps {
    fagsakId: string;
    behandlingId: string;
}

const BehandlingContainer: React.FC = () => {
    const { fagsakId, behandlingId } = useParams<IProps>();

    const { bruker, fagsak, hentFagsak, hentBruker } = useFagsakRessurser();
    const { åpenBehandling, hentBehandling } = useBehandling();

    React.useEffect(() => {
        if (fagsakId !== undefined) {
            hentFagsak(fagsakId);
        }
    }, [fagsakId]);

    React.useEffect(() => {
        if (fagsak !== undefined) {
            hentBruker(fagsak.fagsakId);
        }
    }, [fagsak]);

    React.useEffect(() => {
        if (fagsak !== undefined && bruker !== undefined) {
            hentBehandling(fagsak.fagsakId, behandlingId);
        }
    }, [fagsak, bruker]);

    return (
        <>
            {fagsak && bruker ? (
                <>
                    <Personlinje bruker={bruker} fagsak={fagsak} />

                    {åpenBehandling ? (
                        <div className={'fagsakcontainer__content'}>
                            <div className={'fagsakcontainer__content--venstremeny'}>
                                <Venstremeny fagsak={fagsak} />
                            </div>
                            <div id={'fagsak-main'} className={'fagsakcontainer__content--main'}>
                                <div></div>
                            </div>
                            <div className={'fagsakcontainer__content--høyremeny'}>
                                <Høyremeny fagsak={fagsak} />
                            </div>
                        </div>
                    ) : (
                        <div>Ikke behandling?</div>
                    )}
                </>
            ) : (
                <div>
                    Skal vise fagsak {fagsakId} og behandling {behandlingId}
                </div>
            )}
        </>
    );
};

export default BehandlingContainer;
