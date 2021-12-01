import * as React from 'react';

import { DecisionFilled } from '@navikt/ds-icons';

import { TidslinjeIkonbakgrunn } from './ikonelementer';

const BeslutterIkon: React.FC = () => {
    return (
        <TidslinjeIkonbakgrunn>
            <DecisionFilled fontSize="15" aria-label="Beslutter" />
        </TidslinjeIkonbakgrunn>
    );
};

export { BeslutterIkon };
