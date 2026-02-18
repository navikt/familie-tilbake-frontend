import type { VilkårsvurderingPeriodeSkjemaData } from './typer/vilkårsvurdering';

import { Vilkårsresultat } from '@kodeverk';
import { TilbakeTidslinje } from '@komponenter/tilbake-tidslinje/TilbakeTidslinje';
import { Alert, BodyShort, type TimelinePeriodProps } from '@navikt/ds-react';
import { ClassNamePeriodeStatus } from '@typer/periodeSkjemaData';
import * as React from 'react';

import { VilkårsvurderingPeriodeSkjema } from './vilkaarsvurdering-periode/VilkårsvurderingPeriodeSkjema';
import { useVilkårsvurdering } from './VilkårsvurderingContext';

const lagTidslinjeRader = (
    perioder: VilkårsvurderingPeriodeSkjemaData[],
    valgtPeriode: VilkårsvurderingPeriodeSkjemaData | undefined
): TimelinePeriodProps[][] => {
    return [
        perioder.map((periode, index): TimelinePeriodProps => {
            const erAktivPeriode =
                !!valgtPeriode &&
                periode.periode.fom === valgtPeriode.periode.fom &&
                periode.periode.tom === valgtPeriode.periode.tom;
            const classNamePeriodeStatus = finnClassNamePeriodeStatus(periode);
            let periodeStatus: 'danger' | 'info' | 'neutral' | 'success' | 'warning' = 'warning';
            if (classNamePeriodeStatus === ClassNamePeriodeStatus.Avvist) {
                periodeStatus = 'danger';
            } else if (classNamePeriodeStatus === ClassNamePeriodeStatus.Behandlet) {
                periodeStatus = 'success';
            }
            return {
                end: new Date(periode.periode.tom),
                start: new Date(periode.periode.fom),
                status: periodeStatus,
                isActive: erAktivPeriode,
                id: `index_${index}`,
                className: classNamePeriodeStatus,
            };
        }),
    ];
};

const finnClassNamePeriodeStatus = (
    periode: VilkårsvurderingPeriodeSkjemaData
): ClassNamePeriodeStatus => {
    const { vilkårsvurderingsresultatInfo } = periode;
    const { vilkårsvurderingsresultat } = vilkårsvurderingsresultatInfo || {};

    if (periode.foreldet) {
        return ClassNamePeriodeStatus.Avvist;
    }

    const erBehandlet =
        !!vilkårsvurderingsresultat &&
        vilkårsvurderingsresultat !== Vilkårsresultat.Udefinert &&
        !!periode.begrunnelse;
    return erBehandlet ? ClassNamePeriodeStatus.Behandlet : ClassNamePeriodeStatus.Ubehandlet;
};

type Props = {
    perioder: VilkårsvurderingPeriodeSkjemaData[];
    erTotalbeløpUnder4Rettsgebyr: boolean;
};

export const VilkårsvurderingPerioder: React.FC<Props> = ({
    perioder,
    erTotalbeløpUnder4Rettsgebyr,
}) => {
    const { valgtPeriode, settValgtPeriode, behandletPerioder, valideringsFeilmelding } =
        useVilkårsvurdering();
    const [pendingPeriode, settPendingPeriode] = React.useState<
        VilkårsvurderingPeriodeSkjemaData | undefined
    >();

    const tidslinjeRader = lagTidslinjeRader(perioder, valgtPeriode);

    React.useEffect(() => {
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

        settPendingPeriode(vilkårsvurderingPeriode);
    };

    return perioder && tidslinjeRader ? (
        <>
            {valideringsFeilmelding && (
                <Alert variant="error">
                    <BodyShort className="font-semibold">{valideringsFeilmelding}</BodyShort>
                </Alert>
            )}
            <TilbakeTidslinje rader={tidslinjeRader} onSelectPeriode={onSelectPeriode} />
            {valgtPeriode && (
                <VilkårsvurderingPeriodeSkjema
                    periode={valgtPeriode}
                    behandletPerioder={behandletPerioder}
                    erTotalbeløpUnder4Rettsgebyr={erTotalbeløpUnder4Rettsgebyr}
                    pendingPeriode={pendingPeriode}
                    settPendingPeriode={settPendingPeriode}
                    perioder={perioder}
                />
            )}
        </>
    ) : null;
};
