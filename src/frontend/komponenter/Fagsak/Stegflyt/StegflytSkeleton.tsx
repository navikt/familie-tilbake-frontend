import { Box, Skeleton } from '@navikt/ds-react';
import React from 'react';

export const StegflytSkeleton: React.FC = () => {
    const antallGjentagelser = 4;
    return (
        <nav aria-label="Laster behandlingssteg navigasjon" className="flex flex-row py-2 mt-10">
            <ol className="flex flex-row gap-4">
                {Array.from({ length: antallGjentagelser }).map((_, index) => (
                    <li key={index}>
                        <Box width="12rem" className="flex flex-col items-center">
                            <Skeleton
                                variant="circle"
                                width={28}
                                height={28}
                                className="flex items-center"
                            />
                            <Skeleton variant="text" width="50%" />
                        </Box>
                    </li>
                ))}
            </ol>
        </nav>
    );
};
