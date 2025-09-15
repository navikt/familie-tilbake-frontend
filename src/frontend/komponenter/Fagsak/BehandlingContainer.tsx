import type { IBehandling } from '../../typer/behandling';
import type { IFagsak } from '../../typer/fagsak';

import { BodyShort } from '@navikt/ds-react';
import { ABorderDefault, ASpacing3 } from '@navikt/ds-tokens/dist/tokens';
import * as React from 'react';
import { Suspense } from 'react';
import { Route, Routes, useNavigate, useLocation } from 'react-router';
import { styled } from 'styled-components';

import { BrevmottakerProvider } from './Brevmottaker/BrevmottakerContext';
import { FaktaProvider } from './Fakta/FaktaContext';
import { HistoriskFaktaProvider } from './Fakta/FaktaPeriode/historikk/HistoriskFaktaContext';
import { ForeldelseProvider } from './Foreldelse/ForeldelseContext';
import { Stegflyt } from './Stegflyt/Stegflyt';
import { VedtakProvider } from './Vedtak/VedtakContext';
import { VergeProvider } from './Verge/VergeContext';
import { HistoriskVilkårsvurderingProvider } from './Vilkårsvurdering/historikk/HistoriskVilkårsvurderingContext';
import { VilkårsvurderingProvider } from './Vilkårsvurdering/VilkårsvurderingContext';
import { useBehandling } from '../../context/BehandlingContext';
import { Behandlingstatus } from '../../typer/behandling';
import { erHistoriskSide, erØnsketSideTilgjengelig, utledBehandlingSide } from '../../utils/sider';
import { lazyImportMedRetry } from '../Felleskomponenter/FeilInnlasting/FeilInnlasting';

const BrevmottakerContainer = lazyImportMedRetry(
    () => import('./Brevmottaker/BrevmottakerContainer'),
    'BrevmottakerContainer'
);
const FaktaContainer = lazyImportMedRetry(() => import('./Fakta/FaktaContainer'), 'FaktaContainer');
const HistoriskFaktaContainer = lazyImportMedRetry(
    () => import('./Fakta/FaktaPeriode/historikk/HistoriskFaktaContainer'),
    'HistoriskFaktaContainer'
);
const ForeldelseContainer = lazyImportMedRetry(
    () => import('./Foreldelse/ForeldelseContainer'),
    'ForeldelseContainer'
);
const VedtakContainer = lazyImportMedRetry(
    () => import('./Vedtak/VedtakContainer'),
    'VedtakContainer'
);
const VergeContainer = lazyImportMedRetry(() => import('./Verge/VergeContainer'), 'VergeContainer');
const VilkårsvurderingContainer = lazyImportMedRetry(
    () => import('./Vilkårsvurdering/VilkårsvurderingContainer'),
    'VilkårsvurderingContainer'
);
const HistoriskVilkårsvurderingContainer = lazyImportMedRetry(
    () => import('./Vilkårsvurdering/historikk/HistoriskVilkårsvurderingContainer'),
    'HistoriskVilkårsvurderingContainer'
);
const Høyremeny = lazyImportMedRetry(() => import('./Høyremeny/Høyremeny'), 'Høyremeny');
const HistoriskeVurderingermeny = lazyImportMedRetry(
    () => import('./HistoriskeVurderingermeny/HistoriskeVurderingermeny'),
    'HistoriskeVurderingermeny'
);

const BEHANDLING_KONTEKST_PATH = '/behandling/:behandlingId';

const StyledMainContainer = styled.main`
    flex: 1;
    overflow: auto;
`;

const HenlagtContainer = styled.div`
    padding: ${ASpacing3};
    text-align: center;
`;

const StyledHøyremenyContainer = styled.aside`
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
    const erØnsketSideLovlig =
        ønsketSide && erØnsketSideTilgjengelig(ønsketSide, behandling.behandlingsstegsinfo);
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
            <main
                className="flex-1 overflow-auto mt-4 [scrollbar-gutter:stable]"
                aria-label="Behandling innhold"
            >
                <nav aria-label="Behandlingssteg">
                    <Stegflyt />
                </nav>
                <section className="mx-6">
                    <Routes>
                        <Route
                            path={BEHANDLING_KONTEKST_PATH + '/fakta'}
                            element={
                                <FaktaProvider behandling={behandling} fagsak={fagsak}>
                                    <Suspense fallback="Fakta laster...">
                                        <FaktaContainer ytelse={fagsak.ytelsestype} />
                                    </Suspense>
                                </FaktaProvider>
                            }
                        />
                        <Route
                            path={BEHANDLING_KONTEKST_PATH + '/foreldelse'}
                            element={
                                <ForeldelseProvider behandling={behandling} fagsak={fagsak}>
                                    <Suspense fallback="Foreldelse laster...">
                                        <ForeldelseContainer behandling={behandling} />
                                    </Suspense>
                                </ForeldelseProvider>
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
                                <VedtakProvider behandling={behandling} fagsak={fagsak}>
                                    <Suspense fallback="Vedtak laster...">
                                        <VedtakContainer behandling={behandling} fagsak={fagsak} />
                                    </Suspense>
                                </VedtakProvider>
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
                </section>
            </main>
            <StyledHøyremenyContainer aria-label="Høyremeny med informasjon og handlinger for behandlingen">
                <Suspense fallback="Høyremeny kravgrunnlag laster...">
                    <Høyremeny fagsak={fagsak} behandling={behandling} />
                </Suspense>
            </StyledHøyremenyContainer>
        </>
    ) : null;
};

export default BehandlingContainer;
