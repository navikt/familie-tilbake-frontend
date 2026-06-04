import type { FC } from 'react';
import type { ForhaandsvarselErSendt, Uttalelse } from '@/generated-new';
import type { BrukeruttalelseFormData } from './brukeruttalelseSchema';

import { zodResolver } from '@hookform/resolvers/zod';
import { FormProvider, type SubmitHandler, useForm } from 'react-hook-form';

import { Brukeruttalelse } from './Brukeruttalelse';
import { brukeruttalelseSchema, tilUttalelseSkjema } from './brukeruttalelseSchema';

export const BRUKERUTTALELSE_FORM_ID = 'brukeruttalelse-form';

type Props = ForhaandsvarselErSendt & {
    brukeruttalelse: Uttalelse | null;
    onSubmit: SubmitHandler<BrukeruttalelseFormData>;
};

export const SendtVarsel: FC<Props> = ({ brukeruttalelse, uttalelsesfrist, onSubmit }: Props) => {
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
            <form id={BRUKERUTTALELSE_FORM_ID} onSubmit={methods.handleSubmit(onSubmit)}>
                <Brukeruttalelse varselErSendt fristForUttalelse={fristForUttalelse} />
            </form>
        </FormProvider>
    );
};
