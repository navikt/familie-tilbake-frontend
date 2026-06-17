import type { FC } from 'react';
import type { ForhaandsvarselErSendt, Uttalelse } from '@/generated-new';
import type { BrukeruttalelseFormData } from './brukeruttalelseSchema';

import { zodResolver } from '@hookform/resolvers/zod';
import { FormProvider, type SubmitHandler, useForm, useFormContext } from 'react-hook-form';

import { Brukeruttalelse } from './Brukeruttalelse';
import { brukeruttalelseSchema, tilUttalelseSkjema } from './brukeruttalelseSchema';
import { useUlagretForhåndsvarsel } from './useUlagretForhåndsvarsel';

export const BRUKERUTTALELSE_FORM_ID = 'brukeruttalelse-form';

type SendtVarselProps = ForhaandsvarselErSendt & {
    brukeruttalelse: Uttalelse | null;
    onSubmit: SubmitHandler<BrukeruttalelseFormData>;
};

type SendtVarselSkjemaProps = {
    fristForUttalelse: string | undefined;
    onSubmit: SubmitHandler<BrukeruttalelseFormData>;
};

const SendtVarselSkjema: FC<SendtVarselSkjemaProps> = ({
    fristForUttalelse,
    onSubmit,
}: SendtVarselSkjemaProps) => {
    const { handleSubmit } = useFormContext<BrukeruttalelseFormData>();

    useUlagretForhåndsvarsel();

    return (
        <form id={BRUKERUTTALELSE_FORM_ID} onSubmit={handleSubmit(onSubmit)}>
            <Brukeruttalelse varselErSendt fristForUttalelse={fristForUttalelse} />
        </form>
    );
};

export const SendtVarsel: FC<SendtVarselProps> = ({
    brukeruttalelse,
    uttalelsesfrist,
    onSubmit,
}: SendtVarselProps) => {
    const fristForUttalelse = uttalelsesfrist.nyFrist ?? uttalelsesfrist.opprinneligFrist;

    const methods = useForm<BrukeruttalelseFormData>({
        resolver: zodResolver(brukeruttalelseSchema),
        shouldUnregister: true,
        defaultValues: {
            brukeruttalelse: tilUttalelseSkjema(brukeruttalelse),
        },
    });

    return (
        <FormProvider {...methods}>
            <SendtVarselSkjema fristForUttalelse={fristForUttalelse} onSubmit={onSubmit} />
        </FormProvider>
    );
};
