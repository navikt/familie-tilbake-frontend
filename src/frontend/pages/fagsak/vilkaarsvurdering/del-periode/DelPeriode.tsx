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
import { useMutation } from '@tanstack/react-query';
import { format, isValid, parseISO, subDays } from 'date-fns';
import { type FC, useRef, useState } from 'react';

import { useBehandling } from '@/context/BehandlingContext';
import { behandlingSplittPeriodeMutation } from '@/generated-new/@tanstack/react-query.gen';
import { MODAL_BREDDE } from '@/komponenter/meny/utils';
import { useVisGlobalAlert } from '@/stores/globalAlertStore';
import { formatterDatostring } from '@/utils';

type Props = {
    periode: Periode;
    vilkårsperioder: Periode[];
    hentVilkårsvurdering: () => void;
};

export const DelPeriode: FC<Props> = ({
    periode,
    vilkårsperioder,
    hentVilkårsvurdering,
}: Props) => {
    const delPeriodeRef = useRef<HTMLDialogElement>(null);
    const { behandlingId } = useBehandling();
    const visGlobalAlert = useVisGlobalAlert();

    // Man kan kun splitte på fom-datoene til vilkårsperiodene, men ikke på den første
    // periodens fom (som er lik hele periodens fom). Standardvalg er index 1.
    const valgbareSplittDatoer = vilkårsperioder.slice(1).map(vilkårsperiode => vilkårsperiode.fom);
    const standardSplittDato = vilkårsperioder[1]?.fom;

    const [valgtDato, setValgtDato] = useState<Date | undefined>(
        standardSplittDato ? parseISO(standardSplittDato) : undefined
    );
    const [feilmelding, setFeilmelding] = useState<string | undefined>(undefined);

    const fellesProps = {
        icon: <CalendarFillIcon aria-hidden />,
        status: 'info',
    } satisfies Partial<TimelinePeriodProps>;
    const tidslinjeRader = valgtDato
        ? [
              [
                  {
                      id: '1',
                      start: new Date(periode.fom),
                      end: subDays(valgtDato, 1),
                      ...fellesProps,
                  },
                  {
                      id: '2',
                      start: valgtDato,
                      end: new Date(periode.tom),
                      ...fellesProps,
                      isActive: true,
                  },
              ] satisfies TimelinePeriodProps[],
          ]
        : [
              [
                  {
                      id: '1',
                      start: new Date(periode.fom),
                      end: new Date(periode.tom),
                      ...fellesProps,
                  },
              ] satisfies TimelinePeriodProps[],
          ];

    const { datepickerProps, inputProps } = useDatepicker({
        fromDate: new Date(periode.fom),
        toDate: new Date(periode.tom),
        defaultSelected: standardSplittDato ? parseISO(standardSplittDato) : undefined,
        disabled: [
            (dato: Date): boolean =>
                !isValid(dato) || !valgbareSplittDatoer.includes(format(dato, 'yyyy-MM-dd')),
        ],
        onDateChange: (dato: Date | undefined) => {
            setValgtDato(dato);
            if (dato) {
                setFeilmelding(undefined);
            }
        },
    });

    const splittPeriode = useMutation({
        ...behandlingSplittPeriodeMutation(),
        onSuccess: () => {
            hentVilkårsvurdering();
            visGlobalAlert({
                title: 'Perioden ble delt opp',
                status: 'success',
            });
            delPeriodeRef.current?.close();
        },
        // biome-ignore lint/nursery/useExplicitType: Klarer ikke finne typen på error her, da den kommer fra useMutation og ikke er eksplisitt definert i api-kallet.
        onError: error => {
            visGlobalAlert({
                title: 'Kunne ikke dele opp perioden',
                message: error.message,
                status: 'error',
            });
        },
    });

    const delOpp = (): void => {
        if (!valgtDato) {
            setFeilmelding('Du må velge en dato');
            return;
        }
        splittPeriode.mutate({
            path: { behandlingId },
            body: valgtDato.toISOString(),
        });
    };

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
                            error={feilmelding}
                        />
                    </DatePicker>
                </Modal.Body>
                <Modal.Footer>
                    <Button
                        size="small"
                        onClick={delOpp}
                        loading={splittPeriode.isPending}
                        disabled={splittPeriode.isPending}
                    >
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
