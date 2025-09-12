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
        <>
            {autentisert ? (
                <>
                    <Toasts />
                    <main>
                        <FTHeader innloggetSaksbehandler={innloggetSaksbehandler} />
                        <TogglesProvider>
                            <FagsakProvider>
                                <BehandlingProvider>
                                    <AppRoutes />
                                </BehandlingProvider>
                            </FagsakProvider>
                        </TogglesProvider>
                    </main>
                </>
            ) : (
                <UgyldigSesjon />
            )}
        </>
    );
};

const AppRoutes: React.FC = () => {
    const router = createBrowserRouter(
        createRoutesFromElements(
            <Route path="/" element={<UlagretDataModalContainer />}>
                <Route path="/fagsystem/:fagsystem/fagsak/:fagsakId/">
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
        )
    );

    return <RouterProvider router={router} />;
};

const UlagretDataModalContainer: React.FC = () => (
    <>
        <Outlet />
        <UlagretDataModal />
    </>
);

export default Container;
