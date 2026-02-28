import type { Dispatch, RefObject, SetStateAction } from 'react';

export const updateParentBounds = (
    containerRef: RefObject<HTMLDivElement | null>,
    setParentBounds: Dispatch<SetStateAction<{ width: number }>>
): void => {
    if (containerRef.current?.parentElement) {
        const rect = containerRef.current.parentElement.getBoundingClientRect();
        setParentBounds({
            width: rect.width,
        });
    }
};
