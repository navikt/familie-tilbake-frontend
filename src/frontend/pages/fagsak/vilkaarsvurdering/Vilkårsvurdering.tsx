import type { FC, ReactNode } from 'react';
import type { VedtaksresultatEnum } from '@/generated';
import type { BestemmelseEllerGrunnlag } from '@/generated-new';

import {
    ArrowUndoIcon,
    HeadCloudIcon,
    PercentIcon,
    QuestionmarkCircleIcon,
    SealCheckmarkIcon,
    SealXMarkIcon,
    XMarkIcon,
} from '@navikt/aksel-icons';
import { Box, Heading, HStack, Tag, type TagProps, VStack } from '@navikt/ds-react';
import { useState } from 'react';

import { formatCurrencyNoKr } from '@/utils/miscUtils';

import { DelPeriode } from './del-periode/DelPeriode';

type PeriodeTag = {
    label: string;
    icon: ReactNode;
    'data-color': TagProps['data-color'];
};

export const vurdering: Record<string, PeriodeTag> = {
    IKKE_VURDERT: {
        label: 'Ikke vurdert',
        icon: <QuestionmarkCircleIcon aria-hidden />,
        'data-color': 'neutral',
    },
    GOD_TRO: { label: 'God tro', icon: <SealCheckmarkIcon aria-hidden />, 'data-color': 'success' },
    FORSETT: {
        label: 'Forsett',
        icon: <SealXMarkIcon aria-hidden />,
        'data-color': 'brand-magenta',
    },
    GROVT_UAKTSOMHET: {
        label: 'Grovt uaktsomt',
        icon: <SealXMarkIcon aria-hidden />,
        'data-color': 'warning',
    },
    UAKTSOMT: {
        label: 'Uaktsomt',
        icon: <SealXMarkIcon aria-hidden />,
        'data-color': 'meta-purple',
    },
    FORSTO: { label: 'Forsto', icon: <HeadCloudIcon aria-hidden />, 'data-color': 'meta-lime' },
    BURDE_FORSTÅTT: {
        label: 'Burde forstått',
        icon: <HeadCloudIcon aria-hidden />,
        'data-color': 'brand-beige',
    },
};

const resultat: Record<VedtaksresultatEnum, PeriodeTag> = {
    FULL_TILBAKEBETALING: {
        label: 'Full tilbakebetaling',
        icon: <XMarkIcon aria-hidden />,
        'data-color': 'brand-magenta',
    },
    DELVIS_TILBAKEBETALING: {
        label: 'Delvis tilbakebetaling',
        icon: <PercentIcon aria-hidden />,
        'data-color': 'meta-lime',
    },
    INGEN_TILBAKEBETALING: {
        label: 'Ingen tilbakebetaling',
        icon: <ArrowUndoIcon aria-hidden />,
        'data-color': 'success',
    },
};

type RettsligGrunnlag = {
    bestemmelse: BestemmelseEllerGrunnlag;
    grunnlag: BestemmelseEllerGrunnlag;
};

type Vilkårsperiode = {
    id: number;
    fom: string;
    tom: string;
    feilutbetalt: number;
    vurdering: string;
    vurdert: boolean;
    resultat: VedtaksresultatEnum;
    rettsligGrunnlag: RettsligGrunnlag[];
};

const perioder = Array.from({ length: 5 }, (_, i) => {
    const vurderingsnøkler = Object.keys(vurdering);
    const vurderingsnøkkel = vurderingsnøkler[i % vurderingsnøkler.length];
    return {
        id: i,
        fom: '01.01.2025',
        tom: '31.12.2025',
        feilutbetalt: 8234,
        vurdering: vurderingsnøkkel,
        vurdert: vurderingsnøkkel !== 'IKKE_VURDERT',
        resultat:
            Math.random() < 0.33
                ? 'FULL_TILBAKEBETALING'
                : Math.random() < 0.5
                  ? 'DELVIS_TILBAKEBETALING'
                  : 'INGEN_TILBAKEBETALING',
        rettsligGrunnlag: [
            {
                bestemmelse: { nøkkel: 'ANNET', beskrivelse: 'Annet' },
                grunnlag: { nøkkel: 'ANNET_FRITEKST', beskrivelse: 'Annet fritekst' },
            },
        ],
    } satisfies Vilkårsperiode;
});

