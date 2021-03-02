import React, { ReactNode } from 'react';

import styled from 'styled-components';

import navFarger from 'nav-frontend-core';

const borderRadius = 4;

const ArrowBoxTop = styled.div`
    .arrowBoxTop${props => props.theme.alignOffset} {
        background: #ffffff;
        border: 1px solid ${navFarger.navGra60};
        border-radius: ${borderRadius}px;
        padding: 15px;
        margin-bottom: 10px;
        margin-top: ${props => props.theme.marginTop}px;
        margin-left: ${props => props.theme.marginLeft}px;
        position: relative;
    }
    .arrowBoxTop${props => props.theme.alignOffset}:before {
        background-color: #ffffff;
        border: 1px solid ${navFarger.navGra60};
        border-bottom-width: 0;
        border-right-width: 0;
        content: '';
        height: 1rem;
        top: 0;
        margin-top: -1px;
        position: absolute;
        left: ${props => props.theme.alignOffset}px;
        transform: rotate(45deg) translateY(-100%) translateZ(0);
        transform-origin: 0 0;
        width: 1rem;
    }
`;

const ArrowBoxLeft = styled.div`
    .arrowBoxLeft${props => props.theme.alignOffset} {
        background: #ffffff;
        border: 1px solid ${navFarger.navGra60};
        border-radius: ${borderRadius}px;
        padding: 15px;
        margin-bottom: 10px;
        margin-top: ${props => props.theme.marginTop}px;
        margin-left: ${props => props.theme.marginLeft}px;
        position: relative;
    }

    .arrowBoxLeft${props => props.theme.alignOffset}:before {
        background-color: #ffffff;
        border: 1px solid ${navFarger.navGra60};
        border-bottom-width: 0;
        border-right-width: 0;
        content: '';
        height: 1rem;
        left: 0;
        margin-left: -1px;
        position: absolute;
        top: ${props => props.theme.alignOffset}px;
        transform: rotate(-45deg) translateY(-100%) translateZ(0);
        transform-origin: 0 0;
        width: 1rem;
    }
`;

const getClassName = (alignOffset?: number, alignLeft?: boolean): string => {
    return alignLeft ? `arrowBoxLeft${alignOffset}` : `arrowBoxTop${alignOffset}`;
};

interface IProps {
    children: ReactNode | ReactNode[];
    alignOffset?: number;
    alignLeft?: boolean;
    marginTop?: number;
    marginLeft?: number;
}

const ArrowBox: React.FC<IProps> = ({
    children,
    alignOffset = 0,
    alignLeft = false,
    marginTop = 0,
    marginLeft = 0,
}) => (
    <>
        {alignLeft ? (
            <ArrowBoxLeft theme={{ alignOffset, marginTop, marginLeft }}>
                <div className={getClassName(alignOffset, alignLeft)}>{children}</div>
            </ArrowBoxLeft>
        ) : (
            <ArrowBoxTop theme={{ alignOffset, marginTop, marginLeft }}>
                <div className={getClassName(alignOffset, alignLeft)}>{children}</div>
            </ArrowBoxTop>
        )}
    </>
);

export default ArrowBox;
