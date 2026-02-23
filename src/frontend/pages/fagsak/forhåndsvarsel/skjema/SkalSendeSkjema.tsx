import type { Section, Varselbrevtekst } from '../../../../generated';
import type { ForhåndsvarselFormData } from '../schema';
import type { FieldErrors, SubmitHandler } from 'react-hook-form';

import { BodyLong, Heading, Radio, RadioGroup, Textarea, VStack } from '@navikt/ds-react';
import React, { Fragment } from 'react';
import { Controller, useFormContext, useWatch } from 'react-hook-form';

import { SkalSendesForhåndsvarsel } from '../schema';
import { Unntak } from './UnntakSkjema';
import { useBehandlingState } from '../../../../context/BehandlingStateContext';

type Props = {
    varselbrevtekster: Varselbrevtekst | undefined;
    varselErSendt: boolean;
    handleForhåndsvarselSubmit: SubmitHandler<ForhåndsvarselFormData>;
};

export const SkalSendeSkjema: React.FC<Props> = ({
    varselbrevtekster,
    varselErSendt,
    handleForhåndsvarselSubmit,
}) => {
    const maksAntallTegn = 4000;
    const { behandlingILesemodus } = useBehandlingState();
    const {
        control,
        register,
        handleSubmit,
        formState: { errors },
    } = useFormContext<ForhåndsvarselFormData>();

    const fieldError: FieldErrors<
        Extract<ForhåndsvarselFormData, { skalSendesForhåndsvarsel: SkalSendesForhåndsvarsel.Ja }>
    > = errors;

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
            <Controller
                control={control}
                name="skalSendesForhåndsvarsel"
                render={({ field, fieldState }) => (
                    <RadioGroup
                        {...field}
                        size="small"
                        className="max-w-xl"
                        legend="Skal det sendes forhåndsvarsel om tilbakekreving?"
                        description="Brukeren skal som klar hovedregel varsles før vedtak om tilbakekreving
                        fattes, slik at de får mulighet til å uttale seg."
                        readOnly={varselErSendt || behandlingILesemodus}
                        error={fieldState.error?.message}
                    >
                        <Radio value={SkalSendesForhåndsvarsel.Ja}>Ja</Radio>
                        <Radio value={SkalSendesForhåndsvarsel.Nei}>Nei</Radio>
                    </RadioGroup>
                )}
            />

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
                                {/* Første element sin tittel er tom */}
                                {avsnitt.title && (
                                    <Heading level="4" size="xsmall">
                                        {avsnitt.title}
                                    </Heading>
                                )}
                                <BodyLong size="small">{avsnitt.body}</BodyLong>
                                {avsnitt.title === 'Dette har skjedd' && (
                                    <Textarea
                                        {...register('fritekst')}
                                        size="small"
                                        minRows={3}
                                        label="Legg til utdypende tekst"
                                        maxLength={maksAntallTegn}
                                        error={fieldError.fritekst?.message?.toString()}
                                        readOnly={varselErSendt}
                                        resize
                                    />
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
