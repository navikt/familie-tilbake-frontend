import type { FC } from 'react';
import type { VedtaksresultatEnum } from '@/generated/types.gen';

import { ArrowUndoIcon, PercentIcon, XMarkIcon } from '@navikt/aksel-icons';
import { Heading, HStack, Tag } from '@navikt/ds-react';

import { formatCurrencyNoKr } from '@/utils/miscUtils';

import { type PeriodeTag, type Vilkårsperiode, vurdering } from './Vilkårsvurdering';

const resultat: Record<VedtaksresultatEnum, PeriodeTag> = {
    FULL_TILBAKEBETALING: {
        label: 'Full tilbakekreving',
        icon: <ArrowUndoIcon aria-hidden />,
        'data-color': 'brand-magenta',
    },
    DELVIS_TILBAKEBETALING: {
        label: 'Delvis tilbakekreving',
        icon: <PercentIcon aria-hidden />,
        'data-color': 'meta-purple',
    },
    INGEN_TILBAKEBETALING: {
        label: 'Ingen tilbakekreving',
        icon: <XMarkIcon aria-hidden />,
        'data-color': 'success',
    },
};

type Props = {
    perioder: Vilkårsperiode[];
    valgtPeriodeId: number;
    onSelectPeriode: (periodeId: number) => void;
};

export const VilkårsvurderingPeriodeListe: FC<Props> = ({
    perioder,
    valgtPeriodeId,
    onSelectPeriode,
}: Props) => {
    return (
        <section className="flex-1 min-h-0 overflow-y-hidden scrollbar-stable hover:overflow-y-auto flex flex-col gap-2">
            <HStack justify="space-between" align="center">
                <Heading size="small" level="2">
                    {perioder.length > 1 ? 'Perioder' : 'Periode'}
                </Heading>
                {perioder.filter(({ vurdert }) => vurdert).length} av {perioder.length} vurdert
            </HStack>
            <ul className="grid grid-cols-1 ax-sm:grid-cols-2 ax-md:grid-cols-1 gap-2">
                {perioder.map(periode => (
                    <li key={periode.id} className="flex min-h-11">
                        <button
                            onClick={(): void => onSelectPeriode(periode.id)}
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
                        </button>
                    </li>
                ))}
            </ul>
        </section>
    );
};
