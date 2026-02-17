import type { PeriodeSkjemaData } from '../../../typer/periodeSkjemaData';
import type { TimelinePeriodProps } from '@navikt/ds-react';

import {
    BodyShort,
    Button,
    Label,
    Modal,
    MonthPicker,
    Timeline,
    useMonthpicker,
} from '@navikt/ds-react';
import { endOfMonth, subMonths } from 'date-fns';
import * as React from 'react';

import { formatterDatoDDMMYYYY, formatterDatostring } from '../../../utils';
import { dateTilIsoDatoString, isoStringTilDate } from '../../../utils/dato';

type Props = {
    periode: PeriodeSkjemaData;
    tidslinjeRader: TimelinePeriodProps[][];
    splittDato: string;
    visModal: boolean;
    settVisModal: (vis: boolean) => void;
    onChangeDato: (nyVerdi: string | undefined) => void;
    onSubmit: () => void;
    feilmelding?: string;
};

export const DelOppPeriode: React.FC<Props> = ({
    periode,
    tidslinjeRader,
    splittDato,
    visModal,
    settVisModal,
    onChangeDato,
    onSubmit,
    feilmelding,
}) => {
    const { monthpickerProps, inputProps } = useMonthpicker({
        fromDate: isoStringTilDate(periode.periode.fom),
        toDate: subMonths(isoStringTilDate(periode.periode.tom), 1),
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
                    }}
                    portal
                    width="medium"
                    onClose={() => settVisModal(false)}
                >
                    <Modal.Body className="flex flex-col gap-4">
                        <Label size="small">Periode</Label>
                        <BodyShort size="small">
                            {`${formatterDatostring(periode.periode.fom)} - ${formatterDatostring(
                                periode.periode.tom
                            )}`}
                        </BodyShort>

                        <Timeline>
                            {tidslinjeRader.map(rad => (
                                <Timeline.Row label="" key={rad[0].id}>
                                    {rad.map(periode => (
                                        <Timeline.Period
                                            key={periode.id}
                                            start={periode.start}
                                            end={periode.end}
                                            status={periode.status}
                                            isActive={periode.isActive}
                                            className={periode.className}
                                        >
                                            Periode fra {formatterDatoDDMMYYYY(periode.start)} til{' '}
                                            {formatterDatoDDMMYYYY(periode.end)}
                                        </Timeline.Period>
                                    ))}
                                </Timeline.Row>
                            ))}
                        </Timeline>
                        <MonthPicker {...monthpickerProps} dropdownCaption>
                            <MonthPicker.Input
                                {...inputProps}
                                label="Angi t.o.m. måned for første periode"
                                error={feilmelding}
                            />
                        </MonthPicker>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button key="bekreft" onClick={onSubmit} size="small">
                            Bekreft
                        </Button>
                        <Button
                            variant="tertiary"
                            key="avbryt"
                            onClick={() => settVisModal(false)}
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
