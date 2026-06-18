import type { FC } from 'react';

import { Box, Heading, HStack } from '@navikt/ds-react';

import { DelPeriode } from './del-periode/DelPeriode';

export const VilkårsvurderingDetaljer: FC = () => {
    return (
        <section className="col-span-1 ax-md:col-span-2 h-full">
            <Box className="border border-ax-default rounded-xl border-ax-border-neutral-subtle h-full">
                <HStack
                    justify="space-between"
                    className="border-b py-3 px-4 border-ax-border-neutral-subtle"
                >
                    <Heading size="small" level="2">
                        Periode: 01.01.2025–31.12.2025
                    </Heading>
                    <DelPeriode
                        periode={{
                            fom: new Date().toDateString(),
                            tom: new Date().toDateString(),
                        }}
                        vilkårsperioder={[]}
                        erVurdert={false}
                        hentVilkårsvurdering={function (): void {
                            throw new Error('Function not implemented.');
                        }}
                    />
                </HStack>
                <div className="py-3 px-4">Innhold for periode</div>
            </Box>
        </section>
    );
};
