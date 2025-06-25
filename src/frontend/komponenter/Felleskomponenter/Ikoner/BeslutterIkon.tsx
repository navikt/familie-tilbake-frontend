import { PersonGavelFillIcon } from '@navikt/aksel-icons';
import * as React from 'react';

const BeslutterIkon: React.FC = () => {
    return (
        <div className="bg-grayalpha-300 w-[26px] h-[26px] rounded-full inline-flex items-center justify-center">
            <PersonGavelFillIcon fontSize="1.2rem" aria-label="Beslutter" />
        </div>
    );
};

export { BeslutterIkon };
