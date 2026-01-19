import type {
    BeregnSplittetPeriodeRespons,
    Periode,
} from '../../../../../typer/tilbakekrevingstyper';
import type { ForeldelsePeriodeSkjemeData } from '../../typer/foreldelse';
import type { TimelinePeriodProps } from '@navikt/ds-react';

import { Detail, Link } from '@navikt/ds-react';
import * as React from 'react';
import { useCallback, useEffect, useState } from 'react';

import splitPeriodImageUrl from '../../../../../images/splitt.svg';
import splitPeriodImageHoverUrl from '../../../../../images/splitt_hover.svg';
import { flyttDatoISODateStr } from '../../../../../utils';
import Image from '../../../../Felleskomponenter/Image/Image';
import { DelOppPeriode, useDelOppPeriode } from '../../../../Felleskomponenter/Modal/DelOppPeriode';

const konverterPeriode = (periode: ForeldelsePeriodeSkjemeData): TimelinePeriodProps => {
    return {
        end: new Date(periode.periode.tom),
        start: new Date(periode.periode.fom),
        status: 'success',
        id: periode.index,
    };
};

type Props = {
    periode: ForeldelsePeriodeSkjemeData;
    onBekreft: (
        periode: ForeldelsePeriodeSkjemeData,
        nyePerioder: ForeldelsePeriodeSkjemeData[]
    ) => void;
};

const SplittPeriode: React.FC<Props> = ({ periode, onBekreft }) => {
    const [splittetPerioder, settSplittetPerioder] = useState<ForeldelsePeriodeSkjemeData[]>();
    const {
        visModal,
        settVisModal,
        splittDato,
        settSplittDato,
        tidslinjeRader,
        settTidslinjeRader,
        feilmelding,
        vedDatoEndring,
        sendInnSkjema,
        validateNyPeriode,
    } = useDelOppPeriode(periode.periode.tom);

    const onChangeDato = useCallback(
        (nyVerdi?: string) => {
            vedDatoEndring((månedsslutt: string) => {
                const per: Periode = periode.periode;
                if (validateNyPeriode(per, månedsslutt)) {
                    const nyePerioder: ForeldelsePeriodeSkjemeData[] = [
                        {
                            ...periode,
                            index: `${periode.index}_1`,
                            periode: {
                                fom: per.fom,
                                tom: månedsslutt,
                            },
                            oppdagelsesdato: undefined,
                            foreldelsesfrist: undefined,
                            foreldelsesvurderingstype: undefined,
                            erSplittet: true,
                        },
                        {
                            ...periode,
                            index: `${periode.index}_2`,
                            periode: {
                                fom: flyttDatoISODateStr(månedsslutt, { days: 1 }),
                                tom: per.tom,
                            },
                            oppdagelsesdato: undefined,
                            foreldelsesfrist: undefined,
                            foreldelsesvurderingstype: undefined,
                            erSplittet: true,
                        },
                    ];
                    settSplittetPerioder(nyePerioder);
                    settTidslinjeRader([
                        [konverterPeriode(nyePerioder[0]), konverterPeriode(nyePerioder[1])],
                    ]);
                } else {
                    settSplittetPerioder([periode]);
                    settSplittDato(periode.periode.tom);
                }
            }, nyVerdi);
        },
        [periode, settSplittDato, settTidslinjeRader, validateNyPeriode, vedDatoEndring]
    );

    const onSubmit = (): void => {
        if (splittetPerioder) {
            sendInnSkjema(
                splittetPerioder.map(per => ({
                    fom: per.periode.fom,
                    tom: per.periode.tom,
                })),
                (response: BeregnSplittetPeriodeRespons) => {
                    const beregnetperioder = response.beregnetPerioder;
                    const beregnetNyePerioder: ForeldelsePeriodeSkjemeData[] = [
                        {
                            ...splittetPerioder[0],
                            feilutbetaltBeløp: beregnetperioder[0].feilutbetaltBeløp,
                        },
                        {
                            ...splittetPerioder[1],
                            feilutbetaltBeløp: beregnetperioder[1].feilutbetaltBeløp,
                        },
                    ];
                    settSplittetPerioder([]);
                    onBekreft(periode, beregnetNyePerioder);
                }
            );
        }
    };

    useEffect(() => {
        if (periode.periode.fom) {
            onChangeDato(periode.periode.fom);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [periode.periode.fom]);

    return periode && tidslinjeRader ? (
        <div className="text-right">
            <Link
                href="#"
                role="button"
                onClick={() => settVisModal(true)}
                onKeyUp={e => {
                    if (e.code === 'Space' || e.code === 'Enter') {
                        e.preventDefault();
                        settVisModal(true);
                    }
                }}
                aria-label="Del opp perioden"
            >
                <Image
                    src={splitPeriodImageUrl}
                    srcHover={splitPeriodImageHoverUrl}
                    altText="Del opp perioden"
                    aria-label="Del opp perioden"
                />
                <Detail className="ml-0.5">Del opp perioden</Detail>
            </Link>
            {visModal && (
                <DelOppPeriode
                    periode={periode}
                    tidslinjeRader={tidslinjeRader}
                    splittDato={splittDato}
                    visModal={visModal}
                    settVisModal={settVisModal}
                    onChangeDato={onChangeDato}
                    onSubmit={onSubmit}
                    feilmelding={feilmelding}
                />
            )}
        </div>
    ) : null;
};

export default SplittPeriode;
