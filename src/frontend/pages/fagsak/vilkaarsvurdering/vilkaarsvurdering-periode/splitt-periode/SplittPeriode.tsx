import type { VilkårsvurderingPeriodeSkjemaData } from '../../typer/vilkårsvurdering';
import type { TimelinePeriodProps } from '@navikt/ds-react';
import type { FC } from 'react';
import type { BeregnSplittetPeriodeRespons, Periode } from '~/typer/tilbakekrevingstyper';

import { SplitHorizontalIcon } from '@navikt/aksel-icons';
import { Button } from '@navikt/ds-react';
import { useCallback, useEffect, useState } from 'react';

import { DelOppPeriode, useDelOppPeriode } from '~/komponenter/modal/del-opp-periode';
import { flyttDatoISODateStr } from '~/utils';

const konverterPeriode = (periode: VilkårsvurderingPeriodeSkjemaData): TimelinePeriodProps => {
    return {
        end: new Date(periode.periode.tom),
        start: new Date(periode.periode.fom),
        status: 'success',
        id: periode.index,
    };
};

type Props = {
    periode: VilkårsvurderingPeriodeSkjemaData;
    onBekreft: (
        periode: VilkårsvurderingPeriodeSkjemaData,
        nyePerioder: VilkårsvurderingPeriodeSkjemaData[]
    ) => void;
};

export const SplittPeriode: FC<Props> = ({ periode, onBekreft }) => {
    const [splittetPerioder, setSplittetPerioder] = useState<VilkårsvurderingPeriodeSkjemaData[]>();
    const {
        visModal,
        setVisModal,
        splittDato,
        setSplittDato,
        tidslinjeRader,
        setTidslinjeRader,
        feilmelding,
        vedDatoEndring,
        sendInnSkjema,
        validateNyPeriode,
    } = useDelOppPeriode(periode.periode.fom);

    const onChangeDato = useCallback(
        (nyVerdi?: string) => {
            vedDatoEndring((månedsslutt: string) => {
                const per: Periode = periode.periode;
                if (validateNyPeriode(per, månedsslutt)) {
                    const nyePerioder: VilkårsvurderingPeriodeSkjemaData[] = [
                        {
                            ...periode,
                            index: `${periode.index}_1`,
                            periode: {
                                fom: per.fom,
                                tom: månedsslutt,
                            },
                            vilkårsvurderingsresultatInfo: undefined,
                            erSplittet: true,
                        },
                        {
                            ...periode,
                            index: `${periode.index}_2`,
                            periode: {
                                fom: flyttDatoISODateStr(månedsslutt, { days: 1 }),
                                tom: per.tom,
                            },
                            vilkårsvurderingsresultatInfo: undefined,
                            erSplittet: true,
                        },
                    ];
                    // eslint-disable-next-line @eslint-react/set-state-in-effect -- False positive: kalles i en bruker-callback via useDelOppPeriode, ikke i en useEffect. Ville bli løst ved migrering til react-hook-form.
                    setSplittetPerioder(nyePerioder);
                    setTidslinjeRader([
                        [konverterPeriode(nyePerioder[0]), konverterPeriode(nyePerioder[1])],
                    ]);
                } else {
                    // eslint-disable-next-line @eslint-react/set-state-in-effect -- Se kommentar over.
                    setSplittetPerioder([periode]);
                    setSplittDato(periode.periode.fom);
                }
            }, nyVerdi);
        },
        [periode, setSplittDato, setTidslinjeRader, validateNyPeriode, vedDatoEndring]
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
                    const beregnetNyePerioder: VilkårsvurderingPeriodeSkjemaData[] = [
                        {
                            ...splittetPerioder[0],
                            feilutbetaltBeløp: beregnetperioder[0].feilutbetaltBeløp,
                        },
                        {
                            ...splittetPerioder[1],
                            feilutbetaltBeløp: beregnetperioder[1].feilutbetaltBeløp,
                        },
                    ];
                    setSplittetPerioder([]);
                    onBekreft(periode, beregnetNyePerioder);
                }
            );
        }
    };

    useEffect(() => {
        if (periode.periode.fom) {
            onChangeDato(periode.periode.fom);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps, @eslint-react/exhaustive-deps -- TODO: Se på om dette er en bug eller tiltenkt funksjonalitet. Vurder useEffectEvent senere.
    }, [periode.periode.fom]);

    return periode && tidslinjeRader ? (
        <div className="text-right">
            <Button
                size="xsmall"
                variant="tertiary"
                onClick={() => setVisModal(true)}
                icon={<SplitHorizontalIcon aria-hidden />}
            >
                Del opp perioden
            </Button>
            {visModal && (
                <DelOppPeriode
                    periode={periode}
                    tidslinjeRader={tidslinjeRader}
                    splittDato={splittDato}
                    visModal={visModal}
                    settVisModal={setVisModal}
                    onChangeDato={onChangeDato}
                    onSubmit={onSubmit}
                    feilmelding={feilmelding}
                />
            )}
        </div>
    ) : null;
};
