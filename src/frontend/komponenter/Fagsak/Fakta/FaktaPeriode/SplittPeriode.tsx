import * as React from 'react';

import { Wrench } from '@navikt/ds-icons';
import { Button, Link } from '@navikt/ds-react';
import { type Periode as TidslinjePeriode } from '@navikt/familie-tidslinje';

import { IBehandling } from '../../../../typer/behandling';
import { IBeregnSplittetPeriodeRespons, Periode } from '../../../../typer/feilutbetalingtyper';
import { flyttDatoISODateStr } from '../../../../utils';
import { DelOppPeriode, useDelOppPeriode } from '../../../Felleskomponenter/Modal/DelOppPeriode';
import { FaktaPeriodeSkjemaData } from '../typer/feilutbetalingFakta';

const konverterPeriode = (periode: FaktaPeriodeSkjemaData): TidslinjePeriode => {
    return {
        tom: new Date(periode.periode.tom),
        fom: new Date(periode.periode.fom),
        status: 'suksess',
        id: periode.index + '',
    };
};

interface IProps {
    periode: FaktaPeriodeSkjemaData;
    behandling: IBehandling;
    onBekreft: (periode: FaktaPeriodeSkjemaData, nyePerioder: FaktaPeriodeSkjemaData[]) => void;
}

const SplittPeriode: React.FC<IProps> = ({ behandling, periode, onBekreft }) => {
    const [splittetPerioder, settSplittetPerioder] = React.useState<FaktaPeriodeSkjemaData[]>();
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
    } = useDelOppPeriode(periode.periode.tom, behandling.behandlingId);

    React.useEffect(() => {
        const perRad: TidslinjePeriode = konverterPeriode(periode);
        settTidslinjeRader([[perRad]]);
        settSplittDato(periode.periode.tom);
    }, [periode]);

    const onChangeDato = (nyVerdi?: string) => {
        vedDatoEndring((månedsslutt: string) => {
            const per: Periode = periode.periode;
            if (validateNyPeriode(per, månedsslutt)) {
                const nyePerioder: FaktaPeriodeSkjemaData[] = [
                    {
                        ...periode,
                        index: `${periode.index}_1`,
                        periode: {
                            fom: per.fom,
                            tom: månedsslutt,
                        },
                        hendelsestype: undefined,
                        hendelsesundertype: undefined,
                        erSplittet: true,
                    },
                    {
                        ...periode,
                        index: `${periode.index}_2`,
                        periode: {
                            fom: flyttDatoISODateStr(månedsslutt, { days: 1 }),
                            tom: per.tom,
                        },
                        hendelsestype: undefined,
                        hendelsesundertype: undefined,
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
    };

    const onSubmit = () => {
        if (splittetPerioder) {
            sendInnSkjema(
                splittetPerioder.map(per => ({
                    fom: per.periode.fom,
                    tom: per.periode.tom,
                })),
                (response: IBeregnSplittetPeriodeRespons) => {
                    const beregnetperioder = response.beregnetPerioder;
                    const beregnetNyePerioder: FaktaPeriodeSkjemaData[] = [
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

    return periode && tidslinjeRader ? (
        <>
            <Button
                size="small"
                icon={<Wrench />}
                variant="tertiary"
                onClick={_event => {
                    settVisModal(true);
                }}
            />
            <Link
                href="#"
                role="button"
                onClick={_event => {
                    settVisModal(true);
                }}
                onKeyUp={e => {
                    const key = e.code || e.keyCode;
                    if (key === 'Space' || key === 'Enter' || key === 32 || key === 13) {
                        settVisModal(true);
                    }
                }}
                aria-label="Del opp perioden"
            >
                <Wrench aria-label="Del opp perioden" width={18} height={18} />
            </Link>

            {visModal && (
                <DelOppPeriode
                    periode={periode}
                    tidslinjeRader={tidslinjeRader}
                    splittDato={splittDato}
                    visModal={visModal}
                    senderInn={!splittetPerioder || splittetPerioder.length === 0}
                    settVisModal={settVisModal}
                    onChangeDato={onChangeDato}
                    onSubmit={onSubmit}
                    feilmelding={feilmelding}
                />
            )}
        </>
    ) : null;
};

export default SplittPeriode;
