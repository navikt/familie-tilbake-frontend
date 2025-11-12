import type { SkalSendesForhåndsvarsel } from './Forhåndsvarsel';
import type { BehandlingDto, Section, Varselbrevtekst } from '../../../generated';
import type { UseFormReturn } from 'react-hook-form';

import { FilePdfIcon } from '@navikt/aksel-icons';
import {
    BodyLong,
    Button,
    ExpansionCard,
    Heading,
    HStack,
    Textarea,
    VStack,
} from '@navikt/ds-react';
import { ATextWidthMax } from '@navikt/ds-tokens/dist/tokens';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import React, { useState } from 'react';
import { Controller } from 'react-hook-form';

import { BrevmalkodeEnum } from '../../../generated';
import { forhåndsvisBrevMutation } from '../../../generated/@tanstack/react-query.gen';

type Props = {
    behandling: BehandlingDto;
    methods: UseFormReturn<{
        skalSendesForhåndsvarsel: SkalSendesForhåndsvarsel;
        fritekst: string;
    }>;
    varselbrevtekster: Varselbrevtekst;
};

export const ForhåndsvarselSkjema: React.FC<Props> = ({
    behandling,
    methods,
    varselbrevtekster,
}) => {
    const tittel = behandling.varselSendt ? 'Forhåndsvarsel' : 'Opprett forhåndsvarsel';
    const queryClient = useQueryClient();
    const maksAntallTegn = 4000;
    const [expansionCardÅpen, setExpansionCardÅpen] = useState(!behandling.varselSendt);

    const {
        control,
        formState: { errors },
    } = methods;

    const seForhåndsvisningMutation = useMutation({
        ...forhåndsvisBrevMutation(),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['hentBehandling'],
            });
        },
        onError: () => {
            //TODO. må håndteres bedre når vi har design
        },
    });

    const seForhåndsvisning = (): void => {
        seForhåndsvisningMutation.mutate({
            body: {
                behandlingId: behandling.behandlingId,
                brevmalkode: BrevmalkodeEnum.VARSEL,
                fritekst: methods.getValues('fritekst'),
            },
        });
    };

    return (
        <HStack gap="4">
            <ExpansionCard
                className="flex-1"
                aria-label={tittel}
                open={expansionCardÅpen}
                onToggle={setExpansionCardÅpen}
            >
                <ExpansionCard.Header>
                    <HStack>
                        <ExpansionCard.Title size="small">{tittel}</ExpansionCard.Title>
                    </HStack>
                </ExpansionCard.Header>
                <ExpansionCard.Content>
                    <HStack align="center" justify="space-between">
                        <Heading size="medium" level="2" spacing>
                            {varselbrevtekster?.overskrift}
                        </Heading>
                        <Button
                            icon={<FilePdfIcon aria-hidden />}
                            variant="tertiary"
                            onClick={seForhåndsvisning}
                        >
                            Forhåndsvisning
                        </Button>
                    </HStack>
                    <VStack maxWidth={ATextWidthMax}>
                        {varselbrevtekster?.avsnitter?.map((avsnitt: Section, index: number) => (
                            <div key={`avsnitt-${avsnitt.title || index}`}>
                                {avsnitt.title && (
                                    <Heading size="xsmall" level="3" spacing>
                                        {avsnitt.title}
                                    </Heading>
                                )}
                                <BodyLong size="small" spacing>
                                    {avsnitt.body}
                                </BodyLong>
                            </div>
                        ))}
                        <form>
                            <Controller
                                name="fritekst"
                                control={control}
                                rules={{
                                    required: 'Du må legge til en tekst',
                                    maxLength: {
                                        value: maksAntallTegn,
                                        message: `Maks ${maksAntallTegn} tegn`,
                                    },
                                }}
                                render={({ field }) => (
                                    <Textarea
                                        {...field}
                                        label="Legg til utdypende tekst"
                                        maxLength={maksAntallTegn}
                                        error={errors.fritekst?.message?.toString()}
                                    />
                                )}
                            />
                        </form>
                    </VStack>
                </ExpansionCard.Content>
            </ExpansionCard>
            {!expansionCardÅpen && (
                <Button
                    icon={<FilePdfIcon aria-hidden />}
                    variant="tertiary"
                    onClick={seForhåndsvisning}
                >
                    Forhåndsvisning
                </Button>
            )}
        </HStack>
    );
};
