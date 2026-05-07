import type { FC } from 'react';
import type { FieldErrors, SubmitHandler } from 'react-hook-form';
import type { Section, Varselbrevtekst } from '~/generated';
import type { ForhåndsvarselFormData } from '~/pages/fagsak/forhåndsvarsel/schema';

import { BodyLong, Heading, Radio, RadioGroup, Textarea, VStack } from '@navikt/ds-react';
import { useQuery } from '@tanstack/react-query';
import { parseISO } from 'date-fns';
import { Fragment, useEffect } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';

import { useBehandling } from '~/context/BehandlingContext';
import { useBehandlingState } from '~/context/BehandlingStateContext';
import { behandlingFaktaOptions } from '~/generated-new/@tanstack/react-query.gen';
import { SkalSendesForhåndsvarsel } from '~/pages/fagsak/forhåndsvarsel/schema';

import { Unntak } from './UnntakSkjema';

const lagStønadstekst = (vedtaksdato: string | undefined): string | undefined => {
    if (!vedtaksdato) return undefined;

    const formatertDato = parseISO(vedtaksdato).toLocaleDateString('no-NO', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });
    return `Det er gjort en endring i saken din ${formatertDato}. Dette gjør at tidligere utbetalinger ikke lenger er riktige, og at du har fått utbetalt for mye.`;
};

type Props = {
    varselbrevtekster: Varselbrevtekst | undefined;
    varselErSendt: boolean;
    handleForhåndsvarselSubmit: SubmitHandler<ForhåndsvarselFormData>;
};

export const SkalSendeSkjema: FC<Props> = ({
    varselbrevtekster,
    varselErSendt,
    handleForhåndsvarselSubmit,
}) => {
    const maksAntallTegn = 4000;
    const { behandlingILesemodus } = useBehandlingState();
    const { behandlingId } = useBehandling();
    const {
        control,
        register,
        handleSubmit,
        setValue,
        getValues,
        formState: { errors },
    } = useFormContext<ForhåndsvarselFormData>();

    const { data: faktaOmFeilutbetaling } = useQuery(
        behandlingFaktaOptions({ path: { behandlingId } })
    );

    const stønadstekst = lagStønadstekst(
        faktaOmFeilutbetaling?.feilutbetaling.revurdering.vedtaksdato
    );

    useEffect(() => {
        if (stønadstekst && !getValues('fritekst')) {
            setValue('fritekst', stønadstekst);
        }
    }, [stønadstekst, setValue, getValues]);

    const fieldError: FieldErrors<
        Extract<ForhåndsvarselFormData, { skalSendesForhåndsvarsel: SkalSendesForhåndsvarsel.Ja }>
    > = errors;
    const { name, ...radioProps } = register('skalSendesForhåndsvarsel');
    const skalSendesForhåndsvarsel = useWatch({
        control: control,
        name: 'skalSendesForhåndsvarsel',
    });

    const visSkjema =
        skalSendesForhåndsvarsel === SkalSendesForhåndsvarsel.Ja &&
        varselbrevtekster &&
        !varselErSendt;

    return (
        <form
            id="opprettForm"
            onSubmit={handleSubmit(handleForhåndsvarselSubmit)}
            className="flex flex-col gap-6"
        >
            <RadioGroup
                name={name}
                size="small"
                readOnly={varselErSendt || behandlingILesemodus}
                className="max-w-xl"
                legend="Skal det sendes forhåndsvarsel om tilbakekreving?"
                description="Brukeren skal som klar hovedregel varsles før vedtak om tilbakekreving
                        fattes, slik at de får mulighet til å uttale seg."
                error={errors.skalSendesForhåndsvarsel?.message}
            >
                <Radio value={SkalSendesForhåndsvarsel.Ja} {...radioProps}>
                    Ja
                </Radio>
                <Radio value={SkalSendesForhåndsvarsel.Nei} {...radioProps}>
                    Nei
                </Radio>
            </RadioGroup>

            {visSkjema && (
                <div className="flex-1 border border-ax-border-neutral-strong rounded-lg py-3 px-4">
                    <Heading level="2" size="small" spacing>
                        Opprett forhåndsvarsel
                    </Heading>
                    <VStack className="max-w-xl pt-4" gap="space-24">
                        <Heading level="3" size="medium">
                            {varselbrevtekster.overskrift}
                        </Heading>
                        {varselbrevtekster.avsnitter.map((avsnitt: Section) => (
                            <Fragment key={avsnitt.title}>
                                {/* I første element er tittel er tom */}
                                {avsnitt.title && avsnitt.title !== 'Dette har skjedd' && (
                                    <Heading level="4" size="xsmall">
                                        {avsnitt.title}
                                    </Heading>
                                )}
                                {avsnitt.title !== 'Dette har skjedd' && (
                                    <BodyLong size="small">{avsnitt.body}</BodyLong>
                                )}
                                {avsnitt.title === 'Dette har skjedd' && (
                                    <VStack gap="space-16">
                                        <Heading level="4" size="xsmall">
                                            {avsnitt.title}
                                        </Heading>
                                        <Textarea
                                            {...register('fritekst')}
                                            size="small"
                                            minRows={3}
                                            label="Legg til utdypende tekst"
                                            maxLength={maksAntallTegn}
                                            error={fieldError.fritekst?.message}
                                            readOnly={varselErSendt}
                                            resize
                                        />
                                    </VStack>
                                )}
                            </Fragment>
                        ))}
                    </VStack>
                </div>
            )}

            {skalSendesForhåndsvarsel === SkalSendesForhåndsvarsel.Nei && <Unntak />}
        </form>
    );
};
