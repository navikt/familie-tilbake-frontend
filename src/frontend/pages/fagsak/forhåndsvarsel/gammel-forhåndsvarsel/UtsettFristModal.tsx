import type { FC, RefObject } from 'react';
import type { SubmitHandler } from 'react-hook-form';
import type { z } from 'zod';
import type { FristUtsettelseDto } from '~/generated';

import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Modal, Textarea, DatePicker, useDatepicker, VStack } from '@navikt/ds-react';
import { useMemo, useState } from 'react';
import { useForm, get } from 'react-hook-form';

import { useBehandlingState } from '~/context/BehandlingStateContext';
import { MODAL_BREDDE } from '~/komponenter/meny/utils';
import { utsettUttalelseFristSchema } from '~/pages/fagsak/forhåndsvarsel/gammel-forhåndsvarsel/schema';
import { dateTilIsoDatoString } from '~/utils/dato';

type UtsettFristFormData = z.infer<typeof utsettUttalelseFristSchema>;

type Props = {
    dialogRef: RefObject<HTMLDialogElement | null>;
    onUtsettFrist: (payload: FristUtsettelseDto) => void;
    laster: boolean;
};

export const UtsettFristModal: FC<Props> = ({ dialogRef, onUtsettFrist, laster }) => {
    const { behandlingILesemodus } = useBehandlingState();
    const [nyFristFeil, setNyFristFeil] = useState<string | undefined>(undefined);
    const iDag = useMemo(() => new Date(), []);

    const methods = useForm<UtsettFristFormData>({
        resolver: zodResolver(utsettUttalelseFristSchema),
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
