import React, { ReactNode } from 'react';

import styled from 'styled-components';

import {
    NavdsSemanticColorBorder,
    NavdsSemanticColorCanvasBackgroundLight,
    NavdsSpacing3,
    NavdsSpacing4,
} from '@navikt/ds-tokens/dist/tokens';

const borderRadius = 4;

const ArrowBoxTop = styled.div`
    .arrowBoxTop${props => props.theme.alignOffset} {
        border: 1px solid ${NavdsSemanticColorBorder};
        border-radius: ${borderRadius}px;
        padding: ${NavdsSpacing4};
        margin-bottom: ${NavdsSpacing3};
        margin-top: ${props => props.theme.marginTop}px;
        margin-left: ${props => props.theme.marginLeft}px;
        position: relative;
    }
    .arrowBoxTop${props => props.theme.alignOffset}:before {
        background: ${NavdsSemanticColorCanvasBackgroundLight};
        border: 1px solid ${NavdsSemanticColorBorder};
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
        border: 1px solid ${NavdsSemanticColorBorder};
        border-radius: ${borderRadius}px;
        padding: ${NavdsSpacing4};
        margin-bottom: ${NavdsSpacing3};
        margin-top: ${props => props.theme.marginTop}px;
        margin-left: ${props => props.theme.marginLeft}px;
        position: relative;
    }

    .arrowBoxLeft${props => props.theme.alignOffset}:before {
        background: ${NavdsSemanticColorCanvasBackgroundLight};
        border: 1px solid ${NavdsSemanticColorBorder};
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
