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
            const timer = setTimeout(() => setIsVisible(false), 7000);

            return (): void => clearTimeout(timer);
        }
    }, [variant, children]);

    if (!isVisible) {
        return null;
    }
    return (
        <Alert
            size="small"
            className="fixed bottom-34"
            style={{ width }}
            variant={variant}
            contentMaxWidth={false}
            {...props}
        >
            {children}
        </Alert>
    );
};
