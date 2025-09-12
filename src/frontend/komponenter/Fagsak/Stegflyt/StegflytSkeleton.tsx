import { Box, Skeleton } from '@navikt/ds-react';
import React, { Fragment } from 'react';

export const StegflytSkeleton: React.FC = () => {
    const antallGjentagelser = 4;
    return (
        <nav
            aria-label="Laster behandlingssteg navigasjon"
            className="flex flex-row py-2 mt-4 mx-6"
        >
            <ol className="flex flex-row mx-auto gap-5 w-full max-w-4xl">
                {Array.from({ length: antallGjentagelser }).map((_, index) => (
                    <Fragment key={`skjelett-steg-indeks-${index}`}>
                        {/* Stegene */}
                        <li className="flex flex-row items-center gap-5">
                            <Box width="6 rem" className="flex flex-col items-center gap-2">
                                <Skeleton
                                    variant="circle"
                                    width={28}
                                    height={28}
                                    className="flex items-center"
                                />
                                <Skeleton variant="text" width={100} height={25} />
                            </Box>
                        </li>
                        {/* Linjene mellom stegene */}
                        {index < antallGjentagelser - 1 && (
                            <Skeleton
                                variant="text"
                                width="100%"
                                height={5}
                                aria-hidden="true"
                                className="flex-1 px-4 self-center"
                            />
                        )}
                    </Fragment>
                ))}
            </ol>
        </nav>
    );
};
