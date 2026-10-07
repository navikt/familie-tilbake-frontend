import type { AxiosError } from 'axios';
import type { FC } from 'react';
import type { Options } from '@/generated-new/sdk.gen';
import type { IkkeVurdertFormData } from './schema';

import { zodResolver } from '@hookform/resolvers/zod';
import { Heading, HStack, InlineMessage, VStack } from '@navikt/ds-react';
import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { useMemo, useRef, useState } from 'react';
import { FormProvider, type SubmitHandler, useForm } from 'react-hook-form';

import { useBehandling } from '@/context/BehandlingContext';
import { useBehandlingState } from '@/context/BehandlingStateContext';
import {
    forhåndsvisBrevMutation,
    hentBehandlingQueryKey,
} from '@/generated/@tanstack/react-query.gen';
import {
    type BehandlingHentDokumentError,
    type BehandlingLagreBrukersuttalelseError,
    type BehandlingLagreForhaandsvarselUnntakError,
    type BehandlingSendVarselbrevData,
    type BehandlingSendVarselbrevError,
    type BehandlingUtsettUttalelsesfristData,
    type BehandlingUtsettUttalelsesfristError,
    type BehandlingUtsettUttalelsesfristResponse,
    behandlingHentDokument,
    behandlingLagreBrukersuttalelse,
    behandlingLagreForhaandsvarselUnntak,
    type ForhaandsvarselSteg,
    type ForhaandsvarselUnntak,
    type UpdateUttalelsesfrist,
    type Uttalelse,
} from '@/generated-new';
import {
    behandlingForhandsvarselOptions,
    behandlingForhandsvarselQueryKey,
    behandlingLagreBrukersuttalelseMutation,
    behandlingLagreForhaandsvarselUnntakMutation,
    behandlingSendVarselbrevMutation,
    behandlingUtsettUttalelsesfristMutation,
} from '@/generated-new/@tanstack/react-query.gen';
import { useActionBar } from '@/hooks/useActionBar';
import { Bekreftelsesmodal } from '@/komponenter/modal/bekreftelse/Bekreftelsesmodal';
import { useVisGlobalAlert } from '@/stores/globalAlertStore';
import { formatterDatostring } from '@/utils';
import { lesFeilmeldingFraBlob } from '@/utils/blobFeilmelding';
import { useStegNavigering } from '@/utils/sider';

import { StatusTag } from '../StegStatus';
import {
    type BrukeruttalelseFormData,
    tilUttalelsePayload,
    tilUttalelseSkjema,
} from './brukeruttalelseSchema';
import { ForhåndsvisVarselbrev } from './ForhåndsvisVarselbrev';
import { Fristinfo } from './Fristinfo';
import { FORHÅNDSVARSEL_FORM_ID, IkkeVurdert } from './IkkeVurdert';
import { BRUKERUTTALELSE_FORM_ID, SendtVarsel } from './SendtVarsel';
import { SkalSendeForhåndsvarsel } from './SkalSendeForhåndsvarsel';
import { ikkeVurdertSchema } from './schema';
import { UtsettFristModal } from './UtsettFristModal';
import { Varselbrevinfo } from './Varselbrevinfo';

const utledForhåndsvarselDefaultValues = (
    forhåndsvarselSteg: ForhaandsvarselSteg,
    brukeruttalelse: Uttalelse | null
): IkkeVurdertFormData | undefined => {
    if (forhåndsvarselSteg.type !== 'unntak') {
        return undefined;
    }

    return {
        valg: 'unntak',
        begrunnelseForUnntak: forhåndsvarselSteg.begrunnelseForUnntak,
        beskrivelse: forhåndsvarselSteg.beskrivelse,
        ...(forhåndsvarselSteg.begrunnelseForUnntak === 'ÅPENBART_UNØDVENDIG'
            ? { brukeruttalelse: tilUttalelseSkjema(brukeruttalelse) }
            : {}),
    };
};

