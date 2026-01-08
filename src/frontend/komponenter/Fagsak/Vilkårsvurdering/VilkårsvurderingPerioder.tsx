import type { VilkårsvurderingPeriodeSkjemaData } from './typer/vilkårsvurdering';

import { BodyShort, VStack, type TimelinePeriodProps } from '@navikt/ds-react';
import * as React from 'react';

import { useVilkårsvurdering } from './VilkårsvurderingContext';
import VilkårsvurderingPeriodeSkjema from './VilkårsvurderingPeriode/VilkårsvurderingPeriodeSkjema';
import { Vilkårsresultat } from '../../../kodeverk';
import { type Behandling } from '../../../typer/behandling';
import { ClassNamePeriodeStatus } from '../../../typer/periodeSkjemaData';
import { FTAlertStripe } from '../../Felleskomponenter/Flytelementer';
import TilbakeTidslinje from '../../Felleskomponenter/TilbakeTidslinje/TilbakeTidslinje';

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
    behandling: Behandling;
    perioder: VilkårsvurderingPeriodeSkjemaData[];
    erTotalbeløpUnder4Rettsgebyr: boolean;
    erLesevisning: boolean;
};

const VilkårsvurderingPerioder: React.FC<Props> = ({
    behandling,
    perioder,
    erTotalbeløpUnder4Rettsgebyr,
    erLesevisning,
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
        <VStack gap="5">
            {valideringsFeilmelding && (
                <FTAlertStripe variant="error" fullWidth>
                    <BodyShort className="font-semibold">{valideringsFeilmelding}</BodyShort>
                </FTAlertStripe>
            )}
            <TilbakeTidslinje rader={tidslinjeRader} onSelectPeriode={onSelectPeriode} />
            {valgtPeriode && (
                <VilkårsvurderingPeriodeSkjema
                    behandling={behandling}
                    periode={valgtPeriode}
                    behandletPerioder={behandletPerioder}
                    erTotalbeløpUnder4Rettsgebyr={erTotalbeløpUnder4Rettsgebyr}
                    erLesevisning={erLesevisning}
                    pendingPeriode={pendingPeriode}
                    settPendingPeriode={settPendingPeriode}
                    perioder={perioder}
                />
            )}
        </VStack>
    ) : null;
};

export default VilkårsvurderingPerioder;
