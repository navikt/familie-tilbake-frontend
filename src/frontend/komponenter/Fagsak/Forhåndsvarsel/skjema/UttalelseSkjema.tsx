import type { UttalelseMedFristFormData } from '../forhåndsvarselSchema';
import type { SubmitHandler } from 'react-hook-form';

import {
    VStack,
    RadioGroup,
    Radio,
    DatePicker,
    TextField,
    Textarea,
    useDatepicker,
} from '@navikt/ds-react';
import { ATextWidthMax } from '@navikt/ds-tokens/dist/tokens';
import React from 'react';
import { Controller, get, useFieldArray, useFormContext, useWatch } from 'react-hook-form';

import { dateTilIsoDatoString } from '../../../../utils/dato';
import { HarUttaltSeg } from '../forhåndsvarselSchema';

type Props = {
    handleUttalelseSubmit: SubmitHandler<UttalelseMedFristFormData>;
    readOnly: boolean;
    kanUtsetteFrist?: boolean;
};

export const Uttalelse: React.FC<Props> = ({
    handleUttalelseSubmit,
    readOnly,
    kanUtsetteFrist = false,
}) => {
    const methods = useFormContext<UttalelseMedFristFormData>();

    const harUttaltSeg = useWatch({
        control: methods.control,
        name: 'harUttaltSeg',
    });

    const errors = methods.formState.errors;

    const uttalelsesDatepicker = useDatepicker({
        onDateChange: date => {
            const dateString = dateTilIsoDatoString(date);
            methods.setValue('uttalelsesDetaljer.0.uttalelsesdato', dateString);
            methods.trigger('uttalelsesDetaljer.0.uttalelsesdato');
        },
    });

    const nyFristDatepicker = useDatepicker({
        onDateChange: date => {
            const dateString = dateTilIsoDatoString(date);
            methods.setValue('utsettUttalelseFrist.nyFrist', dateString);
            methods.trigger('utsettUttalelseFrist.nyFrist');
        },
    });
    const { fields } = useFieldArray({
        control: methods.control,
        name: 'uttalelsesDetaljer',
    });

    return (
        <VStack
            as="form"
            maxWidth={ATextWidthMax}
            gap="4"
            onSubmit={methods.handleSubmit(handleUttalelseSubmit)}
            id="uttalelseForm"
        >
            <Controller
                control={methods.control}
                name="harUttaltSeg"
                render={({ field, fieldState }) => (
                    <RadioGroup
                        {...field}
                        size="small"
                        readOnly={readOnly}
                        legend="Har brukeren uttalt seg etter forhåndsvarselet?"
                        error={fieldState.error?.message}
                    >
                        <Radio value={HarUttaltSeg.Ja}>Ja</Radio>
                        <Radio value={HarUttaltSeg.Nei}>Nei</Radio>
                        {toggles[ToggleName.Forhåndsvarselsteg] && kanUtsetteFrist && (
                            <Radio value={HarUttaltSeg.UtsettFrist}>
                                Utsett frist for å uttale seg
                            </Radio>
                        )}
                    </RadioGroup>
                )}
            />
            {harUttaltSeg === HarUttaltSeg.Ja &&
                fields.map((fieldItem, index) => (
                    <React.Fragment key={fieldItem.id}>
                        <Controller
                            name={`uttalelsesDetaljer.${index}.uttalelsesdato`}
                            control={methods.control}
                            render={({ field, fieldState }) => (
                                <DatePicker {...uttalelsesDatepicker.datepickerProps}>
                                    <DatePicker.Input
                                        {...field}
                                        {...uttalelsesDatepicker.inputProps}
                                        size="small"
                                        readOnly={readOnly}
                                        label="Når uttalte brukeren seg?"
                                        error={fieldState.error?.message}
                                        onBlur={() =>
                                            methods.trigger(
                                                `uttalelsesDetaljer.${index}.uttalelsesdato`
                                            )
                                        }
                                    />
                                </DatePicker>
                            )}
                        />
                        <TextField
                            {...methods.register(
                                `uttalelsesDetaljer.${index}.hvorBrukerenUttalteSeg`
                            )}
                            size="small"
                            readOnly={readOnly}
                            label="Hvordan uttalte brukeren seg?"
                            description="For eksempel via telefon, Gosys, Ditt Nav eller Skriv til oss"
                            error={get(
                                errors,
                                `uttalelsesDetaljer.${index}.hvorBrukerenUttalteSeg.message`
                            )}
                        />
                        <Textarea
                            {...methods.register(
                                `uttalelsesDetaljer.${index}.uttalelseBeskrivelse`
                            )}
                            size="small"
                            readOnly={readOnly}
                            label="Beskriv hva brukeren har uttalt seg om"
                            maxLength={4000}
                            resize
                            error={get(
                                errors,
                                `uttalelsesDetaljer.${index}.uttalelseBeskrivelse.message`
                            )}
                        />
                    </React.Fragment>
                ))}
            {harUttaltSeg === HarUttaltSeg.Nei && (
                <Textarea
                    {...methods.register('kommentar')}
                    size="small"
                    readOnly={readOnly}
                    label="Kommentar til valget over"
                    maxLength={4000}
                    resize
                    error={get(errors, 'kommentar.message')}
                />
            )}
            {harUttaltSeg === HarUttaltSeg.UtsettFrist && (
                <>
                    <Controller
                        name="utsettUttalelseFrist.nyFrist"
                        control={methods.control}
                        render={({ field, fieldState }) => (
                            <DatePicker {...nyFristDatepicker.datepickerProps}>
                                <DatePicker.Input
                                    {...nyFristDatepicker.inputProps}
                                    size="small"
                                    readOnly={readOnly}
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
                        readOnly={readOnly}
                        label="Begrunnelse for utsatt frist"
                        maxLength={4000}
                        resize
                        error={get(errors, 'utsettUttalelseFrist.begrunnelse.message')}
                    />
                </>
            )}
        </VStack>
    );
};
