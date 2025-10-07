import type { Behandling } from '../../typer/behandling';
import type { Fagsak } from '../../typer/fagsak';

import { BodyShort } from '@navikt/ds-react';
import { ASpacing3 } from '@navikt/ds-tokens/dist/tokens';
import * as React from 'react';
import { Suspense } from 'react';
import { Route, Routes, useNavigate, useLocation } from 'react-router';
import { styled } from 'styled-components';

import { BehandlingContainerSkeleton } from './BehandlingContainerSkeleton';
import { FaktaProvider } from './Fakta/FaktaContext';
import { HistoriskFaktaProvider } from './Fakta/FaktaPeriode/historikk/HistoriskFaktaContext';
import { ForeldelseProvider } from './Foreldelse/ForeldelseContext';
import { Forhåndsvarsel } from './Forhåndsvarsel/Forhåndsvarsel';
import { Stegflyt } from './Stegflyt/Stegflyt';
import { VedtakProvider } from './Vedtak/VedtakContext';
import { VergeProvider } from './Verge/VergeContext';
import { HistoriskVilkårsvurderingProvider } from './Vilkårsvurdering/historikk/HistoriskVilkårsvurderingContext';
import { VilkårsvurderingProvider } from './Vilkårsvurdering/VilkårsvurderingContext';
import { useBehandling } from '../../context/BehandlingContext';
import { ToggleName } from '../../context/toggles';
import { useToggles } from '../../context/TogglesContext';
import { Behandlingstatus } from '../../typer/behandling';
import { erHistoriskSide, erØnsketSideTilgjengelig, utledBehandlingSide } from '../../utils/sider';
import { lazyImportMedRetry } from '../Felleskomponenter/FeilInnlasting/FeilInnlasting';

const BrevmottakerContainer = lazyImportMedRetry(
    () => import('./Brevmottaker/Brevmottakere'),
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

const HenlagtContainer = styled.div`
    padding: ${ASpacing3};
    text-align: center;
`;

type Props = {
    fagsak: Fagsak;
    behandling: Behandling;
};

const BehandlingContainer: React.FC<Props> = ({ fagsak, behandling }) => {
    const { visVenteModal, harKravgrunnlag, aktivtSteg } = useBehandling();
    const navigate = useNavigate();
    const location = useLocation();
    const { toggles } = useToggles();

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
            <div className="flex-1 overflow-auto">
                <HenlagtContainer>
                    <BodyShort size="small">Behandlingen er henlagt</BodyShort>
                </HenlagtContainer>
            </div>

            <Høyremeny fagsak={fagsak} behandling={behandling} />
        </>
    ) : !harKravgrunnlag ? (
        <>
            <div className="flex-1 overflow-auto" />
            <Høyremeny fagsak={fagsak} behandling={behandling} />
        </>
    ) : erHistoriskeVerdier ? (
        <>
            <div className="flex-1 overflow-auto">
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
            </div>
        </>
    ) : harKravgrunnlag ? (
        <>
            <section
                className="flex flex-col gap-4 flex-1 min-h-0"
                aria-label="Oversikt over behandlingen, steg, innhold og handlingsmeny"
            >
                <Stegflyt />
                <section
                    className="py-4 border-border-divider border-1 rounded-2xl px-6 bg-white scrollbar-stable overflow-x-hidden overflow-y-auto flex-1 min-h-0"
                    aria-label="Behandlingsinnhold"
                >
                    <Suspense fallback={<BehandlingContainerSkeleton />}>
                        <Routes>
                            <Route
                                path={BEHANDLING_KONTEKST_PATH + '/fakta'}
                                element={
                                    <FaktaProvider behandling={behandling} fagsak={fagsak}>
                                        <FaktaContainer ytelse={fagsak.ytelsestype} />
                                    </FaktaProvider>
                                }
                            />
                            {/* TODO: Rydde opp etter feature toggle */}
                            {toggles[ToggleName.Forhåndsvarselsteg] && (
                                <Route
                                    path={BEHANDLING_KONTEKST_PATH + '/forhaandsvarsel'}
                                    element={
                                        <Suspense fallback="Fakta laster...">
                                            <Forhåndsvarsel />
                                        </Suspense>
                                    }
                                />
                            )}
                            {/* ... */}
                            <Route
                                path={BEHANDLING_KONTEKST_PATH + '/foreldelse'}
                                element={
                                    <ForeldelseProvider behandling={behandling} fagsak={fagsak}>
                                        <ForeldelseContainer behandling={behandling} />
                                    </ForeldelseProvider>
                                }
                            />
                            <Route
                                path={BEHANDLING_KONTEKST_PATH + '/vilkaarsvurdering'}
                                element={
                                    <VilkårsvurderingProvider
                                        behandling={behandling}
                                        fagsak={fagsak}
                                    >
                                        <VilkårsvurderingContainer
                                            behandling={behandling}
                                            fagsak={fagsak}
                                        />
                                    </VilkårsvurderingProvider>
                                }
                            />
                            <Route
                                path={BEHANDLING_KONTEKST_PATH + '/vedtak'}
                                element={
                                    <VedtakProvider behandling={behandling} fagsak={fagsak}>
                                        <VedtakContainer behandling={behandling} fagsak={fagsak} />
                                    </VedtakProvider>
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
                                    <BrevmottakerContainer
                                        fagsak={fagsak}
                                        behandling={behandling}
                                    />
                                }
                            />
                        </Routes>
                    </Suspense>
                </section>
            </section>

            <Høyremeny fagsak={fagsak} behandling={behandling} />
        </>
    ) : null;
};

export default BehandlingContainer;
