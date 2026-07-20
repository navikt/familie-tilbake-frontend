import type { AxiosError } from 'axios';
import type { FC } from 'react';
import type { Options } from '@/generated-new/sdk.gen';
import type { IkkeVurdertFormData } from './schema';

import { zodResolver } from '@hookform/resolvers/zod';
import { Heading, HStack, VStack } from '@navikt/ds-react';
import { useMutation, useQuery, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { useMemo, useRef, useState } from 'react';
import { FormProvider, type SubmitHandler, useForm } from 'react-hook-form';

import { useBehandling } from '@/context/BehandlingContext';
import { useBehandlingState } from '@/context/BehandlingStateContext';
import {
    forhåndsvisBrevMutation,
    hentBehandlingQueryKey,
} from '@/generated/@tanstack/react-query.gen';
import {
    type BehandlingLagreBrukersuttalelseError,
    type BehandlingLagreForhaandsvarselUnntakError,
    type BehandlingSendVarselbrevData,
    type BehandlingSendVarselbrevError,
    type BehandlingUtsettUttalelsesfristData,
    type BehandlingUtsettUttalelsesfristError,
    type BehandlingUtsettUttalelsesfristResponse,
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
    behandlingHentDokumentInfoOptions,
    behandlingHentDokumentOptions,
    behandlingLagreBrukersuttalelseMutation,
    behandlingLagreForhaandsvarselUnntakMutation,
    behandlingSendVarselbrevMutation,
    behandlingUtsettUttalelsesfristMutation,
} from '@/generated-new/@tanstack/react-query.gen';
import { useActionBar } from '@/hooks/useActionBar';
import { Bekreftelsesmodal } from '@/komponenter/modal/bekreftelse/Bekreftelsesmodal';
import { useVisGlobalAlert } from '@/stores/globalAlertStore';
import { formatterDatostring } from '@/utils';
import { useStegNavigering } from '@/utils/sider';

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
import { VisSendtVarselbrev } from './VisSendtVarselbrev';

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

    const { forhaandsvarselSteg: forhåndsvarselSteg, brukeruttalelse } = response;
    const [valg, setValg] = useState<'send' | 'unntak'>();

    const varselErSendt = forhåndsvarselSteg.type === 'sendt';

    const { data: { journalpostId, dokumentId } = {}, isLoading: dokumentInfoLaster } = useQuery({
        ...behandlingHentDokumentInfoOptions({
            path: { behandlingId, dokumentType: 'VARSELBREV' },
        }),
        enabled: varselErSendt,
    });

    const { data: sendtDokument, isLoading: sendtDokumentLaster } = useQuery({
        ...behandlingHentDokumentOptions({
            path: {
                behandlingId,
                journalpostId: journalpostId ?? '',
                dokumentInfoId: dokumentId ?? '',
            },
        }),
        enabled: !!journalpostId && !!dokumentId,
    });

    const varselbrevUrl = useMemo(() => {
        if (!sendtDokument) return null;
        return URL.createObjectURL(new Blob([sendtDokument], { type: 'application/pdf' }));
    }, [sendtDokument]);

    const erRedigerbarForhåndsvarselFlyt =
        forhåndsvarselSteg.type === 'ikke_vurdert' || forhåndsvarselSteg.type === 'unntak';

    const methods = useForm<IkkeVurdertFormData>({
        resolver: zodResolver(ikkeVurdertSchema),
        shouldUnregister: true,
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
            body: tilUttalelsePayload(data.brukeruttalelse, 'sendt'),
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
                uttalelse: tilUttalelsePayload(data.brukeruttalelse, 'unntak'),
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

    const erUnntakUtenKravTilBrukeruttalelse =
        forhåndsvarselSteg.type === 'unntak' &&
        forhåndsvarselSteg.begrunnelseForUnntak !== 'ÅPENBART_UNØDVENDIG';

    const skalSubmitteSkjema = isDirty || !erUnntakUtenKravTilBrukeruttalelse;

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

    const skalViseFristinfo =
        forhåndsvarselSteg.type === 'sendt' || forhåndsvarselSteg.type === 'unntak';

    return (
        <VStack gap="space-24">
            {erRedigerbarForhåndsvarselFlyt ? (
                <FormProvider {...methods}>
                    <HStack align="center" gap="space-16">
                        <Heading size="medium">Forhåndsvarsel</Heading>
                        {visForhåndsvisning && <ForhåndsvisVarselbrev />}
                    </HStack>
                    <IkkeVurdert onValgEndring={setValg} onSubmit={onSubmit} />
                </FormProvider>
            ) : (
                <div
                    className={`grid grid-cols-1 gap-6 items-start ${skalViseFristinfo ? ' lg:grid-cols-[1fr_18rem]' : ''}`}
                >
                    <HStack align="center" gap="space-16">
                        <Heading size="medium">Forhåndsvarsel</Heading>
                        {forhåndsvarselSteg.type === 'sendt' && varselbrevUrl && (
                            <VisSendtVarselbrev
                                varselbrevUrl={varselbrevUrl}
                                laster={dokumentInfoLaster || sendtDokumentLaster}
                            />
                        )}
                    </HStack>
                    <div className="lg:col-start-2 lg:row-start-1 lg:row-end-3">
                        <Fristinfo
                            uttalelsesfrist={forhåndsvarselSteg.uttalelsesfrist}
                            onUtsettFrist={(): void => utsettFristModalRef.current?.showModal()}
                        />
                    </div>

                    <VStack gap="space-24">
                        <SkalSendeForhåndsvarsel
                            name="valg"
                            value={forhåndsvarselSteg.type === 'sendt' ? 'send' : 'unntak'}
                            readOnly
                        />
                        {forhåndsvarselSteg.type === 'sendt' && (
                            <SendtVarsel
                                {...forhåndsvarselSteg}
                                brukeruttalelse={brukeruttalelse}
                                onSubmit={onSubmitBrukeruttalelse}
                            />
                        )}
                    </VStack>
                </div>
            )}
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
