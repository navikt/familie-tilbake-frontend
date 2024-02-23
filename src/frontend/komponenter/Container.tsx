import * as React from 'react';

import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

import { useApp } from '../context/AppContext';
import { BehandlingProvider } from '../context/BehandlingContext';
import { FagsakProvider } from '../context/FagsakContext';
import FagsakContainer from './Fagsak/FagsakContainer';
import Dashboard from './Felleskomponenter/Dashboard';
import Feilmelding from './Felleskomponenter/Feilmelding';
import FTHeader from './Felleskomponenter/FTHeader/FTHeader';
import UgyldigSesjon from './Felleskomponenter/Modal/SesjonUtløpt';
import Toasts from './Felleskomponenter/Toast/Toasts';

const Container: React.FC = () => {
    const { autentisert, innloggetSaksbehandler } = useApp();

    return (
        <Router>
            {autentisert ? (
                <>
                    <Toasts />
                    <main>
                        <FTHeader innloggetSaksbehandler={innloggetSaksbehandler} />
                        <button
                            onClick={() => {
                                throw new Error('Sentry testerror');
                            }}
                        >
                            Error-knapp for test av Sentry oppsett
                        </button>
                        <FagsakProvider>
                            <BehandlingProvider>
                                <Routes>
                                    <Route
                                        path="/fagsystem/:fagsystem/fagsak/:fagsakId/*"
                                        element={<FagsakContainer />}
                                    />
                                    <Route path="/" element={<Dashboard />} />
                                    <Route path="/*" element={<Feilmelding />} />
                                </Routes>
                            </BehandlingProvider>
                        </FagsakProvider>
                    </main>
                </>
            ) : (
                <UgyldigSesjon />
            )}
        </Router>
    );
};

export default Container;
