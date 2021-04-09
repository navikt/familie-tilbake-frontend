import * as React from 'react';

import { AxiosError } from 'axios';
import styled from 'styled-components';

import navFarger from 'nav-frontend-core';
import { Knapp } from 'nav-frontend-knapper';
import { Normaltekst, Undertekst } from 'nav-frontend-typografi';

import { useHttp } from '@navikt/familie-http';
import { Ressurs, RessursStatus } from '@navikt/familie-typer';
import { Periode as TidslinjePeriode, Tidslinje } from '@navikt/helse-frontend-tidslinje';

import splitPeriodImageUrl from '../../../../../images/splitt.svg';
import splitPeriodImageHoverUrl from '../../../../../images/splitt_hover.svg';
import { IBehandling } from '../../../../../typer/behandling';
import { IBeregnSplittetPeriodeRespons, Periode } from '../../../../../typer/feilutbetalingtyper';
import {
    flyttDatoISODateStr,
    formatterDatostring,
    getEndOfMonthISODateStr,
    NormaltekstBold,
} from '../../../../../utils';
import { Spacer8 } from '../../../../Felleskomponenter/Flytelementer';
import Image from '../../../../Felleskomponenter/Image/Image';
import UIModalWrapper from '../../../../Felleskomponenter/Modal/UIModalWrapper';
import { FixedDatovelger } from '../../../../Felleskomponenter/Skjemaelementer';
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

const TidslinjeContainer = styled.div`
    border: 1px solid ${navFarger.navGra60};
    margin-bottom: 20px;

    .etiketter div:last-child {
        max-width: max-content;
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
        perioder: ForeldelsePeriodeSkjemeData,
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
                    erSplittet: true,
                },
                {
                    ...periode,
                    index: `${periode.index}_2`,
                    periode: {
                        fom: flyttDatoISODateStr(månedsslutt, { days: 1 }),
                        tom: per.tom,
                    },
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
            })
                .then((response: Ressurs<IBeregnSplittetPeriodeRespons>) => {
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
                })
                .catch((error: AxiosError) => {
                    console.log('Error ved splitting av perioder: ', error);
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
                <UIModalWrapper
                    modal={{
                        tittel: 'Del opp perioden',
                        visModal: visModal,
                        lukkKnapp: false,
                        actions: [
                            <Knapp
                                key={'avbryt'}
                                onClick={() => {
                                    settVisModal(false);
                                }}
                                mini={true}
                            >
                                Lukk
                            </Knapp>,
                            <Knapp
                                key={'bekreft'}
                                type={'hoved'}
                                mini={true}
                                onClick={onSubmit}
                                disabled={!splittetPerioder || splittetPerioder.length === 0}
                            >
                                Bekreft
                            </Knapp>,
                        ],
                    }}
                    style={{
                        content: {
                            width: '30rem',
                        },
                    }}
                >
                    <NormaltekstBold>Periode</NormaltekstBold>
                    <Normaltekst>
                        {`${formatterDatostring(periode.periode.fom)} - ${formatterDatostring(
                            periode.periode.tom
                        )}`}
                    </Normaltekst>
                    <Spacer8 />
                    <TidslinjeContainer>
                        <Tidslinje rader={tidslinjeRader} />
                    </TidslinjeContainer>
                    <FixedDatovelger
                        id={'splittDato'}
                        valgtDato={splittDato}
                        label={'Angi t.o.m. måned for første periode'}
                        limitations={{
                            minDate: periode.periode.fom,
                            maxDate: periode.periode.tom,
                        }}
                        onChange={(nyVerdi?: string) => onChangeDato(nyVerdi)}
                    />
                </UIModalWrapper>
            )}
        </StyledContainer>
    ) : null;
};

export default SplittPeriode;
