import { SidebarRightIcon } from '@navikt/aksel-icons';
import { BodyShort, Button } from '@navikt/ds-react';
import * as React from 'react';
import { Suspense, useRef } from 'react';
import { Route, Routes, useLocation, useNavigate } from 'react-router';

import { ActionBar } from './ActionBar/ActionBar';
import { BehandlingContainerSkeleton } from './BehandlingContainerSkeleton';
import { Fakta } from './Fakta/Fakta';
import { FaktaProvider } from './Fakta/FaktaContext';
import { lazyImportMedRetry } from '../Felleskomponenter/FeilInnlasting/FeilInnlasting';
import { HistoriskFaktaProvider } from './Fakta/FaktaPeriode/historikk/HistoriskFaktaContext';
import { ForeldelseProvider } from './Foreldelse/ForeldelseContext';
import { Forhåndsvarsel } from './Forhåndsvarsel/Forhåndsvarsel';
import { HøyremenySkeleton } from './Høyremeny/HøyremenySkeleton';
import { Stegflyt } from './Stegflyt/Stegflyt';
import { VedtakProvider } from './Vedtak/VedtakContext';
import { VergeProvider } from './Verge/VergeContext';
import { HistoriskVilkårsvurderingProvider } from './Vilkårsvurdering/historikk/HistoriskVilkårsvurderingContext';
import { VilkårsvurderingProvider } from './Vilkårsvurdering/VilkårsvurderingContext';
import { useBehandling } from '../../context/BehandlingContext';
import { useFagsak } from '../../context/FagsakContext';
import { Behandlingstatus } from '../../typer/behandling';
import { erHistoriskSide, erØnsketSideTilgjengelig, utledBehandlingSide } from '../../utils/sider';

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

