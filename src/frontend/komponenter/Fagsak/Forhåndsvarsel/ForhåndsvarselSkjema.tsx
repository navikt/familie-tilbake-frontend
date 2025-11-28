import type { SkalSendesForhåndsvarsel } from './Forhåndsvarsel';
import type { BehandlingDto, RessursByte, Section, Varselbrevtekst } from '../../../generated';
import type { Dispatch, ReactNode, SetStateAction } from 'react';
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
import React, { Fragment, useLayoutEffect, useRef, useState } from 'react';
import { Controller } from 'react-hook-form';

import { BrevmalkodeEnum } from '../../../generated';
import { forhåndsvisBrevMutation } from '../../../generated/@tanstack/react-query.gen';
import { updateParentBounds } from '../../../utils/updateParentBounds';
import { FixedAlert } from '../../Felleskomponenter/FixedAlert/FixedAlert';
import PdfVisningModal from '../../Felleskomponenter/PdfVisningModal/PdfVisningModal';

type Props = {
    behandling: BehandlingDto;
    methods: UseFormReturn<{
        skalSendesForhåndsvarsel: SkalSendesForhåndsvarsel;
        fritekst: string;
    }>;
    varselbrevtekster: Varselbrevtekst;
};

const renderModal = (
    pdfData: RessursByte | undefined,
    showModal: boolean,
    setShowModal: Dispatch<SetStateAction<boolean>>
): ReactNode => {
    if (!showModal || !pdfData) return null;

    return (
        <PdfVisningModal
            åpen={true}
            pdfdata={pdfData}
            onRequestClose={() => {
                setShowModal(false);
            }}
        />
    );
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
    const [showModal, setShowModal] = useState(false);
    const fritekst = methods.watch('fritekst');

    const {
        control,
        formState: { errors },
    } = methods;

    const seForhåndsvisningMutation = useMutation({
        ...forhåndsvisBrevMutation(),
        onSuccess: data => {
            queryClient.setQueryData(
                ['forhåndsvisBrev', behandling.behandlingId, BrevmalkodeEnum.VARSEL, fritekst],
                data
            );
            setShowModal(true);
        },
    });

    const seForhåndsvisning = (): void => {
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
            seForhåndsvisningMutation.mutate({
                body: {
                    behandlingId: behandling.behandlingId,
                    brevmalkode: BrevmalkodeEnum.VARSEL,
                    fritekst,
                },
            });
        }
    };

    const getPdfData = (): RessursByte | undefined => {
        return (
            seForhåndsvisningMutation.data ||
            queryClient.getQueryData([
                'forhåndsvisBrev',
                behandling.behandlingId,
                BrevmalkodeEnum.VARSEL,
                fritekst,
            ])
        );
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
        <>
            <div ref={containerRef}>
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
                                <Button
                                    loading={seForhåndsvisningMutation.isPending}
                                    icon={<FilePdfIcon aria-hidden />}
                                    variant="tertiary"
                                    onClick={seForhåndsvisning}
                                >
                                    Forhåndsvisning
                                </Button>
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
                                            <form>
                                                <Controller
                                                    name="fritekst"
                                                    control={control}
                                                    rules={{
                                                        required: 'Du må legge til en tekst',
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
                                    </Fragment>
                                ))}
                            </VStack>
                        </ExpansionCard.Content>
                    </ExpansionCard>
                    {!expansionCardÅpen && (
                        <Button
                            loading={seForhåndsvisningMutation.isPending}
                            icon={<FilePdfIcon aria-hidden />}
                            variant="tertiary"
                            onClick={seForhåndsvisning}
                        >
                            Forhåndsvisning
                        </Button>
                    )}
                </HStack>
                {seForhåndsvisningMutation.error && (
                    <FixedAlert
                        aria-live="assertive"
                        variant="error"
                        closeButton
                        width={parentBounds.width}
                        onClose={seForhåndsvisningMutation.reset}
                    >
                        <Heading spacing size="small" level="3">
                            Forhåndsvisning feilet
                        </Heading>
                        {seForhåndsvisningMutation.error.message}
                    </FixedAlert>
                )}
            </div>
            {renderModal(getPdfData(), showModal, setShowModal)}
        </>
    );
};
