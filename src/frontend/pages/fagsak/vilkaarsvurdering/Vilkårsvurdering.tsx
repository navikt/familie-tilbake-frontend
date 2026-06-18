import type { FC, ReactNode } from 'react';
import type { VedtaksresultatEnum } from '@/generated';
import type { BestemmelseEllerGrunnlag } from '@/generated-new';

import {
    HeadCloudIcon,
    QuestionmarkCircleIcon,
    SealCheckmarkIcon,
    SealXMarkIcon,
} from '@navikt/aksel-icons';
import { Heading, HStack, Tag, type TagProps, VStack } from '@navikt/ds-react';
import { useState } from 'react';

import { VilkårsvurderingDetaljer } from './VilkårsvurderingDetaljer';
import { VilkårsvurderingPeriodeListe } from './VilkårsvurderingPeriodeListe';

export type PeriodeTag = {
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

type RettsligGrunnlag = {
    bestemmelse: BestemmelseEllerGrunnlag;
    grunnlag: BestemmelseEllerGrunnlag;
};

export type Vilkårsperiode = {
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
                {/* TODO Status for steget */}
                <Tag variant="moderate" data-color="success">
                    Vurdert
                </Tag>
            </HStack>
            <div className="flex flex-col ax-md:flex-row gap-4 min-h-0 h-full">
                <VilkårsvurderingPeriodeListe
                    perioder={perioder}
                    valgtPeriodeId={valgtPeriodeId}
                    onSelectPeriode={setValgtPeriodeId}
                />
                <VilkårsvurderingDetaljer />
            </div>
        </VStack>
    );
};
