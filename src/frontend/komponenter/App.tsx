import * as React from 'react';

import '@navikt/ds-css';
import '@navikt/ds-css-internal';
import { Modal } from '@navikt/ds-react';
import { type ISaksbehandler } from '@navikt/familie-typer';

import Container from './Container';
import ErrorBoundary from './Felleskomponenter/ErrorBoundary/ErrorBoundary';
import { hentInnloggetBruker } from '../api/saksbehandler';
import { AppProvider } from '../context/AppContext';

Modal?.setAppElement?.(document.getElementById('modal-a11y-wrapper'));

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
                <Container />
            </AppProvider>
        </ErrorBoundary>
    );
};

export default App;
