import * as React from 'react';
import { Suspense } from 'react';
import {
    createBrowserRouter,
    createRoutesFromElements,
    RouterProvider,
    Route,
    Outlet,
} from 'react-router';

import { useApp } from '../context/AppContext';
import { BehandlingProvider } from '../context/BehandlingContext';
import { FagsakProvider } from '../context/FagsakContext';
import { TogglesProvider } from '../context/TogglesContext';
import { StegflytSkeleton } from './Fagsak/Stegflyt/StegflytSkeleton';
import { FagsakLoadingSkeleton } from './Felleskomponenter/Datalast/FagsakLoadingSkeleton';
import FagsakErrorBoundary from './Felleskomponenter/ErrorBoundary/FagsakErrorBoundary';
import { lazyImportMedRetry } from './Felleskomponenter/FeilInnlasting/FeilInnlasting';
import { FTHeader } from './Felleskomponenter/FTHeader/FTHeader';
import UgyldigSesjon from './Felleskomponenter/Modal/SesjonUtløpt';
import UlagretDataModal from './Felleskomponenter/Modal/UlagretDataModal';
import Toasts from './Felleskomponenter/Toast/Toasts';

const Dashboard = lazyImportMedRetry(() => import('../pages/Dashboard'), 'Dashboard');
const FagsakContainer = lazyImportMedRetry(
    () => import('./Fagsak/FagsakContainer'),
    'FagsakContainer'
);
const IkkeFunnet = lazyImportMedRetry(() => import('../pages/feilsider/IkkeFunnet'), 'IkkeFunnet');

const Container: React.FC = () => {
    const { autentisert, innloggetSaksbehandler } = useApp();

    return (
        <main aria-label="Hovedinnhold">
            {autentisert ? (
                <>
                    <Toasts />
                    <FTHeader innloggetSaksbehandler={innloggetSaksbehandler} />

                    <AppRoutes />
                </>
            ) : (
                <UgyldigSesjon />
            )}
        </main>
    );
};

const AppRoutes: React.FC = () => {
    const router = createBrowserRouter(
        createRoutesFromElements(
            <>
                <Route
                    path="/"
                    element={
                        <TogglesProvider>
                            <Outlet />
                        </TogglesProvider>
                    }
                >
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
                    <Route
                        path="/"
                        element={
                            <Suspense fallback={<div>Dashboard laster...</div>}>
                                <Dashboard />
                            </Suspense>
                        }
                    />
                    <Route
                        path="/*"
                        element={
                            <Suspense fallback={<div>Feilmelding laster...</div>}>
                                <IkkeFunnet />
                            </Suspense>
                        }
                    />
                </Route>
            </>
        )
    );

    return <RouterProvider router={router} />;
};

const FagsakProvidersWrapper: React.FC = () => (
    <Suspense fallback={<FagsakLoadingSkeleton />}>
        <FagsakErrorBoundary>
            <FagsakProvider>
                <BehandlingProvider>
                    <Outlet />
                    <UlagretDataModal />
                </BehandlingProvider>
            </FagsakProvider>
        </FagsakErrorBoundary>
    </Suspense>
);

export default Container;
