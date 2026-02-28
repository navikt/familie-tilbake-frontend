import type { FC } from 'react';

import { Jul } from './jul/Jul';

export const Høytidspynt: FC = () => {
    const måned = new Date().getMonth();
    if (måned !== 11) {
        return null;
    }
    return <Jul />;
};
