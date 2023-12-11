import * as React from 'react';

import { CogRotationFillIcon } from '@navikt/aksel-icons';

import { TidslinjeIkonbakgrunn } from './ikonelementer';

const SystemIkon: React.FC = () => {
    return (
        <TidslinjeIkonbakgrunn>
            <CogRotationFillIcon fontSize="18" aria-label="System" />
        </TidslinjeIkonbakgrunn>
    );
};

export { SystemIkon };
