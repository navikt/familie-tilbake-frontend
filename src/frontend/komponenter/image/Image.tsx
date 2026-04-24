import type { FC, MouseEvent, KeyboardEvent } from 'react';

import { useCallback, useState } from 'react';

type Props = {
    src: string;
    srcHover?: string;
    altText: string;
    onClick?: (event: MouseEvent) => void;
    onKeyDown?: (event: KeyboardEvent) => void;
    className?: string;
};

export const Image: FC<Props> = ({
    src,
    srcHover,
    altText,
    onClick = (): undefined => undefined,
    onKeyDown,
    className,
}) => {
    const [isHovering, setIsHovering] = useState(false);

    const onFocus = useCallback((): void => {
        setIsHovering(true);
    }, []);
    const onBlur = useCallback((): void => {
        setIsHovering(false);
    }, []);
    const onKeyDownFn = useCallback(
        (e: KeyboardEvent): void => {
            if (e.key === 'Enter' || e.key === ' ') {
                if (onKeyDown) {
                    onKeyDown(e);
                }
                e.preventDefault();
            }
        },
        [onKeyDown]
    );

    const imgSource = srcHover && isHovering ? srcHover : src;

    const image = (
        <img // eslint-disable-line jsx-a11y/no-noninteractive-element-interactions
            src={imgSource}
            alt={altText}
            onMouseOver={onFocus}
            onMouseOut={onBlur}
            onFocus={onFocus}
            onBlur={onBlur}
            onKeyDown={onKeyDownFn}
            onClick={onClick}
            className={className}
        />
    );
    return image;
};
