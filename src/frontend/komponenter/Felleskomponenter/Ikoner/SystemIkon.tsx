import * as React from 'react';

import { AutomaticSystem } from '@navikt/ds-icons';

import { TidslinjeIkonbakgrunn } from './ikonelementer';

const SystemIkon: React.FC = () => {
    return (
        <TidslinjeIkonbakgrunn>
            <AutomaticSystem fontSize="15" aria-label="System" />
        </TidslinjeIkonbakgrunn>
    );
};

export { SystemIkon };
