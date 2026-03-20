import type { ForeldelsePeriodeSkjemeData } from '../typer/foreldelse';
import type { TimelinePeriodProps } from '@navikt/ds-react';
import type { FC } from 'react';
import type { ForeldelsePeriode } from '~/typer/tilbakekrevingstyper';

import { Foreldelsevurdering } from '~/kodeverk';
import { TilbakeTidslinje } from '~/komponenter/tilbake-tidslinje/TilbakeTidslinje';
import { useForeldelse } from '~/pages/fagsak/foreldelse/ForeldelseContext';

import { ForeldelsePeriodeSkjema } from './ForeldelsePeriodeSkjema';

const finnPeriodeStatus = (periode: ForeldelsePeriode): TimelinePeriodProps['status'] => {
    switch (periode.foreldelsesvurderingstype) {
        case Foreldelsevurdering.Foreldet:
            return 'warning';
        case Foreldelsevurdering.Tilleggsfrist:
        case Foreldelsevurdering.IkkeForeldet:
            return 'success';
        case Foreldelsevurdering.IkkeVurdert:
        case Foreldelsevurdering.Udefinert:
        default:
            return 'neutral';
    }
};

const lagTidslinjeRader = (
    perioder: ForeldelsePeriode[],
    valgtPeriode: ForeldelsePeriode | undefined
): TimelinePeriodProps[][] => [
    perioder.map((periode): TimelinePeriodProps => {
        const erAktivPeriode = !!valgtPeriode && periode.periode.fom === valgtPeriode.periode.fom;
        return {
            end: new Date(periode.periode.tom),
            start: new Date(periode.periode.fom),
            status: finnPeriodeStatus(periode),
            isActive: erAktivPeriode,
            id: periode.periode.fom,
            statusLabel: periode.foreldelsesvurderingstype,
        } satisfies TimelinePeriodProps;
    }),
];

type Props = {
    perioder: ForeldelsePeriodeSkjemeData[];
};

export const ForeldelsePerioder: FC<Props> = ({ perioder }) => {
    const { valgtPeriode, settValgtPeriode } = useForeldelse();
    const tidslinjeRader = lagTidslinjeRader(perioder, valgtPeriode);

    const onSelectPeriode = (periode: TimelinePeriodProps): void => {
        const periodeFom = periode.start.toISOString().substring(0, 10);
        const periodeTom = periode.end.toISOString().substring(0, 10);
        const foreldelsePeriode = perioder.find(
            per => per.periode.fom === periodeFom && per.periode.tom === periodeTom
        );
        settValgtPeriode(foreldelsePeriode);
    };

    return perioder && tidslinjeRader ? (
        <>
            <TilbakeTidslinje rader={tidslinjeRader} onSelectPeriode={onSelectPeriode} />
            {!!valgtPeriode && <ForeldelsePeriodeSkjema periode={valgtPeriode} />}
        </>
    ) : null;
};
