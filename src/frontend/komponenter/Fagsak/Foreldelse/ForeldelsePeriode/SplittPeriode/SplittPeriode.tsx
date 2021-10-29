import * as React from 'react';

import styled from 'styled-components';

import Lenke from 'nav-frontend-lenker';
import { Undertekst } from 'nav-frontend-typografi';

import { Periode as TidslinjePeriode } from '@navikt/helse-frontend-tidslinje';

import splitPeriodImageUrl from '../../../../../images/splitt.svg';
import splitPeriodImageHoverUrl from '../../../../../images/splitt_hover.svg';
import { IBehandling } from '../../../../../typer/behandling';
import { IBeregnSplittetPeriodeRespons, Periode } from '../../../../../typer/feilutbetalingtyper';
import { flyttDatoISODateStr } from '../../../../../utils';
import Image from '../../../../Felleskomponenter/Image/Image';
import { DelOppPeriode, useDelOppPeriode } from '../../../../Felleskomponenter/Modal/DelOppPeriode';
import { ForeldelsePeriodeSkjemeData } from '../../typer/feilutbetalingForeldelse';

const InlineUndertekst = styled(Undertekst)`
    display: inline-block;
`;

const StyledContainer = styled.div`
    text-align: right;

    ${InlineUndertekst} {
        margin-left: 1ex;
    }
`;

const konverterPeriode = (periode: ForeldelsePeriodeSkjemeData): TidslinjePeriode => {
    return {
        tom: new Date(periode.periode.tom),
        fom: new Date(periode.periode.fom),
        status: 'suksess',
        id: periode.index,
    };
};

interface IProps {
    periode: ForeldelsePeriodeSkjemeData;
    behandling: IBehandling;
    onBekreft: (
        periode: ForeldelsePeriodeSkjemeData,
        nyePerioder: ForeldelsePeriodeSkjemeData[]
    ) => void;
}

const SplittPeriode: React.FC<IProps> = ({ behandling, periode, onBekreft }) => {
    const [splittetPerioder, settSplittetPerioder] =
        React.useState<ForeldelsePeriodeSkjemeData[]>();
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
    } = useDelOppPeriode(periode.periode.tom, behandling.behandlingId);

    React.useEffect(() => {
        const perRad: TidslinjePeriode = konverterPeriode(periode);
        settTidslinjeRader([[perRad]]);
        settSplittDato(periode.periode.tom);
    }, [periode]);

    const onChangeDato = (nyVerdi?: string) => {
        vedDatoEndring((månedsslutt: string) => {
            const per: Periode = periode.periode;
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

    return periode && tidslinjeRader ? (
        <StyledContainer>
            <Lenke
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
                ariaLabel="Del opp perioden"
            >
                <Image
                    src={splitPeriodImageUrl}
                    srcHover={splitPeriodImageHoverUrl}
                    altText={'Del opp perioden'}
                    aria-label="Del opp perioden"
                />
                <InlineUndertekst>Del opp perioden</InlineUndertekst>
            </Lenke>
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
        </StyledContainer>
    ) : null;
};

export default SplittPeriode;
