import type { FC } from 'react';
import type { Periode, Vilkaarsperiode } from '@/generated-new';
import type { Vilkårsperiode } from './typer';

import { Button, Heading, HStack } from '@navikt/ds-react';

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
        <section
            className="flex-2 min-h-0 border border-ax-default rounded-xl border-ax-border-neutral-subtle flex flex-col"
            aria-label={`Vilkårsvurdering for periode ${valgtPeriode.fom} til ${valgtPeriode.tom}`}
        >
            <HStack
                justify="space-between"
                className="border-b py-3 px-4 border-ax-border-neutral-subtle shrink-0"
            >
                <Heading size="small" level="2">
                    {`${valgtPeriode.fom}–${valgtPeriode.tom}`}
                </Heading>
                <HStack gap="space-4">
                    {valgtVilkårsperiode &&
                        valgtVilkårsperiode.vilkårsvurdering.delbarePerioder.length > 1 && (
                            <DelPeriode
                                key={`${valgtVilkårsperiode.vilkårsvurdering.fom}-${valgtVilkårsperiode.vilkårsvurdering.tom}`}
                                periode={
                                    {
                                        fom: valgtVilkårsperiode.vilkårsvurdering.fom,
                                        tom: valgtVilkårsperiode.vilkårsvurdering.tom,
                                    } satisfies Periode
                                }
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
                            periode: {
                                fom: vilkårsvurdering.fom,
                                tom: vilkårsvurdering.tom,
                            } satisfies Periode,
                            delbarePerioder: vilkårsvurdering.delbarePerioder,
                        }))}
                        hentVilkårsvurdering={hentVilkårsvurdering}
                    />
                    <Button size="xsmall" onClick={(): void => undefined}>
                        Lagre
                    </Button>
                </HStack>
            </HStack>
            {valgtVilkårsperiode && (
                <VilkårsvurderingSkjema
                    key={valgtVilkårsperiode.vilkårsvurdering.id}
                    vilkårsvurdering={valgtVilkårsperiode.vilkårsvurdering}
                    simulertBeløp={valgtVilkårsperiode.simulertBeløp ?? null}
                />
            )}
        </section>
    );
};
