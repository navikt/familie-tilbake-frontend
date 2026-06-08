import type { Periode } from '@/generated';

import { CalendarFillIcon } from '@navikt/aksel-icons';
import {
    Button,
    DatePicker,
    HStack,
    Modal,
    Timeline,
    type TimelinePeriodProps,
    useDatepicker,
} from '@navikt/ds-react';
import { parseISO } from 'date-fns';
import { type FC, useRef } from 'react';

import { MODAL_BREDDE } from '@/komponenter/meny/utils';
import { formatterDatostring } from '@/utils';

type Props = {
    periode: Periode;
};

export const DelPeriode: FC<Props> = ({ periode }: Props) => {
    const delPeriodeRef = useRef<HTMLDialogElement>(null);

    const tidslinjeRader = [
        [
            {
                id: '1',
                start: new Date(periode.fom),
                end: new Date(periode.tom),
                icon: <CalendarFillIcon aria-hidden />,
                status: 'info',
                isActive: true,
            },
        ] satisfies TimelinePeriodProps[],
    ];

    const { datepickerProps, inputProps } = useDatepicker({
        fromDate: new Date(periode.fom),
        toDate: new Date(periode.tom),
        defaultSelected: parseISO(periode.fom),
        // onDateChange: (dato?: Date) => {
        //     //Splitter perioden i to ved valgt dato, og oppdaterer fom for den nye perioden til valgt dato
        //     //F.eks. hvis perioden er 01.01.2024 - 31.01.2024 og valgt dato er 15.01.2024, så blir den nye perioden 15.01.2024 - 31.01.2024
        //     //og den opprinnelige perioden blir 01.01.2024 - 14.01.2024
        // },
    });

    return (
        <>
            <Button
                onClick={(): void => delPeriodeRef.current?.showModal()}
                size="xsmall"
                variant="tertiary"
            >
                Del opp
            </Button>

            <Modal
                ref={delPeriodeRef}
                header={{ heading: 'Del opp perioden' }}
                className={MODAL_BREDDE}
                closeOnBackdropClick
            >
                <Modal.Body className="flex flex-col gap-4">
                    <HStack gap="space-32">
                        <span>Periode</span>
                        <span className="font-semibold">{`${formatterDatostring(periode.fom)}–${formatterDatostring(periode.tom)}`}</span>
                    </HStack>

                    <Timeline className="pb-4">
                        <Timeline.Row label="">
                            {tidslinjeRader[0].map(periode => (
                                <Timeline.Period key={periode.id} {...periode} />
                            ))}
                        </Timeline.Row>
                    </Timeline>

                    <DatePicker {...datepickerProps}>
                        <DatePicker.Input
                            {...inputProps}
                            label="Velg dato"
                            size="small"
                            error={/** TODO: Legg til feilmelding*/ undefined}
                        />
                    </DatePicker>
                </Modal.Body>
                <Modal.Footer>
                    <Button size="small" onClick={(): void => delPeriodeRef.current?.close()}>
                        Del opp perioden
                    </Button>
                    <Button
                        variant="secondary"
                        size="small"
                        onClick={(): void => delPeriodeRef.current?.close()}
                    >
                        Avbryt
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};
