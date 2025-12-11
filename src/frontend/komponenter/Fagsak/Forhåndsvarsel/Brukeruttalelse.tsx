import type { ForhåndsvarselFormData } from './schema';

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

import { HarBrukerUttaltSeg } from './Enums';
import { dateTilIsoDatoString } from '../../../utils/dato';
type Props = {
    kanUtsetteFrist?: boolean;
};

export const Brukeruttalelse: React.FC<Props> = ({ kanUtsetteFrist = false }) => {
    const methods = useFormContext<ForhåndsvarselFormData>();

    const harBrukerUttaltSeg = useWatch({
        control: methods.control,
        name: 'harBrukerUttaltSeg',
    });

    const uttalelsesDatepicker = useDatepicker({
        onDateChange: date => {
            const dateString = dateTilIsoDatoString(date);
            methods.setValue('uttalelsesdato', dateString);
            methods.trigger('uttalelsesdato');
        },
    });

    const nyFristDatepicker = useDatepicker({
        onDateChange: date => {
            const dateString = dateTilIsoDatoString(date);
            methods.setValue('nyFristDato', dateString);
            methods.trigger('nyFristDato');
        },
    });

    return (
        <VStack maxWidth={ATextWidthMax} gap="4">
            <Controller
                name="harBrukerUttaltSeg"
                control={methods.control}
                rules={{
                    required: 'Velg ett av alternativene over for å gå videre',
                }}
                render={({ field }) => (
                    <RadioGroup
                        legend="Har brukeren uttalt seg etter forhåndsvarselet?"
                        size="small"
                        name={field.name}
                        value={field.value || ''}
                        onChange={field.onChange}
                        error={methods.formState.errors.harBrukerUttaltSeg?.message?.toString()}
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
                        name="uttalelsesdato"
                        control={methods.control}
                        rules={{
                            required: 'Du må legge til en dato',
                        }}
                        render={() => (
                            <DatePicker {...uttalelsesDatepicker.datepickerProps}>
                                <DatePicker.Input
                                    {...uttalelsesDatepicker.inputProps}
                                    label="Når uttalte brukeren seg?"
                                    error={methods.formState.errors.uttalelsesdato?.message?.toString()}
                                />
                            </DatePicker>
                        )}
                    />

                    <TextField
                        {...methods.register('hvorBrukerenUttalteSeg')}
                        label="Hvordan uttalte brukeren seg?"
                        description="For eksempel via telefon, Gosys, Ditt Nav eller Skriv til oss"
                    />
                    <Textarea
                        {...methods.register('uttalelseBeskrivelse')}
                        label="Beskriv hva brukeren har uttalt seg om"
                        maxLength={4000}
                        resize
                    />
                </>
            )}
            {harBrukerUttaltSeg === HarBrukerUttaltSeg.Nei && (
                <Textarea
                    {...methods.register('uttalelsesKommentar')}
                    label="Kommentar til valget over"
                    maxLength={4000}
                    resize
                />
            )}
            {harBrukerUttaltSeg === HarBrukerUttaltSeg.UtsettFrist && (
                <>
                    <Controller
                        name="nyFristDato"
                        control={methods.control}
                        render={() => (
                            <DatePicker {...nyFristDatepicker.datepickerProps}>
                                <DatePicker.Input
                                    {...nyFristDatepicker.inputProps}
                                    label="Sett ny dato for frist"
                                    error={methods.formState.errors.nyFristDato?.message?.toString()}
                                />
                            </DatePicker>
                        )}
                    />
                    <Textarea
                        {...methods.register('begrunnelseUtsattFrist')}
                        label="Begrunnelse for utsatt frist"
                        maxLength={4000}
                        resize
                    />
                </>
            )}
        </VStack>
    );
};
