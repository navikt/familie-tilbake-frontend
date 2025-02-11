import * as React from 'react';

import { Header } from '@navikt/familie-header';
import { type ISaksbehandler } from '@navikt/familie-typer';

interface IHeaderProps {
    innloggetSaksbehandler?: ISaksbehandler;
}

const FTHeader: React.FC<IHeaderProps> = ({ innloggetSaksbehandler }) => {
    return (
        <Header
            tittelHref={'/'}
            tittel="Nav - Tilbakekreving"
            brukerinfo={{
                navn: innloggetSaksbehandler?.displayName || 'Ukjent',
            }}
            brukerPopoverItems={[{ name: 'Logg ut', href: `${window.origin}/auth/logout` }]}
            eksterneLenker={[]}
        />
    );
};

export default FTHeader;
