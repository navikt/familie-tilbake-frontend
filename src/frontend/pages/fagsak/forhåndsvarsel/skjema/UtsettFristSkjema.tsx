import type { FC } from 'react';
import type { UttalelseFormData } from '~/pages/fagsak/forhåndsvarsel/schema';

import { DatePicker, Textarea, useDatepicker } from '@navikt/ds-react';
import { Controller, get, useFormContext } from 'react-hook-form';

import { useBehandlingState } from '~/context/BehandlingStateContext';
import { dateTilIsoDatoString } from '~/utils/dato';

export const UtsettFristSkjema: FC = () => {
    const methods = useFormContext<UttalelseFormData>();
    const { behandlingILesemodus } = useBehandlingState();
    const errors = methods.formState.errors;

    const nyFristDatepicker = useDatepicker({
        fromDate: new Date(),
        onDateChange: date => {
            const dateString = dateTilIsoDatoString(date);
            methods.setValue('utsettUttalelseFrist.nyFrist', dateString);
            methods.trigger('utsettUttalelseFrist.nyFrist');
        },
    });

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
                {...methods.register('utsettUttalelseFrist.begrunnelse')}
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
