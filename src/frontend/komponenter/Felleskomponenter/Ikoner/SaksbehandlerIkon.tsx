import { PersonPencilFillIcon } from '@navikt/aksel-icons';
import * as React from 'react';

import { TidslinjeIkonbakgrunn } from './ikonelementer';

const SaksbehandlerIkon: React.FC = () => {
    return (
        <TidslinjeIkonbakgrunn>
            <PersonPencilFillIcon fontSize="1.2rem" aria-label="Saksbehandler" />
        </TidslinjeIkonbakgrunn>
    );
};

export { SaksbehandlerIkon };
