import type { Behandlingsstegstilstand, Venteårsak } from '../../typer/behandling';

import { SidebarRightIcon } from '@navikt/aksel-icons';
import { BodyShort, Button } from '@navikt/ds-react';
import classNames from 'classnames';
import * as React from 'react';
import { Suspense, useEffect, useRef, useState } from 'react';
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
import { useBehandlingState } from '../../context/BehandlingStateContext';
import { useFagsak } from '../../context/FagsakContext';
import { Behandlingstatus, venteårsaker } from '../../typer/behandling';
import { formatterDatostring } from '../../utils';
import { erHistoriskSide, erØnsketSideTilgjengelig, utledBehandlingSide } from '../../utils/sider';
import { FTAlertStripe } from '../Felleskomponenter/Flytelementer';
import PåVentModal from '../Felleskomponenter/Modal/PåVent/PåVentModal';

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

type BehandlingLayoutProps = {
    children: React.ReactNode;
    visHøyremeny?: boolean;
    dialogRef: React.RefObject<HTMLDialogElement | null>;
};

const BehandlingLayout: React.FC<BehandlingLayoutProps> = ({
    children,
    visHøyremeny = true,
    dialogRef,
}) => (
    <>
        <div className="flex-1 overflow-auto">{children}</div>
        {visHøyremeny && (
            <Suspense fallback={<HøyremenySkeleton />}>
                <Høyremeny dialogRef={dialogRef} />
            </Suspense>
        )}
    </>
);

type HenlagtBehandlingProps = {
    dialogRef: React.RefObject<HTMLDialogElement | null>;
};

const HenlagtBehandling: React.FC<HenlagtBehandlingProps> = ({ dialogRef }) => (
    <BehandlingLayout dialogRef={dialogRef}>
        <section className="px-6 text-center" aria-label="Behandlingen er henlagt">
            <BodyShort size="small">Behandlingen er henlagt</BodyShort>
        </section>
    </BehandlingLayout>
);

type VenterPåKravgrunnlagBehandlingProps = {
    dialogRef: React.RefObject<HTMLDialogElement | null>;
};

const VenterPåKravgrunnlagBehandling: React.FC<VenterPåKravgrunnlagBehandlingProps> = ({
    dialogRef,
}) => (
    <BehandlingLayout dialogRef={dialogRef}>
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
    </BehandlingLayout>
);

type HistoriskBehandlingProps = {
    dialogRef: React.RefObject<HTMLDialogElement | null>;
};

const HistoriskBehandling: React.FC<HistoriskBehandlingProps> = ({ dialogRef }) => (
    <BehandlingLayout dialogRef={dialogRef} visHøyremeny={false}>
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
    </BehandlingLayout>
);

type AktivBehandlingProps = {
    dialogRef: React.RefObject<HTMLDialogElement | null>;
};

const AktivBehandling: React.FC<AktivBehandlingProps> = ({ dialogRef }) => {
    const behandling = useBehandling();

    return (
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
                        onClick={() => dialogRef.current?.showModal()}
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
                                        <Fakta />
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
                <Høyremeny dialogRef={dialogRef} />
            </Suspense>
        </>
    );
};

const Behandling: React.FC = () => {
    const behandling = useBehandling();
    const { harKravgrunnlag, aktivtSteg } = useBehandlingState();
    const { fagsystem, eksternFagsakId } = useFagsak();
    const navigate = useNavigate();
    const location = useLocation();
    const dialogRef = useRef<HTMLDialogElement>(null);

    const ønsketSide = location.pathname.split('/')[7];
    const erHistoriskeVerdier = erHistoriskSide(ønsketSide);
    const erØnsketSideLovlig =
        ønsketSide && erØnsketSideTilgjengelig(ønsketSide, behandling.behandlingsstegsinfo);
    const behandlingUrl = `/fagsystem/${fagsystem}/fagsak/${eksternFagsakId}/behandling/${behandling.eksternBrukId}`;

    useEffect(() => {
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

    if (behandling.erBehandlingHenlagt) {
        return <HenlagtBehandling dialogRef={dialogRef} />;
    }

    if (!harKravgrunnlag) {
        return <VenterPåKravgrunnlagBehandling dialogRef={dialogRef} />;
    }

    if (erHistoriskeVerdier) {
        return <HistoriskBehandling dialogRef={dialogRef} />;
    }

    return <AktivBehandling dialogRef={dialogRef} />;
};

const venteBeskjed = (ventegrunn: Behandlingsstegstilstand): string => {
    return `Behandlingen er satt på vent: ${
        venteårsaker[ventegrunn.venteårsak as Venteårsak]
    }. Tidsfrist: ${formatterDatostring(ventegrunn.tidsfrist as string)}`;
};

const BehandlingContainer: React.FC = () => {
    const { ventegrunn } = useBehandlingState();
    const [visVenteModal, settVisVenteModal] = useState(false);

    return (
        <>
            {ventegrunn && <FTAlertStripe variant="info">{venteBeskjed(ventegrunn)}</FTAlertStripe>}
            {ventegrunn && !visVenteModal && (
                <PåVentModal ventegrunn={ventegrunn} onClose={() => settVisVenteModal(true)} />
            )}
            <div
                className={classNames(
                    'grid grid-cols-1 ax-lg:grid-cols-[2fr_1fr] gap-4 p-4 bg-ax-neutral-100 min-h-screen',
                    {
                        venter: !!ventegrunn,
                    }
                )}
            >
                <Behandling />
            </div>
        </>
    );
};

export default BehandlingContainer;
