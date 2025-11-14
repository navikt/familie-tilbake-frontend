export const updateParentBounds = (
    containerRef: React.RefObject<HTMLDivElement | null>,
    setParentBounds: React.Dispatch<React.SetStateAction<{ width: string }>>
): void => {
    if (containerRef.current?.parentElement) {
        const rect = containerRef.current.parentElement.getBoundingClientRect();
        setParentBounds({
            width: `${rect.width}px`,
        });
    }
};
