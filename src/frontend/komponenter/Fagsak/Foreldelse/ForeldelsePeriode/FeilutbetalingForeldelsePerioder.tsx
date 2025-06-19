import type { IBehandling } from '../../../../typer/behandling';
import type { ForeldelsePeriode } from '../../../../typer/feilutbetalingtyper';
import type { ForeldelsePeriodeSkjemeData } from '../typer/feilutbetalingForeldelse';
import type { TimelinePeriodProps } from '@navikt/ds-react';

import { Button, VStack } from '@navikt/ds-react';
import classNames from 'classnames';
import * as React from 'react';

import FeilutbetalingForeldelsePeriodeSkjema from './FeilutbetalingForeldelsePeriodeSkjema';
import { Foreldelsevurdering } from '../../../../kodeverk';
import { ClassNamePeriodeStatus } from '../../../../typer/periodeSkjemaData';
import { Navigering } from '../../../Felleskomponenter/Flytelementer';
import TilbakeTidslinje from '../../../Felleskomponenter/TilbakeTidslinje/TilbakeTidslinje';
import { useFeilutbetalingForeldelse } from '../FeilutbetalingForeldelseContext';

const finnClassNamePeriode = (periode: ForeldelsePeriode, aktivPeriode: boolean) => {
    const aktivPeriodeCss = aktivPeriode ? 'aktivPeriode' : '';
    switch (periode.foreldelsesvurderingstype) {
        case Foreldelsevurdering.Foreldet:
            return classNames(ClassNamePeriodeStatus.Avvist, aktivPeriodeCss);
        case Foreldelsevurdering.Tilleggsfrist:
        case Foreldelsevurdering.IkkeForeldet:
            return classNames(ClassNamePeriodeStatus.Behandlet, aktivPeriodeCss);
        case Foreldelsevurdering.IkkeVurdert:
        case Foreldelsevurdering.Udefinert:
        default:
            return classNames(ClassNamePeriodeStatus.Ubehandlet, aktivPeriodeCss);
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
                        {stegErBehandlet ? 'Neste' : 'Lagre og fortsett'}
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
