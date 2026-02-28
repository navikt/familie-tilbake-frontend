import type { FC } from 'react';

import { PersonPencilFillIcon } from '@navikt/aksel-icons';

const SaksbehandlerIkon: FC = () => {
    return (
        <div className="bg-ax-neutral-400A w-6.5 h-6.5 rounded-full inline-flex items-center justify-center">
            <PersonPencilFillIcon fontSize="1.2rem" aria-label="Saksbehandler" />
        </div>
    );
};

export { SaksbehandlerIkon };
