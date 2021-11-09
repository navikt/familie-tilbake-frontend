import * as React from 'react';

import { Route, Routes, useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';

import navFarger from 'nav-frontend-core';
import { Normaltekst } from 'nav-frontend-typografi';

import { useBehandling } from '../../context/BehandlingContext';
import { Behandlingstatus, IBehandling } from '../../typer/behandling';
import { IFagsak } from '../../typer/fagsak';
import {
    erØnsketSideTilgjengelig,
    finnSideAktivtSteg,
} from '../Felleskomponenter/Venstremeny/sider';
import Venstremeny from '../Felleskomponenter/Venstremeny/Venstremeny';
import FaktaContainer from './Fakta/FaktaContainer';
import { FeilutbetalingFaktaProvider } from './Fakta/FeilutbetalingFaktaContext';
import { FeilutbetalingForeldelseProvider } from './Foreldelse/FeilutbetalingForeldelseContext';
import ForeldelseContainer from './Foreldelse/ForeldelseContainer';
import Høyremeny from './Høyremeny/Høyremeny';
import { FeilutbetalingVedtakProvider } from './Vedtak/FeilutbetalingVedtakContext';
import VedtakContainer from './Vedtak/VedtakContainer';
import VergeContainer from './Verge/VergeContainer';
import { VergeProvider } from './Verge/VergeContext';
import { FeilutbetalingVilkårsvurderingProvider } from './Vilkårsvurdering/FeilutbetalingVilkårsvurderingContext';
import VilkårsvurderingContainer from './Vilkårsvurdering/VilkårsvurderingContainer';

const BEHANDLING_KONTEKST_PATH = '/behandling/:behandlingId';

const StyledVenstremenyContainer = styled.div`
    min-width: 10rem;
    border-right: 1px solid ${navFarger.navGra20};
    overflow: hidden;
`;

const StyledMainContainer = styled.div`
    flex: 1;
    overflow: auto;
`;

const HenlagtContainer = styled.div`
    padding: 10px;
    text-align: center;
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
    const navigate = useNavigate();
    const location = useLocation();
    const ønsketSide = location.pathname.split('/')[7];

    const { visVenteModal, harKravgrunnlag, aktivtSteg } = useBehandling();

    React.useEffect(() => {
        if (visVenteModal === false) {
            const ønsketSideLovlig = ønsketSide && erØnsketSideTilgjengelig(ønsketSide, behandling);
            if (!ønsketSideLovlig && aktivtSteg) {
                const aktivSide = finnSideAktivtSteg(aktivtSteg);
                if (aktivSide) {
                    navigate(
                        `/fagsystem/${fagsak.fagsystem}/fagsak/${fagsak.eksternFagsakId}/behandling/${behandling.eksternBrukId}/${aktivSide?.href}`
                    );
                }
            } else if (!ønsketSideLovlig) {
                if (behandling.status === Behandlingstatus.AVSLUTTET) {
                    navigate(
                        `/fagsystem/${fagsak.fagsystem}/fagsak/${fagsak.eksternFagsakId}/behandling/${behandling.eksternBrukId}/vedtak`
                    );
                } else {
                    navigate(
                        `/fagsystem/${fagsak.fagsystem}/fagsak/${fagsak.eksternFagsakId}/behandling/${behandling.eksternBrukId}`
                    );
                }
            }
        }
    }, [visVenteModal, aktivtSteg, ønsketSide]);

    return behandling.erBehandlingHenlagt ? (
        <>
            <StyledMainContainer id={'fagsak-main'}>
                <HenlagtContainer>
                    <Normaltekst>Behandlingen er henlagt</Normaltekst>
                </HenlagtContainer>
            </StyledMainContainer>
            <StyledHøyremenyContainer>
                <Høyremeny fagsak={fagsak} behandling={behandling} />
            </StyledHøyremenyContainer>
        </>
    ) : harKravgrunnlag ? (
        <>
            <StyledVenstremenyContainer>
                <Venstremeny fagsak={fagsak} />
            </StyledVenstremenyContainer>
            <StyledMainContainer id={'fagsak-main'}>
                <Routes>
                    <Route
                        path={BEHANDLING_KONTEKST_PATH + '/fakta'}
                        element={
                            <FeilutbetalingFaktaProvider behandling={behandling} fagsak={fagsak}>
                                <FaktaContainer ytelse={fagsak.ytelsestype} />
                            </FeilutbetalingFaktaProvider>
                        }
                    />
                    <Route
                        path={BEHANDLING_KONTEKST_PATH + '/foreldelse'}
                        element={
                            <FeilutbetalingForeldelseProvider
                                behandling={behandling}
                                fagsak={fagsak}
                            >
                                <ForeldelseContainer behandling={behandling} />
                            </FeilutbetalingForeldelseProvider>
                        }
                    />

                    <Route
                        path={BEHANDLING_KONTEKST_PATH + '/vilkaarsvurdering'}
                        element={
                            <FeilutbetalingVilkårsvurderingProvider
                                behandling={behandling}
                                fagsak={fagsak}
                            >
                                <VilkårsvurderingContainer
                                    behandling={behandling}
                                    fagsak={fagsak}
                                />
                            </FeilutbetalingVilkårsvurderingProvider>
                        }
                    />

                    <Route
                        path={BEHANDLING_KONTEKST_PATH + '/vedtak'}
                        element={
                            <FeilutbetalingVedtakProvider behandling={behandling} fagsak={fagsak}>
                                <VedtakContainer behandling={behandling} />
                            </FeilutbetalingVedtakProvider>
                        }
                    />

                    <Route
                        path={BEHANDLING_KONTEKST_PATH + '/verge'}
                        element={
                            <VergeProvider behandling={behandling} fagsak={fagsak}>
                                <VergeContainer />
                            </VergeProvider>
                        }
                    />
                </Routes>
            </StyledMainContainer>
            <StyledHøyremenyContainer>
                <Høyremeny fagsak={fagsak} behandling={behandling} />
            </StyledHøyremenyContainer>
        </>
    ) : null;
};

export default BehandlingContainer;