export const Forhåndsvarsel: FC = () => {
    const { behandlingId } = useBehandling();
    const queryClient = useQueryClient();
    const visGlobalAlert = useVisGlobalAlert();

    queryClient.setMutationDefaults(['sendVarselbrev'], {
        ...behandlingSendVarselbrevMutation(),
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: behandlingForhandsvarselQueryKey({ path: { behandlingId } }),
            });
            visGlobalAlert({
                title: 'Forhåndsvarsel er sendt',
                message:
                    'Du kan fortsette saksbehandlingen når bruker har uttalt seg, eller når fristen for å uttale seg (3 uker) har gått ut.',
                status: 'success',
            });
        },
        onError: (error: AxiosError<BehandlingLagreForhaandsvarselUnntakError>) => {
            visGlobalAlert({
                title: error.response?.data?.tittel ?? 'Kunne ikke sende forhåndsvarsel',
                message: error.response?.data?.melding,
                status: 'error',
            });
        },
    });

    queryClient.setMutationDefaults(['forhåndsvisBrev'], {
        ...forhåndsvisBrevMutation(),
    });

    queryClient.setMutationDefaults(['hentSendtDokument'], {
        mutationFn: async ({
            journalpostId,
            dokumentInfoId,
        }: {
            journalpostId: string;
            dokumentInfoId: string;
        }) => {
            const { data } = await behandlingHentDokument({
                path: { behandlingId, journalpostId, dokumentInfoId },
                throwOnError: true,
            });
            return data;
        },
        onError: async (error: AxiosError<BehandlingHentDokumentError>) => {
            const feilmelding = await lesFeilmeldingFraBlob(error);
            visGlobalAlert({
                title: 'Kunne ikke vise forhåndsvarselet',
                message: feilmelding?.melding ?? 'Prøv igjen senere.',
                status: 'error',
            });
        },
    });

    return <ForhåndsvarselInnhold />;
};

