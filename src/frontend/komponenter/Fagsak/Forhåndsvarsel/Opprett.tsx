import type { ForhåndsvarselFormData } from './forhåndsvarselSchema';
import type {
    BehandlingDto,
    RessursByte,
    Section,
    Varselbrevtekst,
    FagsakDto,
} from '../../../generated';
import type { Dispatch, ReactNode, SetStateAction } from 'react';

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
import { useQueryClient } from '@tanstack/react-query';
import React, { Fragment, useEffect, useEffectEvent, useState } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';

import { Brukeruttalelse } from './Brukeruttalelse';
import { useForhåndsvarselMutations } from './useForhåndsvarselMutations';
import { BrevmalkodeEnum } from '../../../generated';
import { FixedAlert } from '../../Felleskomponenter/FixedAlert/FixedAlert';
import PdfVisningModal from '../../Felleskomponenter/PdfVisningModal/PdfVisningModal';

type Props = {
    behandling: BehandlingDto;
    fagsak: FagsakDto;
    varselbrevtekster: Varselbrevtekst;
    varselErSendt: boolean;
    parentBounds: { width: string | undefined };
};

const renderModal = (
    pdfData: RessursByte | undefined,
    showModal: boolean,
    setShowModal: Dispatch<SetStateAction<boolean>>
): ReactNode => {
    if (!showModal || !pdfData) return null;

    return <PdfVisningModal åpen pdfdata={pdfData} onRequestClose={() => setShowModal(false)} />;
};

export const Opprett: React.FC<Props> = ({
    behandling,
    fagsak,
    varselbrevtekster,
    varselErSendt,
    parentBounds,
}) => {
    const tittel = varselErSendt ? 'Forhåndsvarsel' : 'Opprett forhåndsvarsel';
    const queryClient = useQueryClient();
    const maksAntallTegn = 4000;
    const [expansionCardÅpen, setExpansionCardÅpen] = useState(!varselErSendt);

    const { seForhåndsvisning, forhåndsvisning } = useForhåndsvarselMutations(behandling, fagsak);

    const [showModal, setShowModal] = useState(false);
    const methods = useFormContext<ForhåndsvarselFormData>();

    const fritekst = useWatch({
        control: methods.control,
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
                    BrevmalkodeEnum.VARSEL,
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
        const currentQueryKey = [
            'forhåndsvisBrev',
            behandling.behandlingId,
            BrevmalkodeEnum.VARSEL,
            fritekst,
        ];

        const cachedData = queryClient.getQueryData(currentQueryKey);

        if (cachedData) {
            setShowModal(true);
        } else {
            seForhåndsvisning(fritekst);
        }
    };

    const getPdfData = (): RessursByte | undefined => {
        return (
            forhåndsvisning.data ||
            queryClient.getQueryData([
                'forhåndsvisBrev',
                behandling.behandlingId,
                BrevmalkodeEnum.VARSEL,
                fritekst,
            ])
        );
    };

    return (
        <>
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
                                {!varselErSendt && (
                                    <Button
                                        loading={forhåndsvisning.isPending}
                                        icon={<FilePdfIcon aria-hidden />}
                                        variant="tertiary"
                                        onClick={seForhåndsvisningWithModal}
                                    >
                                        Forhåndsvisning
                                    </Button>
                                )}
                            </HStack>
                            <VStack maxWidth={ATextWidthMax}>
                                {varselbrevtekster.avsnitter.map((avsnitt: Section) => (
                                    <Fragment key={avsnitt.title}>
                                        <div key={avsnitt.title}>
                                            <Heading size="xsmall" level="3" spacing>
                                                {avsnitt.title}
                                            </Heading>
                                            <BodyLong size="small" spacing>
                                                {avsnitt.body}
                                            </BodyLong>
                                        </div>
                                        {avsnitt.title === 'Dette har skjedd' && (
                                            <Textarea
                                                {...methods.register('fritekst')}
                                                label="Legg til utdypende tekst"
                                                maxLength={maksAntallTegn}
                                                error={
                                                    'fritekst' in methods.formState.errors
                                                        ? methods.formState.errors.fritekst?.message?.toString()
                                                        : undefined
                                                }
                                                className="mb-6"
                                                readOnly={varselErSendt}
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
                {varselErSendt && <Brukeruttalelse kanUtsetteFrist />}
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
            {renderModal(getPdfData(), showModal, setShowModal)}
        </>
    );
};
