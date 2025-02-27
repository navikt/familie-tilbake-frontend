import type { IBehandling } from '../../typer/behandling';
import type { IFagsak } from '../../typer/fagsak';

import { BodyShort } from '@navikt/ds-react';
import { ABorderDefault, ASpacing3 } from '@navikt/ds-tokens/dist/tokens';
import * as React from 'react';
import { Route, Routes, useNavigate, useLocation } from 'react-router-dom';
import { styled } from 'styled-components';

import BrevmottakerContainer from './Brevmottaker/BrevmottakerContainer';
import { BrevmottakerProvider } from './Brevmottaker/BrevmottakerContext';
import FaktaContainer from './Fakta/FaktaContainer';
import HistoriskFaktaContainer from './Fakta/FaktaPeriode/historikk/HistoriskFaktaContainer';
import { HistoriskFaktaProvider } from './Fakta/FaktaPeriode/historikk/HistoriskFaktaContext';
import { FeilutbetalingFaktaProvider } from './Fakta/FeilutbetalingFaktaContext';
import { FeilutbetalingForeldelseProvider } from './Foreldelse/FeilutbetalingForeldelseContext';
import ForeldelseContainer from './Foreldelse/ForeldelseContainer';
import HistoriskeVurderingermeny from './HistoriskeVurderingermeny/HistoriskeVurderingermeny';
import Høyremeny from './Høyremeny/Høyremeny';
import { FeilutbetalingVedtakProvider } from './Vedtak/FeilutbetalingVedtakContext';
import VedtakContainer from './Vedtak/VedtakContainer';
import VergeContainer from './Verge/VergeContainer';
import { VergeProvider } from './Verge/VergeContext';
import { FeilutbetalingVilkårsvurderingProvider } from './Vilkårsvurdering/FeilutbetalingVilkårsvurderingContext';
import HistoriskVilkårsvurderingContainer from './Vilkårsvurdering/historikk/HistoriskVilkårsvurderingContainer';
import { HistoriskVilkårsvurderingProvider } from './Vilkårsvurdering/historikk/HistoriskVilkårsvurderingContext';
import VilkårsvurderingContainer from './Vilkårsvurdering/VilkårsvurderingContainer';
import { useBehandling } from '../../context/BehandlingContext';
import { Behandlingstatus } from '../../typer/behandling';
import {
    erHistoriskSide,
    erØnsketSideTilgjengelig,
    utledBehandlingSide,
} from '../Felleskomponenter/Venstremeny/sider';
import Venstremeny from '../Felleskomponenter/Venstremeny/Venstremeny';

const BEHANDLING_KONTEKST_PATH = '/behandling/:behandlingId';

const StyledVenstremenyContainer = styled.div`
    min-width: 10rem;
    border-right: 1px solid ${ABorderDefault};
    overflow: hidden;
`;

const StyledMainContainer = styled.div`
    flex: 1;
    overflow: auto;
`;

const HenlagtContainer = styled.div`
    padding: ${ASpacing3};
    text-align: center;
`;

const StyledHøyremenyContainer = styled.div`
    border-left: 1px solid ${ABorderDefault};
    overflow-x: hidden;
    overflow-y: scroll;
`;

interface IProps {
    fagsak: IFagsak;
    behandling: IBehandling;
}

const BehandlingContainer: React.FC<IProps> = ({ fagsak, behandling }) => {
    const { visVenteModal, harKravgrunnlag, aktivtSteg } = useBehandling();
    const navigate = useNavigate();
    const location = useLocation();

    const ønsketSide = location.pathname.split('/')[7];
    const erHistoriskeVerdier = erHistoriskSide(ønsketSide);
    const erØnsketSideLovlig = ønsketSide && erØnsketSideTilgjengelig(ønsketSide, behandling);
    const behandlingUrl = `/fagsystem/${fagsak.fagsystem}/fagsak/${fagsak.eksternFagsakId}/behandling/${behandling.eksternBrukId}`;

    React.useEffect(() => {
        if (visVenteModal === false) {
            if (!erØnsketSideLovlig && aktivtSteg) {
                const aktivSide = utledBehandlingSide(aktivtSteg.behandlingssteg);
                if (aktivSide) {
                    navigate(`${behandlingUrl}/${aktivSide?.href}`);
                }
            } else if (!erØnsketSideLovlig) {
                if (behandling.status === Behandlingstatus.Avsluttet) {
                    navigate(`${behandlingUrl}/vedtak`);
                } else {
                    navigate(`${behandlingUrl}`);
                }
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [visVenteModal, aktivtSteg, ønsketSide]);

    return behandling.erBehandlingHenlagt ? (
        <>
            <StyledMainContainer id="fagsak-main">
                <HenlagtContainer>
                    <BodyShort size="small">Behandlingen er henlagt</BodyShort>
                </HenlagtContainer>
            </StyledMainContainer>
            <StyledHøyremenyContainer>
                <Høyremeny fagsak={fagsak} behandling={behandling} />
            </StyledHøyremenyContainer>
        </>
    ) : !harKravgrunnlag ? (
        <>
            <StyledMainContainer id="fagsak-main" />
            <StyledHøyremenyContainer>
                <Høyremeny fagsak={fagsak} behandling={behandling} />
            </StyledHøyremenyContainer>
        </>
    ) : erHistoriskeVerdier ? (
        <>
            <StyledMainContainer id="fagsak-main">
                <HistoriskeVurderingermeny behandling={behandling} fagsak={fagsak} />
                <Routes>
                    <Route
                        path={BEHANDLING_KONTEKST_PATH + '/inaktiv-fakta'}
                        element={
                            <HistoriskFaktaProvider behandling={behandling}>
                                <HistoriskFaktaContainer behandling={behandling} fagsak={fagsak} />
                            </HistoriskFaktaProvider>
                        }
                    />
                    <Route
                        path={BEHANDLING_KONTEKST_PATH + '/inaktiv-vilkaarsvurdering'}
                        element={
                            <HistoriskVilkårsvurderingProvider behandling={behandling}>
                                <HistoriskVilkårsvurderingContainer
                                    behandling={behandling}
                                    fagsak={fagsak}
                                />
                            </HistoriskVilkårsvurderingProvider>
                        }
                    />
                    <Route path={BEHANDLING_KONTEKST_PATH + '/inaktiv'} element={<></>} />
                </Routes>
            </StyledMainContainer>
        </>
    ) : harKravgrunnlag ? (
        <>
            <StyledVenstremenyContainer>
                <Venstremeny fagsak={fagsak} />
            </StyledVenstremenyContainer>
            <StyledMainContainer id="fagsak-main">
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
                                <VedtakContainer behandling={behandling} fagsak={fagsak} />
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

                    <Route
                        path={BEHANDLING_KONTEKST_PATH + '/brevmottakere'}
                        element={
                            <BrevmottakerProvider behandling={behandling} fagsak={fagsak}>
                                <BrevmottakerContainer />
                            </BrevmottakerProvider>
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
