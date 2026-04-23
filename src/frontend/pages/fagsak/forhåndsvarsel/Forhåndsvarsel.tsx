import type { ForhåndsvarselFormData } from './schema';
import type { FC } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { FilePdfIcon, MegaphoneIcon, TimerPauseIcon } from '@navikt/aksel-icons';
import { Button, Heading, HStack, Tag, Tooltip, VStack } from '@navikt/ds-react';
import { useQueryClient } from '@tanstack/react-query';
import { differenceInWeeks } from 'date-fns/differenceInWeeks';
import { useEffect, useState } from 'react';
import { FormProvider, useForm, useWatch } from 'react-hook-form';

import { useBehandling } from '~/context/BehandlingContext';
import { useBehandlingState } from '~/context/BehandlingStateContext';
import { PdfVisningModal } from '~/komponenter/pdf-visning-modal/PdfVisningModal';
import { useVisGlobalAlert } from '~/stores/globalAlertStore';
import { formatterDatostring, formatterDatostringKortårstall, formatterRelativTid } from '~/utils';

import { forhåndsvarselSchema, getDefaultValues, SkalSendesForhåndsvarsel } from './schema';
import { ForhåndsvarselSkjema } from './skjema/ForhåndsvarselSkjema';
import { useForhåndsvarselMutations } from './useForhåndsvarselMutations';
import { useForhåndsvarselQueries } from './useForhåndsvarselQueries';

type TagVariant = 'info-moderate' | 'success-moderate';

const getTagVariant = (sendtTid: string): TagVariant => {
    const ukerSiden = differenceInWeeks(new Date(), new Date(sendtTid));
    return ukerSiden >= 3 ? 'success-moderate' : 'info-moderate';
};

export const Forhåndsvarsel: FC = () => {
    const { behandlingId } = useBehandling();
    const { setIkkePersistertKomponent, nullstillIkkePersisterteKomponenter } =
        useBehandlingState();
    const visGlobalAlert = useVisGlobalAlert();
    const { forhåndsvarselInfo } = useForhåndsvarselQueries();
    const { forhåndsvisning } = useForhåndsvarselMutations();
    const [showModal, setShowModal] = useState(false);
    const queryClient = useQueryClient();

    const varselErSendt = !!forhåndsvarselInfo?.varselbrevDto?.varselbrevSendtTid;

    const methods = useForm<ForhåndsvarselFormData>({
        resolver: zodResolver(forhåndsvarselSchema),
        mode: 'onSubmit',
        reValidateMode: 'onChange',
        criteriaMode: 'all',
        defaultValues: getDefaultValues(varselErSendt, forhåndsvarselInfo),
    });

    methods.subscribe({
        formState: { isDirty: true },
        callback: data => {
            if (data.isDirty) {
                setIkkePersistertKomponent('forhåndsvarsel');
            } else {
                nullstillIkkePersisterteKomponenter();
            }
        },
    });

    const fritekst = useWatch({
        control: methods.control,
        name: 'fritekst',
    });

    const skalSendesForhåndsvarsel = useWatch({
        control: methods.control,
        name: 'skalSendesForhåndsvarsel',
    });

    const seForhåndsvisningWithModal = (): void => {
        const currentQueryKey = ['forhåndsvisBrev', behandlingId, 'VARSEL', fritekst];

        const cachedData = queryClient.getQueryData(currentQueryKey);

        if (cachedData) {
            setShowModal(true);
        } else {
            forhåndsvisning.mutate(
                {
                    path: { behandlingId },
                    body: {
                        behandlingId,
                        brevmalkode: 'VARSEL',
                        fritekst: fritekst || '',
                    },
                },
                {
                    onSuccess: data => {
                        queryClient.setQueryData(currentQueryKey, data);
                        setShowModal(true);
                    },
                }
            );
        }
    };

    useEffect(() => {
        if (forhåndsvisning.error) {
            visGlobalAlert({
                title: 'Forhåndsvisning feilet',
                message: forhåndsvisning.error.message,
                status: 'error',
            });
        }
    }, [forhåndsvisning.error, visGlobalAlert]);

    const pdfData =
        forhåndsvisning.data ||
        queryClient.getQueryData(['forhåndsvisBrev', behandlingId, 'VARSEL', fritekst]);

    const visForhåndsvisningsknapp = skalSendesForhåndsvarsel === SkalSendesForhåndsvarsel.Ja;

    return (
        <VStack gap="space-24">
            <HStack align="center" justify="space-between">
                <Heading size="medium">Forhåndsvarsel</Heading>
                <HStack gap="space-16">
                    <Button
                        loading={forhåndsvisning.isPending}
                        icon={<FilePdfIcon aria-hidden />}
                        variant="tertiary"
                        size="small"
                        onClick={seForhåndsvisningWithModal}
                        className={visForhåndsvisningsknapp ? '' : 'invisible pointer-events-none'}
                        aria-hidden={!visForhåndsvisningsknapp}
                        tabIndex={visForhåndsvisningsknapp ? 0 : -1}
                    >
                        Forhåndsvis
                    </Button>
                    {forhåndsvarselInfo?.varselbrevDto?.varselbrevSendtTid && (
                        <Tooltip
                            arrow={false}
                            placement="bottom"
                            content={`Sendt ${formatterDatostring(forhåndsvarselInfo.varselbrevDto.varselbrevSendtTid)}`}
                        >
                            <Tag
                                variant={getTagVariant(
                                    forhåndsvarselInfo.varselbrevDto.varselbrevSendtTid
                                )}
                                icon={<MegaphoneIcon aria-hidden />}
                            >
                                {`Sendt ${formatterRelativTid(forhåndsvarselInfo.varselbrevDto.varselbrevSendtTid)}`}
                            </Tag>
                        </Tooltip>
                    )}
                    {forhåndsvarselInfo?.utsettUttalelseFrist && (
                        <Tag variant="warning-moderate" icon={<TimerPauseIcon aria-hidden />}>
                            {`Ny frist: ${formatterDatostringKortårstall(forhåndsvarselInfo.utsettUttalelseFrist.nyFrist)}`}
                        </Tag>
                    )}
                </HStack>
            </HStack>
            <FormProvider {...methods}>
                <ForhåndsvarselSkjema
                    forhåndsvarselInfo={forhåndsvarselInfo}
                    skalSendesForhåndsvarsel={skalSendesForhåndsvarsel}
                />
            </FormProvider>
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
