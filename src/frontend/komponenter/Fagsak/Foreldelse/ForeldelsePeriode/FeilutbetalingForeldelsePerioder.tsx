import * as React from 'react';

import classNames from 'classnames';

import { Button, VStack } from '@navikt/ds-react';
import { type Periode } from '@navikt/familie-tidslinje';

import FeilutbetalingForeldelsePeriodeSkjema from './FeilutbetalingForeldelsePeriodeSkjema';
import { Foreldelsevurdering } from '../../../../kodeverk';
import { IBehandling } from '../../../../typer/behandling';
import { ForeldelsePeriode } from '../../../../typer/feilutbetalingtyper';
import { Navigering } from '../../../Felleskomponenter/Flytelementer';
import TilbakeTidslinje from '../../../Felleskomponenter/TilbakeTidslinje/TilbakeTidslinje';
import { useFeilutbetalingForeldelse } from '../FeilutbetalingForeldelseContext';
import { ForeldelsePeriodeSkjemeData } from '../typer/feilutbetalingForeldelse';

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
        gåTilForrigeSteg,
        gåTilNesteSteg,
        allePerioderBehandlet,
        sendInnSkjema,
        senderInn,
    } = useFeilutbetalingForeldelse();

    React.useEffect(() => {
        settTidslinjeRader(genererRader(perioder, valgtPeriode));
    }, [perioder, valgtPeriode]);

    React.useEffect(() => {
        if (!valgtPeriode) {
            settDisableBekreft(!allePerioderBehandlet || !behandling.kanEndres || erLesevisning);
        } else {
            settDisableBekreft(true);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
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
        <VStack gap="5">
            <TilbakeTidslinje rader={tidslinjeRader} onSelectPeriode={onSelectPeriode} />

            {!!valgtPeriode && (
                <FeilutbetalingForeldelsePeriodeSkjema
                    behandling={behandling}
                    periode={valgtPeriode}
                    erLesevisning={erLesevisning}
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
                        disabled={disableBekreft}
                    >
                        {stegErBehandlet ? 'Neste' : 'Bekreft og fortsett'}
                    </Button>
                )}
                <Button variant="secondary" onClick={gåTilForrigeSteg}>
                    Forrige
                </Button>
            </Navigering>
        </VStack>
    ) : null;
};

export default FeilutbetalingForeldelsePerioder;
