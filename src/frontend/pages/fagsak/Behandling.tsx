import type { BehandlingsstegsinfoDto, VenteårsakEnum } from '~/generated';

import { SidebarRightIcon } from '@navikt/aksel-icons';
import { BodyShort, Button, LocalAlert } from '@navikt/ds-react';
import classNames from 'classnames';
import * as React from 'react';
import { Suspense, useEffect, useEffectEvent, useLayoutEffect, useRef, useState } from 'react';
import { Route, Routes, useLocation, useNavigate } from 'react-router';

import { useBehandling } from '~/context/BehandlingContext';
import { useBehandlingState } from '~/context/BehandlingStateContext';
import { useFagsak } from '~/context/FagsakContext';
import { ToggleName } from '~/context/toggles';
import { useToggles } from '~/context/TogglesContext';
import { ActionBar } from '~/komponenter/action-bar/ActionBar';
import { StegErrorBoundary } from '~/komponenter/error-boundary/StegErrorBoundary';
import { lazyImportMedRetry } from '~/komponenter/feilInnlasting/FeilInnlasting';
import { FixedAlert } from '~/komponenter/fixedAlert/FixedAlert';
import { PåVentModal } from '~/komponenter/modal/på-vent/PåVentModal';
import { SidebarSkeleton } from '~/komponenter/sidebar/SidebarSkeleton';
import { Stegflyt } from '~/komponenter/stegflyt/Stegflyt';
import { IkkeFunnet } from '~/pages/feilsider/IkkeFunnet';
import { useGlobalAlerts, useLukkGlobalAlert } from '~/stores/globalAlertStore';
import { venteårsaker } from '~/typer/behandling';
import { formatterDatostring } from '~/utils';
import {
    erHistoriskSide,
    erØnsketSideTilgjengelig,
    SYNLIGE_STEG,
    useStegNavigering,
    utledBehandlingSide,
} from '~/utils/sider';

import { BehandlingContainerSkeleton } from './BehandlingSkeleton';
import { Fakta } from './fakta/Fakta';
import { HistoriskFaktaProvider } from './fakta/fakta-periode/historikk/HistoriskFaktaContext';
import { FaktaProvider } from './fakta/FaktaContext';
import { FaktaSkeleton } from './fakta/FaktaSkeleton';
import { ForeldelseProvider } from './foreldelse/ForeldelseContext';
import { ForhåndsvarselSkeleton } from './forhåndsvarsel/ForhåndsvarselSkeleton';
import { VedtakProvider } from './vedtak/VedtakContext';
import { VedtakSkeleton } from './vedtak/VedtakSkeleton';
import { VergeProvider } from './verge/VergeContext';
import { HistoriskVilkårsvurderingProvider } from './vilkaarsvurdering/historikk/HistoriskVilkårsvurderingContext';
import { VilkårsvurderingProvider } from './vilkaarsvurdering/VilkårsvurderingContext';

const BrevmottakerContainer = lazyImportMedRetry(
    () => import('./brevmottaker/Brevmottakere'),
    'Brevmottakere'
);
const FaktaContainer = lazyImportMedRetry(() => import('./fakta/FaktaContainer'), 'FaktaContainer');
const HistoriskFaktaContainer = lazyImportMedRetry(
    () => import('./fakta/fakta-periode/historikk/HistoriskFaktaContainer'),
    'HistoriskFaktaContainer'
);
const Forhåndsvarsel = lazyImportMedRetry(
    () => import('./forhåndsvarsel/Forhåndsvarsel'),
    'Forhåndsvarsel'
);
const ForeldelseContainer = lazyImportMedRetry(
    () => import('./foreldelse/ForeldelseContainer'),
    'ForeldelseContainer'
);
const VedtakContainer = lazyImportMedRetry(
    () => import('./vedtak/VedtakContainer'),
    'VedtakContainer'
);
const Vedtak = lazyImportMedRetry(() => import('./vedtak/Vedtak'), 'Vedtak');
const VergeContainer = lazyImportMedRetry(() => import('./verge/VergeContainer'), 'VergeContainer');
const VilkårsvurderingContainer = lazyImportMedRetry(
    () => import('./vilkaarsvurdering/VilkårsvurderingContainer'),
    'VilkårsvurderingContainer'
);
const HistoriskVilkårsvurderingContainer = lazyImportMedRetry(
    () => import('./vilkaarsvurdering/historikk/HistoriskVilkårsvurderingContainer'),
    'HistoriskVilkårsvurderingContainer'
);
const Sidebar = lazyImportMedRetry(() => import('../../komponenter/sidebar/Sidebar'), 'Sidebar');
const HistoriskeVurderingermeny = lazyImportMedRetry(
    () => import('../../komponenter/historiske-vurderingermeny/HistoriskeVurderingermeny'),
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
            <Suspense fallback={<SidebarSkeleton />}>
                <Sidebar dialogRef={dialogRef} />
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
            <Route path="*" element={<IkkeFunnet />} />
        </Routes>
    </BehandlingLayout>
);

type AktivBehandlingProps = {
    dialogRef: React.RefObject<HTMLDialogElement | null>;
};

