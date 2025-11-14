import type { AlertProps } from '@navikt/ds-react';

import { Alert } from '@navikt/ds-react';
import React from 'react';

type Props = AlertProps & {
    width?: string;
};

export const FixedAlert: React.FC<Props> = ({ width, children, ...props }) => {
    return (
        <div className="fixed bottom-34" style={{ width }}>
            <Alert {...props}>{children}</Alert>
        </div>
    );
};
