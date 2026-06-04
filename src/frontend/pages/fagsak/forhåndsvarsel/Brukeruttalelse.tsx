import type { FC } from 'react';
import type { BrukeruttalelseFormData } from './brukeruttalelseSchema';

import {
    DatePicker,
    type DateValidationT,
    Radio,
    RadioGroup,
    Textarea,
    TextField,
    useDatepicker,
    VStack,
} from '@navikt/ds-react';
import { addDays } from 'date-fns/addDays';
import { isBefore } from 'date-fns/isBefore';
import { parseISO } from 'date-fns/parseISO';
import { useMemo, useState } from 'react';
import { get, useFormContext, useWatch } from 'react-hook-form';

import { useBehandlingState } from '@/context/BehandlingStateContext';
import { dateTilIsoDatoString } from '@/utils/dato';

type Props = {
    varselErSendt: boolean;
    fristForUttalelse?: string;
};

export const Brukeruttalelse: FC<Props> = ({ varselErSendt, fristForUttalelse }: Props) => {
    const { behandlingILesemodus } = useBehandlingState();
    const {
        register,
        control,
        setValue,
        trigger,
        getValues,
        formState: { errors },
    } = useFormContext<BrukeruttalelseFormData>();

    const harUttaltSeg = useWatch({ control, name: 'brukeruttalelse.harUttaltSeg' });
    const [uttalelsesdatoFeil, setUttalelsesdatoFeil] = useState<string | undefined>(undefined);

    const iDag = useMemo(() => new Date(), []);
    const valgtUttalelsesdato = getValues('brukeruttalelse.uttalelsesdato');

    const fristIkkeUtgått = fristForUttalelse
        ? isBefore(iDag, addDays(parseISO(fristForUttalelse), 1))
        : false;

    const {
        datepickerProps,
        inputProps: { onBlur: datepickerOnBlur, ...datepickerInputProps },
    } = useDatepicker({
        toDate: iDag,
        defaultSelected: valgtUttalelsesdato ? parseISO(valgtUttalelsesdato) : undefined,
        onDateChange: async (date: Date | undefined): Promise<void> => {
            setValue('brukeruttalelse.uttalelsesdato', dateTilIsoDatoString(date), {
                shouldDirty: true,
            });
            await trigger('brukeruttalelse.uttalelsesdato');
        },
        onValidate: (val: DateValidationT): void => {
            setUttalelsesdatoFeil(val.isAfter ? 'Datoen kan ikke være i fremtiden' : undefined);
        },
    });

    const { name: radioName, ...radioProps } = register('brukeruttalelse.harUttaltSeg');

    return (
        <VStack gap="space-24">
            <RadioGroup
                name={radioName}
                legend={
                    varselErSendt
                        ? 'Har brukeren uttalt seg etter forhåndsvarselet ble sendt?'
                        : 'Har brukeren uttalt seg?'
                }
                size="small"
                readOnly={behandlingILesemodus}
                className="max-w-xl"
                error={get(errors, 'brukeruttalelse.harUttaltSeg.message')}
            >
                <Radio value="ja" {...radioProps}>
                    Ja
                </Radio>
                <Radio value="nei" {...radioProps} disabled={fristIkkeUtgått}>
                    Nei
                </Radio>
            </RadioGroup>

            {harUttaltSeg === 'ja' && (
                <>
                    <DatePicker {...datepickerProps} dropdownCaption>
                        <DatePicker.Input
                            size="small"
                            {...register('brukeruttalelse.uttalelsesdato')}
                            {...datepickerInputProps}
                            onBlur={async (
                                event: React.FocusEvent<HTMLInputElement, Element>
                            ): Promise<void> => {
                                datepickerOnBlur?.(event);
                                await trigger('brukeruttalelse.uttalelsesdato');
                            }}
                            readOnly={behandlingILesemodus}
                            label="Når uttalte brukeren seg?"
                            error={
                                uttalelsesdatoFeil ??
                                get(errors, 'brukeruttalelse.uttalelsesdato.message')
                            }
                        />
                    </DatePicker>
                    <TextField
                        {...register('brukeruttalelse.hvorBrukerenUttalteSeg')}
                        size="small"
                        readOnly={behandlingILesemodus}
                        label="Hvordan uttalte brukeren seg?"
                        description="For eksempel via telefon, Gosys, Ditt Nav eller Skriv til oss"
                        className="max-w-xl"
                        error={get(errors, 'brukeruttalelse.hvorBrukerenUttalteSeg.message')}
                    />
                    <Textarea
                        {...register('brukeruttalelse.beskrivelse')}
                        size="small"
                        readOnly={behandlingILesemodus}
                        label="Beskriv hva brukeren har uttalt seg om"
                        maxLength={4000}
                        minRows={3}
                        resize
                        className="max-w-xl"
                        error={get(errors, 'brukeruttalelse.beskrivelse.message')}
                    />
                </>
            )}

            {harUttaltSeg === 'nei' && (
                <Textarea
                    {...register('brukeruttalelse.beskrivelse')}
                    size="small"
                    readOnly={behandlingILesemodus}
                    label="Kommentar til valget over"
                    maxLength={4000}
                    minRows={3}
                    resize
                    className="max-w-xl"
                    error={get(errors, 'brukeruttalelse.beskrivelse.message')}
                />
            )}
        </VStack>
    );
};
