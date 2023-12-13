import * as React from 'react';

import { PersonGavelFillIcon } from '@navikt/aksel-icons';

import { TidslinjeIkonbakgrunn } from './ikonelementer';

const BeslutterIkon: React.FC = () => {
    return (
        <TidslinjeIkonbakgrunn>
            <PersonGavelFillIcon fontSize={'1.2rem'} aria-label="Beslutter" />
        </TidslinjeIkonbakgrunn>
    );
};

export { BeslutterIkon };
