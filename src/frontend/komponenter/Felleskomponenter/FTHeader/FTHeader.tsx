import * as React from 'react';

import { NavLink } from 'react-router-dom';

import { Header } from '@navikt/familie-header';
import { ISaksbehandler } from '@navikt/familie-typer';

import { useApp } from '../../../context/AppContext';

export interface IHeaderProps {
    innloggetSaksbehandler?: ISaksbehandler;
}

const FTHeader: React.FC<IHeaderProps> = ({ innloggetSaksbehandler }) => {
    const { hentTilbakeInfo } = useApp();

    return (
        <Header
            tittel="NAV Familie - Tilbakekreving"
            brukerinfo={{
                navn: innloggetSaksbehandler?.displayName || 'ukjent',
                enhet: innloggetSaksbehandler?.enhet || 'ukjent enhet',
            }}
            brukerPopoverItems={[{ name: 'Logg ut', href: `${window.origin}/auth/logout` }]}
            eksterneLenker={[]}
        >
            <div>
                <NavLink
                    id="info"
                    to="#"
                    onClick={e => {
                        hentTilbakeInfo();
                        e.preventDefault();
                    }}
                >
                    ?
                </NavLink>
            </div>
        </Header>
    );
};

export default FTHeader;
