import * as React from 'react';

import { Header } from '@navikt/familie-header';
import { ISaksbehandler } from '@navikt/familie-typer';

export interface IHeaderProps {
    innloggetSaksbehandler?: ISaksbehandler;
}

const FTHeader: React.FC<IHeaderProps> = ({ innloggetSaksbehandler }) => (
    <Header
        tittel="NAV Familie - Tilbakekreving"
        brukerinfo={{
            navn: innloggetSaksbehandler?.displayName || 'ukjent',
            enhet: innloggetSaksbehandler?.enhet || 'ukjent enhet',
        }}
        brukerPopoverItems={[{ name: 'Logg ut', href: `${window.origin}/auth/logout` }]}
    ></Header>
);

export default FTHeader;
