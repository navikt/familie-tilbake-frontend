import * as React from 'react';

import styled from 'styled-components';

import navFarger from 'nav-frontend-core';
import { Knapp } from 'nav-frontend-knapper';
import { Normaltekst } from 'nav-frontend-typografi';

import { Periode as TidslinjePeriode, Tidslinje } from '@navikt/helse-frontend-tidslinje';

import { IPeriodeSkjemaData } from '../../../typer/periodeSkjemaData';
import { formatterDatostring, NormaltekstBold } from '../../../utils';
import { Spacer8 } from '../Flytelementer';
import { FixedDatovelger } from '../Skjemaelementer';
import UIModalWrapper from './UIModalWrapper';

const TidslinjeContainer = styled.div`
    border: 1px solid ${navFarger.navGra60};
    margin-bottom: 20px;

    .etiketter div:last-child {
        max-width: max-content;
    }
`;

interface IProps {
    periode: IPeriodeSkjemaData;
    tidslinjeRader: TidslinjePeriode[][];
    splittDato: string;
    visModal: boolean;
    senderInn: boolean;
    settVisModal: (vis: boolean) => void;
    onChangeDato: (nyVerdi: string | undefined) => void;
    onSubmit: () => void;
}

const DelOppPeriode: React.FC<IProps> = ({
    periode,
    tidslinjeRader,
    splittDato,
    visModal,
    senderInn,
    settVisModal,
    onChangeDato,
    onSubmit,
}) => {
    return (
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
                        disabled={senderInn}
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
    );
};

export default DelOppPeriode;
