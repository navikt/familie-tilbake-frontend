import * as React from 'react';

import { PersonGavelFillIcon } from '@navikt/aksel-icons';

import { TidslinjeIkonbakgrunn } from './ikonelementer';

const BeslutterIkon: React.FC = () => {
    return (
        <TidslinjeIkonbakgrunn>
            <PersonGavelFillIcon fontSize="18" aria-label="Beslutter" />
        </TidslinjeIkonbakgrunn>
    );
};

export { BeslutterIkon };
