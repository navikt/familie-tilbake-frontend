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
import { Heading, HStack, Tag, Tooltip } from '@navikt/ds-react';

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

const periodeKortAriaLabel = (
    periode: Vilkårsperiode,
    valgtPeriodeId: Vilkårsperiode['id'] | undefined
): string => {
    const vurderingLabel = vurdering[periode.vurdering].label;
    const resultatLabel = periode.resultat ? resultat[periode.resultat].label : undefined;
    const feilutbetaltLabel = formatCurrencyNoKr(periode.feilutbetalt);
    const rettsligGrunnlagLabel =
        periode.rettsligGrunnlag.length > 0 ? periode.rettsligGrunnlag.join(', ') : undefined;

    return `Periode ${periode.fom} til ${periode.tom}. Vurdering: ${vurderingLabel}.${
        resultatLabel ? ` Resultat: ${resultatLabel}.` : ''
    } Feilutbetalt: ${feilutbetaltLabel}.${
        rettsligGrunnlagLabel ? ` Rettslig grunnlag: ${rettsligGrunnlagLabel}.` : ''
    }${periode.id === valgtPeriodeId ? ' Valgt.' : ''}`;
};

type Props = {
    perioder: Vilkårsperiode[];
    valgtPeriodeId: Vilkårsperiode['id'] | undefined;
    setValgtPeriodeId: (periodeId: Vilkårsperiode['id']) => void;
};

export const VilkårsvurderingPeriodeListe: FC<Props> = ({
    perioder,
    valgtPeriodeId,
    setValgtPeriodeId,
}: Props) => {
    return (
        <section
            className="flex-1 min-h-0 scrollbar-stable flex flex-col gap-2 px-1"
            aria-label="Vilkårsvurderingsperioder"
        >
            <HStack justify="space-between" align="center">
                <Heading size="small" level="2">
                    {perioder.length > 1 ? 'Perioder' : 'Periode'}
                </Heading>
                <span aria-live="polite">
                    {perioder.filter(({ vurdering }) => erPeriodeVurdert(vurdering)).length} av{' '}
                    {perioder.length} vurdert
                </span>
            </HStack>
            <ul className="grid grid-cols-1 ax-sm:grid-cols-2 ax-md:grid-cols-1 gap-2">
                {perioder.map(periode => (
                    <li key={periode.id} className="flex min-h-11">
                        <button
                            onClick={(): void => setValgtPeriodeId(periode.id)}
                            aria-pressed={periode.id === valgtPeriodeId}
                            aria-label={periodeKortAriaLabel(periode, valgtPeriodeId)}
                            className={`w-full rounded-xl p-4 gap-2 flex flex-col text-left transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 cursor-pointer ${
                                periode.id === valgtPeriodeId
                                    ? 'border border-ax-bg-accent-strong bg-ax-bg-info-soft'
                                    : 'border border-ax-border-neutral-subtle hover:border-ax-border-neutral'
                            }`}
                        >
                            <HStack gap="space-8">
                                <Tooltip
                                    content={`Vurdering: ${vurdering[periode.vurdering].label}`}
                                >
                                    <Tag
                                        variant="moderate"
                                        icon={vurdering[periode.vurdering].icon}
                                        size="small"
                                        className="w-fit"
                                        data-color={vurdering[periode.vurdering]['data-color']}
                                    >
                                        {vurdering[periode.vurdering].label}
                                    </Tag>
                                </Tooltip>
                                {periode.resultat && (
                                    <Tooltip
                                        content={`Resultat: ${resultat[periode.resultat].label}`}
                                    >
                                        <Tag
                                            variant="moderate"
                                            icon={resultat[periode.resultat].icon}
                                            size="small"
                                            className="w-fit"
                                            data-color={resultat[periode.resultat]['data-color']}
                                        >
                                            {resultat[periode.resultat].label}
                                        </Tag>
                                    </Tooltip>
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
