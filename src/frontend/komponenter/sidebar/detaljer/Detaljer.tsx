import type { FC } from 'react';

import { BrukerBoks } from './BrukerBoks';
import { Faktaboks } from './Faktaboks';

export const Detaljer: FC = () => {
    return (
        <div className="flex-1 min-h-0 overflow-y-auto scrollbar-stable flex flex-col gap-4">
            <Faktaboks />
            <BrukerBoks />
        </div>
    );
};
