import type { FC } from 'react';
import type { SubmitHandler } from 'react-hook-form';
import type { UttalelseFormData } from '~/pages/fagsak/forhåndsvarsel/schema';

import {
    RadioGroup,
    Radio,
    DatePicker,
    TextField,
    Textarea,
    useDatepicker,
} from '@navikt/ds-react';
import { addDays } from 'date-fns/addDays';
import { isBefore } from 'date-fns/isBefore';
import { parseISO } from 'date-fns/parseISO';
import { Fragment, useEffect, useMemo, useState } from 'react';
import { get, useFieldArray, useFormContext, useWatch } from 'react-hook-form';

import { useBehandlingState } from '~/context/BehandlingStateContext';
import { HarUttaltSeg } from '~/pages/fagsak/forhåndsvarsel/schema';
import { dateTilIsoDatoString } from '~/utils/dato';

type Props = {
    handleUttalelseSubmit: SubmitHandler<UttalelseFormData>;
    varselErSendt: boolean;
    fristForUttalelse?: string | null;
};

export const Uttalelse: FC<Props> = ({
    handleUttalelseSubmit,
    varselErSendt,
    fristForUttalelse,
}) => {
    const methods = useFormContext<UttalelseFormData>();
    const [uttalelsesdatoFeil, setUttalelsesdatoFeil] = useState<string | undefined>(undefined);
    const { behandlingILesemodus } = useBehandlingState();
    const harUttaltSeg = useWatch({
        control: methods.control,
        name: 'harUttaltSeg',
    });

    const { name, ...radioProps } = methods.register('harUttaltSeg');
    const errors = methods.formState.errors;

    const iDag = useMemo(() => new Date(), []);

    const fristIkkeUtgått = fristForUttalelse
        ? isBefore(iDag, addDays(parseISO(fristForUttalelse), 1))
        : false;

    const {
        datepickerProps,
        inputProps: { onBlur: datepickerOnBlur, ...datepickerInputProps },
    } = useDatepicker({
        toDate: iDag,
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
                <Radio value={HarUttaltSeg.Nei} {...radioProps} disabled={fristIkkeUtgått}>
                    Nei
                </Radio>
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
        </form>
    );
};
