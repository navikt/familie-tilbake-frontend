import type { FC } from 'react';

import { PersonGavelFillIcon } from '@navikt/aksel-icons';

const BeslutterIkon: FC = () => {
    return (
        <div className="bg-ax-neutral-400A w-6.5 h-6.5 rounded-full inline-flex items-center justify-center">
            <PersonGavelFillIcon fontSize="1.2rem" aria-label="Beslutter" />
        </div>
    );
};

export { BeslutterIkon };
