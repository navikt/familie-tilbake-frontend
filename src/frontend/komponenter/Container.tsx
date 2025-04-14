import * as React from 'react';
import { lazy, Suspense } from 'react';
import { createBrowserRouter, createRoutesFromElements, RouterProvider, Route } from 'react-router';

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

const SuspenseWrapper = ({ children }: { children: React.ReactNode }) => (
    <Suspense fallback={<div>Laster innhold...</div>}>{children}</Suspense>
);

const Container: React.FC = () => {
    const { autentisert, innloggetSaksbehandler } = useApp();
    console.log('autentisert', autentisert);

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
                <Route path="/fagsystem/:fagsystem/fagsak/:fagsakId/">
                    <Route
                        path="*"
                        element={
                            <SuspenseWrapper>
                                <FagsakContainer />
                            </SuspenseWrapper>
                        }
                    />
                </Route>
                <Route
                    path="/"
                    element={
                        <SuspenseWrapper>
                            <Dashboard />
                        </SuspenseWrapper>
                    }
                />
                <Route
                    path="/*"
                    element={
                        <SuspenseWrapper>
                            <Feilmelding />
                        </SuspenseWrapper>
                    }
                />
            </Route>
        )
    );

    return <RouterProvider router={router} />;
};

export default Container;
