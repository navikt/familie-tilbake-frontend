import type { IkkeVurdertFormData } from './schema';
import type { FC } from 'react';
import type { ChangeHandler, SubmitHandler } from 'react-hook-form';
import type { Section, Varselbrevtekst } from '~/generated';

import { zodResolver } from '@hookform/resolvers/zod';
import { BodyLong, Box, Heading, Textarea, VStack } from '@navikt/ds-react';
import { useQuery } from '@tanstack/react-query';
import { Fragment, useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';

import { useBehandling } from '~/context/BehandlingContext';
import { useBehandlingState } from '~/context/BehandlingStateContext';
import { hentForhåndsvarselTekstOptions } from '~/generated/@tanstack/react-query.gen';
import { behandlingFaktaOptions } from '~/generated-new/@tanstack/react-query.gen';
import { formatterDatostringLangt } from '~/utils/dateUtils';

import { ikkeVurdertSchema } from './schema';
import { SkalSendeForhåndsvarsel } from './SkalSendeForhåndsvarsel';

export const FORHÅNDSVARSEL_FORM_ID = 'forhåndsvarsel-form';

type Props = {
    onSubmit: SubmitHandler<IkkeVurdertFormData>;
    onValgEndring?: (valg: 'send' | 'unntak' | undefined) => void;
};

const lagStønadstekst = (vedtaksdato: string | undefined): string | undefined => {
    if (!vedtaksdato) return undefined;
    const formatertDato = formatterDatostringLangt(vedtaksdato);
    return `Det er gjort en endring i saken din ${formatertDato}. Dette gjør at tidligere utbetalinger ikke lenger er riktige, og at du har fått utbetalt for mye.`;
};

export const IkkeVurdert: FC<Props> = ({ onSubmit, onValgEndring }) => {
    const { behandlingILesemodus } = useBehandlingState();
    const { behandlingId } = useBehandling();

    const {
        register,
        handleSubmit,
        control,
        setValue,
        getValues,
        formState: { errors },
    } = useForm<IkkeVurdertFormData>({
        resolver: zodResolver(ikkeVurdertSchema),
    });

    const valg = useWatch({ control, name: 'valg' });

    const { data: varselbrevtekster } = useQuery({
        ...hentForhåndsvarselTekstOptions({ path: { behandlingId } }),
        select: (data): Varselbrevtekst | undefined => data.data ?? undefined,
    });

    const { data: faktaOmFeilutbetaling } = useQuery(
        behandlingFaktaOptions({ path: { behandlingId } })
    );

    const stønadstekst = lagStønadstekst(
        faktaOmFeilutbetaling?.feilutbetaling.revurdering.vedtaksdato
    );

    useEffect(() => {
        if (stønadstekst && valg === 'send' && !getValues('tekstFraSaksbehandler')) {
            setValue('tekstFraSaksbehandler', stønadstekst);
        }
    }, [stønadstekst, valg, setValue, getValues]);

    const {
        name: valgName,
        ref: valgRef,
        onChange: registerOnChange,
        ...valgRadioProps
    } = register('valg');

    const handleValgChange: ChangeHandler = async event => {
        await registerOnChange(event);
        onValgEndring?.(event.target.value as 'send' | 'unntak');
    };

    return (
        <VStack asChild gap="space-24">
            <form id={FORHÅNDSVARSEL_FORM_ID} onSubmit={handleSubmit(onSubmit)}>
                <SkalSendeForhåndsvarsel
                    name={valgName}
                    radioRef={valgRef}
                    readOnly={behandlingILesemodus}
                    value={valg}
                    error={errors.valg?.message}
                    onChange={handleValgChange}
                    {...valgRadioProps}
                />

                {valg === 'send' && varselbrevtekster && (
                    <Box
                        borderColor="neutral-strong"
                        borderWidth="1"
                        borderRadius="8"
                        paddingBlock="space-12"
                        paddingInline="space-16"
                    >
                        <VStack gap="space-24">
                            <Heading level="2" size="small">
                                Opprett forhåndsvarsel
                            </Heading>
                            <VStack className="max-w-xl" gap="space-24">
                                <Heading level="3" size="medium">
                                    {varselbrevtekster.overskrift}
                                </Heading>
                                {varselbrevtekster.avsnitter.map((avsnitt: Section) => (
                                    <Fragment key={avsnitt.title}>
                                        {avsnitt.title === 'Dette har skjedd' ? (
                                            <VStack gap="space-16">
                                                <Heading level="4" size="xsmall">
                                                    {avsnitt.title}
                                                </Heading>
                                                <Textarea
                                                    {...register('tekstFraSaksbehandler')}
                                                    label="Legg til utdypende tekst"
                                                    maxLength={4000}
                                                    minRows={3}
                                                    size="small"
                                                    readOnly={behandlingILesemodus}
                                                    resize
                                                    error={
                                                        'tekstFraSaksbehandler' in errors
                                                            ? errors.tekstFraSaksbehandler?.message
                                                            : undefined
                                                    }
                                                />
                                            </VStack>
                                        ) : (
                                            <>
                                                {avsnitt.title && (
                                                    <Heading level="4" size="xsmall">
                                                        {avsnitt.title}
                                                    </Heading>
                                                )}
                                                <BodyLong size="small">{avsnitt.body}</BodyLong>
                                            </>
                                        )}
                                    </Fragment>
                                ))}
                            </VStack>
                        </VStack>
                    </Box>
                )}
            </form>
        </VStack>
    );
};
