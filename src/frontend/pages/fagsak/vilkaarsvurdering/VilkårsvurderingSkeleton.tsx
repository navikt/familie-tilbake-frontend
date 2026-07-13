import type { FC } from 'react';

import { Box, Heading, HStack, Skeleton, VStack } from '@navikt/ds-react';

export const VilkårsvurderingSkeleton: FC = () => {
    return (
        <VStack gap="space-24" className="min-h-0 h-full">
            <Heading size="medium">Vilkårsvurdering</Heading>
            <div className="grid grid-cols-1 ax-md:grid-cols-3 gap-4 ax-md:h-full min-h-0">
                {/* Section 1: Perioder */}
                <section
                    className="col-span-1 ax-md:col-span-1 gap-2 flex flex-col overflow-y-auto min-h-0"
                    aria-busy
                >
                    <HStack justify="space-between" align="center">
                        <Heading size="small" level="2">
                            Periode
                        </Heading>
                        <Skeleton variant="text" width="120px" />
                    </HStack>
                    <Box className="border border-ax-border-neutral-subtle rounded-xl p-4 gap-2 flex flex-col">
                        <Skeleton variant="text" width="100px" />
                        <Skeleton variant="text" width="160px" height="24px" />
                        <Skeleton variant="text" width="120px" />
                    </Box>
                </section>

                {/* Section 2: Detaljer */}
                <section className="col-span-1 ax-md:col-span-2 h-full" aria-busy>
                    <Box className="border border-ax-default rounded-xl border-ax-border-neutral-subtle h-full flex flex-col">
                        <HStack
                            justify="space-between"
                            className="border-b py-3 px-4 border-ax-border-neutral-subtle"
                        >
                            <Heading size="small" level="2">
                                <Skeleton variant="text" width="200px" />
                            </Heading>
                            <Skeleton variant="text" width="100px" />
                        </HStack>
                        <div className="py-3 px-4 flex-1">
                            <Skeleton variant="text" />
                        </div>
                    </Box>
                </section>
            </div>
        </VStack>
    );
};
