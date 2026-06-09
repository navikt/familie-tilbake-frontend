import type { FC, RefObject } from 'react';
import type { SubmitHandler } from 'react-hook-form';
import type { z } from 'zod';
import type { UpdateUttalelsesfrist } from '@/generated-new';

import { zodResolver } from '@hookform/resolvers/zod';
import { Button, DatePicker, Modal, Textarea, useDatepicker, VStack } from '@navikt/ds-react';
import { useMemo, useState } from 'react';
import { get, useForm } from 'react-hook-form';
import { z as zod } from 'zod';

import { useBehandlingState } from '@/context/BehandlingStateContext';
import { MODAL_BREDDE } from '@/komponenter/meny/utils';
import { dateTilIsoDatoString } from '@/utils/dato';

const utsettFristSchema = zod.object({
    nyFrist: zod.iso.date({ message: 'Du må velge en ny frist' }),
    begrunnelse: zod.string().trim().min(1, 'Du må fylle inn en begrunnelse').max(4000),
});

type UtsettFristFormData = z.infer<typeof utsettFristSchema>;

type Props = {
    dialogRef: RefObject<HTMLDialogElement | null>;
    onUtsettFrist: (payload: UpdateUttalelsesfrist) => void;
    laster: boolean;
};

export const UtsettFristModal: FC<Props> = ({ dialogRef, onUtsettFrist, laster }) => {
    const { behandlingILesemodus } = useBehandlingState();
    const [nyFristFeil, setNyFristFeil] = useState<string | undefined>(undefined);
    const iDag = useMemo(() => new Date(), []);

    const methods = useForm<UtsettFristFormData>({
        resolver: zodResolver(utsettFristSchema),
        mode: 'onSubmit',
        reValidateMode: 'onChange',
        defaultValues: {
            nyFrist: '',
            begrunnelse: '',
        },
    });

    const errors = methods.formState.errors;

    const {
        datepickerProps,
        inputProps: { onBlur: datepickerOnBlur, ...datepickerInputProps },
    } = useDatepicker({
        fromDate: iDag,
        onDateChange: date => {
            const dateString = dateTilIsoDatoString(date);
            methods.setValue('nyFrist', dateString);
            methods.trigger('nyFrist');
        },
        onValidate: val => {
            if (val.isBefore) {
                setNyFristFeil('Fristen kan ikke være i fortiden');
            } else {
                setNyFristFeil(undefined);
            }
        },
    });

    const handleSubmit: SubmitHandler<UtsettFristFormData> = data => {
        onUtsettFrist({
            nyFrist: data.nyFrist,
            begrunnelse: data.begrunnelse,
        });
    };

    const handleLukk = (): void => {
        methods.reset();
        dialogRef.current?.close();
    };

    return (
        <Modal
            ref={dialogRef}
            header={{ heading: 'Utsett frist for uttalelse' }}
            className={MODAL_BREDDE}
            onClose={handleLukk}
        >
            <form onSubmit={methods.handleSubmit(handleSubmit)}>
                <Modal.Body>
                    <VStack gap="space-24">
                        <DatePicker {...datepickerProps}>
                            <DatePicker.Input
                                size="small"
                                {...datepickerInputProps}
                                onBlur={async event => {
                                    datepickerOnBlur?.(event);
                                    await methods.trigger('nyFrist');
                                }}
                                name="nyFrist"
                                readOnly={behandlingILesemodus}
                                label="Sett ny dato for frist"
                                error={nyFristFeil ?? get(errors, 'nyFrist.message')}
                            />
                        </DatePicker>
                        <Textarea
                            {...methods.register('begrunnelse')}
                            size="small"
                            readOnly={behandlingILesemodus}
                            minRows={3}
                            label="Begrunnelse for utsatt frist"
                            maxLength={4000}
                            resize
                            error={get(errors, 'begrunnelse.message')}
                        />
                    </VStack>
                </Modal.Body>
                <Modal.Footer>
                    <Button type="submit" loading={laster} disabled={laster}>
                        Utsett frist
                    </Button>
                    <Button variant="secondary" onClick={handleLukk}>
                        Avbryt
                    </Button>
                </Modal.Footer>
            </form>
        </Modal>
    );
};
