import type { PeriodeSkjemaData } from '../../../../typer/periodeSkjemaData';
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
import { styled } from 'styled-components';

import { formatterDatoDDMMYYYY, formatterDatostring } from '../../../../utils';
import { dateTilIsoDatoString, isoStringTilDate } from '../../../../utils/dato';

const TidslinjeContainer = styled.div`
    border: 1px solid var(--ax-border-info-strong);
    margin-bottom: 24px;
    padding: 12px 16px;

    .etiketter div:last-child {
        max-width: max-content;
    }

    .aksel-timeline__period {
        cursor: default;
    }
`;

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
                        size: 'medium',
                    }}
                    portal
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
                                                Periode fra {formatterDatoDDMMYYYY(periode.start)}{' '}
                                                til {formatterDatoDDMMYYYY(periode.end)}
                                            </Timeline.Period>
                                        ))}
                                    </Timeline.Row>
                                ))}
                            </Timeline>
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
                        <Button variant="primary" key="bekreft" onClick={onSubmit} size="small">
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
