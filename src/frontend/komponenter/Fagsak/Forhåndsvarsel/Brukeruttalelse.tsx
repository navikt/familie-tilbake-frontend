import type { ForhåndsvarselFormData } from './forhåndsvarselSchema';

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
import { Controller, useFormContext, useWatch } from 'react-hook-form';

import { HarBrukerUttaltSeg } from './forhåndsvarselSchema';
import { dateTilIsoDatoString } from '../../../utils/dato';

type Props = {
    kanUtsetteFrist?: boolean;
};

export const Brukeruttalelse: React.FC<Props> = ({ kanUtsetteFrist = false }) => {
    const methods = useFormContext<ForhåndsvarselFormData>();

    const harBrukerUttaltSeg = useWatch({
        control: methods.control,
        name: 'harBrukerUttaltSeg.harBrukerUttaltSeg',
    });

    const uttalelsesDatepicker = useDatepicker({
        onDateChange: date => {
            const dateString = dateTilIsoDatoString(date);
            methods.setValue('harBrukerUttaltSeg.uttalelsesDetaljer.0.uttalelsesdato', dateString);
            methods.trigger('harBrukerUttaltSeg.uttalelsesDetaljer.0.uttalelsesdato');
        },
    });

    const nyFristDatepicker = useDatepicker({
        onDateChange: date => {
            const dateString = dateTilIsoDatoString(date);
            methods.setValue('harBrukerUttaltSeg.utsettUttalelseFrist.nyFrist', dateString);
            methods.trigger('harBrukerUttaltSeg.utsettUttalelseFrist.nyFrist');
        },
    });

    return (
        <VStack maxWidth={ATextWidthMax} gap="4">
            <Controller
                control={methods.control}
                name="harBrukerUttaltSeg.harBrukerUttaltSeg"
                render={({ field, fieldState }) => (
                    <RadioGroup
                        {...field}
                        size="small"
                        legend="Har brukeren uttalt seg etter forhåndsvarselet?"
                        error={fieldState.error?.message}
                    >
                        <Radio value={HarBrukerUttaltSeg.Ja}>Ja</Radio>
                        <Radio value={HarBrukerUttaltSeg.Nei}>Nei</Radio>
                        {kanUtsetteFrist && (
                            <Radio value={HarBrukerUttaltSeg.UtsettFrist}>
                                Utsett frist for å uttale seg
                            </Radio>
                        )}
                    </RadioGroup>
                )}
            />
            {harBrukerUttaltSeg === HarBrukerUttaltSeg.Ja && (
                <>
                    <Controller
                        name="harBrukerUttaltSeg.uttalelsesDetaljer.0.uttalelsesdato"
                        control={methods.control}
                        render={({ field, fieldState }) => (
                            <DatePicker {...uttalelsesDatepicker.datepickerProps}>
                                <DatePicker.Input
                                    {...field}
                                    {...uttalelsesDatepicker.inputProps}
                                    label="Når uttalte brukeren seg?"
                                    error={fieldState.error?.message}
                                />
                            </DatePicker>
                        )}
                    />

                    <TextField
                        {...methods.register(
                            'harBrukerUttaltSeg.uttalelsesDetaljer.0.hvorBrukerenUttalteSeg'
                        )}
                        label="Hvordan uttalte brukeren seg?"
                        description="For eksempel via telefon, Gosys, Ditt Nav eller Skriv til oss"
                        error={
                            //@ts-expect-error Trenger å typeguarde error objektet
                            methods.formState.errors.harBrukerUttaltSeg?.uttalelsesDetaljer?.[0]
                                .hvorBrukerenUttalteSeg?.message
                        }
                    />
                    <Textarea
                        {...methods.register(
                            'harBrukerUttaltSeg.uttalelsesDetaljer.0.uttalelseBeskrivelse'
                        )}
                        label="Beskriv hva brukeren har uttalt seg om"
                        maxLength={4000}
                        resize
                        error={
                            //@ts-expect-error Trenger å typeguarde error objektet
                            methods.formState.errors.harBrukerUttaltSeg?.uttalelsesDetaljer?.[0]
                                .uttalelseBeskrivelse?.message
                        }
                    />
                </>
            )}
            {harBrukerUttaltSeg === HarBrukerUttaltSeg.Nei && (
                <Textarea
                    {...methods.register('harBrukerUttaltSeg.kommentar')}
                    label="Kommentar til valget over"
                    maxLength={4000}
                    resize
                    //@ts-expect-error Trenger å typeguarde error objektet
                    error={methods.formState.errors.harBrukerUttaltSeg?.kommentar?.message}
                />
            )}
            {harBrukerUttaltSeg === HarBrukerUttaltSeg.UtsettFrist && (
                <>
                    <Controller
                        name="harBrukerUttaltSeg.utsettUttalelseFrist.nyFrist"
                        control={methods.control}
                        render={({ field, fieldState }) => (
                            <DatePicker {...nyFristDatepicker.datepickerProps}>
                                <DatePicker.Input
                                    {...nyFristDatepicker.inputProps}
                                    label="Sett ny dato for frist"
                                    name={field.name}
                                    error={fieldState.error?.message}
                                />
                            </DatePicker>
                        )}
                    />
                    <Textarea
                        {...methods.register('harBrukerUttaltSeg.utsettUttalelseFrist.begrunnelse')}
                        label="Begrunnelse for utsatt frist"
                        maxLength={4000}
                        resize
                        error={
                            //@ts-expect-error Trenger å typeguarde error objektet
                            methods.formState.errors.harBrukerUttaltSeg?.utsettUttalelseFrist
                                ?.begrunnelse?.message
                        }
                    />
                </>
            )}
        </VStack>
    );
};
