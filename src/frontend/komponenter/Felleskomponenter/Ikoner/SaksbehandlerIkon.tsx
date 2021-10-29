import * as React from 'react';

import { CaseworkerFilled } from '@navikt/ds-icons';

import { TidslinjeIkonbakgrunn } from './ikonelementer';

const SaksbehandlerIkon: React.FC = () => {
    return (
        <TidslinjeIkonbakgrunn>
            <CaseworkerFilled fontSize="15" aria-label="Saksbehandler" />
        </TidslinjeIkonbakgrunn>
    );
};

export { SaksbehandlerIkon };
