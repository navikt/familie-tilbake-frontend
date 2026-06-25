import type { FC } from 'react';

import { Box, Heading, HStack } from '@navikt/ds-react';

import { VilkårsvurderingSkjema } from './skjema/VilkårsvurderingSkjema';

// import { DelPeriode } from './del-periode/DelPeriode';

type Props = {
    fom: string | undefined;
    tom: string | undefined;
};

export const VilkårsvurderingDetaljer: FC<Props> = ({ fom, tom }: Props) => {
    return (
        <section className="flex-2 min-h-0">
            <Box className="border border-ax-default rounded-xl border-ax-border-neutral-subtle h-full flex flex-col">
                <HStack
                    justify="space-between"
                    className="border-b py-3 px-4 border-ax-border-neutral-subtle shrink-0"
                >
                    <Heading size="small" level="2">
                        {`Periode: ${fom}–${tom}`}
                    </Heading>
                    {/* {fom && tom && (
                        <DelPeriode
                            periode={{
                                fom,
                                tom,
                            }}
                            vilkårsperioder={[]}
                            erVurdert={false}
                            hentVilkårsvurdering={function (): void {
                                throw new Error('Function not implemented.');
                            }}
                        />
                    )} */}
                </HStack>

                <VilkårsvurderingSkjema />
            </Box>
        </section>
    );
};
