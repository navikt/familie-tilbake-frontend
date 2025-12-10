import React from 'react';

import { Jul } from './jul/Jul';

export const Høytidspynt: React.FC = () => {
    const måned = new Date().getMonth();
    if (måned === 11) {
        return <Jul />;
    }
};