export const ForhåndsvarselInnhold: FC = () => {
    const { behandlingId } = useBehandling();
    const { actionBarStegtekst, nullstillIkkePersisterteKomponenter, harUlagredeData } =
        useBehandlingState();
    const navigerTilNeste = useStegNavigering('FORELDELSE');
    const navigerTilForrige = useStegNavigering('FAKTA');
    const queryClient = useQueryClient();
    const visGlobalAlert = useVisGlobalAlert();
    const utsettFristModalRef = useRef<HTMLDialogElement>(null);
    const bekreftelsesmodalRef = useRef<HTMLDialogElement>(null);

    const { data: response } = useSuspenseQuery(
        behandlingForhandsvarselOptions({
            path: { behandlingId },
        })
    );

    const {
        forhaandsvarselSteg: forhåndsvarselSteg,
        brukeruttalelse,
        tilbakeført,
        ferdigvurdert,
        sendtVarselbrev,
        uttalelsesfrist,
    } = response;
    const [valg, setValg] = useState<'send' | 'unntak'>();

    const erNyttKravgrunnlag = tilbakeført === 'NyttKravgrunnlag';

    const hentSendtDokument = useMutation<
        Blob,
        AxiosError<BehandlingHentDokumentError>,
        { journalpostId: string; dokumentInfoId: string }
    >({
        mutationKey: ['hentSendtDokument'],
    });

    const varselbrevUrl = useMemo(() => {
        if (!hentSendtDokument.data) return null;
        return URL.createObjectURL(new Blob([hentSendtDokument.data], { type: 'application/pdf' }));
    }, [hentSendtDokument.data]);

    const onSeVarselbrev = (): void => {
        if ((hentSendtDokument.isIdle || hentSendtDokument.isError) && sendtVarselbrev) {
            hentSendtDokument.mutate({
                journalpostId: sendtVarselbrev.journalpostId,
                dokumentInfoId: sendtVarselbrev.dokumentId,
            });
        }
    };

    const erRedigerbarForhåndsvarselFlyt =
        forhåndsvarselSteg.type === 'ikke_vurdert' || forhåndsvarselSteg.type === 'unntak';

    const methods = useForm<IkkeVurdertFormData>({
        resolver: zodResolver(ikkeVurdertSchema),
        shouldUnregister: false,
        defaultValues: utledForhåndsvarselDefaultValues(forhåndsvarselSteg, brukeruttalelse),
    });

    const {
        formState: { isDirty },
    } = methods;

    const etterVellykketLagring = async (): Promise<void> => {
        nullstillIkkePersisterteKomponenter();
        await queryClient.invalidateQueries({
            queryKey: hentBehandlingQueryKey({ path: { behandlingId } }),
        });
        await queryClient.invalidateQueries({
            queryKey: behandlingForhandsvarselQueryKey({ path: { behandlingId } }),
        });
        navigerTilNeste();
    };

    const sendVarselbrev = useMutation<
        unknown,
        AxiosError<BehandlingSendVarselbrevError>,
        Options<BehandlingSendVarselbrevData>
    >({
        mutationKey: ['sendVarselbrev'],
    });

    const lagreUnntak = useMutation({
        ...behandlingLagreForhaandsvarselUnntakMutation(),
        onSuccess: etterVellykketLagring,
        onError: (error: AxiosError<BehandlingLagreForhaandsvarselUnntakError>) => {
            visGlobalAlert({
                title: error.response?.data?.tittel ?? 'Kunne ikke lagre unntak',
                message: error.response?.data?.melding,
                status: 'error',
            });
        },
    });

    const lagreUnntakMedUttalelse = useMutation({
        mutationFn: async ({
            unntak,
            uttalelse,
        }: {
            unntak: ForhaandsvarselUnntak;
            uttalelse: Uttalelse;
        }) => {
            await behandlingLagreForhaandsvarselUnntak({
                path: { behandlingId },
                body: unntak,
                throwOnError: true,
            });
            await behandlingLagreBrukersuttalelse({
                path: { behandlingId },
                body: uttalelse,
                throwOnError: true,
            });
        },
        onSuccess: etterVellykketLagring,
        onError: (error: AxiosError<BehandlingLagreForhaandsvarselUnntakError>) => {
            visGlobalAlert({
                title: error.response?.data?.tittel ?? 'Kunne ikke lagre unntak',
                message: error.response?.data?.melding,
                status: 'error',
            });
        },
    });

    const lagreBrukeruttalelse = useMutation({
        ...behandlingLagreBrukersuttalelseMutation(),
        onSuccess: etterVellykketLagring,
        onError: (error: AxiosError<BehandlingLagreBrukersuttalelseError>) => {
            visGlobalAlert({
                title: error.response?.data?.tittel ?? 'Kunne ikke lagre brukeruttalelse',
                message: error.response?.data?.melding,
                status: 'error',
            });
        },
    });

    const utsettFrist = useMutation({
        ...behandlingUtsettUttalelsesfristMutation(),
        onSuccess: async (
            data: BehandlingUtsettUttalelsesfristResponse,
            variables: Options<BehandlingUtsettUttalelsesfristData>
        ): Promise<void> => {
            await queryClient.invalidateQueries({
                queryKey: behandlingForhandsvarselQueryKey({ path: { behandlingId } }),
            });
            utsettFristModalRef.current?.close();
            const nyFrist = variables.body?.nyFrist ?? data.nyFrist;
            const formatertDato = nyFrist ? formatterDatostring(nyFrist) : '';
            visGlobalAlert({
                title: `Fristen for uttalelse er utsatt til ${formatertDato}`,
                status: 'success',
            });
        },
        onError: (error: AxiosError<BehandlingUtsettUttalelsesfristError>) => {
            visGlobalAlert({
                title: error.response?.data?.tittel ?? 'Kunne ikke utsette fristen',
                message: error.response?.data?.melding,
                status: 'error',
            });
        },
    });

    const sendUtsettFrist = (payload: UpdateUttalelsesfrist): void => {
        utsettFrist.mutate({
            path: { behandlingId },
            body: payload,
        });
    };

    const onSubmitBrukeruttalelse: SubmitHandler<BrukeruttalelseFormData> = (
        data: BrukeruttalelseFormData
    ) => {
        lagreBrukeruttalelse.mutate({
            path: { behandlingId },
            body: tilUttalelsePayload(data.brukeruttalelse),
        });
    };

    const onBekreftSending = (): void => {
        sendVarselbrev.mutate(
            {
                path: { behandlingId },
                body: { tekstFraSaksbehandler: methods.getValues('tekstFraSaksbehandler') },
            },
            {
                onSuccess: () => {
                    bekreftelsesmodalRef.current?.close();
                },
                onError: (error: AxiosError<BehandlingSendVarselbrevError>) => {
                    bekreftelsesmodalRef.current?.close();
                    visGlobalAlert({
                        title: error.response?.data?.tittel ?? 'Kunne ikke sende forhåndsvarsel',
                        message: error.response?.data?.melding,
                        status: 'error',
                    });
                },
            }
        );
    };

    const onSubmit: SubmitHandler<IkkeVurdertFormData> = (data: IkkeVurdertFormData): void => {
        if (data.valg === 'send') {
            bekreftelsesmodalRef.current?.showModal();
        } else if (data.begrunnelseForUnntak === 'ÅPENBART_UNØDVENDIG' && data.brukeruttalelse) {
            lagreUnntakMedUttalelse.mutate({
                unntak: {
                    begrunnelseForUnntak: data.begrunnelseForUnntak,
                    beskrivelse: data.beskrivelse,
                },
                uttalelse: tilUttalelsePayload(data.brukeruttalelse),
            });
        } else {
            lagreUnntak.mutate({
                path: { behandlingId },
                body: {
                    begrunnelseForUnntak: data.begrunnelseForUnntak,
                    beskrivelse: data.beskrivelse,
                },
            });
        }
    };

    const visForhåndsvisning = erRedigerbarForhåndsvarselFlyt && valg === 'send';

    const fellesActionBarConfig = {
        stegtekst: actionBarStegtekst('FORHÅNDSVARSEL'),
        forrigeAriaLabel: 'Gå tilbake til faktasteget',
        onForrige: navigerTilForrige,
    };

    const skalSubmitteSkjema = !ferdigvurdert || isDirty;

    const sendEllerLagreForhåndsvarselConfig = {
        type: 'submit' as const,
        formId: FORHÅNDSVARSEL_FORM_ID,
        ...fellesActionBarConfig,
        isLoading:
            sendVarselbrev.isPending || lagreUnntak.isPending || lagreUnntakMedUttalelse.isPending,
        nesteTekst: valg === 'send' ? 'Send forhåndsvarselet' : 'Lagre og gå videre',
        nesteAriaLabel:
            valg === 'send' ? 'Send forhåndsvarselet' : 'Lagre og gå videre til foreldelsessteget',
    };

    const navigerTilNesteConfig = {
        ...fellesActionBarConfig,
        onNeste: navigerTilNeste,
        nesteAriaLabel: 'Gå videre til foreldelsessteget',
    };

    const lagreBrukeruttalelseConfig = {
        type: 'submit' as const,
        formId: BRUKERUTTALELSE_FORM_ID,
        ...fellesActionBarConfig,
        isLoading: lagreBrukeruttalelse.isPending,
        nesteTekst: 'Lagre og gå videre',
        nesteAriaLabel: 'Lagre og gå videre til foreldelsessteget',
    };

    const sendtForhåndsvarselConfig = harUlagredeData
        ? lagreBrukeruttalelseConfig
        : navigerTilNesteConfig;

    const actionBarConfig = erRedigerbarForhåndsvarselFlyt
        ? skalSubmitteSkjema
            ? sendEllerLagreForhåndsvarselConfig
            : navigerTilNesteConfig
        : sendtForhåndsvarselConfig;

    useActionBar(actionBarConfig);

    const erInternVurdering =
        forhåndsvarselSteg.type === 'sendt' ||
        valg === 'unntak' ||
        (forhåndsvarselSteg.type === 'unntak' && valg !== 'send');

    const sidekolonne = (sendtVarselbrev || forhåndsvarselSteg.type === 'sendt') && (
        <VStack gap="space-8">
            {sendtVarselbrev && (
                <Varselbrevinfo
                    varselbrevUrl={varselbrevUrl}
                    sendtTid={sendtVarselbrev.brevSendt}
                    laster={hentSendtDokument.isPending}
                    onSeBrevet={onSeVarselbrev}
                />
            )}
            {uttalelsesfrist && (
                <Fristinfo
                    uttalelsesfrist={uttalelsesfrist}
                    onUtsettFrist={(): void => utsettFristModalRef.current?.showModal()}
                />
            )}
        </VStack>
    );

    return (
        <VStack gap="space-24">
            <FormProvider {...methods}>
                <HStack gap="space-16" className="justify-between">
                    <HStack className="gap-x-4">
                        <HStack gap="space-0 space-32" align="center">
                            <Heading size="medium">Forhåndsvarsel</Heading>
                            {erInternVurdering && (
                                <InlineMessage size="small" status="info">
                                    Intern vurdering (ikke synlig i vedtaksbrev)
                                </InlineMessage>
                            )}
                        </HStack>

                        {visForhåndsvisning && <ForhåndsvisVarselbrev />}
                    </HStack>
                    <StatusTag tilbakeført={tilbakeført} ferdigvurdert={ferdigvurdert} />
                </HStack>
                {forhåndsvarselSteg.type === 'sendt' ? (
                    <VStack gap="space-24">
                        <div className="grid grid-cols-1 gap-6 items-start md:grid-cols-[minmax(0,1fr)_auto]">
                            <SkalSendeForhåndsvarsel
                                name="valg"
                                value="send"
                                erNyttKravgrunnlag={erNyttKravgrunnlag}
                                readOnly
                            />
                            {sidekolonne}
                        </div>
                        <SendtVarsel
                            {...forhåndsvarselSteg}
                            brukeruttalelse={brukeruttalelse}
                            onSubmit={onSubmitBrukeruttalelse}
                        />
                    </VStack>
                ) : (
                    <IkkeVurdert
                        sendtVarselDato={sendtVarselbrev?.brevSendt}
                        erNyttKravgrunnlag={erNyttKravgrunnlag}
                        sidekolonne={sidekolonne}
                        onValgEndring={setValg}
                        onSubmit={onSubmit}
                    />
                )}
            </FormProvider>
            <UtsettFristModal
                dialogRef={utsettFristModalRef}
                onUtsettFrist={sendUtsettFrist}
                laster={utsettFrist.isPending}
            />
            <Bekreftelsesmodal
                dialogRef={bekreftelsesmodalRef}
                tekster={{
                    overskrift: 'Send forhåndsvarselet',
                    brødtekst:
                        'Er du sikker på at du vil sende forhåndsvarselet? Dette kan ikke angres.',
                    bekreftTekst: 'Send forhåndsvarselet',
                }}
                laster={sendVarselbrev.isPending}
                onBekreft={onBekreftSending}
            />
        </VStack>
    );
};
