import { PersonGavelFillIcon } from '@navikt/aksel-icons';
import * as React from 'react';

import { TidslinjeIkonbakgrunn } from './ikonelementer';

const BeslutterIkon: React.FC = () => {
    return (
        <TidslinjeIkonbakgrunn>
            <PersonGavelFillIcon fontSize="1.2rem" aria-label="Beslutter" />
        </TidslinjeIkonbakgrunn>
    );
};

export { BeslutterIkon };
