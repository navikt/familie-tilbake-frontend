import * as React from 'react';

import styled from 'styled-components';

import { BodyShort, Label } from '@navikt/ds-react';
import { NavdsSemanticColorBorder, NavdsSpacing6 } from '@navikt/ds-tokens/dist/tokens';
import { type Periode as TidslinjePeriode, Tidslinje } from '@navikt/familie-tidslinje';

import { IPeriodeSkjemaData } from '../../../../typer/periodeSkjemaData';
import { formatterDatostring } from '../../../../utils';
import { FTButton } from '../../Flytelementer';
import { FixedDatovelger } from '../../Skjemaelementer';
import UIModalWrapper from '../UIModalWrapper';

const TidslinjeContainer = styled.div`
    border: 1px solid ${NavdsSemanticColorBorder};
    margin-bottom: ${NavdsSpacing6};

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
    feilmelding?: string;
}

export const DelOppPeriode: React.FC<IProps> = ({
    periode,
    tidslinjeRader,
    splittDato,
    visModal,
    senderInn,
    settVisModal,
    onChangeDato,
    onSubmit,
    feilmelding,
}) => {
    return (
        <UIModalWrapper
            modal={{
                tittel: 'Del opp perioden',
                visModal: visModal,
                lukkKnapp: false,
                actions: [
                    <FTButton
                        variant="tertiary"
                        key={'avbryt'}
                        onClick={() => {
                            settVisModal(false);
                        }}
                        size="small"
                    >
                        Lukk
                    </FTButton>,
                    <FTButton
                        variant="primary"
                        key={'bekreft'}
                        onClick={onSubmit}
                        disabled={senderInn}
                        size="small"
                    >
                        Bekreft
                    </FTButton>,
                ],
            }}
            modelStyleProps={{
                width: '30rem',
            }}
        >
            <Label size="small">Periode</Label>
            <BodyShort size="small" spacing>
                {`${formatterDatostring(periode.periode.fom)} - ${formatterDatostring(
                    periode.periode.tom
                )}`}
            </BodyShort>
            <TidslinjeContainer>
                <Tidslinje kompakt rader={tidslinjeRader} />
            </TidslinjeContainer>
            <FixedDatovelger
                id={'splittDato'}
                value={splittDato}
                label={'Angi t.o.m. måned for første periode'}
                limitations={{
                    minDate: periode.periode.fom,
                    maxDate: periode.periode.tom,
                }}
                onChange={(nyVerdi?: string) => onChangeDato(nyVerdi)}
                feil={feilmelding}
            />
        </UIModalWrapper>
    );
};
