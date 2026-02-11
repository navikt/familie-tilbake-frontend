import type { ForhåndsvarselFormData, UttalelseFormData } from './forhåndsvarselSchema';
import type { ForhåndsvarselDto, RessursByte } from '../../../generated';
import type { SubmitHandler } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';
import { FilePdfIcon, MegaphoneIcon } from '@navikt/aksel-icons';
import { Button, Heading, HStack, Tag, Tooltip, VStack } from '@navikt/ds-react';
import { useQueryClient } from '@tanstack/react-query';
import { differenceInWeeks } from 'date-fns/differenceInWeeks';
import React, { useEffect, useEffectEvent, useState } from 'react';
import { FormProvider, useForm, useWatch, useFormContext } from 'react-hook-form';

import {
    forhåndsvarselSchema,
    getDefaultValues,
    HarUttaltSeg,
    SkalSendesForhåndsvarsel,
    uttalelseSchema,
    getUttalelseValues,
    getUttalelseValuesBasertPåValg,
} from './forhåndsvarselSchema';
import { OpprettSkjema } from './skjema/OpprettSkjema';
import { Uttalelse } from './skjema/UttalelseSkjema';
import {
    extractErrorFromMutationError,
    useForhåndsvarselMutations,
} from './useForhåndsvarselMutations';
import { useForhåndsvarselQueries } from './useForhåndsvarselQueries';
import { useBehandling } from '../../../context/BehandlingContext';
import { useBehandlingState } from '../../../context/BehandlingStateContext';
import { Behandlingssteg } from '../../../typer/behandling';
import { formatterDatostring, formatterRelativTid } from '../../../utils';
import { FeilModal } from '../../Felleskomponenter/Modal/Feil/FeilModal';
import PdfVisningModal from '../../Felleskomponenter/PdfVisningModal/PdfVisningModal';
import { ActionBar } from '../ActionBar/ActionBar';

type TagVariant = 'info-moderate' | 'success-moderate';

const getTagVariant = (sendtTid: string): TagVariant => {
    const ukerSiden = differenceInWeeks(new Date(), new Date(sendtTid));
    return ukerSiden >= 3 ? 'success-moderate' : 'info-moderate';
};

