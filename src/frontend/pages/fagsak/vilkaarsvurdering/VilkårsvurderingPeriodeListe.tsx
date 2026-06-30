import type { FC } from 'react';
import type { _0Enum as VedtaksresultatEnum } from '@/generated-new';
import type { PeriodeTag, Vilkårsperiode, Vurderingsstatus } from './typer';

import {
    ArrowUndoIcon,
    HeadCloudIcon,
    PercentIcon,
    QuestionmarkCircleIcon,
    SealCheckmarkIcon,
    SealXMarkIcon,
    XMarkIcon,
} from '@navikt/aksel-icons';
import { Heading, HStack, Tag } from '@navikt/ds-react';

import { formatCurrencyNoKr } from '@/utils/miscUtils';

import { erPeriodeVurdert } from './utils';

const resultat: Record<VedtaksresultatEnum, PeriodeTag> = {
    FULL_TILBAKEKREVING: {
        label: 'Full tilbakekreving',
        icon: <ArrowUndoIcon aria-hidden />,
        'data-color': 'brand-magenta',
    },
    DELVIS_TILBAKEKREVING: {
        label: 'Delvis tilbakekreving',
        icon: <PercentIcon aria-hidden />,
        'data-color': 'meta-purple',
    },
    INGEN_TILBAKEKREVING: {
        label: 'Ingen tilbakekreving',
        icon: <XMarkIcon aria-hidden />,
        'data-color': 'success',
    },
};

const vurdering: Record<Vurderingsstatus, PeriodeTag> = {
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

type Props = {
    perioder: Vilkårsperiode[];
    valgtPeriode: Vilkårsperiode | undefined;
    onSelectPeriode: (periode: Vilkårsperiode | undefined) => void;
};

export const VilkårsvurderingPeriodeListe: FC<Props> = ({
    perioder,
    valgtPeriode,
    onSelectPeriode,
}: Props) => {
    return (
        <section className="flex-1 min-h-0 scrollbar-stable flex flex-col gap-2 px-1">
            <HStack justify="space-between" align="center">
                <Heading size="small" level="2">
                    {perioder.length > 1 ? 'Perioder' : 'Periode'}
                </Heading>
                {perioder.filter(periode => erPeriodeVurdert(periode.vurdering)).length} av{' '}
                {perioder.length} vurdert
            </HStack>
            <ul className="grid grid-cols-1 ax-sm:grid-cols-2 ax-md:grid-cols-1 gap-2">
                {perioder.map(periode => (
                    <li key={periode.id} className="flex min-h-11">
                        <button
                            onClick={(): void => onSelectPeriode(periode)}
                            aria-pressed={periode.id === valgtPeriode?.id}
                            aria-label={`Periode ${periode.fom} til ${periode.tom}. Vurdering: ${vurdering[periode.vurdering].label}.${periode.resultat ? ` Resultat: ${resultat[periode.resultat].label}.` : ''} Feilutbetalt: ${formatCurrencyNoKr(periode.feilutbetalt)}.${periode.id === valgtPeriode?.id ? ' Valgt.' : ''}`}
                            className={`w-full rounded-xl p-4 gap-2 flex flex-col text-left transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 cursor-pointer ${
                                periode.id === valgtPeriode?.id
                                    ? 'border border-ax-bg-accent-strong bg-ax-bg-info-soft'
                                    : 'border border-ax-border-neutral-subtle hover:border-ax-border-neutral'
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
                                        data-color={resultat[periode.resultat]['data-color']}
                                    >
                                        {resultat[periode.resultat].label}
                                    </Tag>
                                )}
                            </HStack>
                            <span className="font-ax-bold text-xl">
                                {periode.fom}–{periode.tom}
                            </span>
                            <span className="text-ax-text-brand-magenta">
                                Feilutbetalt: {formatCurrencyNoKr(periode.feilutbetalt)}
                            </span>
                            {periode.rettsligGrunnlag.length > 0 && (
                                <span>{periode.rettsligGrunnlag.join(', ')}</span>
                            )}
                        </button>
                    </li>
                ))}
            </ul>
        </section>
    );
};
