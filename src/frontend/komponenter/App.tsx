import * as React from 'react';

import { ISaksbehandler } from '@navikt/familie-typer';

import { hentInnloggetBruker } from '../api/saksbehandler';
import { AppProvider } from '../context/AppContext';
import Container from './Container';

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
        <AppProvider autentisertSaksbehandler={autentisertSaksbehandler}>
            <Container />
        </AppProvider>
    );
};

export default App;
