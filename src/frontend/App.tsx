import type { FC, ReactNode } from 'react';

import { Heading, Loader } from '@navikt/ds-react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Suspense } from 'react';
import { createBrowserRouter, Outlet, RouterProvider } from 'react-router';

import { AppProvider, useApp } from './context/AppContext';
import { ThemeProvider } from './context/ThemeContext';
import { TogglesProvider } from './context/TogglesContext';
import { ErrorBoundary } from './komponenter/error-boundary/ErrorBoundary';
import { lazyImportMedRetry } from './komponenter/feilInnlasting/FeilInnlasting';
import { Header } from './komponenter/header/Header';
import { Toasts } from './komponenter/toast/Toasts';
import { IkkeFunnet } from './pages/feilsider/IkkeFunnet';
import { Serverfeil } from './pages/feilsider/serverfeil';
import { Uautorisert } from './pages/feilsider/Uautorisert';

const Landingsside = lazyImportMedRetry(() => import('./pages/Landingsside'), 'Landingsside');
const FagsakSide = lazyImportMedRetry(() => import('./pages/fagsak/Fagsak'), 'FagsakSide');
const BehandlingSide = lazyImportMedRetry(() => import('./pages/fagsak/Fagsak'), 'BehandlingSide');

const SideLaster: FC = () => (
    <div className="flex items-center justify-center h-screen">
        <Heading size="medium" visuallyHidden>
            Laster inn siden
        </Heading>
        <Loader size="2xlarge" title="Laster inn siden" variant="neutral" />
    </div>
);

const AppLayout: FC = () => {
    const { innloggingsstatus } = useApp();

    switch (innloggingsstatus.status) {
        case 'laster':
            return <SideLaster />;
        case 'feilet':
            return innloggingsstatus.httpStatus === 401 ? (
                <Uautorisert />
            ) : (
                <Serverfeil httpStatus={innloggingsstatus.httpStatus} />
            );
        case 'innlogget':
            return (
                <>
                    <Toasts />
                    <Header />
                    <Suspense fallback={<SideLaster />}>
                        <Outlet />
                    </Suspense>
                </>
            );
    }
};

const TogglesLayout: FC = () => (
    <TogglesProvider>
        <Outlet />
    </TogglesProvider>
);

const router = createBrowserRouter([
    {
        element: <AppLayout />,
        children: [
            {
                element: <TogglesLayout />,
                children: [
                    { path: '/', element: <Landingsside /> },
                    {
                        path: '/fagsystem/:fagsystem/fagsak/:fagsakId',
                        element: <FagsakSide />,
                        children: [
                            {
                                path: 'behandling/:eksternBrukId/*',
                                element: <BehandlingSide />,
                            },
                        ],
                    },
                    { path: '*', element: <IkkeFunnet /> },
                ],
            },
        ],
    },
]);

/*
 * Ligger inne i AppProvider for å kunne lese innlogget saksbehandler fra context.
 * Uten den havner alle Sentry-feil på "Ukjent bruker".
 */
const ErrorBoundaryMedBruker: FC<{ children: ReactNode }> = ({
    children,
}: {
    children: ReactNode;
}) => {
    const { innloggetSaksbehandler } = useApp();

    return (
        <ErrorBoundary autentisertSaksbehandler={innloggetSaksbehandler}>{children}</ErrorBoundary>
    );
};

export const App: FC = () => {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: 5 * 60 * 1000, // 5 minutter
            },
        },
    });

    return (
        <QueryClientProvider client={queryClient}>
            <AppProvider>
                <ErrorBoundaryMedBruker>
                    <ThemeProvider>
                        <main aria-label="Hovedinnhold">
                            <RouterProvider router={router} />
                        </main>
                    </ThemeProvider>
                </ErrorBoundaryMedBruker>
            </AppProvider>
        </QueryClientProvider>
    );
};
