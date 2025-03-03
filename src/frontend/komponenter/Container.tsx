import * as React from 'react';
import { lazy } from 'react';
import {
    createBrowserRouter,
    createRoutesFromElements,
    RouterProvider,
    Route,
} from 'react-router-dom';

import { useApp } from '../context/AppContext';
import { BehandlingProvider } from '../context/BehandlingContext';
import { FagsakProvider } from '../context/FagsakContext';
import { TogglesProvider } from '../context/TogglesContext';
import FTHeader from './Felleskomponenter/FTHeader/FTHeader';
import UgyldigSesjon from './Felleskomponenter/Modal/SesjonUtløpt';
import UlagretDataModal from './Felleskomponenter/Modal/UlagretDataModal';
import Toasts from './Felleskomponenter/Toast/Toasts';

// Lazy load main components
const Dashboard = lazy(() => import('./Felleskomponenter/Dashboard'));
const FagsakContainer = lazy(() => import('./Fagsak/FagsakContainer'));
const Feilmelding = lazy(() => import('./Felleskomponenter/Feilmelding'));

// Loading component
const Suspense = ({ children }: { children: React.ReactNode }) => (
    <React.Suspense fallback={<div>Laster...</div>}>{children}</React.Suspense>
);

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
            <Route path="/" element={<UlagretDataModal />}>
                <Route
                    path="/fagsystem/:fagsystem/fagsak/:fagsakId/*"
                    element={
                        <Suspense>
                            <FagsakContainer />
                        </Suspense>
                    }
                />
                <Route
                    path="/"
                    element={
                        <Suspense>
                            <Dashboard />
                        </Suspense>
                    }
                />
                <Route
                    path="/*"
                    element={
                        <Suspense>
                            <Feilmelding />
                        </Suspense>
                    }
                />
            </Route>
        )
    );

    return <RouterProvider router={router} />;
};

export default Container;
