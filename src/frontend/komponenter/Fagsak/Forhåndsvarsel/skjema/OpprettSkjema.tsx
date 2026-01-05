import type {
    BehandlingDto,
    RessursByte,
    Section,
    Varselbrevtekst,
    FagsakDto,
} from '../../../../generated';
import type { ForhåndsvarselFormData } from '../forhåndsvarselSchema';
import type { FieldErrors, SubmitHandler } from 'react-hook-form';

import { FilePdfIcon } from '@navikt/aksel-icons';
import {
    BodyLong,
    Button,
    ExpansionCard,
    Heading,
    HStack,
    Radio,
    RadioGroup,
    Textarea,
    VStack,
} from '@navikt/ds-react';
import { ATextWidthMax } from '@navikt/ds-tokens/dist/tokens';
import { useQueryClient } from '@tanstack/react-query';
import React, { Fragment, useEffect, useEffectEvent, useState } from 'react';
import { Controller, useFormContext, useWatch } from 'react-hook-form';

import { FixedAlert } from '../../../Felleskomponenter/FixedAlert/FixedAlert';
import PdfVisningModal from '../../../Felleskomponenter/PdfVisningModal/PdfVisningModal';
import { SkalSendesForhåndsvarsel } from '../forhåndsvarselSchema';
import { useForhåndsvarselMutations } from '../useForhåndsvarselMutations';
import { Unntak } from './UnntakSkjema';

type Props = {
    behandling: BehandlingDto;
    fagsak: FagsakDto;
    varselbrevtekster: Varselbrevtekst | undefined;
    varselErSendt: boolean;
    parentBounds: { width: string | undefined };
    handleForhåndsvarselSubmit: SubmitHandler<ForhåndsvarselFormData>;
    readOnly: boolean;
};

export const OpprettSkjema: React.FC<Props> = ({
    behandling,
    fagsak,
    varselbrevtekster,
    varselErSendt,
    parentBounds,
    handleForhåndsvarselSubmit,
    readOnly,
}) => {
    const tittel = varselErSendt ? 'Forhåndsvarsel' : 'Opprett forhåndsvarsel';
    const queryClient = useQueryClient();
    const maksAntallTegn = 4000;
    const [expansionCardÅpen, setExpansionCardÅpen] = useState(!varselErSendt);

    const { seForhåndsvisning, forhåndsvisning } = useForhåndsvarselMutations(behandling, fagsak);

    const [showModal, setShowModal] = useState(false);
    const {
        control,
        register,
        handleSubmit,
        formState: { errors },
    } = useFormContext<ForhåndsvarselFormData>();

    const fieldError: FieldErrors<
        Extract<ForhåndsvarselFormData, { skalSendesForhåndsvarsel: SkalSendesForhåndsvarsel.Ja }>
    > = errors;

    const fritekst = useWatch({
        control: control,
        name: 'fritekst',
    });

    const handleVarselChange = useEffectEvent((varselErSendt: boolean) => {
        if (varselErSendt) {
            setExpansionCardÅpen(false);
        }
    });

    useEffect(() => {
        handleVarselChange(varselErSendt);
    }, [varselErSendt]);

    const handleMutationSuccess = useEffectEvent(
        (isSuccess: boolean, data: RessursByte | undefined) => {
            if (isSuccess && data) {
                const currentQueryKey = [
                    'forhåndsvisBrev',
                    behandling.behandlingId,
                    'VARSEL',
                    fritekst,
                ];
                queryClient.setQueryData(currentQueryKey, data);
                setShowModal(true);
            }
        }
    );

    useEffect(() => {
        handleMutationSuccess(forhåndsvisning.isSuccess, forhåndsvisning.data);
    }, [forhåndsvisning.isSuccess, forhåndsvisning.data]);

    const seForhåndsvisningWithModal = (): void => {
        const currentQueryKey = ['forhåndsvisBrev', behandling.behandlingId, 'VARSEL', fritekst];

        const cachedData = queryClient.getQueryData(currentQueryKey);

        if (cachedData) {
            setShowModal(true);
        } else {
            seForhåndsvisning(fritekst);
        }
    };

    const pdfData =
        forhåndsvisning.data ||
        queryClient.getQueryData(['forhåndsvisBrev', behandling.behandlingId, 'VARSEL', fritekst]);

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
                        readOnly={varselErSendt}
                        error={fieldState.error?.message}
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
                                    {/* {!varselErSendt && ( */}
                                    <Button
                                        type="button"
                                        loading={forhåndsvisning.isPending}
                                        icon={<FilePdfIcon aria-hidden />}
                                        variant="tertiary"
                                        onClick={seForhåndsvisningWithModal}
                                    >
                                        Forhåndsvisning
                                    </Button>
                                    {/* )} */}
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

                        {!expansionCardÅpen && !varselErSendt && (
                            <Button
                                loading={forhåndsvisning.isPending}
                                icon={<FilePdfIcon aria-hidden />}
                                variant="tertiary"
                                onClick={() => seForhåndsvisning(fritekst)}
                            >
                                Forhåndsvisning
                            </Button>
                        )}
                    </HStack>

                    {forhåndsvisning.error && (
                        <FixedAlert
                            aria-live="assertive"
                            variant="error"
                            closeButton
                            width={parentBounds.width}
                            onClose={forhåndsvisning.reset}
                        >
                            <Heading spacing size="small" level="3">
                                Forhåndsvisning feilet
                            </Heading>
                            {forhåndsvisning.error.message}
                        </FixedAlert>
                    )}
                </VStack>
            )}

            {skalSendesForhåndsvarsel === SkalSendesForhåndsvarsel.Nei && (
                <Unntak readOnly={readOnly} />
            )}

            {showModal && pdfData && (
                <PdfVisningModal
                    åpen
                    pdfdata={pdfData}
                    onRequestClose={() => setShowModal(false)}
                />
            )}
        </VStack>
    );
};