const BehandlingContainer: React.FC = () => {
    const { behandling, harKravgrunnlag, aktivtSteg } = useBehandling();
    const { fagsystem, eksternFagsakId } = useFagsak();
    const navigate = useNavigate();
    const location = useLocation();
    const ref = useRef<HTMLDialogElement>(null);

    const ønsketSide = location.pathname.split('/')[7];
    const erHistoriskeVerdier = erHistoriskSide(ønsketSide);
    const erØnsketSideLovlig =
        ønsketSide && erØnsketSideTilgjengelig(ønsketSide, behandling.behandlingsstegsinfo);
    const behandlingUrl = `/fagsystem/${fagsystem}/fagsak/${eksternFagsakId}/behandling/${behandling.eksternBrukId}`;

    React.useEffect(() => {
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [aktivtSteg, ønsketSide]);

    return behandling.erBehandlingHenlagt ? (
        <>
            <div className="flex-1 overflow-auto">
                <section className="px-6 text-center" aria-label="Behandlingen er henlagt">
                    <BodyShort size="small">Behandlingen er henlagt</BodyShort>
                </section>
            </div>

            <Høyremeny dialogRef={ref} />
        </>
    ) : !harKravgrunnlag ? (
        <>
            <div className="flex-1 overflow-auto">
                <section className="px-6 text-center" aria-label="Venter på kravgrunnlag">
                    <ActionBar
                        stegtekst="På vent"
                        skjulNeste
                        forrigeAriaLabel={undefined}
                        nesteAriaLabel="Neste"
                        onNeste={() => null}
                        onForrige={undefined}
                    />
                </section>
            </div>

            <Høyremeny dialogRef={ref} />
        </>
    ) : erHistoriskeVerdier ? (
        <div className="flex-1 overflow-auto">
            <Suspense fallback="Historiske vurderinger laster...">
                <HistoriskeVurderingermeny />
            </Suspense>
            <Routes>
                <Route
                    path={BEHANDLING_KONTEKST_PATH + '/inaktiv-fakta'}
                    element={
                        <HistoriskFaktaProvider>
                            <Suspense fallback="Historisk fakta laster...">
                                <HistoriskFaktaContainer />
                            </Suspense>
                        </HistoriskFaktaProvider>
                    }
                />
                <Route
                    path={BEHANDLING_KONTEKST_PATH + '/inaktiv-vilkaarsvurdering'}
                    element={
                        <HistoriskVilkårsvurderingProvider>
                            <Suspense fallback="Historisk vilkårsvurdering laster...">
                                <HistoriskVilkårsvurderingContainer />
                            </Suspense>
                        </HistoriskVilkårsvurderingProvider>
                    }
                />
                <Route path={BEHANDLING_KONTEKST_PATH + '/inaktiv'} element={<></>} />
            </Routes>
        </div>
    ) : harKravgrunnlag ? (
        <>
            <section
                /* Trekker fra høyde fra header (48), padding (16+16 + 16) og action baren (66) */
                className="flex flex-col gap-4 flex-1 min-h-0 max-h-[calc(100vh-162px)]"
                aria-label="Oversikt over behandlingen, steg, innhold og handlingsmeny"
            >
                <div className="flex flex-row gap-2 ax-lg:block justify-between">
                    <Stegflyt />
                    <Button
                        variant="tertiary"
                        icon={
                            <SidebarRightIcon title="Åpne informasjonspanelet" fontSize="1.5rem" />
                        }
                        className="lg:hidden"
                        onClick={() => ref.current?.showModal()}
                    >
                        Åpne
                    </Button>
                </div>
                <section
                    className="py-4 border-ax-border-neutral-subtle border rounded-2xl px-6 bg-ax-bg-default scrollbar-stable overflow-x-hidden overflow-y-auto flex-1 min-h-0"
                    aria-label="Behandlingsinnhold"
                >
                    <Suspense fallback={<BehandlingContainerSkeleton />}>
                        <Routes>
                            <Route
                                path={BEHANDLING_KONTEKST_PATH + '/fakta'}
                                element={
                                    behandling.erNyModell ? (
                                        <Fakta
                                            behandlingId={behandling.behandlingId}
                                            behandlingUrl={behandlingUrl}
                                        />
                                    ) : (
                                        <FaktaProvider>
                                            <FaktaContainer />
                                        </FaktaProvider>
                                    )
                                }
                            />
                            <Route
                                path={BEHANDLING_KONTEKST_PATH + '/forhaandsvarsel'}
                                element={
                                    <Suspense fallback="Forhåndsvarsel laster...">
                                        <Forhåndsvarsel />
                                    </Suspense>
                                }
                            />
                            <Route
                                path={BEHANDLING_KONTEKST_PATH + '/foreldelse'}
                                element={
                                    <ForeldelseProvider>
                                        <ForeldelseContainer />
                                    </ForeldelseProvider>
                                }
                            />
                            <Route
                                path={BEHANDLING_KONTEKST_PATH + '/vilkaarsvurdering'}
                                element={
                                    <VilkårsvurderingProvider>
                                        <VilkårsvurderingContainer />
                                    </VilkårsvurderingProvider>
                                }
                            />
                            <Route
                                path={BEHANDLING_KONTEKST_PATH + '/vedtak'}
                                element={
                                    <VedtakProvider>
                                        <VedtakContainer />
                                    </VedtakProvider>
                                }
                            />
                            <Route
                                path={BEHANDLING_KONTEKST_PATH + '/verge'}
                                element={
                                    <VergeProvider>
                                        <VergeContainer />
                                    </VergeProvider>
                                }
                            />
                            <Route
                                path={BEHANDLING_KONTEKST_PATH + '/brevmottakere'}
                                element={<BrevmottakerContainer />}
                            />
                        </Routes>
                    </Suspense>
                </section>
            </section>
            <Suspense fallback={<HøyremenySkeleton />}>
                <Høyremeny dialogRef={ref} />
            </Suspense>
        </>
    ) : null;
};

export default BehandlingContainer;
