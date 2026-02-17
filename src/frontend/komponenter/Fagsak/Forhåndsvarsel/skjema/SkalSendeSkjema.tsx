import type { Section, Varselbrevtekst } from '../../../../generated';
import type { ForhåndsvarselFormData } from '../schema';
import type { FieldErrors, SubmitHandler } from 'react-hook-form';

import {
    BodyLong,
    Box,
    Heading,
    HStack,
    Radio,
    RadioGroup,
    Textarea,
    VStack,
} from '@navikt/ds-react';
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
        <VStack
            as="form"
            gap="space-24"
            onSubmit={handleSubmit(handleForhåndsvarselSubmit)}
            id="opprettForm"
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
                <VStack gap="space-16">
                    <HStack gap="space-16">
                        <Box className="flex-1 border border-ax-border-neutral-strong rounded-lg py-3 px-4">
                            <Heading level="2" size="small" className="mb-6">
                                Opprett forhåndsvarsel
                            </Heading>
                            <HStack align="center" justify="space-between">
                                <Heading size="medium" level="3" spacing>
                                    {varselbrevtekster.overskrift}
                                </Heading>
                            </HStack>
                            <VStack className="max-w-xl">
                                {varselbrevtekster.avsnitter.map((avsnitt: Section) => (
                                    <Fragment key={avsnitt.title}>
                                        <Heading size="xsmall" level="4" spacing>
                                            {avsnitt.title}
                                        </Heading>
                                        <BodyLong size="small" spacing>
                                            {avsnitt.body}
                                        </BodyLong>
                                        {avsnitt.title === 'Dette har skjedd' && (
                                            <Textarea
                                                {...register('fritekst')}
                                                size="small"
                                                minRows={3}
                                                label="Legg til utdypende tekst"
                                                maxLength={maksAntallTegn}
                                                error={fieldError.fritekst?.message?.toString()}
                                                className="mb-6"
                                                readOnly={varselErSendt}
                                                resize
                                            />
                                        )}
                                    </Fragment>
                                ))}
                            </VStack>
                        </Box>
                    </HStack>
                </VStack>
            )}

            {skalSendesForhåndsvarsel === SkalSendesForhåndsvarsel.Nei && <Unntak />}
        </VStack>
    );
};