export const Vilkårsvurdering: FC = () => {
    const [valgtPeriodeId, setValgtPeriodeId] = useState(0);
    return (
        <VStack gap="space-24" className="min-h-0 h-full">
            <HStack justify="space-between">
                <Heading size="medium">Vilkårsvurdering</Heading>
                {/* Hvis steget er vurdert */}
                <Tag variant="moderate" data-color="success">
                    Vurdert
                </Tag>
            </HStack>
            <div className="grid grid-cols-1 ax-md:grid-cols-3 gap-4 ax-md:h-full min-h-0">
                {/* TODO child av section er egen komponent */}
                <section className="col-span-1 ax-md:col-span-1 gap-2 flex flex-col overflow-y-auto min-h-0">
                    {/* TODO hent perioder */}
                    <HStack justify="space-between" align="center">
                        <Heading size="small" level="2">
                            {perioder.length > 1 ? 'Perioder' : 'Periode'}
                        </Heading>
                        {perioder.filter(periode => periode.vurdert).length} av {perioder.length}{' '}
                        vurdert
                    </HStack>
                    <ul className="grid grid-cols-1 ax-sm:grid-cols-2 ax-md:grid-cols-1 gap-2">
                        {perioder.map(periode => (
                            <li key={periode.id} className="flex min-h-11">
                                <button
                                    onClick={(): void => setValgtPeriodeId(periode.id)}
                                    aria-pressed={periode.id === valgtPeriodeId}
                                    aria-label={`Periode ${periode.fom} til ${periode.tom}. Vurdering: ${vurdering[periode.vurdering].label}. Resultat: ${resultat[periode.resultat].label}. Feilutbetalt: ${formatCurrencyNoKr(periode.feilutbetalt)}.${periode.id === valgtPeriodeId ? ' Valgt.' : ''}`}
                                    className={`w-full rounded-xl p-4 gap-2 flex flex-col text-left transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 cursor-pointer ${
                                        periode.id === valgtPeriodeId
                                            ? 'border border-ax-bg-accent-strong bg-ax-bg-info-soft focus:ring-ax-focus-color'
                                            : 'border border-ax-border-neutral-subtle hover:border-ax-border-neutral focus:ring-ax-focus-color'
                                    }`}
                                >
                                    <HStack gap="space-8">
                                        <Tag
                                            variant="moderate"
                                            icon={vurdering[periode.vurdering].icon}
                                            size="small"
                                            className="w-fit"
                                            data-color={vurdering[periode.vurdering]['data-color']}
                                        >
                                            {vurdering[periode.vurdering].label}
                                        </Tag>
                                        {periode.resultat && (
                                            <Tag
                                                variant="moderate"
                                                icon={resultat[periode.resultat].icon}
                                                size="small"
                                                className="w-fit"
                                                data-color={
                                                    resultat[periode.resultat]['data-color']
                                                }
                                            >
                                                {resultat[periode.resultat].label}
                                            </Tag>
                                        )}
                                    </HStack>
                                    <span className="font-ax-bold text-xl">
                                        {periode.fom}–{periode.tom}
                                    </span>
                                    <span className="font-semibold text-ax-text-brand-magenta">
                                        Feilutbetalt: {formatCurrencyNoKr(periode.feilutbetalt)}
                                    </span>
                                </button>
                            </li>
                        ))}
                    </ul>
                </section>
                {/* TODO child av section er egen komponent */}
                <section className="col-span-1 ax-md:col-span-2 h-full">
                    <Box className="border border-ax-default rounded-xl border-ax-border-neutral-subtle h-full">
                        {/* TODO hent valgt periode */}
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
                        <div className="py-3 px-4">Innhold her</div>
                    </Box>
                </section>
            </div>
        </VStack>
    );
};
