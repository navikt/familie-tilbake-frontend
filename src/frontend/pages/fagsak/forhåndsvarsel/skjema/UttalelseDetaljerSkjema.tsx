import type { FC } from 'react';
import type { FieldArrayPath } from 'react-hook-form';
import type { UttalelseFormData } from '~/pages/fagsak/forhåndsvarsel/schema';

import { DatePicker, Textarea, TextField, useDatepicker } from '@navikt/ds-react';
import { parseISO } from 'date-fns/parseISO';
import { Fragment, useEffect, useState } from 'react';
import { get, useFieldArray, useFormContext } from 'react-hook-form';

import { useBehandlingState } from '~/context/BehandlingStateContext';
import { dateTilIsoDatoString } from '~/utils/dato';

type UttalelseDetaljerFieldName = 'uttalelsesDetaljer' | 'uttalelsesDetaljerEtterUtsattFrist';

type Props = {
    fieldPrefix: `${UttalelseDetaljerFieldName}.${number}`;
    onChange?: () => void;
};

export const UttalelseDetaljerSkjema: FC<Props> = ({ fieldPrefix, onChange }) => {
    const methods = useFormContext<UttalelseFormData>();
    const { behandlingILesemodus } = useBehandlingState();
    const [uttalelsesdatoFeil, setUttalelsesdatoFeil] = useState<string | undefined>(undefined);
    const errors = methods.formState.errors;

    const uttalelsesdatoVerdi = methods.getValues(
        `${fieldPrefix}.uttalelsesdato` as 'uttalelsesDetaljer.0.uttalelsesdato'
    );
    const {
        datepickerProps,
        inputProps: { onBlur: datepickerOnBlur, ...datepickerInputProps },
    } = useDatepicker({
        toDate: new Date(),
        defaultSelected: uttalelsesdatoVerdi ? parseISO(uttalelsesdatoVerdi) : undefined,
        onDateChange: async date => {
            const dateString = dateTilIsoDatoString(date);
            methods.setValue(`${fieldPrefix}.uttalelsesdato`, dateString);
            await methods.trigger(`${fieldPrefix}.uttalelsesdato`);
            onChange?.();
        },
        onValidate: val => {
            if (val.isAfter) {
                setUttalelsesdatoFeil('Datoen kan ikke være i fremtiden');
            } else {
                setUttalelsesdatoFeil(undefined);
            }
        },
    });

    return (
        <>
            <DatePicker {...datepickerProps} dropdownCaption>
                <DatePicker.Input
                    size="small"
                    {...methods.register(`${fieldPrefix}.uttalelsesdato`)}
                    {...datepickerInputProps}
                    onBlur={async event => {
                        datepickerOnBlur?.(event);
                        await methods.trigger(`${fieldPrefix}.uttalelsesdato`);
                    }}
                    readOnly={behandlingILesemodus}
                    label="Når uttalte brukeren seg?"
                    error={
                        uttalelsesdatoFeil ?? get(errors, `${fieldPrefix}.uttalelsesdato.message`)
                    }
                />
            </DatePicker>
            <TextField
                {...methods.register(`${fieldPrefix}.hvorBrukerenUttalteSeg`, {
                    onChange,
                })}
                size="small"
                readOnly={behandlingILesemodus}
                label="Hvordan uttalte brukeren seg?"
                description="For eksempel via telefon, Gosys, Ditt Nav eller Skriv til oss"
                className="max-w-xl"
                error={get(errors, `${fieldPrefix}.hvorBrukerenUttalteSeg.message`)}
            />
            <Textarea
                {...methods.register(`${fieldPrefix}.uttalelseBeskrivelse`, {
                    onChange,
                })}
                size="small"
                readOnly={behandlingILesemodus}
                label="Beskriv hva brukeren har uttalt seg om"
                maxLength={4000}
                minRows={3}
                resize
                className="max-w-xl"
                error={get(errors, `${fieldPrefix}.uttalelseBeskrivelse.message`)}
            />
        </>
    );
};

export const UttalelseDetaljerListe: FC<{
    fieldName?: UttalelseDetaljerFieldName;
    onChange?: () => void;
}> = ({ fieldName = 'uttalelsesDetaljer', onChange }) => {
    const methods = useFormContext<UttalelseFormData>();
    const { fields, replace } = useFieldArray({
        control: methods.control,
        name: fieldName as FieldArrayPath<UttalelseFormData>,
    });

    useEffect(() => {
        if (fields.length === 0) {
            replace([
                {
                    hvorBrukerenUttalteSeg: '',
                    uttalelsesdato: '',
                    uttalelseBeskrivelse: '',
                },
            ]);
        }
    }, [fields.length, replace]);

    return (
        <>
            {fields.map((fieldItem, index) => (
                <Fragment key={fieldItem.id}>
                    <UttalelseDetaljerSkjema
                        fieldPrefix={`${fieldName}.${index}`}
                        onChange={onChange}
                    />
                </Fragment>
            ))}
        </>
    );
};