const AktivBehandling: React.FC<AktivBehandlingProps> = ({ dialogRef }) => {
    const behandling = useBehandling();
    const { toggles } = useToggles();
    const { ventegrunn, settInnholdsbredde } = useBehandlingState();
    const contentRef = useRef<HTMLElement>(null);

    useLayoutEffect(() => {
        const oppdaterBredde = (): void => {
            if (contentRef.current) {
                const rect = contentRef.current.getBoundingClientRect();
                settInnholdsbredde(rect.width);
            }
        };
        oppdaterBredde();
        window.addEventListener('resize', oppdaterBredde);
        return (): void => window.removeEventListener('resize', oppdaterBredde);
    }, [settInnholdsbredde]);

    return (
        <>
            <section
                /* Trekker fra høyde fra header (48), padding (16+16 + 16) og action baren (66), hvis det er vente grunn blir det ytterligere 62 */
                className={classNames(
                    'flex flex-col gap-4 flex-1 min-h-0 max-h-[calc(100vh-162px)]',
                    { 'max-h-[calc(100vh-224px)]': !!ventegrunn }
                )}
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
                    ref={contentRef}
                    className="py-4 border-ax-border-neutral-subtle border rounded-2xl px-6 bg-ax-bg-default scrollbar-stable overflow-x-hidden overflow-y-auto flex-1 min-h-0"
                    aria-label="Behandlingsinnhold"
                >
                    <Suspense fallback={<BehandlingContainerSkeleton />}>
                        <Routes>
                            <Route
                                path={BEHANDLING_KONTEKST_PATH + '/fakta'}
                                element={
                                    behandling.erNyModell ? (
                                        <StegErrorBoundary steg={SYNLIGE_STEG.FAKTA}>
                                            <Suspense fallback={<FaktaSkeleton />}>
                                                <Fakta />
                                            </Suspense>
                                        </StegErrorBoundary>
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
                                    <StegErrorBoundary steg={SYNLIGE_STEG.FORHÅNDSVARSEL}>
                                        <Suspense fallback={<ForhåndsvarselSkeleton />}>
                                            <Forhåndsvarsel />
                                        </Suspense>
                                    </StegErrorBoundary>
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
                                    behandling.erNyModell && toggles[ToggleName.Vedtaksbrev] ? (
                                        <StegErrorBoundary steg={SYNLIGE_STEG.FORESLÅ_VEDTAK}>
                                            <Suspense fallback={<VedtakSkeleton />}>
                                                <Vedtak />
                                            </Suspense>
                                        </StegErrorBoundary>
                                    ) : (
                                        <VedtakProvider>
                                            <VedtakContainer />
                                        </VedtakProvider>
                                    )
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
                            <Route path="*" element={<IkkeFunnet />} />
                        </Routes>
                    </Suspense>
                </section>
            </section>
            <Suspense fallback={<SidebarSkeleton />}>
                <Sidebar dialogRef={dialogRef} />
            </Suspense>
        </>
    );
};

const Behandling: React.FC = () => {
    const { fagsystem, eksternFagsakId } = useFagsak();
    const behandling = useBehandling();
    const { harKravgrunnlag, aktivtSteg } = useBehandlingState();
    const location = useLocation();
    const dialogRef = useRef<HTMLDialogElement>(null);
    const navigate = useNavigate();
    const navigerTilBehandling = useStegNavigering();
    const navigerTilVedtak = useStegNavigering('FORESLÅ_VEDTAK');

    const behandlingUrl = `/fagsystem/${fagsystem}/fagsak/${eksternFagsakId}/behandling/${behandling.eksternBrukId}`;
    const ønsketSide = location.pathname.split('/')[7];
    const erHistoriskeVerdier = erHistoriskSide(ønsketSide);
    const erØnsketSideGyldig =
        !!ønsketSide && erØnsketSideTilgjengelig(ønsketSide, behandling.behandlingsstegsinfo);

    const navigerHvisUgyldigSide = useEffectEvent(
        (erØnsketSideGyldig: boolean, aktivtSteg: BehandlingsstegsinfoDto | undefined) => {
            if (!erØnsketSideGyldig && aktivtSteg) {
                const aktivSide = utledBehandlingSide(aktivtSteg.behandlingssteg);
                if (aktivSide) {
                    navigate(`${behandlingUrl}/${aktivSide.href}`);
                }
            } else if (!erØnsketSideGyldig) {
                if (behandling.status === 'AVSLUTTET') {
                    navigerTilVedtak();
                } else {
                    navigerTilBehandling();
                }
            }
        }
    );

    useEffect(() => {
        navigerHvisUgyldigSide(erØnsketSideGyldig, aktivtSteg);
    }, [erØnsketSideGyldig, aktivtSteg]);

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

const venteBeskjed = (ventegrunn: BehandlingsstegsinfoDto): string => {
    return `Behandlingen er satt på vent: ${
        venteårsaker[ventegrunn.venteårsak as VenteårsakEnum]
    }. Tidsfrist: ${formatterDatostring(ventegrunn.tidsfrist as string)}`;
};

export const BehandlingContainer: React.FC = () => {
    const { ventegrunn, innholdsbredde } = useBehandlingState();
    const globalAlerts = useGlobalAlerts();
    const lukkGlobalAlert = useLukkGlobalAlert();
    const [visVenteModal, settVisVenteModal] = useState(false);

    return (
        <>
            {ventegrunn && (
                <LocalAlert status="announcement" className="w-full">
                    <LocalAlert.Content>{venteBeskjed(ventegrunn)}</LocalAlert.Content>
                </LocalAlert>
            )}
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

            {globalAlerts.map((alert, index) => (
                <FixedAlert
                    key={alert.id}
                    aria-live="polite"
                    status={alert.status}
                    title={alert.title}
                    width={innholdsbredde}
                    stackIndex={index}
                    onClose={() => lukkGlobalAlert(alert.id)}
                >
                    {alert.message}
                </FixedAlert>
            ))}
        </>
    );
};
