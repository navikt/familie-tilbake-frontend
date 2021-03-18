import * as React from 'react';

import { Route, Switch, useHistory } from 'react-router-dom';
import styled from 'styled-components';

import navFarger from 'nav-frontend-core';

import { IFagsak } from '../../typer/fagsak';
import Venstremeny from '../Felleskomponenter/Venstremeny/Venstremeny';
import FaktaContainer from './Fakta/FaktaContainer';
import ForeldelseContainer from './Foreldelse/ForeldelseContainer';
import Høyremeny from './Høyremeny/Høyremeny';
import VilkårsvurderingContainer from './Vilkårsvurdering/VilkårsvurderingContainer';
import { IBehandling } from '../../typer/behandling';
import VedtakContainer from './Vedtak/VedtakContainer';
import { useBehandling } from '../../context/BehandlingContext';
import {
    erØnsketSideTilgjengelig,
    finnSideAktivtSteg,
} from '../Felleskomponenter/Venstremeny/sider';

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
    behandling: IBehandling;
}

const BehandlingContainer: React.FC<IProps> = ({ fagsak, behandling }) => {
    const history = useHistory();
    const ønsketSide = history.location.pathname.split('/')[7];

    const { aktivtSteg } = useBehandling();

    React.useEffect(() => {
        const ønsketSideLovlig = ønsketSide && erØnsketSideTilgjengelig(ønsketSide, behandling);
        if (!ønsketSideLovlig && aktivtSteg) {
            const aktivSide = finnSideAktivtSteg(aktivtSteg);
            if (aktivSide) {
                history.push(
                    `/fagsystem/${fagsak.fagsystem}/fagsak/${fagsak.eksternFagsakId}/behandling/${behandling.eksternBrukId}/${aktivSide?.href}`
                );
            }
        } else if (!ønsketSideLovlig) {
            history.push(
                `/fagsystem/${fagsak.fagsystem}/fagsak/${fagsak.eksternFagsakId}/behandling/${behandling.eksternBrukId}`
            );
        }
    }, [aktivtSteg, ønsketSide]);

    return behandling ? (
        <>
            <StyledVenstremenyContainer>
                <Venstremeny fagsak={fagsak} />
            </StyledVenstremenyContainer>
            <StyledMainContainer id={'fagsak-main'}>
                <Switch>
                    <Route
                        path={BEHANDLING_KONTEKST_PATH + '/fakta'}
                        render={() => (
                            <FaktaContainer behandling={behandling} ytelse={fagsak.ytelsestype} />
                        )}
                    ></Route>
                    <Route
                        path={BEHANDLING_KONTEKST_PATH + '/foreldelse'}
                        render={() => <ForeldelseContainer behandling={behandling} />}
                    />
                    <Route
                        path={BEHANDLING_KONTEKST_PATH + '/vilkaarsvurdering'}
                        render={() => <VilkårsvurderingContainer behandling={behandling} />}
                    />
                    <Route
                        path={BEHANDLING_KONTEKST_PATH + '/vedtak'}
                        render={() => <VedtakContainer behandling={behandling} />}
                    />
                    <Route path={BEHANDLING_KONTEKST_PATH + '/verge'}>
                        <div>Verge</div>
                    </Route>
                </Switch>
            </StyledMainContainer>
            <StyledHøyremenyContainer>
                <Høyremeny fagsak={fagsak} behandling={behandling} />
            </StyledHøyremenyContainer>
        </>
    ) : (
        <div />
    );
};

export default BehandlingContainer;
