import * as React from 'react';
import { lazy, Suspense } from 'react';
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
import FTHeader from './Felleskomponenter/FTHeader/FTHeader';
import UgyldigSesjon from './Felleskomponenter/Modal/SesjonUtløpt';
import UlagretDataModal from './Felleskomponenter/Modal/UlagretDataModal';
import Toasts from './Felleskomponenter/Toast/Toasts';

const Dashboard = lazy(() => import('./Felleskomponenter/Dashboard'));
const FagsakContainer = lazy(() => import('./Fagsak/FagsakContainer'));
const Feilmelding = lazy(() => import('./Felleskomponenter/Feilmelding'));

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

const AppRoutes = () => {
    const router = createBrowserRouter(
        createRoutesFromElements(
            <Route path="/" element={<UlagretDataModalContainer />}>
                <Route path="/fagsystem/:fagsystem/fagsak/:fagsakId/">
                    <Route
                        path="*"
                        element={
                            <Suspense fallback={<div>Fagsak-container laster...</div>}>
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
                            <Feilmelding />
                        </Suspense>
                    }
                />
            </Route>
        )
    );

    return <RouterProvider router={router} />;
};

const UlagretDataModalContainer = () => (
    <>
        <Outlet />
        <UlagretDataModal />
    </>
);

export default Container;
