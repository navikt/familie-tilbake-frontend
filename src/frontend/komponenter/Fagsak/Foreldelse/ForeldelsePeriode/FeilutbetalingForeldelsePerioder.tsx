import * as React from 'react';

import classNames from 'classnames';

import { Column, Row } from 'nav-frontend-grid';

import { Periode } from '@navikt/familie-tidslinje';

import { Foreldelsevurdering } from '../../../../kodeverk';
import { IBehandling } from '../../../../typer/behandling';
import { ForeldelsePeriode } from '../../../../typer/feilutbetalingtyper';
import { FTButton, Navigering, Spacer20 } from '../../../Felleskomponenter/Flytelementer';
import TilbakeTidslinje from '../../../Felleskomponenter/TilbakeTidslinje/TilbakeTidslinje';
import { useFeilutbetalingForeldelse } from '../FeilutbetalingForeldelseContext';
import { ForeldelsePeriodeSkjemeData } from '../typer/feilutbetalingForeldelse';
import FeilutbetalingForeldelsePeriodeSkjema from './FeilutbetalingForeldelsePeriodeSkjema';

const finnClassNamePeriode = (periode: ForeldelsePeriode, aktivPeriode: boolean) => {
    const aktivPeriodeCss = aktivPeriode ? 'aktivPeriode' : '';
    switch (periode.foreldelsesvurderingstype) {
        case Foreldelsevurdering.FORELDET:
            return classNames('avvist', aktivPeriodeCss);
        case Foreldelsevurdering.TILLEGGSFRIST:
        case Foreldelsevurdering.IKKE_FORELDET:
            return classNames('behandlet', aktivPeriodeCss);
        case Foreldelsevurdering.IKKE_VURDERT:
        case Foreldelsevurdering.UDEFINERT:
        default:
            return classNames('ubehandlet', aktivPeriodeCss);
    }
};

const genererRader = (
    perioder: ForeldelsePeriode[],
    valgtPeriode: ForeldelsePeriode | undefined
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
                className: finnClassNamePeriode(periode, erAktivPeriode),
            };
        }),
    ];
};

interface IProps {
    behandling: IBehandling;
    perioder: ForeldelsePeriodeSkjemeData[];
    erLesevisning: boolean;
}

const FeilutbetalingForeldelsePerioder: React.FC<IProps> = ({
    behandling,
    perioder,
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
        allePerioderBehandlet,
        sendInnSkjema,
        senderInn,
    } = useFeilutbetalingForeldelse();

    React.useEffect(() => {
        settTidslinjeRader(genererRader(perioder, valgtPeriode));
    }, [perioder, valgtPeriode]);

    React.useEffect(() => {
        if (!valgtPeriode) {
            settDisableBekreft(!allePerioderBehandlet || !behandling.kanEndres);
        } else {
            settDisableBekreft(true);
        }
    }, [valgtPeriode, allePerioderBehandlet]);

    const onSelectPeriode = (periode: Periode): void => {
        const periodeFom = periode.fom.toISOString().substring(0, 10);
        const periodeTom = periode.tom.toISOString().substring(0, 10);
        const foreldelsePeriode = perioder.find(
            per => per.periode.fom === periodeFom && per.periode.tom === periodeTom
        );
        settValgtPeriode(foreldelsePeriode);
    };

    return perioder && tidslinjeRader ? (
        <>
            <Row>
                <Column xs="12">
                    <TilbakeTidslinje rader={tidslinjeRader} onSelectPeriode={onSelectPeriode} />
                </Column>
            </Row>
            {!!valgtPeriode && (
                <>
                    <Spacer20 />
                    <Row>
                        <Column xs="12">
                            <FeilutbetalingForeldelsePeriodeSkjema
                                behandling={behandling}
                                periode={valgtPeriode}
                                erLesevisning={erLesevisning}
                            />
                        </Column>
                    </Row>
                </>
            )}
            <Spacer20 />
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

export default FeilutbetalingForeldelsePerioder;
