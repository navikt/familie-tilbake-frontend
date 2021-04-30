import * as React from 'react';

import classNames from 'classnames';
import styled from 'styled-components';

import AlertStripe from 'nav-frontend-alertstriper';
import navFarger from 'nav-frontend-core';
import { Column, Row } from 'nav-frontend-grid';
import { Knapp } from 'nav-frontend-knapper';
import { Element } from 'nav-frontend-typografi';

import { Periode } from '@navikt/helse-frontend-tidslinje';

import { Vilkårsresultat } from '../../../kodeverk';
import { IBehandling } from '../../../typer/behandling';
import { Navigering, Spacer20 } from '../../Felleskomponenter/Flytelementer';
import TilbakeTidslinje from '../../Felleskomponenter/TilbakeTidslinje/TilbakeTidslinje';
import { useFeilutbetalingVilkårsvurdering } from './FeilutbetalingVilkårsvurderingContext';
import { VilkårsvurderingPeriodeSkjemaData } from './typer/feilutbetalingVilkårsvurdering';
import VilkårsvurderingPeriodeSkjema from './VilkårsvurderingPeriode/VilkårsvurderingPeriodeSkjema';

const StyledAlertStripe = styled(AlertStripe)`
    background-color: ${navFarger.navOransjeLighten80};

    .alertstripe__tekst {
        color: ${navFarger.navMorkGra};
        max-width: fit-content;
    }
`;

const finnClassNamePeriode = (
    periode: VilkårsvurderingPeriodeSkjemaData,
    aktivPeriode: boolean
) => {
    const aktivPeriodeCss = aktivPeriode ? 'aktivPeriode' : '';
    if (
        periode.foreldet ||
        (!!periode.vilkårsvurderingsresultatInfo &&
            periode.vilkårsvurderingsresultatInfo.vilkårsvurderingsresultat ===
                Vilkårsresultat.GOD_TRO &&
            !periode.vilkårsvurderingsresultatInfo.godTro?.beløpErIBehold)
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
    valgtPeriode: VilkårsvurderingPeriodeSkjemaData | undefined
): Periode[][] => {
    return [
        perioder.map(
            (periode, index): Periode => {
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
                    className: finnClassNamePeriode(periode, erAktivPeriode),
                };
            }
        ),
    ];
};

interface IProps {
    behandling: IBehandling;
    perioder: VilkårsvurderingPeriodeSkjemaData[];
    erTotalbeløpUnder4Rettsgebyr: boolean;
    erLesevisning: boolean;
}

const VilkårsvurderingPerioder: React.FC<IProps> = ({
    behandling,
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
        settTidslinjeRader(genererRader(perioder, valgtPeriode));
    }, [perioder, valgtPeriode]);

    React.useEffect(() => {
        if (!valgtPeriode) {
            settDisableBekreft(!allePerioderBehandlet);
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
                    <StyledAlertStripe type="feil">
                        <Element>{valideringsFeilmelding}</Element>
                    </StyledAlertStripe>
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
                                <Knapp type={'hoved'} mini={true} onClick={gåTilNeste}>
                                    Neste
                                </Knapp>
                            ) : (
                                <Knapp
                                    type={'hoved'}
                                    mini={true}
                                    onClick={sendInnSkjema}
                                    spinner={senderInn}
                                    autoDisableVedSpinner
                                    disabled={disableBekreft}
                                >
                                    {stegErBehandlet ? 'Neste' : 'Bekreft og fortsett'}
                                </Knapp>
                            )}
                        </div>
                        <div>
                            <Knapp type={'standard'} mini={true} onClick={gåTilForrige}>
                                Forrige
                            </Knapp>
                        </div>
                    </Navigering>
                </Column>
            </Row>
        </>
    ) : null;
};

export default VilkårsvurderingPerioder;
