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
import { HistoriskVilkårsvurderingProvider } from './Vilkårsvurdering/historikk/HistoriskVilkårsvurderingContext';
import { VilkårsvurderingProvider } from './Vilkårsvurdering/VilkårsvurderingContext';
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
                <Suspense fallback="Høyremeny for henlagt behandling laster...">
                    <Høyremeny fagsak={fagsak} behandling={behandling} />
                </Suspense>
            </StyledHøyremenyContainer>
        </>
    ) : !harKravgrunnlag ? (
        <>
            <StyledMainContainer id="fagsak-main" />
            <StyledHøyremenyContainer>
                <Suspense fallback="Høyremeny for behandling uten kravgrunnlag laster...">
                    <Høyremeny fagsak={fagsak} behandling={behandling} />
                </Suspense>
            </StyledHøyremenyContainer>
        </>
    ) : erHistoriskeVerdier ? (
        <>
            <StyledMainContainer id="fagsak-main">
                <Suspense fallback="Historiske vurderinger laster...">
                    <HistoriskeVurderingermeny behandling={behandling} fagsak={fagsak} />
                </Suspense>
                <Routes>
                    <Route
                        path={BEHANDLING_KONTEKST_PATH + '/inaktiv-fakta'}
                        element={
                            <HistoriskFaktaProvider behandling={behandling}>
                                <Suspense fallback="Historisk fakta laster...">
                                    <HistoriskFaktaContainer
                                        behandling={behandling}
                                        fagsak={fagsak}
                                    />
                                </Suspense>
                            </HistoriskFaktaProvider>
                        }
                    />
                    <Route
                        path={BEHANDLING_KONTEKST_PATH + '/inaktiv-vilkaarsvurdering'}
                        element={
                            <HistoriskVilkårsvurderingProvider behandling={behandling}>
                                <Suspense fallback="Historisk vilkårsvurdering laster...">
                                    <HistoriskVilkårsvurderingContainer
                                        behandling={behandling}
                                        fagsak={fagsak}
                                    />
                                </Suspense>
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
                                <Suspense fallback="Fakta laster...">
                                    <FaktaContainer ytelse={fagsak.ytelsestype} />
                                </Suspense>
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
                                <Suspense fallback="Foreldelse laster...">
                                    <ForeldelseContainer behandling={behandling} />
                                </Suspense>
                            </FeilutbetalingForeldelseProvider>
                        }
                    />
                    <Route
                        path={BEHANDLING_KONTEKST_PATH + '/vilkaarsvurdering'}
                        element={
                            <VilkårsvurderingProvider behandling={behandling} fagsak={fagsak}>
                                <Suspense fallback="Vilkårsvurdering laster...">
                                    <VilkårsvurderingContainer
                                        behandling={behandling}
                                        fagsak={fagsak}
                                    />
                                </Suspense>
                            </VilkårsvurderingProvider>
                        }
                    />
                    <Route
                        path={BEHANDLING_KONTEKST_PATH + '/vedtak'}
                        element={
                            <FeilutbetalingVedtakProvider behandling={behandling} fagsak={fagsak}>
                                <Suspense fallback="Vedtak laster...">
                                    <VedtakContainer behandling={behandling} fagsak={fagsak} />
                                </Suspense>
                            </FeilutbetalingVedtakProvider>
                        }
                    />
                    <Route
                        path={BEHANDLING_KONTEKST_PATH + '/verge'}
                        element={
                            <VergeProvider behandling={behandling} fagsak={fagsak}>
                                <Suspense fallback="Verge laster...">
                                    <VergeContainer />
                                </Suspense>
                            </VergeProvider>
                        }
                    />
                    <Route
                        path={BEHANDLING_KONTEKST_PATH + '/brevmottakere'}
                        element={
                            <BrevmottakerProvider behandling={behandling} fagsak={fagsak}>
                                <Suspense fallback="Brevmottakere laster...">
                                    <BrevmottakerContainer />
                                </Suspense>
                            </BrevmottakerProvider>
                        }
                    />
                </Routes>
            </StyledMainContainer>
            <StyledHøyremenyContainer>
                <Suspense fallback="Høyremeny kravgrunnlag laster...">
                    <Høyremeny fagsak={fagsak} behandling={behandling} />
                </Suspense>
            </StyledHøyremenyContainer>
        </>
    ) : null;
};

export default BehandlingContainer;
