import type { FC } from 'react';

import { BrukerBoks } from './BrukerBoks';
import { Faktaboks } from './Faktaboks';

export const Detaljer: FC = () => {
    return (
        <div className="flex flex-col gap-4">
            <Faktaboks />
            <BrukerBoks />
        </div>
    );
};
