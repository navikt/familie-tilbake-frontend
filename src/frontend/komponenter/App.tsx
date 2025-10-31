import '@navikt/ds-css/darkside';
import type { Saksbehandler } from '../typer/saksbehandler';

import { Theme } from '@navikt/ds-react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as React from 'react';
import { Suspense } from 'react';

import { hentInnloggetBruker } from '../api/saksbehandler';
import { AppProvider } from '../context/AppContext';
import ErrorBoundary from './Felleskomponenter/ErrorBoundary/ErrorBoundary';
import { lazyImportMedRetry } from './Felleskomponenter/FeilInnlasting/FeilInnlasting';
const Container = lazyImportMedRetry(() => import('./Container'), 'Container');

const App: React.FC = () => {
    const [autentisertSaksbehandler, settAutentisertSaksbehandler] = React.useState<
        Saksbehandler | undefined
    >(undefined);
    const queryClient = new QueryClient();

    React.useEffect(() => {
        hentInnloggetBruker().then((innhentetInnloggetSaksbehandler: Saksbehandler) => {
            settAutentisertSaksbehandler(innhentetInnloggetSaksbehandler);
        });
    }, []);

    return (
        <QueryClientProvider client={queryClient}>
            <ErrorBoundary autentisertSaksbehandler={autentisertSaksbehandler}>
                <AppProvider autentisertSaksbehandler={autentisertSaksbehandler}>
                    <Theme>
                        <Suspense fallback={<div>Container laster innhold...</div>}>
                            <Container />
                        </Suspense>
                    </Theme>
                </AppProvider>
            </ErrorBoundary>
        </QueryClientProvider>
    );
};

export default App;
