import type { FC } from 'react';
import type { Saksbehandler } from './typer/saksbehandler';

import { Heading, Loader } from '@navikt/ds-react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Suspense, useEffect, useState } from 'react';
import {
    createBrowserRouter,
    createRoutesFromElements,
    Outlet,
    Route,
    RouterProvider,
} from 'react-router';

import { hentInnloggetBruker } from './api/saksbehandler';
import { AppProvider, useApp } from './context/AppContext';
import { FagsakProvider } from './context/FagsakContext';
import { ThemeProvider } from './context/ThemeContext';
import { TogglesProvider } from './context/TogglesContext';
import { ErrorBoundary } from './komponenter/error-boundary/ErrorBoundary';
import { FagsakErrorBoundary } from './komponenter/error-boundary/FagsakErrorBoundary';
import { lazyImportMedRetry } from './komponenter/feilInnlasting/FeilInnlasting';
import { Header } from './komponenter/header/Header';
import { Toasts } from './komponenter/toast/Toasts';
import { BehandlingSkeleton } from './pages/fagsak/BehandlingSkeleton';
import { IkkeFunnet } from './pages/feilsider/IkkeFunnet';
import { IkkeTilgang } from './pages/feilsider/ikke-tilgang';
import { configureZod } from './utils/zodConfig';

const Landingsside = lazyImportMedRetry(() => import('./pages/Landingsside'), 'Landingsside');
const FagsakContainer = lazyImportMedRetry(
    () => import('./pages/fagsak/Fagsak'),
    'FagsakContainer'
);

const SideLaster: FC = () => (
    <div className="flex items-center justify-center h-screen">
        <Heading size="medium" visuallyHidden>
            Laster inn siden
        </Heading>
        <Loader size="2xlarge" title="Laster inn siden" variant="neutral" />
    </div>
);

const AppLayout: FC = () => {
    const { autentisert } = useApp();

    if (!autentisert) {
        return <IkkeTilgang />;
    }

    return (
        <>
            <Toasts />
            <Header />
            <Suspense fallback={<SideLaster />}>
                <Outlet />
            </Suspense>
        </>
    );
};

const FagsakProvidersWrapper: FC = () => (
    <Suspense fallback={<BehandlingSkeleton />}>
        <FagsakErrorBoundary>
            <FagsakProvider>
                <Outlet />
            </FagsakProvider>
        </FagsakErrorBoundary>
    </Suspense>
);

const router = createBrowserRouter(
    createRoutesFromElements(
        <Route element={<AppLayout />}>
            <Route
                element={
                    <TogglesProvider>
                        <Outlet />
                    </TogglesProvider>
                }
            >
                <Route path="/" element={<Landingsside />} />
                <Route
                    path="/fagsystem/:fagsystem/fagsak/:fagsakId/"
                    element={<FagsakProvidersWrapper />}
                >
                    <Route path="*" element={<FagsakContainer />} />
                </Route>
                <Route path="*" element={<IkkeFunnet />} />
            </Route>
        </Route>
    )
);

export const App: FC = () => {
    const [autentisertSaksbehandler, setAutentisertSaksbehandler] = useState<
        Saksbehandler | undefined
    >(undefined);
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: 5 * 60 * 1000, // 5 minutter
            },
        },
    });

    configureZod();

    useEffect(() => {
        hentInnloggetBruker().then((innhentetInnloggetSaksbehandler: Saksbehandler) => {
            setAutentisertSaksbehandler(innhentetInnloggetSaksbehandler);
        });
    }, []);

    return (
        <QueryClientProvider client={queryClient}>
            <ErrorBoundary autentisertSaksbehandler={autentisertSaksbehandler}>
                <AppProvider autentisertSaksbehandler={autentisertSaksbehandler}>
                    <ThemeProvider>
                        <main aria-label="Hovedinnhold">
                            <RouterProvider router={router} />
                        </main>
                    </ThemeProvider>
                </AppProvider>
            </ErrorBoundary>
        </QueryClientProvider>
    );
};
