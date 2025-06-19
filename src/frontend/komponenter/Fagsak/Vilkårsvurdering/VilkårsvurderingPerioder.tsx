import type { VilkårsvurderingPeriodeSkjemaData } from './typer/feilutbetalingVilkårsvurdering';
import type { IBehandling } from '../../../typer/behandling';
import type { IFagsak } from '../../../typer/fagsak';
import type { TimelinePeriodProps } from '@navikt/ds-react';

import { BodyShort, Button, VStack } from '@navikt/ds-react';
import * as React from 'react';

import { useFeilutbetalingVilkårsvurdering } from './FeilutbetalingVilkårsvurderingContext';
import VilkårsvurderingPeriodeSkjema from './VilkårsvurderingPeriode/VilkårsvurderingPeriodeSkjema';
import { useBehandling } from '../../../context/BehandlingContext';
import { ClassNamePeriodeStatus } from '../../../typer/periodeSkjemaData';
import { FTAlertStripe, Navigering } from '../../Felleskomponenter/Flytelementer';
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
            const periodeStatus =
                classNamePeriodeStatus === ClassNamePeriodeStatus.Avvist
                    ? 'danger'
                    : classNamePeriodeStatus === ClassNamePeriodeStatus.Behandlet
                      ? 'success'
                      : 'warning';
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

const finnClassNamePeriodeStatus = (periode: VilkårsvurderingPeriodeSkjemaData) => {
    const { vilkårsvurderingsresultatInfo } = periode;
    const { vilkårsvurderingsresultat } = vilkårsvurderingsresultatInfo || {};

    if (periode.foreldet) {
        return ClassNamePeriodeStatus.Avvist;
    }

    const erBehandlet = !!vilkårsvurderingsresultat && !!periode.begrunnelse;
    return erBehandlet ? ClassNamePeriodeStatus.Behandlet : ClassNamePeriodeStatus.Ubehandlet;
};

interface IProps {
    behandling: IBehandling;
    fagsak: IFagsak;
    perioder: VilkårsvurderingPeriodeSkjemaData[];
    erTotalbeløpUnder4Rettsgebyr: boolean;
    erLesevisning: boolean;
}

const VilkårsvurderingPerioder: React.FC<IProps> = ({
    behandling,
    fagsak,
    perioder,
    erTotalbeløpUnder4Rettsgebyr,
    erLesevisning,
}) => {
    const {
        valgtPeriode,
        settValgtPeriode,
        stegErBehandlet,
        erAutoutført,
        gåTilForrigeSteg,
        gåTilNesteSteg,
        behandletPerioder,
        allePerioderBehandlet,
        sendInnSkjema,
        senderInn,
        valideringsfeil,
        valideringsFeilmelding,
    } = useFeilutbetalingVilkårsvurdering();

    const tidslinjeRader = lagTidslinjeRader(perioder, valgtPeriode);
    const { harUlagredeData } = useBehandling();

    const erHovedKnappDisabled =
        valgtPeriode !== undefined ||
        erLesevisning ||
        !allePerioderBehandlet ||
        !behandling.kanEndres;

    const onSelectPeriode = (periode: TimelinePeriodProps) => {
        const periodeFom = periode.start.toISOString().substring(0, 10);
        const periodeTom = periode.end.toISOString().substring(0, 10);
        const vilkårsvurderingPeriode = perioder.find(
            per => per.periode.fom === periodeFom && per.periode.tom === periodeTom
        );
        settValgtPeriode(vilkårsvurderingPeriode);
    };

    return perioder && tidslinjeRader ? (
        <VStack gap="5">
            {valideringsfeil && (
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
                    fagsak={fagsak}
                />
            )}
            <Navigering>
                {erAutoutført || (stegErBehandlet && erLesevisning) ? (
                    <Button variant="primary" onClick={gåTilNesteSteg}>
                        Neste
                    </Button>
                ) : (
                    <Button
                        variant="primary"
                        onClick={sendInnSkjema}
                        loading={senderInn}
                        disabled={erHovedKnappDisabled}
                    >
                        {harUlagredeData ? 'Lagre og fortsett' : 'Neste'}
                    </Button>
                )}
                <Button variant="secondary" onClick={gåTilForrigeSteg}>
                    Forrige
                </Button>
            </Navigering>
        </VStack>
    ) : null;
};

export default VilkårsvurderingPerioder;
