import * as React from 'react';
import {
    createBrowserRouter,
    createRoutesFromElements,
    RouterProvider,
    Outlet,
    Route,
} from 'react-router';

import FagsakContainer from './Fagsak/FagsakContainer';
import Dashboard from './Felleskomponenter/Dashboard';
import Feilmelding from './Felleskomponenter/Feilmelding';
import { useApp } from '../context/AppContext';
import { BehandlingProvider } from '../context/BehandlingContext';
import { FagsakProvider } from '../context/FagsakContext';
import { TogglesProvider } from '../context/TogglesContext';
import FTHeader from './Felleskomponenter/FTHeader/FTHeader';
import UgyldigSesjon from './Felleskomponenter/Modal/SesjonUtløpt';
import UlagretDataModal from './Felleskomponenter/Modal/UlagretDataModal';
import Toasts from './Felleskomponenter/Toast/Toasts';

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
                    <Route path="*" element={<FagsakContainer />} />
                </Route>
                <Route path="/" element={<Dashboard />} />
                <Route path="/*" element={<Feilmelding />} />
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
