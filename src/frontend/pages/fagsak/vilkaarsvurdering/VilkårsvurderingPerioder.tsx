import type { VilkårsvurderingPeriodeSkjemaData } from './typer/vilkårsvurdering';
import type { ForeldelsesvurderingstypeEnum } from '~/generated';

import { BodyShort, LocalAlert, type TimelinePeriodProps } from '@navikt/ds-react';
import { useEffect, useState, type FC } from 'react';

import { Vilkårsresultat } from '~/kodeverk';
import { TilbakeTidslinje } from '~/komponenter/tilbake-tidslinje/TilbakeTidslinje';

import { VilkårsvurderingPeriodeSkjema } from './vilkaarsvurdering-periode/VilkårsvurderingPeriodeSkjema';
import { useVilkårsvurdering } from './VilkårsvurderingContext';

const finnPeriodeStatus = (
    periode: VilkårsvurderingPeriodeSkjemaData
): TimelinePeriodProps['status'] => {
    if (periode.foreldet) {
        return 'warning';
    }
    const { vilkårsvurderingsresultatInfo } = periode;
    const { vilkårsvurderingsresultat } = vilkårsvurderingsresultatInfo || {};

    const erBehandlet =
        !!vilkårsvurderingsresultat &&
        vilkårsvurderingsresultat !== Vilkårsresultat.Udefinert &&
        !!periode.begrunnelse;
    return erBehandlet ? 'success' : 'neutral';
};

const finnStatusLabel = (
    periode: VilkårsvurderingPeriodeSkjemaData
): ForeldelsesvurderingstypeEnum | 'VURDERT' => {
    if (periode.foreldet) {
        return 'FORELDET';
    }
    // Har ingen måte å identifisere TILLEGGSFRIST på, så VURDERT dekker det og IKKE_FORELDET
    return periode.begrunnelse ? 'VURDERT' : 'IKKE_VURDERT';
};

const lagTidslinjeRader = (
    perioder: VilkårsvurderingPeriodeSkjemaData[],
    valgtPeriode: VilkårsvurderingPeriodeSkjemaData | undefined
): TimelinePeriodProps[][] => [
    perioder.map((periode): TimelinePeriodProps => {
        const erAktivPeriode = !!valgtPeriode && periode.periode.fom === valgtPeriode.periode.fom;
        return {
            end: new Date(periode.periode.tom),
            start: new Date(periode.periode.fom),
            status: finnPeriodeStatus(periode),
            isActive: erAktivPeriode,
            id: periode.periode.fom,
            statusLabel: finnStatusLabel(periode),
        } satisfies TimelinePeriodProps;
    }),
];

type Props = {
    perioder: VilkårsvurderingPeriodeSkjemaData[];
    erTotalbeløpUnder4Rettsgebyr: boolean;
};

export const VilkårsvurderingPerioder: FC<Props> = ({ perioder, erTotalbeløpUnder4Rettsgebyr }) => {
    const { valgtPeriode, settValgtPeriode, behandletPerioder, valideringsFeilmelding } =
        useVilkårsvurdering();
    const [pendingPeriode, setPendingPeriode] = useState<
        VilkårsvurderingPeriodeSkjemaData | undefined
    >();

    const tidslinjeRader = lagTidslinjeRader(perioder, valgtPeriode);

    useEffect(() => {
        if (!valgtPeriode && perioder && perioder.length > 0) {
            settValgtPeriode(perioder[0]);
        }
    }, [perioder, valgtPeriode, tidslinjeRader, settValgtPeriode]);

    const onSelectPeriode = (periode: TimelinePeriodProps): void => {
        const periodeFom = periode.start.toISOString().substring(0, 10);
        const periodeTom = periode.end.toISOString().substring(0, 10);
        const vilkårsvurderingPeriode = perioder.find(
            per => per.periode.fom === periodeFom && per.periode.tom === periodeTom
        );

        setPendingPeriode(vilkårsvurderingPeriode);
    };

    return perioder && tidslinjeRader ? (
        <>
            {valideringsFeilmelding && (
                <LocalAlert status="error">
                    <LocalAlert.Header>
                        <LocalAlert.Title>Valideringsfeil</LocalAlert.Title>
                    </LocalAlert.Header>
                    <LocalAlert.Content>
                        <BodyShort className="font-semibold">{valideringsFeilmelding}</BodyShort>
                    </LocalAlert.Content>
                </LocalAlert>
            )}
            <TilbakeTidslinje rader={tidslinjeRader} onSelectPeriode={onSelectPeriode} />
            {valgtPeriode && (
                <VilkårsvurderingPeriodeSkjema
                    periode={valgtPeriode}
                    behandletPerioder={behandletPerioder}
                    erTotalbeløpUnder4Rettsgebyr={erTotalbeløpUnder4Rettsgebyr}
                    pendingPeriode={pendingPeriode}
                    settPendingPeriode={setPendingPeriode}
                    perioder={perioder}
                />
            )}
        </>
    ) : null;
};
