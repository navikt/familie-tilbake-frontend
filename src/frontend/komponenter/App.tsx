import type { ISaksbehandler } from '../typer/saksbehandler';

import * as React from 'react';
import { Suspense } from 'react';

import '@navikt/ds-css';

import { hentInnloggetBruker } from '../api/saksbehandler';
import { AppProvider } from '../context/AppContext';
import ErrorBoundary from './Felleskomponenter/ErrorBoundary/ErrorBoundary';
const Container = React.lazy(() => import('./Container'));

const App: React.FC = () => {
    const [autentisertSaksbehandler, settAutentisertSaksbehandler] = React.useState<
        ISaksbehandler | undefined
    >(undefined);

    React.useEffect(() => {
        hentInnloggetBruker().then((innhentetInnloggetSaksbehandler: ISaksbehandler) => {
            settAutentisertSaksbehandler(innhentetInnloggetSaksbehandler);
        });
    }, []);

    return (
        <ErrorBoundary autentisertSaksbehandler={autentisertSaksbehandler}>
            <AppProvider autentisertSaksbehandler={autentisertSaksbehandler}>
                <Suspense fallback={<div>Container laster innhold...</div>}>
                    <Container />
                </Suspense>
            </AppProvider>
        </ErrorBoundary>
    );
};

export default App;
