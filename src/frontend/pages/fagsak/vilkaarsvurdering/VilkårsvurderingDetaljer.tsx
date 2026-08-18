import type { AxiosError } from 'axios';
import type { FC } from 'react';
import type { SubmitHandler } from 'react-hook-form';
import type {
    BehandlingLagreVilkaarsvurderingData,
    BehandlingLagreVilkaarsvurderingError,
    BehandlingLagreVilkaarsvurderingResponse,
    Periode,
    Vilkaarsperiode,
} from '@/generated-new';
import type { Options } from '@/generated-new/client';
import type { VilkårsvurderingSkjemaFelter } from './skjema/schema';
import type { Vilkårsperiode } from './typer';

import { zodResolver } from '@hookform/resolvers/zod';
import { Heading, HStack } from '@navikt/ds-react';
import { useMutation } from '@tanstack/react-query';
import { useMemo } from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import { useBehandling } from '@/context/BehandlingContext';
import { useVisGlobalAlert } from '@/stores/globalAlertStore';

import { DelPeriode } from './del-periode/DelPeriode';
import { LagreKnapp } from './LagreKnapp';
import { lagVilkårsvurderingSkjema } from './skjema/schema';
import { utledDefaultValues } from './skjema/utledDefaultValues';
import { utledWritable } from './skjema/utledWritable';
import { VilkårsvurderingSkjema } from './skjema/VilkårsvurderingSkjema';
import { SlåSammen } from './slå-sammen-periode/SlåSammen';
import { erPeriodeVurdert } from './utils';
import { useVilkårsvurderingLesedata } from './VilkårsvurderingLesedataContext';

type InnholdProps = {
    valgtPeriode: Vilkårsperiode;
    valgtVilkårsperiode: Vilkaarsperiode;
    vilkårsperioder: Vilkaarsperiode[];
    hentVilkårsvurdering: () => void;
};

export const LAGRE_VILKÅRSVURDERING_MUTATION_KEY = ['lagreVilkårsvurdering'] as const;

const VilkårsvurderingDetaljerInnhold: FC<InnholdProps> = ({
    valgtPeriode,
    valgtVilkårsperiode,
    vilkårsperioder,
    hentVilkårsvurdering,
}: InnholdProps) => {
    const { behandlingId } = useBehandling();
    const { erUnder4xRettsgebyr, momenterSærligeGrunner, momenterReduksjonGodTro } =
        useVilkårsvurderingLesedata();
    const visGlobalAlert = useVisGlobalAlert();

    const skjema = useMemo(
        () => lagVilkårsvurderingSkjema(erUnder4xRettsgebyr),
        [erUnder4xRettsgebyr]
    );

    const methods = useForm<VilkårsvurderingSkjemaFelter>({
        resolver: zodResolver(skjema),
        defaultValues: utledDefaultValues(
            valgtVilkårsperiode.vilkårsvurdering,
            valgtVilkårsperiode.simulertBeløp ?? null,
            erPeriodeVurdert(valgtPeriode.vurdering)
        ),
    });

    const lagreMutation = useMutation<
        BehandlingLagreVilkaarsvurderingResponse,
        AxiosError<BehandlingLagreVilkaarsvurderingError>,
        Options<BehandlingLagreVilkaarsvurderingData>
    >({
        mutationKey: LAGRE_VILKÅRSVURDERING_MUTATION_KEY,
        onError: (error: AxiosError<BehandlingLagreVilkaarsvurderingError>) => {
            visGlobalAlert({
                title: error.response?.data.tittel ?? 'Kunne ikke lagre vilkårsvurderingen',
                message: error.response?.data.melding,
                status: 'error',
            });
        },
    });

    const onSubmit: SubmitHandler<VilkårsvurderingSkjemaFelter> = (
        data: VilkårsvurderingSkjemaFelter
    ): void => {
        lagreMutation.mutate(
            {
                path: { behandlingId, periodeId: valgtPeriode.id },
                body: utledWritable(data, {
                    fom: valgtVilkårsperiode.vilkårsvurdering.fom,
                    tom: valgtVilkårsperiode.vilkårsvurdering.tom,
                    delbarePerioder: valgtVilkårsperiode.vilkårsvurdering.delbarePerioder,
                    momenter: [...momenterSærligeGrunner, ...momenterReduksjonGodTro],
                }),
            },
            {
                onSuccess: () => {
                    methods.reset(data);
                    hentVilkårsvurdering();
                },
            }
        );
    };

    return (
        <FormProvider {...methods}>
            <HStack
                justify="space-between"
                className="border-b py-3 px-4 border-ax-border-neutral-subtle shrink-0"
            >
                <Heading size="small" level="2">
                    {`${valgtPeriode.fom}–${valgtPeriode.tom}`}
                </Heading>
                <HStack gap="space-4">
                    {valgtVilkårsperiode.vilkårsvurdering.delbarePerioder.length > 1 && (
                        <DelPeriode
                            key={`${valgtVilkårsperiode.vilkårsvurdering.fom}-${valgtVilkårsperiode.vilkårsvurdering.tom}`}
                            periode={
                                {
                                    fom: valgtVilkårsperiode.vilkårsvurdering.fom,
                                    tom: valgtVilkårsperiode.vilkårsvurdering.tom,
                                } satisfies Periode
                            }
                            delbarePerioder={valgtVilkårsperiode.vilkårsvurdering.delbarePerioder}
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
                    <LagreKnapp
                        skjema={skjema}
                        laster={lagreMutation.isPending}
                        lagre={methods.handleSubmit(onSubmit)}
                    />
                </HStack>
            </HStack>
            <form
                className="py-3 px-4 overflow-y-auto gap-6 flex flex-col flex-1"
                onSubmit={methods.handleSubmit(onSubmit)}
            >
                <VilkårsvurderingSkjema />
            </form>
        </FormProvider>
    );
};

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
            {valgtVilkårsperiode && (
                <VilkårsvurderingDetaljerInnhold
                    valgtPeriode={valgtPeriode}
                    valgtVilkårsperiode={valgtVilkårsperiode}
                    vilkårsperioder={vilkårsperioder}
                    hentVilkårsvurdering={hentVilkårsvurdering}
                />
            )}
        </section>
    );
};
