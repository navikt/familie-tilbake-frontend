import * as React from 'react';

type Props = {
    src: string;
    srcHover?: string;
    altText: string;
    onClick?: (event: React.MouseEvent) => void;
    onKeyDown?: (event: React.KeyboardEvent) => void;
    className?: string;
};

export const Image: React.FC<Props> = ({
    src,
    srcHover,
    altText,
    onClick = (): undefined => undefined,
    onKeyDown,
    className,
}) => {
    const [isHovering, setHoovering] = React.useState(false);

    const onFocus = React.useCallback((): void => {
        setHoovering(true);
    }, []);
    const onBlur = React.useCallback((): void => {
        setHoovering(false);
    }, []);
    const onKeyDownFn = React.useCallback((e: React.KeyboardEvent): void => {
        if (e.key === 'Enter' || e.key === ' ') {
            if (onKeyDown) {
                onKeyDown(e);
            }
            e.preventDefault();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

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
