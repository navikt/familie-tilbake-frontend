import * as React from 'react';

import classNames from 'classnames';
import { styled } from 'styled-components';

import { BodyShort, VStack } from '@navikt/ds-react';
import { AFontWeightBold } from '@navikt/ds-tokens/dist/tokens';
import { type Periode } from '@navikt/familie-tidslinje';

import { useFeilutbetalingVilkårsvurdering } from './FeilutbetalingVilkårsvurderingContext';
import { VilkårsvurderingPeriodeSkjemaData } from './typer/feilutbetalingVilkårsvurdering';
import VilkårsvurderingPeriodeSkjema from './VilkårsvurderingPeriode/VilkårsvurderingPeriodeSkjema';
import { Aktsomhet, Vilkårsresultat } from '../../../kodeverk';
import { IBehandling } from '../../../typer/behandling';
import { IFagsak } from '../../../typer/fagsak';
import { FTAlertStripe, FTButton, Navigering } from '../../Felleskomponenter/Flytelementer';
import TilbakeTidslinje from '../../Felleskomponenter/TilbakeTidslinje/TilbakeTidslinje';

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
        return classNames('avvist', aktivPeriodeCss);
    } else if (
        !!periode.vilkårsvurderingsresultatInfo?.vilkårsvurderingsresultat &&
        !!periode.begrunnelse
    ) {
        return classNames('behandlet', aktivPeriodeCss);
    }
    return classNames('ubehandlet', aktivPeriodeCss);
};

const genererRader = (
    perioder: VilkårsvurderingPeriodeSkjemaData[],
    valgtPeriode: VilkårsvurderingPeriodeSkjemaData | undefined,
    erTotalbeløpUnder4Rettsgebyr: boolean
): Periode[][] => {
    return [
        perioder.map((periode, index): Periode => {
            const erAktivPeriode =
                !!valgtPeriode &&
                periode.periode.fom === valgtPeriode.periode.fom &&
                periode.periode.tom === valgtPeriode.periode.tom;
            return {
                tom: new Date(periode.periode.tom),
                fom: new Date(periode.periode.fom),
                status: 'suksess',
                active: erAktivPeriode,
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

    const erHovedKnappDisabled =
        valgtPeriode !== undefined ||
        erLesevisning ||
        !allePerioderBehandlet ||
        !behandling.kanEndres;

    const onSelectPeriode = (periode: Periode) => {
        const periodeFom = periode.fom.toISOString().substring(0, 10);
        const periodeTom = periode.tom.toISOString().substring(0, 10);
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
                    <FTButton variant="primary" onClick={gåTilNesteSteg}>
                        Neste
                    </FTButton>
                ) : (
                    <FTButton
                        variant="primary"
                        onClick={sendInnSkjema}
                        loading={senderInn}
                        disabled={erHovedKnappDisabled}
                    >
                        {stegErBehandlet ? 'Neste' : 'Bekreft og fortsett'}
                    </FTButton>
                )}
                <FTButton variant="secondary" onClick={gåTilForrigeSteg}>
                    Forrige
                </FTButton>
            </Navigering>
        </VStack>
    ) : null;
};

export default VilkårsvurderingPerioder;
