import * as React from 'react';

import { endOfMonth } from 'date-fns';
import { styled } from 'styled-components';

import { BodyShort, Button, Label, Modal, MonthPicker, useMonthpicker } from '@navikt/ds-react';
import { ABorderStrong, ASpacing6 } from '@navikt/ds-tokens/dist/tokens';
import { type Periode as TidslinjePeriode, Tidslinje } from '@navikt/familie-tidslinje';

import { IPeriodeSkjemaData } from '../../../../typer/periodeSkjemaData';
import { formatterDatostring } from '../../../../utils';
import { dateTilIsoDatoString, isoStringTilDate } from '../../../../utils/dato';

const TidslinjeContainer = styled.div`
    border: 1px solid ${ABorderStrong};
    margin-bottom: ${ASpacing6};

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
    const { monthpickerProps, inputProps } = useMonthpicker({
        fromDate: isoStringTilDate(periode.periode.fom),
        toDate: isoStringTilDate(periode.periode.tom),
        defaultSelected: isoStringTilDate(splittDato),
        onMonthChange: (dato?: Date) =>
            onChangeDato(dato ? dateTilIsoDatoString(endOfMonth(dato)) : undefined),
    });
    return (
        <>
            {visModal && (
                <Modal
                    open
                    header={{
                        heading: 'Del opp perioden',
                        size: 'medium',
                    }}
                    portal={true}
                    width="small"
                    onClose={() => {
                        settVisModal(false);
                    }}
                >
                    <Modal.Body>
                        <Label size="small">Periode</Label>
                        <BodyShort size="small" spacing>
                            {`${formatterDatostring(periode.periode.fom)} - ${formatterDatostring(
                                periode.periode.tom
                            )}`}
                        </BodyShort>
                        <TidslinjeContainer>
                            <Tidslinje kompakt rader={tidslinjeRader} />
                        </TidslinjeContainer>
                        <MonthPicker {...monthpickerProps} dropdownCaption>
                            <MonthPicker.Input
                                {...inputProps}
                                label="Angi t.o.m. måned for første periode"
                                error={feilmelding}
                            />
                        </MonthPicker>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button
                            variant="primary"
                            key={'bekreft'}
                            onClick={onSubmit}
                            disabled={senderInn}
                            size="small"
                        >
                            Bekreft
                        </Button>
                        <Button
                            variant="tertiary"
                            key={'avbryt'}
                            onClick={() => {
                                settVisModal(false);
                            }}
                            size="small"
                        >
                            Lukk
                        </Button>
                    </Modal.Footer>
                </Modal>
            )}
        </>
    );
};
