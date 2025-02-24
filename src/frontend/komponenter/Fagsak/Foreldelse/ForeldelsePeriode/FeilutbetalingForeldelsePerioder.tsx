import * as React from 'react';

import { clsx } from 'clsx';

import { Button, TimelinePeriodProps, VStack } from '@navikt/ds-react';

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
            return clsx('avvist', aktivPeriodeCss);
        case Foreldelsevurdering.TILLEGGSFRIST:
        case Foreldelsevurdering.IKKE_FORELDET:
            return clsx('behandlet', aktivPeriodeCss);
        case Foreldelsevurdering.IKKE_VURDERT:
        case Foreldelsevurdering.UDEFINERT:
        default:
            return clsx('ubehandlet', aktivPeriodeCss);
    }
};

const genererRader = (
    perioder: ForeldelsePeriode[],
    valgtPeriode: ForeldelsePeriode | undefined
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
    const [tidslinjeRader, settTidslinjeRader] = React.useState<TimelinePeriodProps[][]>();
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

    const onSelectPeriode = (periode: TimelinePeriodProps): void => {
        const periodeFom = periode.start.toISOString().substring(0, 10);
        const periodeTom = periode.end.toISOString().substring(0, 10);
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
