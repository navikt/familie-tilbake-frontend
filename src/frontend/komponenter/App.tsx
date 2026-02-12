import type { Saksbehandler } from '../typer/saksbehandler';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as React from 'react';
import { Suspense } from 'react';

import { hentInnloggetBruker } from '../api/saksbehandler';
import { AppProvider } from '../context/AppContext';
import { ThemeProvider } from '../context/ThemeContext';
import { configureZod } from '../utils/zodConfig';
import { ErrorBoundary } from './Felleskomponenter/ErrorBoundary/ErrorBoundary';
import { lazyImportMedRetry } from './Felleskomponenter/FeilInnlasting/FeilInnlasting';
const Container = lazyImportMedRetry(() => import('./Container'), 'Container');

export const App: React.FC = () => {
    const [autentisertSaksbehandler, settAutentisertSaksbehandler] = React.useState<
        Saksbehandler | undefined
    >(undefined);
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: 5 * 60 * 1000, // 5 minutter
            },
        },
    });

    configureZod();

    React.useEffect(() => {
        hentInnloggetBruker().then((innhentetInnloggetSaksbehandler: Saksbehandler) => {
            settAutentisertSaksbehandler(innhentetInnloggetSaksbehandler);
        });
    }, []);

    return (
        <QueryClientProvider client={queryClient}>
            <ErrorBoundary autentisertSaksbehandler={autentisertSaksbehandler}>
                <AppProvider autentisertSaksbehandler={autentisertSaksbehandler}>
                    <ThemeProvider>
                        <Suspense fallback={<div>Container laster innhold...</div>}>
                            <Container />
                        </Suspense>
                    </ThemeProvider>
                </AppProvider>
            </ErrorBoundary>
        </QueryClientProvider>
    );
};
