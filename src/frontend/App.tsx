import type { Saksbehandler } from './typer/saksbehandler';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as React from 'react';
import { Suspense, useEffect, useState } from 'react';
import {
    createBrowserRouter,
    createRoutesFromElements,
    RouterProvider,
    Route,
    Outlet,
} from 'react-router';

import { hentInnloggetBruker } from './api/saksbehandler';
import { AppProvider, useApp } from './context/AppContext';
import { FagsakProvider } from './context/FagsakContext';
import { ThemeProvider } from './context/ThemeContext';
import { TogglesProvider } from './context/TogglesContext';
import { Spinner } from './komponenter/datalast/Spinner';
import { ErrorBoundary } from './komponenter/error-boundary/ErrorBoundary';
import { FagsakErrorBoundary } from './komponenter/error-boundary/FagsakErrorBoundary';
import { lazyImportMedRetry } from './komponenter/feilInnlasting/FeilInnlasting';
import { Header } from './komponenter/header/Header';
import { StegflytSkeleton } from './komponenter/stegflyt/StegflytSkeleton';
import { Toasts } from './komponenter/toast/Toasts';
import { IkkeFunnet } from './pages/feilsider/ikke-funnet';
import { IkkeTilgang } from './pages/feilsider/ikke-tilgang';
import { configureZod } from './utils/zodConfig';

const Dashboard = lazyImportMedRetry(() => import('./pages/dashboard'), 'Dashboard');
const FagsakContainer = lazyImportMedRetry(
    () => import('./pages/fagsak/Fagsak'),
    'FagsakContainer'
);

const AppLayout: React.FC = () => {
    const { autentisert } = useApp();

    if (!autentisert) {
        return <IkkeTilgang />;
    }

    return (
        <>
            <Toasts />
            <Header />
            <Outlet />
        </>
    );
};

const FagsakProvidersWrapper: React.FC = () => (
    <Suspense fallback={<Spinner type="fagsak" />}>
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
                <Route
                    path="/"
                    element={
                        <Suspense fallback={<div>Dashboard laster...</div>}>
                            <Dashboard />
                        </Suspense>
                    }
                />
                <Route
                    path="/fagsystem/:fagsystem/fagsak/:fagsakId/"
                    element={<FagsakProvidersWrapper />}
                >
                    <Route
                        path="*"
                        element={
                            <Suspense fallback={<StegflytSkeleton />}>
                                <FagsakContainer />
                            </Suspense>
                        }
                    />
                </Route>
            </Route>
            <Route path="*" element={<IkkeFunnet />} />
        </Route>
    )
);

export const App: React.FC = () => {
    const [autentisertSaksbehandler, settAutentisertSaksbehandler] = useState<
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
            settAutentisertSaksbehandler(innhentetInnloggetSaksbehandler);
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
