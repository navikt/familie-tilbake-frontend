import { CogRotationFillIcon } from '@navikt/aksel-icons';
import * as React from 'react';

const SystemIkon: React.FC = () => {
    return (
        <div className="bg-ax-neutral-400A w-[26px] h-[26px] rounded-full inline-flex items-center justify-center">
            <CogRotationFillIcon fontSize="1.2rem" aria-label="System" />
        </div>
    );
};

export { SystemIkon };
