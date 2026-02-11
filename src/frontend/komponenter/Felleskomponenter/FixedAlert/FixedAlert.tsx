import type { AlertProps } from '@navikt/ds-react';

import { LocalAlert } from '@navikt/ds-react';
import React, { useEffect, useState } from 'react';

type Props = AlertProps & {
    width?: number;
    title: string;
    stackIndex?: number;
};

const alertHeight = 90;
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

    useEffect(() => {
        if (status !== 'error') {
            const timer = setTimeout(() => {
                setIsVisible(false);
                onClose?.({} as React.MouseEvent<HTMLButtonElement>);
            }, 7000);

            return (): void => clearTimeout(timer);
        }
    }, [status, onClose]);

    if (!isVisible) {
        return null;
    }

    const handleClose = (e: React.MouseEvent<HTMLButtonElement>): void => {
        setIsVisible(false);
        onClose?.(e);
    };

    const bottomPosition = baseBottom + stackIndex * alertHeight;
    const alertWidth = width && width > distanceToParent ? width - distanceToParent : undefined;

    return (
        <LocalAlert
            size="small"
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
