import type { Periode } from '@/generated';
import type { PeriodeInfo, SplittPeriode } from '@/generated-new';

import { CalendarFillIcon } from '@navikt/aksel-icons';
import {
    Box,
    Button,
    DatePicker,
    HStack,
    Modal,
    Timeline,
    type TimelinePeriodProps,
    useDatepicker,
    VStack,
} from '@navikt/ds-react';
import { useMutation } from '@tanstack/react-query';
import { format, isValid, parseISO } from 'date-fns';
import { type FC, useMemo, useRef, useState } from 'react';

import { useBehandling } from '@/context/BehandlingContext';
import { behandlingSplittPeriodeMutation } from '@/generated-new/@tanstack/react-query.gen';
import { MODAL_BREDDE } from '@/komponenter/meny/utils';
import { useVisGlobalAlert } from '@/stores/globalAlertStore';
import { formatterDatostring } from '@/utils';

import { hentSplittedePerioder } from './utils';

type Props = {
    periode: Periode;
    vilkårsperioder: PeriodeInfo[];
    erVurdert: boolean;
    hentVilkårsvurdering: () => void;
};

export const DelPeriode: FC<Props> = ({
    periode,
    vilkårsperioder,
    erVurdert,
    hentVilkårsvurdering,
}: Props) => {
    const delPeriodeRef = useRef<HTMLDialogElement>(null);
    const { behandlingId } = useBehandling();
    const visGlobalAlert = useVisGlobalAlert();

    const perioderInnenforPeriode = useMemo(
        () =>
            vilkårsperioder.filter(
                ({ periode: { fom, tom } }) => fom >= periode.fom && tom <= periode.tom
            ),
        [vilkårsperioder, periode]
    );
    const valgbareSplittDatoer = perioderInnenforPeriode
        .slice(1)
        .map(({ periode: { fom } }) => fom);
    const standardSplittDato = perioderInnenforPeriode[1]?.periode.fom;

    const [valgtDato, setValgtDato] = useState<Date | undefined>(
        standardSplittDato ? parseISO(standardSplittDato) : undefined
    );
    const [feilmelding, setFeilmelding] = useState<string | undefined>(undefined);

    const splittedePerioder = useMemo(
        () =>
            hentSplittedePerioder(
                periode,
                perioderInnenforPeriode.map(({ periode }) => periode),
                valgtDato
            ),
        [periode, perioderInnenforPeriode, valgtDato]
    );
    const førsteSplittetPeriode = splittedePerioder[0];
    const andreSplittetPeriode = splittedePerioder[1];

    const fellesForPerioder = {
        icon: <CalendarFillIcon aria-hidden />,
        status: 'neutral',
    } satisfies Partial<TimelinePeriodProps>;

    const tidslinjePerioder = valgtDato
        ? ([
              {
                  id: '1',
                  start: new Date(periode.fom),
                  end: new Date(førsteSplittetPeriode.tom),
                  ...fellesForPerioder,
                  status: erVurdert ? ('success' as const) : fellesForPerioder.status,
              },
              {
                  id: '2',
                  start: valgtDato,
                  end: new Date(andreSplittetPeriode.tom),
                  ...fellesForPerioder,
              },
          ] satisfies TimelinePeriodProps[])
        : ([
              {
                  id: '1',
                  start: new Date(periode.fom),
                  end: new Date(periode.tom),
                  ...fellesForPerioder,
                  status: erVurdert ? ('success' as const) : fellesForPerioder.status,
              },
          ] satisfies TimelinePeriodProps[]);

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
                title: 'Perioden er delt opp',
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
        const valgtPeriodeId = perioderInnenforPeriode.find(
            ({ periode }) => periode.fom === format(valgtDato, 'yyyy-MM-dd')
        )?.periodeId;
        if (!valgtPeriodeId) {
            setFeilmelding('Fant ikke perioden for valgt dato');
            return;
        }
        splittPeriode.mutate({
            path: { behandlingId },
            body: {
                vilkårsvurderingId: valgtPeriodeId,
            } satisfies SplittPeriode,
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
                <Modal.Body className="flex flex-col gap-8">
                    <Timeline>
                        <Timeline.Row label="">
                            {tidslinjePerioder.map((periode, indeks: number) => {
                                const erFørstePeriode = indeks === 0;
                                return (
                                    <Timeline.Period key={periode.id} {...periode}>
                                        <VStack gap="space-4">
                                            <span>{`Periode ${indeks + 1}: ${format(periode.start, 'dd.MM.yyyy')}–${format(periode.end, 'dd.MM.yyyy')}`}</span>
                                            <span>
                                                {erFørstePeriode && erVurdert
                                                    ? 'Vurdert'
                                                    : 'Ikke vurdert'}
                                            </span>
                                        </VStack>
                                    </Timeline.Period>
                                );
                            })}
                        </Timeline.Row>
                    </Timeline>

                    {førsteSplittetPeriode && andreSplittetPeriode && (
                        <Box className="bg-ax-bg-info-moderate p-4 rounded-xl border border-ax-bg-info-strong">
                            <HStack gap="space-32">
                                Periode 1
                                <span className="font-semibold">
                                    {`${formatterDatostring(førsteSplittetPeriode.fom)}–${formatterDatostring(førsteSplittetPeriode.tom)}`}
                                </span>
                            </HStack>
                            <HStack gap="space-32">
                                Periode 2
                                <span className="font-semibold">
                                    {`${formatterDatostring(andreSplittetPeriode.fom)}–${formatterDatostring(andreSplittetPeriode.tom)}`}
                                </span>
                            </HStack>
                        </Box>
                    )}

                    <DatePicker {...datepickerProps}>
                        <DatePicker.Input
                            {...inputProps}
                            label="Velg fra og med dato for periode 2"
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
