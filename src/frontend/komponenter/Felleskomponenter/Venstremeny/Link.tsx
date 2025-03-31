import type { ReactChild } from 'react';

import classNames from 'classnames';
import React from 'react';
import { Link as NavLink, useLocation } from 'react-router';

interface Props {
    children: ReactChild;
    id: string;
    to?: string;
    active?: boolean;
    className?: string;
}

const Link: React.FC<Props> = ({ active = true, id, to, children, className }) => {
    const location = useLocation();
    const onClick = (event: React.MouseEvent): void => {
        (event.target as HTMLElement).blur();
    };

    return active && to ? (
        <NavLink
            id={id}
            to={to}
            onClick={onClick}
            className={classNames(
                className,
                `${location.pathname}${location.hash}` === to ? 'active' : ''
            )}
        >
            {children}
        </NavLink>
    ) : (
        <span className={classNames('inactive', className)}>{children}</span>
    );
};

export default Link;
