import type { FC } from 'react';
import type { Vilkaarsperiode } from '@/generated-new';
import type { Vilkårsperiode } from './typer';

import { Box, Heading, HStack } from '@navikt/ds-react';

import { DelPeriode } from './del-periode/DelPeriode';
import { VilkårsvurderingSkjema } from './skjema/VilkårsvurderingSkjema';
import { SlåSammen } from './slå-sammen-periode/SlåSammen';
import { erPeriodeVurdert } from './utils';

type Props = {
    valgtPeriode: Vilkårsperiode;
    vilkårsperioder: Vilkaarsperiode[];
    hentVilkårsvurdering: () => void;
};

export const VilkårsvurderingDetaljer: FC<Props> = ({
    valgtPeriode,
    vilkårsperioder,
    hentVilkårsvurdering,
}: Props) => {
    const valgtVilkårsperiode = vilkårsperioder.find(
        ({ vilkårsvurdering: { id } }) => id === valgtPeriode.id
    );
    return (
        <section className="flex-2 min-h-0">
            <Box className="border border-ax-default rounded-xl border-ax-border-neutral-subtle h-full flex flex-col">
                <HStack
                    justify="space-between"
                    className="border-b py-3 px-4 border-ax-border-neutral-subtle shrink-0"
                >
                    <Heading size="small" level="2">
                        {`${valgtPeriode.fom}–${valgtPeriode.tom}`}
                    </Heading>
                    <HStack>
                        {valgtVilkårsperiode &&
                            valgtVilkårsperiode.vilkårsvurdering.delbarePerioder.length > 1 && (
                                <DelPeriode
                                    key={`${valgtVilkårsperiode.vilkårsvurdering.periode.fom}-${valgtVilkårsperiode.vilkårsvurdering.periode.tom}`}
                                    periode={valgtVilkårsperiode.vilkårsvurdering.periode}
                                    delbarePerioder={
                                        valgtVilkårsperiode.vilkårsvurdering.delbarePerioder
                                    }
                                    erVurdert={erPeriodeVurdert(valgtPeriode.vurdering)}
                                    hentVilkårsvurdering={hentVilkårsvurdering}
                                />
                            )}
                        <SlåSammen
                            valgtPeriodeId={valgtPeriode.id}
                            vilkårsperioder={vilkårsperioder.map(({ vilkårsvurdering }) => ({
                                periodeId: vilkårsvurdering.id,
                                periode: vilkårsvurdering.periode,
                                delbarePerioder: vilkårsvurdering.delbarePerioder,
                            }))}
                            hentVilkårsvurdering={hentVilkårsvurdering}
                        />
                    </HStack>
                </HStack>

                <VilkårsvurderingSkjema />
            </Box>
        </section>
    );
};
