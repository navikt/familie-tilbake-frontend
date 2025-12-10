import React from 'react';

import { Jul } from './jul/jul';

export const Høytidspynt: React.FC = () => {
    const måned = new Date().getMonth();
    if (måned === 11) {
        return <Jul />;
    }
};
