import * as React from 'react';

import classNames from 'classnames';
import styled from 'styled-components';

import { Column, Row } from 'nav-frontend-grid';

import { BodyShort } from '@navikt/ds-react';
import { Periode } from '@navikt/familie-tidslinje';

import { Aktsomhet, Vilkårsresultat } from '../../../kodeverk';
import { IBehandling } from '../../../typer/behandling';
import { IFagsak } from '../../../typer/fagsak';
import {
    FTAlertStripe,
    FTButton,
    Navigering,
    Spacer20,
} from '../../Felleskomponenter/Flytelementer';
import TilbakeTidslinje from '../../Felleskomponenter/TilbakeTidslinje/TilbakeTidslinje';
import { useFeilutbetalingVilkårsvurdering } from './FeilutbetalingVilkårsvurderingContext';
import { VilkårsvurderingPeriodeSkjemaData } from './typer/feilutbetalingVilkårsvurdering';
import VilkårsvurderingPeriodeSkjema from './VilkårsvurderingPeriode/VilkårsvurderingPeriodeSkjema';

const ValideringsFeilmelding = styled(BodyShort)`
    font-weight: bold;
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
    const [tidslinjeRader, settTidslinjeRader] = React.useState<Periode[][]>();
    const [disableBekreft, settDisableBekreft] = React.useState<boolean>(true);
    const {
        valgtPeriode,
        settValgtPeriode,
        stegErBehandlet,
        erAutoutført,
        gåTilForrige,
        gåTilNeste,
        behandletPerioder,
        allePerioderBehandlet,
        sendInnSkjema,
        senderInn,
        valideringsfeil,
        valideringsFeilmelding,
    } = useFeilutbetalingVilkårsvurdering();

    React.useEffect(() => {
        settTidslinjeRader(genererRader(perioder, valgtPeriode, erTotalbeløpUnder4Rettsgebyr));
    }, [perioder, valgtPeriode]);

    React.useEffect(() => {
        if (!valgtPeriode) {
            settDisableBekreft(!allePerioderBehandlet || !behandling.kanEndres);
        } else {
            settDisableBekreft(true);
        }
    }, [valgtPeriode, allePerioderBehandlet]);

    const onSelectPeriode = (periode: Periode) => {
        const periodeFom = periode.fom.toISOString().substring(0, 10);
        const periodeTom = periode.tom.toISOString().substring(0, 10);
        const vilkårsvurderingPeriode = perioder.find(
            per => per.periode.fom === periodeFom && per.periode.tom === periodeTom
        );
        settValgtPeriode(vilkårsvurderingPeriode);
    };

    return perioder && tidslinjeRader ? (
        <>
            {valideringsfeil && (
                <>
                    <FTAlertStripe variant="error">
                        <ValideringsFeilmelding>{valideringsFeilmelding}</ValideringsFeilmelding>
                    </FTAlertStripe>
                    <Spacer20 />
                </>
            )}
            <Row>
                <Column xs="12">
                    <TilbakeTidslinje rader={tidslinjeRader} onSelectPeriode={onSelectPeriode} />
                </Column>
            </Row>
            {valgtPeriode && (
                <>
                    <Spacer20 />
                    <Row>
                        <Column xs="12">
                            <VilkårsvurderingPeriodeSkjema
                                behandling={behandling}
                                periode={valgtPeriode}
                                behandletPerioder={behandletPerioder}
                                erTotalbeløpUnder4Rettsgebyr={erTotalbeløpUnder4Rettsgebyr}
                                erLesevisning={erLesevisning}
                                fagsak={fagsak}
                            />
                        </Column>
                    </Row>
                </>
            )}
            <Row>
                <Column md="12">
                    <Navigering>
                        <div>
                            {erAutoutført || (stegErBehandlet && erLesevisning) ? (
                                <FTButton variant="primary" onClick={gåTilNeste}>
                                    Neste
                                </FTButton>
                            ) : (
                                <FTButton
                                    variant="primary"
                                    onClick={sendInnSkjema}
                                    loading={senderInn}
                                    disabled={disableBekreft}
                                >
                                    {stegErBehandlet ? 'Neste' : 'Bekreft og fortsett'}
                                </FTButton>
                            )}
                        </div>
                        <div>
                            <FTButton variant="secondary" onClick={gåTilForrige}>
                                Forrige
                            </FTButton>
                        </div>
                    </Navigering>
                </Column>
            </Row>
        </>
    ) : null;
};

export default VilkårsvurderingPerioder;
