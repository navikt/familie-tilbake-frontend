import type { UttalelseFormData } from '../schema';
import type { SubmitHandler } from 'react-hook-form';

import {
    RadioGroup,
    Radio,
    DatePicker,
    TextField,
    Textarea,
    useDatepicker,
} from '@navikt/ds-react';
import { parseISO } from 'date-fns/parseISO';
import React, { Fragment, useEffect, useState } from 'react';
import { Controller, get, useFieldArray, useFormContext, useWatch } from 'react-hook-form';

import { useBehandlingState } from '../../../../context/BehandlingStateContext';
import { ToggleName } from '../../../../context/toggles';
import { useToggles } from '../../../../context/TogglesContext';
import { dateTilIsoDatoString } from '../../../../utils/dato';
import { HarUttaltSeg } from '../schema';

type Props = {
    handleUttalelseSubmit: SubmitHandler<UttalelseFormData>;
    kanUtsetteFrist?: boolean;
    varselErSendt: boolean;
};

export const Uttalelse: React.FC<Props> = ({
    handleUttalelseSubmit,
    kanUtsetteFrist = false,
    varselErSendt,
}) => {
    const { toggles } = useToggles();
    const methods = useFormContext<UttalelseFormData>();
    const [uttalelsesdatoFeil, setUttalelsesdatoFeil] = useState<string | undefined>(undefined);
    const { behandlingILesemodus } = useBehandlingState();
    const harUttaltSeg = useWatch({
        control: methods.control,
        name: 'harUttaltSeg',
    });

    const { name, ...radioProps } = methods.register('harUttaltSeg');
    const errors = methods.formState.errors;

    const {
        datepickerProps,
        inputProps: { onBlur: datepickerOnBlur, ...datepickerInputProps },
    } = useDatepicker({
        toDate: new Date(),
        defaultSelected: methods.getValues('uttalelsesDetaljer.0.uttalelsesdato')
            ? parseISO(methods.getValues('uttalelsesDetaljer.0.uttalelsesdato'))
            : undefined,
        onDateChange: async date => {
            const dateString = dateTilIsoDatoString(date);
            methods.setValue('uttalelsesDetaljer.0.uttalelsesdato', dateString);
            await methods.trigger('uttalelsesDetaljer.0.uttalelsesdato');
        },
        onValidate: val => {
            if (val.isAfter) {
                setUttalelsesdatoFeil('Datoen kan ikke være i fremtiden');
            } else {
                setUttalelsesdatoFeil(undefined);
            }
        },
    });

    const nyFristDatepicker = useDatepicker({
        onDateChange: date => {
            const dateString = dateTilIsoDatoString(date);
            methods.setValue('utsettUttalelseFrist.nyFrist', dateString);
            methods.trigger('utsettUttalelseFrist.nyFrist');
        },
    });
    const { fields, replace } = useFieldArray({
        control: methods.control,
        name: 'uttalelsesDetaljer',
    });

    useEffect(() => {
        if (harUttaltSeg === HarUttaltSeg.Ja && fields.length === 0) {
            replace([
                {
                    hvorBrukerenUttalteSeg: '',
                    uttalelsesdato: '',
                    uttalelseBeskrivelse: '',
                },
            ]);
        }
    }, [harUttaltSeg, fields.length, replace]);

    return (
        <form
            id="uttalelseForm"
            onSubmit={methods.handleSubmit(handleUttalelseSubmit)}
            className="flex flex-col gap-6"
        >
            <RadioGroup
                name={name}
                size="small"
                readOnly={behandlingILesemodus}
                legend={
                    varselErSendt
                        ? 'Har brukeren uttalt seg etter forhåndsvarselet ble sendt?'
                        : 'Har brukeren uttalt seg?'
                }
                error={errors.harUttaltSeg?.message}
            >
                <Radio value={HarUttaltSeg.Ja} {...radioProps}>
                    Ja
                </Radio>
                <Radio value={HarUttaltSeg.Nei} {...radioProps}>
                    Nei
                </Radio>
                {toggles[ToggleName.Forhåndsvarselsteg] && kanUtsetteFrist && (
                    <Radio value={HarUttaltSeg.UtsettFrist} {...radioProps}>
                        Utsett frist for å uttale seg
                    </Radio>
                )}
            </RadioGroup>
            {harUttaltSeg === HarUttaltSeg.Ja &&
                fields.map((fieldItem, index) => (
                    <Fragment key={fieldItem.id}>
                        <DatePicker {...datepickerProps} dropdownCaption>
                            <DatePicker.Input
                                size="small"
                                {...methods.register(`uttalelsesDetaljer.${index}.uttalelsesdato`)}
                                {...datepickerInputProps}
                                onBlur={async event => {
                                    datepickerOnBlur?.(event);
                                    await methods.trigger(
                                        `uttalelsesDetaljer.${index}.uttalelsesdato`
                                    );
                                }}
                                readOnly={behandlingILesemodus}
                                label="Når uttalte brukeren seg?"
                                error={
                                    uttalelsesdatoFeil ??
                                    get(
                                        errors,
                                        `uttalelsesDetaljer.${index}.uttalelsesdato.message`
                                    )
                                }
                            />
                        </DatePicker>
                        <TextField
                            {...methods.register(
                                `uttalelsesDetaljer.${index}.hvorBrukerenUttalteSeg`
                            )}
                            size="small"
                            readOnly={behandlingILesemodus}
                            label="Hvordan uttalte brukeren seg?"
                            description="For eksempel via telefon, Gosys, Ditt Nav eller Skriv til oss"
                            className="max-w-xl"
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
                            readOnly={behandlingILesemodus}
                            label="Beskriv hva brukeren har uttalt seg om"
                            maxLength={4000}
                            minRows={3}
                            resize
                            className="max-w-xl"
                            error={get(
                                errors,
                                `uttalelsesDetaljer.${index}.uttalelseBeskrivelse.message`
                            )}
                        />
                    </Fragment>
                ))}
            {harUttaltSeg === HarUttaltSeg.Nei && (
                <Textarea
                    {...methods.register('kommentar')}
                    size="small"
                    readOnly={behandlingILesemodus}
                    label="Kommentar til valget over"
                    maxLength={4000}
                    minRows={3}
                    resize
                    className="max-w-xl"
                    error={get(errors, 'kommentar.message')}
                />
            )}
            {harUttaltSeg === HarUttaltSeg.UtsettFrist && (
                <>
                    {/* Husk at denne skal ha focus hvis utsatt frist velges og det ikke er valgt frist */}
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
            )}
        </form>
    );
};
