import React, { ReactChild } from 'react';

import { clsx } from 'clsx';
import { Link as NavLink, useLocation } from 'react-router-dom';

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
            className={clsx(className, `${location.pathname}${location.hash}` === to && 'active')}
        >
            {children}
        </NavLink>
    ) : (
        <span className={clsx('inactive', className)}>{children}</span>
    );
};

export default Link;
