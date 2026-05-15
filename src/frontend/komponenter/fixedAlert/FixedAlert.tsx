import type { LocalAlertProps } from '@navikt/ds-react';
import type { FC } from 'react';

import { LocalAlert } from '@navikt/ds-react';

type Props = LocalAlertProps & {
    width?: number;
    title: string;
    stackIndex?: number;
    onClose?: () => void;
};

const alertHeight = 90;
const alertGap = 8;
const baseBottom = 112;
const distanceToParent = 20;

export const FixedAlert: FC<Props> = ({
    width,
    children,
    title,
    status,
    stackIndex = 0,
    onClose,
    ...props
}) => {
    const bottomPosition = baseBottom + stackIndex * (alertHeight + alertGap);
    const alertWidth = width && width > distanceToParent ? width - distanceToParent : undefined;

    return (
        <LocalAlert
            className="fixed left-6.5 z-50"
            style={{
                width: alertWidth,
                bottom: `${bottomPosition}px`,
            }}
            status={status}
            {...props}
        >
            <LocalAlert.Header>
                <LocalAlert.Title>{title}</LocalAlert.Title>
                <LocalAlert.CloseButton onClick={onClose} />
            </LocalAlert.Header>
            {children && (
                <LocalAlert.Content className="flex flex-col gap-2">{children}</LocalAlert.Content>
            )}
        </LocalAlert>
    );
};
