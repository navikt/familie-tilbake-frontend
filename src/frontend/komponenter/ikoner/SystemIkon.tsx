import type { FC } from 'react';

import { CogRotationFillIcon } from '@navikt/aksel-icons';

const SystemIkon: FC = () => {
    return (
        <div className="bg-ax-neutral-400A w-6.5 h-6.5 rounded-full inline-flex items-center justify-center">
            <CogRotationFillIcon fontSize="1.2rem" aria-label="System" />
        </div>
    );
};

export { SystemIkon };
