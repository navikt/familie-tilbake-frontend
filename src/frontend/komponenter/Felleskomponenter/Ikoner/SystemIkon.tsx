import { CogRotationFillIcon } from '@navikt/aksel-icons';
import * as React from 'react';

import { TidslinjeIkonbakgrunn } from './ikonelementer';

const SystemIkon: React.FC = () => {
    return (
        <TidslinjeIkonbakgrunn>
            <CogRotationFillIcon fontSize="1.2rem" aria-label="System" />
        </TidslinjeIkonbakgrunn>
    );
};

export { SystemIkon };
