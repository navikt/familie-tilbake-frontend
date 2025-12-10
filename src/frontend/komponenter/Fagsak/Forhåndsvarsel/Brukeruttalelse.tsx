import type { ForhåndsvarselFormData } from './useForhåndsvarselMutations';

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
    const {
        register,
        control,
        formState: { errors },
        setValue,
        trigger,
    } = useFormContext<ForhåndsvarselFormData>();

    const harBrukerUttaltSeg = useWatch({
        control,
        name: 'harBrukerUttaltSeg',
    });

    const uttalelsesDatepicker = useDatepicker({
        onDateChange: date => {
            const dateString = dateTilIsoDatoString(date);
            setValue('uttalelsesdato', dateString);
            trigger('uttalelsesdato');
        },
    });

    const nyFristDatepicker = useDatepicker({
        onDateChange: date => {
            const dateString = dateTilIsoDatoString(date);
            setValue('nyFristDato', dateString);
            trigger('nyFristDato');
        },
    });

    return (
        <VStack maxWidth={ATextWidthMax} gap="4">
            <Controller
                name="harBrukerUttaltSeg"
                control={control}
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
                        error={errors.harBrukerUttaltSeg?.message?.toString()}
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
                        control={control}
                        rules={{
                            required: 'Du må legge til en dato',
                        }}
                        render={() => (
                            <DatePicker {...uttalelsesDatepicker.datepickerProps}>
                                <DatePicker.Input
                                    {...uttalelsesDatepicker.inputProps}
                                    label="Når uttalte brukeren seg?"
                                    error={errors.uttalelsesdato?.message?.toString()}
                                />
                            </DatePicker>
                        )}
                    />

                    <TextField
                        {...register('hvorBrukerenUttalteSeg')}
                        label="Hvordan uttalte brukeren seg?"
                        description="For eksempel via telefon, Gosys, Ditt Nav eller Skriv til oss"
                    />
                    <Textarea
                        {...register('uttalelseBeskrivelse')}
                        label="Beskriv hva brukeren har uttalt seg om"
                        maxLength={4000}
                        resize
                    />
                </>
            )}
            {harBrukerUttaltSeg === HarBrukerUttaltSeg.Nei && (
                <Textarea
                    {...register('uttalelsesKommentar')}
                    label="Kommentar til valget over"
                    maxLength={4000}
                    resize
                />
            )}
            {harBrukerUttaltSeg === HarBrukerUttaltSeg.UtsettFrist && (
                <>
                    <Controller
                        name="nyFristDato"
                        control={control}
                        render={() => (
                            <DatePicker {...nyFristDatepicker.datepickerProps}>
                                <DatePicker.Input
                                    {...nyFristDatepicker.inputProps}
                                    label="Sett ny dato for frist"
                                    error={errors.nyFristDato?.message?.toString()}
                                />
                            </DatePicker>
                        )}
                    />
                    <Textarea
                        {...register('begrunnelseUtsattFrist')}
                        label="Begrunnelse for utsatt frist"
                        maxLength={4000}
                        resize
                    />
                </>
            )}
        </VStack>
    );
};
