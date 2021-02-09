import * as React from 'react';

import { Route, Switch } from 'react-router-dom';

import { IBehandling } from '../../typer/behandling';
import { IFagsak } from '../../typer/fagsak';
import Venstremeny from '../Felleskomponenter/Venstremeny/Venstremeny';
import FaktaContainer from './Fakta/FaktaContainer';
import Høyremeny from './Høyremeny/Høyremeny';

const BEHANDLING_KONTEKST_PATH = '/ytelse/:ytelseType/fagsak/:fagsakId/behandling/:behandlingId';

interface IProps {
    fagsak: IFagsak;
    åpenBehandling: IBehandling;
}

const BehandlingContainer: React.FC<IProps> = ({ fagsak, åpenBehandling }) => {
    //const history = useHistory();
    //const sidevisning = history.location.pathname.split('/')[7];

    return (
        <>
            <div className={'fagsakcontainer__content--venstremeny'}>
                <Venstremeny fagsak={fagsak} />
            </div>
            <div id={'fagsak-main'} className={'fagsakcontainer__content--main'}>
                <div>
                    <Switch>
                        <Route
                            path={BEHANDLING_KONTEKST_PATH + '/fakta'}
                            render={() => (
                                <FaktaContainer
                                    behandling={åpenBehandling}
                                    ytelse={fagsak.ytelseType}
                                />
                            )}
                        ></Route>
                        <Route path={BEHANDLING_KONTEKST_PATH + '/foreldelse'}>
                            <div>Foreldelse</div>
                        </Route>
                        <Route path={BEHANDLING_KONTEKST_PATH + '/vilkaarsvurdering'}>
                            <div>Vilkårsvurdering</div>
                        </Route>
                        <Route path={BEHANDLING_KONTEKST_PATH + '/vedtak'}>
                            <div>Vedtak</div>
                        </Route>
                        <Route path={BEHANDLING_KONTEKST_PATH + '/verge'}>
                            <div>Verge</div>
                        </Route>
                    </Switch>
                </div>
            </div>
            <div className={'fagsakcontainer__content--høyremeny'}>
                <Høyremeny fagsak={fagsak} åpenBehandling={åpenBehandling} />
            </div>
        </>
    );
};

export default BehandlingContainer;
