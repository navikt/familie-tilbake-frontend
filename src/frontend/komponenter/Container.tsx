import * as React from 'react';

import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';

import { useApp } from '../context/AppContext';
import { BehandlingProvider } from '../context/BehandlingContext';
import { FagsakProvider } from '../context/FagsakContext';
import BehandlingContainer from './Behandling/BehandlingContainer';
import Dashboard from './Felleskomponenter/Dashboard';
import Feilmelding from './Felleskomponenter/Feilmelding';
import FTHeader from './Felleskomponenter/FTHeader/FTHeader';
import UgyldigSesjon from './Felleskomponenter/Modal/SesjonUtløpt';

const Container: React.FC = () => {
    const { autentisert, innloggetSaksbehandler } = useApp();
    return (
        <Router>
            {autentisert ? (
                <main>
                    <FTHeader innloggetSaksbehandler={innloggetSaksbehandler} />
                    <FagsakProvider>
                        <BehandlingProvider>
                            <Switch>
                                <Route
                                    path="/fagsak/:fagsakId/behandling/:behandlingId"
                                    component={BehandlingContainer}
                                />
                                <Route exact={true} path="/" component={Dashboard} />
                                <Route path="/*" component={Feilmelding} />
                            </Switch>
                        </BehandlingProvider>
                    </FagsakProvider>
                </main>
            ) : (
                <UgyldigSesjon />
            )}
        </Router>
    );
};

export default Container;
