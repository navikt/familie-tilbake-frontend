import type { BehandlingDto, Section, Varselbrevtekst } from '../../../../generated';
import type { ForhåndsvarselFormData } from '../forhåndsvarselSchema';
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
import { ATextWidthMax } from '@navikt/ds-tokens/dist/tokens';
import React, { Fragment } from 'react';
import { Controller, useFormContext, useWatch } from 'react-hook-form';

import { SkalSendesForhåndsvarsel } from '../forhåndsvarselSchema';
import { Unntak } from './UnntakSkjema';

type Props = {
    behandling: BehandlingDto;
    varselbrevtekster: Varselbrevtekst | undefined;
    varselErSendt: boolean;
    handleForhåndsvarselSubmit: SubmitHandler<ForhåndsvarselFormData>;
    readOnly: boolean;
};

export const OpprettSkjema: React.FC<Props> = ({
    varselbrevtekster,
    varselErSendt,
    handleForhåndsvarselSubmit,
    readOnly,
}) => {
    const tittel = varselErSendt ? 'Forhåndsvarsel' : 'Opprett forhåndsvarsel';
    const maksAntallTegn = 4000;

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
            gap="6"
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
                        legend="Skal det sendes forhåndsvarsel om tilbakekreving?"
                        description="Brukeren skal som klar hovedregel varsles før vedtak om tilbakekreving
                        fattes, slik at de får mulighet til å uttale seg."
                        readOnly={varselErSendt || readOnly}
                        error={fieldState.error?.message}
                        style={{ maxWidth: ATextWidthMax }}
                    >
                        <Radio value={SkalSendesForhåndsvarsel.Ja}>Ja</Radio>
                        <Radio value={SkalSendesForhåndsvarsel.Nei}>Nei</Radio>
                    </RadioGroup>
                )}
            />

            {visSkjema && (
                <VStack gap="4">
                    <HStack gap="4">
                        <Box className="flex-1 border border-ax-border-neutral-strong rounded-lg py-3 px-4">
                            <Heading size="small" className="mb-6">
                                {tittel}
                            </Heading>
                            <HStack align="center" justify="space-between">
                                <Heading size="medium" level="2" spacing>
                                    {varselbrevtekster.overskrift}
                                </Heading>
                            </HStack>
                            <VStack maxWidth={ATextWidthMax}>
                                {varselbrevtekster.avsnitter.map((avsnitt: Section) => (
                                    <Fragment key={avsnitt.title}>
                                        <Heading size="xsmall" level="3" spacing>
                                            {avsnitt.title}
                                        </Heading>
                                        <BodyLong size="small" spacing>
                                            {avsnitt.body}
                                        </BodyLong>
                                        {avsnitt.title === 'Dette har skjedd' && (
                                            <Textarea
                                                {...register('fritekst')}
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

            {skalSendesForhåndsvarsel === SkalSendesForhåndsvarsel.Nei && (
                <Unntak readOnly={readOnly} />
            )}
        </VStack>
    );
};
