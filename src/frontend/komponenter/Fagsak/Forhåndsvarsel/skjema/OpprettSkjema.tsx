import type { BehandlingDto, Section, Varselbrevtekst } from '../../../../generated';
import type { ForhåndsvarselFormData } from '../forhåndsvarselSchema';
import type { FieldErrors, SubmitHandler } from 'react-hook-form';

import {
    BodyLong,
    ExpansionCard,
    Heading,
    HStack,
    Radio,
    RadioGroup,
    Textarea,
    VStack,
} from '@navikt/ds-react';
import { ATextWidthMax } from '@navikt/ds-tokens/dist/tokens';
import React, { Fragment, useEffect, useEffectEvent, useState } from 'react';
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
    const [expansionCardÅpen, setExpansionCardÅpen] = useState(!varselErSendt);

    const {
        control,
        register,
        handleSubmit,
        formState: { errors },
    } = useFormContext<ForhåndsvarselFormData>();

    const fieldError: FieldErrors<
        Extract<ForhåndsvarselFormData, { skalSendesForhåndsvarsel: SkalSendesForhåndsvarsel.Ja }>
    > = errors;

    const handleVarselChange = useEffectEvent((varselErSendt: boolean) => {
        if (varselErSendt) {
            setExpansionCardÅpen(false);
        }
    });

    useEffect(() => {
        handleVarselChange(varselErSendt);
    }, [varselErSendt]);

    const skalSendesForhåndsvarsel = useWatch({
        control: control,
        name: 'skalSendesForhåndsvarsel',
    });

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

            {skalSendesForhåndsvarsel === SkalSendesForhåndsvarsel.Ja && varselbrevtekster && (
                <VStack gap="4">
                    <HStack gap="4">
                        <ExpansionCard
                            className="flex-1"
                            aria-label={tittel}
                            open={expansionCardÅpen}
                            onToggle={setExpansionCardÅpen}
                        >
                            <ExpansionCard.Header>
                                <ExpansionCard.Title size="small">{tittel}</ExpansionCard.Title>
                            </ExpansionCard.Header>
                            <ExpansionCard.Content>
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
                            </ExpansionCard.Content>
                        </ExpansionCard>
                    </HStack>
                </VStack>
            )}

            {skalSendesForhåndsvarsel === SkalSendesForhåndsvarsel.Nei && (
                <Unntak readOnly={readOnly} />
            )}
        </VStack>
    );
};
