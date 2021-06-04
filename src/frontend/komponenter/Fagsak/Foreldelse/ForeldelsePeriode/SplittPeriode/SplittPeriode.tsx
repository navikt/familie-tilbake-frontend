import * as React from 'react';

import styled from 'styled-components';

import { Undertekst } from 'nav-frontend-typografi';

import { useHttp } from '@navikt/familie-http';
import { Ressurs, RessursStatus } from '@navikt/familie-typer';
import { Periode as TidslinjePeriode } from '@navikt/helse-frontend-tidslinje';

import splitPeriodImageUrl from '../../../../../images/splitt.svg';
import splitPeriodImageHoverUrl from '../../../../../images/splitt_hover.svg';
import { IBehandling } from '../../../../../typer/behandling';
import { IBeregnSplittetPeriodeRespons, Periode } from '../../../../../typer/feilutbetalingtyper';
import { flyttDatoISODateStr, getEndOfMonthISODateStr } from '../../../../../utils';
import Image from '../../../../Felleskomponenter/Image/Image';
import DelOppPeriode from '../../../../Felleskomponenter/Modal/DelOppPeriode';
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
    const [visModal, settVisModal] = React.useState<boolean>(false);
    const [splittDato, settSplittDato] = React.useState<string>(periode.periode.tom);
    const [splittetPerioder, settSplittetPerioder] = React.useState<
        ForeldelsePeriodeSkjemeData[]
    >();
    const [tidslinjeRader, settTidslinjeRader] = React.useState<TidslinjePeriode[][]>();
    const { request } = useHttp();

    React.useEffect(() => {
        const perRad: TidslinjePeriode = konverterPeriode(periode);
        settTidslinjeRader([[perRad]]);
        settSplittDato(periode.periode.tom);
    }, [periode]);

    const onChangeDato = (nyVerdi?: string) => {
        const månedsslutt = getEndOfMonthISODateStr(nyVerdi);
        if (nyVerdi && månedsslutt) {
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
            settSplittDato(månedsslutt);
            settTidslinjeRader([
                [konverterPeriode(nyePerioder[0]), konverterPeriode(nyePerioder[1])],
            ]);
        }
    };

    const onSubmit = () => {
        if (splittetPerioder) {
            request<Periode[], IBeregnSplittetPeriodeRespons>({
                method: 'POST',
                url: `/familie-tilbake/api/behandling/${behandling.behandlingId}/beregn/v1`,
                data: splittetPerioder.map(per => ({
                    fom: per.periode.fom,
                    tom: per.periode.tom,
                })),
            }).then((response: Ressurs<IBeregnSplittetPeriodeRespons>) => {
                if (response.status === RessursStatus.SUKSESS) {
                    const beregnetperioder = response.data.beregnetPerioder;
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
                    settVisModal(false);
                    settSplittDato('');
                    settSplittetPerioder([]);
                    settTidslinjeRader([]);
                    onBekreft(periode, beregnetNyePerioder);
                }
            });
        }
    };

    return periode && tidslinjeRader ? (
        <StyledContainer>
            <Image
                src={splitPeriodImageUrl}
                srcHover={splitPeriodImageHoverUrl}
                altText={'Del opp perioden'}
                onClick={_event => settVisModal(true)}
            />
            <InlineUndertekst>Del opp perioden</InlineUndertekst>
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
                />
            )}
        </StyledContainer>
    ) : null;
};

export default SplittPeriode;
