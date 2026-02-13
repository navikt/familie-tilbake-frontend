import type { LocalAlertProps } from '@navikt/ds-react';
import type { MouseEvent } from 'react';

import { LocalAlert } from '@navikt/ds-react';
import React, { useState } from 'react';

type Props = LocalAlertProps & {
    width?: number;
    title: string;
    stackIndex?: number;
    onClose?: (e: React.MouseEvent<HTMLButtonElement>) => void;
};

const alertHeight = 90;
const alertGap = 8;
const baseBottom = 112;
const distanceToParent = 20;

export const FixedAlert: React.FC<Props> = ({
    width,
    children,
    title,
    status,
    stackIndex = 0,
    onClose,
    ...props
}) => {
    const [isVisible, setIsVisible] = useState(true);
    if (!isVisible) {
        return null;
    }
    const handleClose = (e: MouseEvent<HTMLButtonElement>): void => {
        setIsVisible(false);
        onClose?.(e);
    };

    const bottomPosition = baseBottom + stackIndex * (alertHeight + alertGap);
    const alertWidth = width && width > distanceToParent ? width - distanceToParent : undefined;

    return (
        <LocalAlert
            className="fixed left-6.5"
            style={{
                width: alertWidth,
                bottom: `${bottomPosition}px`,
            }}
            status={status}
            {...props}
        >
            <LocalAlert.Header>
                <LocalAlert.Title>{title}</LocalAlert.Title>
                <LocalAlert.CloseButton onClick={handleClose} />
            </LocalAlert.Header>
            <LocalAlert.Content>{children}</LocalAlert.Content>
        </LocalAlert>
    );
};
