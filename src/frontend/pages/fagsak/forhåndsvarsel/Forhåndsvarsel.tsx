import type { ForhåndsvarselFormData } from './schema';
import type { FC } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { EyeIcon } from '@navikt/aksel-icons';
import { Button, Heading, HStack, VStack } from '@navikt/ds-react';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';
import { FormProvider, useForm, useWatch } from 'react-hook-form';

import { useBehandling } from '~/context/BehandlingContext';
import { useBehandlingState } from '~/context/BehandlingStateContext';
import { PdfVisningModal } from '~/komponenter/pdf-visning-modal/PdfVisningModal';
import { useVisGlobalAlert } from '~/stores/globalAlertStore';

import { Fristinfo } from './Fristinfo';
import { forhåndsvarselSchema, getDefaultValues, SkalSendesForhåndsvarsel } from './schema';
import { ForhåndsvarselSkjema } from './skjema/ForhåndsvarselSkjema';
import { useForhåndsvarselMutations } from './useForhåndsvarselMutations';
import { useForhåndsvarselQueries } from './useForhåndsvarselQueries';
import { UtsettFristModal } from './UtsettFristModal';

export const Forhåndsvarsel: FC = () => {
    const { behandlingId } = useBehandling();
    const { setIkkePersistertKomponent, nullstillIkkePersisterteKomponenter } =
        useBehandlingState();
    const visGlobalAlert = useVisGlobalAlert();
    const { forhåndsvarselInfo } = useForhåndsvarselQueries();
    const { forhåndsvisning, sendUtsettUttalelseFrist, sendUtsettUttalelseFristMutation } =
        useForhåndsvarselMutations();
    const [showModal, setShowModal] = useState(false);
    const utsettFristModalRef = useRef<HTMLDialogElement>(null);
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
    const skalViseFristinfo = !!forhåndsvarselInfo?.varselbrevDto?.opprinneligFristForUttalelse;

    return (
        <HStack gap="space-24" wrap={false} align="start">
            <VStack gap="space-24" className="flex-1 min-w-0">
                <HStack align="center" gap="space-16">
                    <Heading size="medium">Forhåndsvarsel</Heading>
                    <Button
                        loading={forhåndsvisning.isPending}
                        icon={<EyeIcon aria-hidden />}
                        variant="tertiary"
                        size="small"
                        onClick={seForhåndsvisningWithModal}
                        className={visForhåndsvisningsknapp ? '' : 'invisible pointer-events-none'}
                        aria-hidden={!visForhåndsvisningsknapp}
                        tabIndex={visForhåndsvisningsknapp ? 0 : -1}
                    >
                        Forhåndsvis
                    </Button>
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
            {skalViseFristinfo && forhåndsvarselInfo && (
                <Fristinfo
                    forhåndsvarselInfo={forhåndsvarselInfo}
                    onUtsettFrist={() => utsettFristModalRef.current?.showModal()}
                />
            )}
            <UtsettFristModal
                dialogRef={utsettFristModalRef}
                onUtsettFrist={sendUtsettUttalelseFrist}
                laster={sendUtsettUttalelseFristMutation.isPending}
            />
        </HStack>
    );
};
