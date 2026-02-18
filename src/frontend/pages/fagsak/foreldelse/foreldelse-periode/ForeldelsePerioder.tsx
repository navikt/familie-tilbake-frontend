import type { TimelinePeriodProps } from '@navikt/ds-react';
import type { ForeldelsePeriodeSkjemeData } from '../typer/foreldelse';
import type { ForeldelsePeriode } from '@typer/tilbakekrevingstyper';

import { Foreldelsevurdering } from '@kodeverk';
import { TilbakeTidslinje } from '@komponenter/tilbake-tidslinje/TilbakeTidslinje';
import { useForeldelse } from '@pages/fagsak/foreldelse/ForeldelseContext';
import { ClassNamePeriodeStatus } from '@typer/periodeSkjemaData';
import classNames from 'classnames';
import * as React from 'react';

import { ForeldelsePeriodeSkjema } from './ForeldelsePeriodeSkjema';

const finnClassNamePeriode = (periode: ForeldelsePeriode, aktivPeriode: boolean): string => {
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

type Props = {
    perioder: ForeldelsePeriodeSkjemeData[];
};

export const ForeldelsePerioder: React.FC<Props> = ({ perioder }) => {
    const [tidslinjeRader, settTidslinjeRader] = React.useState<TimelinePeriodProps[][]>();
    const { valgtPeriode, settValgtPeriode } = useForeldelse();

    React.useEffect(() => {
        settTidslinjeRader(genererRader(perioder, valgtPeriode));
    }, [perioder, valgtPeriode]);

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
