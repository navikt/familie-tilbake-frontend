import * as React from 'react';

import { clsx } from 'clsx';
import { styled } from 'styled-components';

import { BodyShort, Button, TimelinePeriodProps, VStack } from '@navikt/ds-react';
import { AFontWeightBold } from '@navikt/ds-tokens/dist/tokens';

import { useFeilutbetalingVilkårsvurdering } from './FeilutbetalingVilkårsvurderingContext';
import { VilkårsvurderingPeriodeSkjemaData } from './typer/feilutbetalingVilkårsvurdering';
import VilkårsvurderingPeriodeSkjema from './VilkårsvurderingPeriode/VilkårsvurderingPeriodeSkjema';
import { Aktsomhet, Vilkårsresultat } from '../../../kodeverk';
import { IBehandling } from '../../../typer/behandling';
import { IFagsak } from '../../../typer/fagsak';
import { FTAlertStripe, Navigering } from '../../Felleskomponenter/Flytelementer';
import TilbakeTidslinje from '../../Felleskomponenter/TilbakeTidslinje/TilbakeTidslinje';
import { useBehandling } from '../../../context/BehandlingContext';

const ValideringsFeilmelding = styled(BodyShort)`
    font-weight: ${AFontWeightBold};
`;

const finnClassNamePeriode = (
    periode: VilkårsvurderingPeriodeSkjemaData,
    aktivPeriode: boolean,
    erTotalbeløpUnder4Rettsgebyr: boolean
) => {
    const aktivPeriodeCss = aktivPeriode ? 'aktivPeriode' : '';
    if (
        periode.foreldet ||
        (!!periode.vilkårsvurderingsresultatInfo &&
            periode.vilkårsvurderingsresultatInfo.vilkårsvurderingsresultat ===
                Vilkårsresultat.GOD_TRO &&
            !periode.vilkårsvurderingsresultatInfo.godTro?.beløpErIBehold) ||
        (periode.vilkårsvurderingsresultatInfo?.aktsomhet?.aktsomhet ===
            Aktsomhet.SIMPEL_UAKTSOMHET &&
            erTotalbeløpUnder4Rettsgebyr &&
            !periode.vilkårsvurderingsresultatInfo.aktsomhet.tilbakekrevSmåbeløp)
    ) {
        return clsx('avvist', aktivPeriodeCss);
    } else if (
        !!periode.vilkårsvurderingsresultatInfo?.vilkårsvurderingsresultat &&
        !!periode.begrunnelse
    ) {
        return clsx('behandlet', aktivPeriodeCss);
    }
    return clsx('ubehandlet', aktivPeriodeCss);
};

const genererRader = (
    perioder: VilkårsvurderingPeriodeSkjemaData[],
    valgtPeriode: VilkårsvurderingPeriodeSkjemaData | undefined,
    erTotalbeløpUnder4Rettsgebyr: boolean
): TimelinePeriodProps[][] => {
    return [
        perioder.map((periode, index): TimelinePeriodProps => {
            const erAktivPeriode =
                !!valgtPeriode &&
                periode.periode.fom === valgtPeriode.periode.fom &&
                periode.periode.tom === valgtPeriode.periode.tom;
            return {
                end: new Date(periode.periode.tom),
                start: new Date(periode.periode.fom),
                status: 'success',
                isActive: erAktivPeriode,
                id: `index_${index}`,
                className: finnClassNamePeriode(
                    periode,
                    erAktivPeriode,
                    erTotalbeløpUnder4Rettsgebyr
                ),
            };
        }),
    ];
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

    const tidslinjeRader = genererRader(perioder, valgtPeriode, erTotalbeløpUnder4Rettsgebyr);
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
                    <ValideringsFeilmelding>{valideringsFeilmelding}</ValideringsFeilmelding>
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
                        {harUlagredeData ? 'Bekreft og fortsett' : 'Neste'}
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
