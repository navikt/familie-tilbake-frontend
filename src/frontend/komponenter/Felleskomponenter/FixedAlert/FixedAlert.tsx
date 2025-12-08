import type { AlertProps } from '@navikt/ds-react';

import { Alert } from '@navikt/ds-react';
import React, { useEffect, useState } from 'react';

type Props = AlertProps & {
    width?: string;
};

export const FixedAlert: React.FC<Props> = ({ width, children, variant, ...props }) => {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        if (variant !== 'error') {
            console.log('FixedAlert mounted');
            const textLength = typeof children === 'string' ? children.length : 100;
            const timer = setTimeout(() => setIsVisible(false), Math.max(textLength * 50, 7000));

            return (): void => clearTimeout(timer);
        }
    }, [variant, children]);

    if (!isVisible) {
        return null;
    }
    return (
        <Alert className="fixed bottom-34" style={{ width }} variant={variant} {...props}>
            {children}
        </Alert>
    );
};
