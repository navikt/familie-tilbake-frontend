import * as React from 'react';

import { Route, Switch } from 'react-router-dom';
import styled from 'styled-components';

import navFarger from 'nav-frontend-core';

import { IBehandling } from '../../typer/behandling';
import { IFagsak } from '../../typer/fagsak';
import Venstremeny from '../Felleskomponenter/Venstremeny/Venstremeny';
import FaktaContainer from './Fakta/FaktaContainer';
import ForeldelseContainer from './Foreldelse/ForeldelseContainer';
import Høyremeny from './Høyremeny/Høyremeny';
import VilkårsvurderingContainer from './Vilkårsvurdering/VilkårsvurderingContainer';

const BEHANDLING_KONTEKST_PATH = '/fagsystem/:fagsystem/fagsak/:fagsakId/behandling/:behandlingId';

const StyledVenstremenyContainer = styled.div`
    min-width: 10rem;
    border-right: 1px solid ${navFarger.navGra20};
    overflow: hidden;
`;

const StyledMainContainer = styled.div`
    flex: 1;
    overflow: auto;
`;

const StyledHøyremenyContainer = styled.div`
    border-left: 1px solid ${navFarger.navGra20};
    overflow-x: hidden;
    overflow-y: scroll;
`;

interface IProps {
    fagsak: IFagsak;
    åpenBehandling: IBehandling;
}

const BehandlingContainer: React.FC<IProps> = ({ fagsak, åpenBehandling }) => {
    //const history = useHistory();
    //const sidevisning = history.location.pathname.split('/')[7];

    return (
        <>
            <StyledVenstremenyContainer>
                <Venstremeny fagsak={fagsak} />
            </StyledVenstremenyContainer>
            <StyledMainContainer id={'fagsak-main'}>
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
                    <Route
                        path={BEHANDLING_KONTEKST_PATH + '/foreldelse'}
                        render={() => <ForeldelseContainer behandling={åpenBehandling} />}
                    />
                    <Route
                        path={BEHANDLING_KONTEKST_PATH + '/vilkaarsvurdering'}
                        render={() => <VilkårsvurderingContainer behandling={åpenBehandling} />}
                    />
                    <Route path={BEHANDLING_KONTEKST_PATH + '/vedtak'}>
                        <div>Vedtak</div>
                    </Route>
                    <Route path={BEHANDLING_KONTEKST_PATH + '/verge'}>
                        <div>Verge</div>
                    </Route>
                </Switch>
            </StyledMainContainer>
            <StyledHøyremenyContainer>
                <Høyremeny fagsak={fagsak} åpenBehandling={åpenBehandling} />
            </StyledHøyremenyContainer>
        </>
    );
};

export default BehandlingContainer;
