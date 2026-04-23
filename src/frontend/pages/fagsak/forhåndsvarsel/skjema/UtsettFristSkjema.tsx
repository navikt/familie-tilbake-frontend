import type { FC } from 'react';
import type { UttalelseFormData } from '~/pages/fagsak/forhåndsvarsel/schema';

import { DatePicker, Textarea, useDatepicker } from '@navikt/ds-react';
import { parseISO } from 'date-fns/parseISO';
import { useMemo, useState } from 'react';
import { get, useFormContext } from 'react-hook-form';

import { useBehandlingState } from '~/context/BehandlingStateContext';
import { dateTilIsoDatoString } from '~/utils/dato';

export const UtsettFristSkjema: FC = () => {
    const methods = useFormContext<UttalelseFormData>();
    const [nyFristFeil, setNyFristFeil] = useState<string | undefined>(undefined);
    const { behandlingILesemodus } = useBehandlingState();
    const errors = methods.formState.errors;
    const iDag = useMemo(() => new Date(), []);

    const {
        datepickerProps: nyFristDatepickerProps,
        inputProps: { onBlur: nyFristOnBlur, ...nyFristInputProps },
    } = useDatepicker({
        fromDate: iDag,
        defaultSelected: methods.getValues('utsettUttalelseFrist.nyFrist')
            ? parseISO(methods.getValues('utsettUttalelseFrist.nyFrist'))
            : undefined,
        onDateChange: date => {
            const dateString = dateTilIsoDatoString(date);
            methods.setValue('utsettUttalelseFrist.nyFrist', dateString);
            methods.trigger('utsettUttalelseFrist.nyFrist');
        },
        onValidate: val => {
            if (val.isBefore) {
                setNyFristFeil('Fristen kan ikke være i fortiden');
            } else {
                setNyFristFeil(undefined);
            }
        },
    });

    return (
        <>
            <DatePicker {...nyFristDatepickerProps}>
                <DatePicker.Input
                    size="small"
                    {...nyFristInputProps}
                    onBlur={async event => {
                        nyFristOnBlur?.(event);
                        await methods.trigger('utsettUttalelseFrist.nyFrist');
                    }}
                    name="utsettUttalelseFrist.nyFrist"
                    readOnly={behandlingILesemodus}
                    label="Sett ny dato for frist"
                    error={nyFristFeil ?? get(errors, 'utsettUttalelseFrist.nyFrist.message')}
                />
            </DatePicker>
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
