import type { AlertProps } from '@navikt/ds-react';

import { LocalAlert } from '@navikt/ds-react';
import React, { useEffect, useState } from 'react';

type Props = AlertProps & {
    width?: string;
    title: string;
};

export const FixedAlert: React.FC<Props> = ({ width, children, title, status, ...props }) => {
    const [isVisible, setIsVisible] = useState(true);
    const avstandTilParent = 20;

    useEffect(() => {
        if (status !== 'error') {
            const timer = setTimeout(() => setIsVisible(false), 7000);

            return (): void => clearTimeout(timer);
        }
    }, [status, children]);

    if (!isVisible) {
        return null;
    }
    return (
        <LocalAlert
            size="small"
            className="fixed bottom-28 left-6.5"
            style={{ width: width - avstandTilParent }}
            status={status}
            {...props}
        >
            <LocalAlert.Header>
                <LocalAlert.Title>{title}</LocalAlert.Title>
                <LocalAlert.CloseButton onClick={() => setIsVisible(false)} />
            </LocalAlert.Header>
            <LocalAlert.Content>{children}</LocalAlert.Content>
        </LocalAlert>
    );
};