export const Forhåndsvarsel: React.FC = () => {
    const { behandlingId } = useBehandling();
    const { settIkkePersistertKomponent, nullstillIkkePersisterteKomponenter, visGlobalAlert } =
        useBehandlingState();
    const { forhåndsvarselInfo } = useForhåndsvarselQueries();
    const { seForhåndsvisning, forhåndsvisning } = useForhåndsvarselMutations();
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
                settIkkePersistertKomponent('forhåndsvarsel');
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

    const handleMutationSuccess = useEffectEvent(
        (isSuccess: boolean, data: RessursByte | undefined) => {
            if (isSuccess && data) {
                const currentQueryKey = ['forhåndsvisBrev', behandlingId, 'VARSEL', fritekst];
                queryClient.setQueryData(currentQueryKey, data);
                setShowModal(true);
            }
        }
    );

    useEffect(() => {
        handleMutationSuccess(forhåndsvisning.isSuccess, forhåndsvisning.data);
    }, [forhåndsvisning.isSuccess, forhåndsvisning.data]);

    useEffect(() => {
        if (forhåndsvisning.error) {
            visGlobalAlert({
                title: 'Forhåndsvisning feilet',
                message: forhåndsvisning.error.message,
                status: 'error',
            });
        }
    }, [forhåndsvisning.error, visGlobalAlert]);

    const seForhåndsvisningWithModal = (): void => {
        const currentQueryKey = ['forhåndsvisBrev', behandlingId, 'VARSEL', fritekst];

        const cachedData = queryClient.getQueryData(currentQueryKey);

        if (cachedData) {
            setShowModal(true);
        } else {
            seForhåndsvisning(fritekst);
        }
    };

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

type ForhåndsvarselSkjemaProps = {
    forhåndsvarselInfo: ForhåndsvarselDto | undefined;
    skalSendesForhåndsvarsel: SkalSendesForhåndsvarsel;
};

export const ForhåndsvarselSkjema: React.FC<ForhåndsvarselSkjemaProps> = ({
    forhåndsvarselInfo,
    skalSendesForhåndsvarsel,
}) => {
    const {
        actionBarStegtekst,
        nullstillIkkePersisterteKomponenter,
        behandlingILesemodus,
        visGlobalAlert,
    } = useBehandlingState();

    const {
        formState: { dirtyFields: forhåndsvarselDirtyFields },
    } = useFormContext<ForhåndsvarselFormData>();
    const forhåndsvarselIsDirty = Object.keys(forhåndsvarselDirtyFields).length > 0;

    const begrunnelseForUnntak = useWatch({
        control: useFormContext<ForhåndsvarselFormData>().control,
        name: 'begrunnelseForUnntak',
    });

    const {
        sendForhåndsvarselMutation,
        sendBrukeruttalelseMutation,
        sendUtsettUttalelseFristMutation,
        sendUtsettUttalelseFrist,
        sendBrukeruttalelse,
        sendForhåndsvarsel,
        sendUnntakMutation,
        sendUnntak,
        navigerTilNeste,
        navigerTilForrige,
    } = useForhåndsvarselMutations();

    const mutations = [
        { key: 'forhåndsvarsel', mutation: sendForhåndsvarselMutation },
        { key: 'brukeruttalelse', mutation: sendBrukeruttalelseMutation },
        { key: 'utsettFrist', mutation: sendUtsettUttalelseFristMutation },
        { key: 'unntak', mutation: sendUnntakMutation },
    ] as const;

    const { varselbrevtekster } = useForhåndsvarselQueries();

    const varselErSendt = !!forhåndsvarselInfo?.varselbrevDto?.varselbrevSendtTid;

    const initialUttalelseValues = getUttalelseValues(forhåndsvarselInfo);

    const uttalelseMethods = useForm<UttalelseFormData>({
        resolver: zodResolver(uttalelseSchema),
        mode: 'onSubmit',
        reValidateMode: 'onChange',
        criteriaMode: 'all',
        defaultValues: initialUttalelseValues,
    });

    const harUttaltSeg = useWatch({
        control: uttalelseMethods.control,
        name: 'harUttaltSeg',
    });

    const getOppdatertUttalelseValues = useEffectEvent((harUttaltSeg: HarUttaltSeg) => {
        if (harUttaltSeg && harUttaltSeg === initialUttalelseValues.harUttaltSeg) {
            uttalelseMethods.reset(
                getUttalelseValuesBasertPåValg(harUttaltSeg, forhåndsvarselInfo)
            );
        }
    });

    useEffect(() => {
        getOppdatertUttalelseValues(harUttaltSeg);
    }, [harUttaltSeg]);

    useEffect(() => {
        if (sendForhåndsvarselMutation.isSuccess) {
            visGlobalAlert({
                title: 'Forhåndsvarsel er sendt',
                message:
                    'Du kan fortsette saksbehandlingen når bruker har uttalt seg, eller når fristen for å uttale seg (3 uker) har gått ut.',
                status: 'success',
            });
        }
    }, [sendForhåndsvarselMutation.isSuccess, visGlobalAlert]);

    const uttalelseIsDirty = Object.keys(uttalelseMethods.formState.dirtyFields).length > 0;

    type SubmitAction =
        | 'NAVIGER'
        | 'SEND_FORHÅNDSVARSEL'
        | 'SEND_UNNTAK_OG_UTTALELSE'
        | 'SEND_UNNTAK'
        | 'SEND_UTTALELSE'
        | 'UTSETT_FRIST';

    const skalSendeForhåndsvarsel =
        skalSendesForhåndsvarsel === SkalSendesForhåndsvarsel.Ja && !varselErSendt;

    const getSubmitAction = (): SubmitAction => {
        if (harUttaltSeg === HarUttaltSeg.UtsettFrist) {
            return 'UTSETT_FRIST';
        }
        if (skalSendeForhåndsvarsel) {
            return 'SEND_FORHÅNDSVARSEL';
        }

        const uttalelseErLagret = !!forhåndsvarselInfo?.brukeruttalelse;
        const uttalelseMåSendes =
            uttalelseIsDirty ||
            (begrunnelseForUnntak === 'ÅPENBART_UNØDVENDIG' && !uttalelseErLagret);

        const erUnntakFlyt =
            !varselErSendt && skalSendesForhåndsvarsel === SkalSendesForhåndsvarsel.Nei;
        if (erUnntakFlyt) {
            if (forhåndsvarselIsDirty && uttalelseMåSendes) {
                return 'SEND_UNNTAK_OG_UTTALELSE';
            }
            if (forhåndsvarselIsDirty) {
                return 'SEND_UNNTAK';
            }
            if (uttalelseMåSendes) {
                return 'SEND_UTTALELSE';
            }
        }

        if (varselErSendt && uttalelseIsDirty) {
            return 'SEND_UTTALELSE';
        }

        return 'NAVIGER';
    };

    const getNesteKnappTekst = (action: SubmitAction): string => {
        switch (action) {
            case 'UTSETT_FRIST':
                return 'Utsett frist';
            case 'SEND_FORHÅNDSVARSEL':
                return 'Send forhåndsvarsel';
            case 'NAVIGER':
                return 'Neste';
            default:
                return 'Lagre og gå til neste';
        }
    };

    const submitAction = getSubmitAction();

    const validerUttalelseSkjema = async (): Promise<boolean> => {
        let isValid = false;
        await uttalelseMethods.handleSubmit(
            () => {
                isValid = true;
            },
            () => {
                isValid = false;
            }
        )();
        return isValid;
    };

    const handleForhåndsvarselSubmit: SubmitHandler<ForhåndsvarselFormData> = async (
        data: ForhåndsvarselFormData
    ): Promise<void> => {
        switch (submitAction) {
            case 'SEND_FORHÅNDSVARSEL':
                sendForhåndsvarsel(data);
                break;
            case 'SEND_UNNTAK':
                sendUnntak(data);
                break;
            case 'SEND_UNNTAK_OG_UTTALELSE':
            case 'SEND_UTTALELSE': {
                const uttalelseValid = await validerUttalelseSkjema();
                if (!uttalelseValid) return;
                if (submitAction === 'SEND_UNNTAK_OG_UTTALELSE') {
                    sendUnntak(data);
                }
                sendBrukeruttalelse(uttalelseMethods.getValues());
                break;
            }
            case 'NAVIGER':
                navigerTilNeste();
                break;
        }
        nullstillIkkePersisterteKomponenter();
    };

    const handleUttalelseSubmit: SubmitHandler<UttalelseFormData> = (
        data: UttalelseFormData
    ): void => {
        if (submitAction === 'NAVIGER') {
            navigerTilNeste();
            return;
        }
        if (harUttaltSeg === HarUttaltSeg.UtsettFrist) {
            sendUtsettUttalelseFrist(data);
        }
        sendBrukeruttalelse(data);
    };

    const formId = ((): 'opprettForm' | 'uttalelseForm' | undefined => {
        if (varselErSendt) {
            return 'uttalelseForm';
        }
        return 'opprettForm';
    })();

    const skalViseUttalelseSkjema =
        varselErSendt ||
        (skalSendesForhåndsvarsel === SkalSendesForhåndsvarsel.Nei &&
            begrunnelseForUnntak === 'ÅPENBART_UNØDVENDIG');

    return (
        <VStack gap="space-24">
            <OpprettSkjema
                varselbrevtekster={varselbrevtekster}
                varselErSendt={varselErSendt}
                handleForhåndsvarselSubmit={handleForhåndsvarselSubmit}
                readOnly={behandlingILesemodus}
            />

            {forhåndsvarselInfo && skalViseUttalelseSkjema && (
                <FormProvider {...uttalelseMethods}>
                    <Uttalelse
                        handleUttalelseSubmit={handleUttalelseSubmit}
                        readOnly={behandlingILesemodus}
                        kanUtsetteFrist
                        varselErSendt={varselErSendt}
                    />
                </FormProvider>
            )}

            <ActionBar
                stegtekst={actionBarStegtekst(Behandlingssteg.Forhåndsvarsel)}
                nesteTekst={getNesteKnappTekst(submitAction)}
                isLoading={
                    sendForhåndsvarselMutation.isPending ||
                    sendBrukeruttalelseMutation.isPending ||
                    sendUnntakMutation?.isPending
                }
                forrigeAriaLabel="Gå til fakta om feilutbetaling"
                onForrige={navigerTilForrige}
                nesteAriaLabel={getNesteKnappTekst(submitAction)}
                {...(formId
                    ? {
                          type: 'submit' as const,
                          formId: formId,
                      }
                    : {
                          type: 'button' as const,
                          onNeste: navigerTilNeste,
                      })}
            />

            {mutations.map(({ key, mutation }) => {
                if (mutation?.isError) {
                    const feil = extractErrorFromMutationError(mutation.error);
                    return <FeilModal key={key} feil={feil} lukkFeilModal={mutation.reset} />;
                }
                return null;
            })}
        </VStack>
    );
};
