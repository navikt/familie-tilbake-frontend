import type { FC } from 'react';
import type { UttalelseFormData } from '~/pages/fagsak/forhåndsvarsel/schema';

import { DatePicker, Textarea, TextField, useDatepicker } from '@navikt/ds-react';
import { parseISO } from 'date-fns/parseISO';
import { Fragment, useState } from 'react';
import { get, useFieldArray, useFormContext } from 'react-hook-form';

import { useBehandlingState } from '~/context/BehandlingStateContext';
import { dateTilIsoDatoString } from '~/utils/dato';

type Props = {
    fieldPrefix: `uttalelsesDetaljer.${number}`;
};

export const UttalelseDetaljerSkjema: FC<Props> = ({ fieldPrefix }) => {
    const methods = useFormContext<UttalelseFormData>();
    const { behandlingILesemodus } = useBehandlingState();
    const [uttalelsesdatoFeil, setUttalelsesdatoFeil] = useState<string | undefined>(undefined);
    const errors = methods.formState.errors;

    const {
        datepickerProps,
        inputProps: { onBlur: datepickerOnBlur, ...datepickerInputProps },
    } = useDatepicker({
        toDate: new Date(),
        defaultSelected: methods.getValues(`${fieldPrefix}.uttalelsesdato`)
            ? parseISO(methods.getValues(`${fieldPrefix}.uttalelsesdato`))
            : undefined,
        onDateChange: async date => {
            const dateString = dateTilIsoDatoString(date);
            methods.setValue(`${fieldPrefix}.uttalelsesdato`, dateString);
            await methods.trigger(`${fieldPrefix}.uttalelsesdato`);
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
                {...methods.register(`${fieldPrefix}.hvorBrukerenUttalteSeg`)}
                size="small"
                readOnly={behandlingILesemodus}
                label="Hvordan uttalte brukeren seg?"
                description="For eksempel via telefon, Gosys, Ditt Nav eller Skriv til oss"
                className="max-w-xl"
                error={get(errors, `${fieldPrefix}.hvorBrukerenUttalteSeg.message`)}
            />
            <Textarea
                {...methods.register(`${fieldPrefix}.uttalelseBeskrivelse`)}
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

type UttalelseDetaljerListeProps = {
    onFieldsInitialized?: () => void;
};

export const UttalelseDetaljerListe: FC<UttalelseDetaljerListeProps> = () => {
    const methods = useFormContext<UttalelseFormData>();
    const { fields } = useFieldArray({
        control: methods.control,
        name: 'uttalelsesDetaljer',
    });

    return (
        <>
            {fields.map((fieldItem, index) => (
                <Fragment key={fieldItem.id}>
                    <UttalelseDetaljerSkjema fieldPrefix={`uttalelsesDetaljer.${index}`} />
                </Fragment>
            ))}
        </>
    );
};
