import type { FC } from 'react';
import type { UttalelseFormData } from '~/pages/fagsak/forhåndsvarsel/schema';

import { DatePicker, Textarea, useDatepicker } from '@navikt/ds-react';
import { parseISO } from 'date-fns';
import { useEffect } from 'react';
import { Controller, get, useFormContext, useWatch } from 'react-hook-form';

import { useBehandlingState } from '~/context/BehandlingStateContext';
import { dateTilIsoDatoString } from '~/utils/dato';

type Props = {
    onChange?: () => void;
};

export const UtsettFristSkjema: FC<Props> = ({ onChange }) => {
    const methods = useFormContext<UttalelseFormData>();
    const { behandlingILesemodus } = useBehandlingState();
    const errors = methods.formState.errors;
    const eksisterendeFrist = methods.getValues('utsettUttalelseFrist.nyFrist');

    const nyFristVerdi = useWatch({
        control: methods.control,
        name: 'utsettUttalelseFrist.nyFrist',
    });

    const nyFristDatepicker = useDatepicker({
        fromDate: new Date(),
        defaultSelected: eksisterendeFrist ? parseISO(eksisterendeFrist) : undefined,
        onDateChange: date => {
            const dateString = dateTilIsoDatoString(date);
            methods.setValue('utsettUttalelseFrist.nyFrist', dateString, { shouldDirty: true });
            methods.trigger('utsettUttalelseFrist.nyFrist');
            onChange?.();
        },
    });

    useEffect(() => {
        if (!nyFristVerdi) {
            nyFristDatepicker.reset();
        }
    }, [nyFristVerdi, nyFristDatepicker]);

    return (
        <>
            <Controller
                name="utsettUttalelseFrist.nyFrist"
                control={methods.control}
                render={({ field, fieldState }) => (
                    <DatePicker {...nyFristDatepicker.datepickerProps}>
                        <DatePicker.Input
                            {...nyFristDatepicker.inputProps}
                            size="small"
                            readOnly={behandlingILesemodus}
                            label="Sett ny dato for frist"
                            name={field.name}
                            error={fieldState.error?.message}
                        />
                    </DatePicker>
                )}
            />
            <Textarea
                {...methods.register('utsettUttalelseFrist.begrunnelse', {
                    onChange,
                })}
                size="small"
                readOnly={behandlingILesemodus}
                minRows={3}
                label="Begrunnelse for utsatt frist"
                maxLength={4000}
                resize
                className="max-w-xl"
                error={get(errors, 'utsettUttalelseFrist.begrunnelse.message')}
            />
        </>
    );
};
