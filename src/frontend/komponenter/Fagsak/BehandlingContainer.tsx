import type { IBehandling } from '../../typer/behandling';
import type { IFagsak } from '../../typer/fagsak';

import { BodyShort } from '@navikt/ds-react';
import { ABorderDefault, ASpacing3 } from '@navikt/ds-tokens/dist/tokens';
import * as React from 'react';
import { lazy, Suspense } from 'react';
import { Route, Routes, useNavigate, useLocation } from 'react-router';
import { styled } from 'styled-components';

import { BrevmottakerProvider } from './Brevmottaker/BrevmottakerContext';
import { HistoriskFaktaProvider } from './Fakta/FaktaPeriode/historikk/HistoriskFaktaContext';
import { FeilutbetalingFaktaProvider } from './Fakta/FeilutbetalingFaktaContext';
import { FeilutbetalingForeldelseProvider } from './Foreldelse/FeilutbetalingForeldelseContext';
import { FeilutbetalingVedtakProvider } from './Vedtak/FeilutbetalingVedtakContext';
import { VergeProvider } from './Verge/VergeContext';
import { FeilutbetalingVilkårsvurderingProvider } from './Vilkårsvurdering/FeilutbetalingVilkårsvurderingContext';
import { HistoriskVilkårsvurderingProvider } from './Vilkårsvurdering/historikk/HistoriskVilkårsvurderingContext';
import { useBehandling } from '../../context/BehandlingContext';
import { Behandlingstatus } from '../../typer/behandling';
import {
    erHistoriskSide,
    erØnsketSideTilgjengelig,
    utledBehandlingSide,
} from '../Felleskomponenter/Venstremeny/sider';
import Venstremeny from '../Felleskomponenter/Venstremeny/Venstremeny';

const BrevmottakerContainer = lazy(() => import('./Brevmottaker/BrevmottakerContainer'));
const FaktaContainer = lazy(() => import('./Fakta/FaktaContainer'));
const HistoriskFaktaContainer = lazy(
    () => import('./Fakta/FaktaPeriode/historikk/HistoriskFaktaContainer')
);
const ForeldelseContainer = lazy(() => import('./Foreldelse/ForeldelseContainer'));
const VedtakContainer = lazy(() => import('./Vedtak/VedtakContainer'));
const VergeContainer = lazy(() => import('./Verge/VergeContainer'));
const VilkårsvurderingContainer = lazy(
    () => import('./Vilkårsvurdering/VilkårsvurderingContainer')
);
const HistoriskVilkårsvurderingContainer = lazy(
    () => import('./Vilkårsvurdering/historikk/HistoriskVilkårsvurderingContainer')
);
const Høyremeny = lazy(() => import('./Høyremeny/Høyremeny'));
const HistoriskeVurderingermeny = lazy(
    () => import('./HistoriskeVurderingermeny/HistoriskeVurderingermeny')
);

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

const SuspenseWrapper = ({ children }: { children: React.ReactNode }) => (
    <Suspense fallback={<div>Laster innhold...</div>}>{children}</Suspense>
);

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
                <SuspenseWrapper>
                    <Høyremeny fagsak={fagsak} behandling={behandling} />
                </SuspenseWrapper>
            </StyledHøyremenyContainer>
        </>
    ) : !harKravgrunnlag ? (
        <>
            <StyledMainContainer id="fagsak-main" />
            <StyledHøyremenyContainer>
                <SuspenseWrapper>
                    <Høyremeny fagsak={fagsak} behandling={behandling} />
                </SuspenseWrapper>
            </StyledHøyremenyContainer>
        </>
    ) : erHistoriskeVerdier ? (
        <>
            <StyledMainContainer id="fagsak-main">
                <SuspenseWrapper>
                    <HistoriskeVurderingermeny behandling={behandling} fagsak={fagsak} />
                </SuspenseWrapper>
                <Routes>
                    <Route
                        path={BEHANDLING_KONTEKST_PATH + '/inaktiv-fakta'}
                        element={
                            <HistoriskFaktaProvider behandling={behandling}>
                                <SuspenseWrapper>
                                    <HistoriskFaktaContainer
                                        behandling={behandling}
                                        fagsak={fagsak}
                                    />
                                </SuspenseWrapper>
                            </HistoriskFaktaProvider>
                        }
                    />
                    <Route
                        path={BEHANDLING_KONTEKST_PATH + '/inaktiv-vilkaarsvurdering'}
                        element={
                            <HistoriskVilkårsvurderingProvider behandling={behandling}>
                                <SuspenseWrapper>
                                    <HistoriskVilkårsvurderingContainer
                                        behandling={behandling}
                                        fagsak={fagsak}
                                    />
                                </SuspenseWrapper>
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
                                <SuspenseWrapper>
                                    <FaktaContainer ytelse={fagsak.ytelsestype} />
                                </SuspenseWrapper>
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
                                <SuspenseWrapper>
                                    <ForeldelseContainer behandling={behandling} />
                                </SuspenseWrapper>
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
                                <SuspenseWrapper>
                                    <VilkårsvurderingContainer
                                        behandling={behandling}
                                        fagsak={fagsak}
                                    />
                                </SuspenseWrapper>
                            </FeilutbetalingVilkårsvurderingProvider>
                        }
                    />
                    <Route
                        path={BEHANDLING_KONTEKST_PATH + '/vedtak'}
                        element={
                            <FeilutbetalingVedtakProvider behandling={behandling} fagsak={fagsak}>
                                <SuspenseWrapper>
                                    <VedtakContainer behandling={behandling} fagsak={fagsak} />
                                </SuspenseWrapper>
                            </FeilutbetalingVedtakProvider>
                        }
                    />
                    <Route
                        path={BEHANDLING_KONTEKST_PATH + '/verge'}
                        element={
                            <VergeProvider behandling={behandling} fagsak={fagsak}>
                                <SuspenseWrapper>
                                    <VergeContainer />
                                </SuspenseWrapper>
                            </VergeProvider>
                        }
                    />
                    <Route
                        path={BEHANDLING_KONTEKST_PATH + '/brevmottakere'}
                        element={
                            <BrevmottakerProvider behandling={behandling} fagsak={fagsak}>
                                <SuspenseWrapper>
                                    <BrevmottakerContainer />
                                </SuspenseWrapper>
                            </BrevmottakerProvider>
                        }
                    />
                </Routes>
            </StyledMainContainer>
            <StyledHøyremenyContainer>
                <SuspenseWrapper>
                    <Høyremeny fagsak={fagsak} behandling={behandling} />
                </SuspenseWrapper>
            </StyledHøyremenyContainer>
        </>
    ) : null;
};

export default BehandlingContainer;
