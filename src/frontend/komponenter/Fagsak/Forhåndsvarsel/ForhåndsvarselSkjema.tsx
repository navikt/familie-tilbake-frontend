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
import React, { useLayoutEffect, useRef, useState } from 'react';
import { Controller } from 'react-hook-form';

import { BrevmalkodeEnum } from '../../../generated';
import { forhåndsvisBrevMutation } from '../../../generated/@tanstack/react-query.gen';
import { updateParentBounds } from '../../../utils/updateParentBounds';
import { FixedAlert } from '../../Felleskomponenter/FixedAlert/FixedAlert';

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
    const containerRef = useRef<HTMLDivElement>(null);
    const [parentBounds, setParentBounds] = useState({ width: 'auto' });

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

    useLayoutEffect(() => {
        updateParentBounds(containerRef, setParentBounds);
        window.addEventListener('resize', () => updateParentBounds(containerRef, setParentBounds));

        return (): void =>
            window.removeEventListener('resize', () =>
                updateParentBounds(containerRef, setParentBounds)
            );
    }, []);

    return (
        <div ref={containerRef}>
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
                                {varselbrevtekster.overskrift}
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
                            {varselbrevtekster.avsnitter.map((avsnitt: Section) => (
                                <>
                                    <div key={avsnitt.title}>
                                        <Heading size="xsmall" level="3" spacing>
                                            {avsnitt.title}
                                        </Heading>
                                        <BodyLong size="small" spacing>
                                            {avsnitt.body}
                                        </BodyLong>
                                    </div>
                                    {avsnitt.title === 'Dette har skjedd' && (
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
                                                        className="mb-6"
                                                    />
                                                )}
                                            />
                                        </form>
                                    )}
                                </>
                            ))}
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
            <div aria-live="assertive">
                {seForhåndsvisningMutation.error && (
                    <FixedAlert
                        variant="error"
                        closeButton
                        width={parentBounds.width}
                        onClose={seForhåndsvisningMutation.reset}
                    >
                        <Heading spacing size="small" level="3">
                            Forhåndsvisning feilet
                        </Heading>
                        Kunne ikke forhåndsvise forhåndsvarselet. Prøv igjen senere.
                    </FixedAlert>
                )}
            </div>
        </div>
    );
};
