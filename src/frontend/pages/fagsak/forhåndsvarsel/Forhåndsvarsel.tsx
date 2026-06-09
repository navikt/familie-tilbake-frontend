import type { FC } from 'react';
import type { SubmitHandler } from 'react-hook-form';
import type { IkkeVurdertFormData } from './schema';

import { zodResolver } from '@hookform/resolvers/zod';
import { Heading, HStack, VStack } from '@navikt/ds-react';
import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { useRef, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import { useBehandling } from '@/context/BehandlingContext';
import { useBehandlingState } from '@/context/BehandlingStateContext';
import {
    behandlingLagreBrukersuttalelse,
    behandlingLagreForhaandsvarselUnntak,
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

export const Forhåndsvarsel: FC = () => {
    const { behandlingId } = useBehandling();
    const { actionBarStegtekst } = useBehandlingState();
    const navigerTilNeste = useStegNavigering('FORELDELSE');
    const navigerTilForrige = useStegNavigering('FAKTA');
    const queryClient = useQueryClient();
    const visGlobalAlert = useVisGlobalAlert();
    const utsettFristModalRef = useRef<HTMLDialogElement>(null);

    const { data: response } = useSuspenseQuery(
        behandlingForhandsvarselOptions({
            path: { behandlingId },
        })
    );

    const { forhaandsvarselSteg: forhåndsvarselSteg, brukeruttalelse } = response;
    const [valg, setValg] = useState<'send' | 'unntak'>();

    const erRedigerbarForhåndsvarselFlyt =
        forhåndsvarselSteg.type === 'ikke_vurdert' || forhåndsvarselSteg.type === 'unntak';

    const methods = useForm<IkkeVurdertFormData>({
        resolver: zodResolver(ikkeVurdertSchema),
        shouldUnregister: true,
        defaultValues:
            forhåndsvarselSteg.type === 'unntak'
                ? {
                      valg: 'unntak',
                      begrunnelseForUnntak: forhåndsvarselSteg.begrunnelseForUnntak,
                      beskrivelse: forhåndsvarselSteg.beskrivelse,
                      brukeruttalelse: tilUttalelseSkjema(brukeruttalelse),
                  }
                : undefined,
    });

    const {
        formState: { isDirty },
    } = methods;

    const oppdaterForhåndsvarselData = async (): Promise<void> => {
        await queryClient.invalidateQueries({
            queryKey: behandlingForhandsvarselQueryKey({ path: { behandlingId } }),
        });
    };

    const etterVellykketLagring = async (): Promise<void> => {
        await oppdaterForhåndsvarselData();
        navigerTilNeste();
    };

    const sendVarselbrev = useMutation({
        ...behandlingSendVarselbrevMutation(),
        onSuccess: oppdaterForhåndsvarselData,
        onError: error => {
            visGlobalAlert({
                title: 'Kunne ikke sende forhåndsvarsel',
                message: error.message,
                status: 'error',
            });
        },
    });

    const lagreUnntak = useMutation({
        ...behandlingLagreForhaandsvarselUnntakMutation(),
        onSuccess: etterVellykketLagring,
        // biome-ignore lint/nursery/useExplicitType: Klarer ikke finne typen på error her, da den kommer fra useMutation og ikke er eksplisitt definert i api-kallet. Kan se nærmere på dette senere.
        onError: error => {
            visGlobalAlert({
                title: 'Kunne ikke lagre unntak',
                message: error.message,
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
        // biome-ignore lint/nursery/useExplicitType: Klarer ikke finne typen på error her, da den kommer fra useMutation og ikke er eksplisitt definert i api-kallet. Kan se nærmere på dette senere.
        onError: error => {
            visGlobalAlert({
                title: 'Kunne ikke lagre unntak',
                message: error.message,
                status: 'error',
            });
        },
    });

    const lagreBrukeruttalelse = useMutation({
        ...behandlingLagreBrukersuttalelseMutation(),
        onSuccess: etterVellykketLagring,
        // biome-ignore lint/nursery/useExplicitType: Klarer ikke finne typen på error her, da den kommer fra useMutation og ikke er eksplisitt definert i api-kallet. Kan se nærmere på dette senere.
        onError: error => {
            visGlobalAlert({
                title: 'Kunne ikke lagre brukeruttalelse',
                message: error.message,
                status: 'error',
            });
        },
    });

    const utsettFrist = useMutation({
        ...behandlingUtsettUttalelsesfristMutation(),
        onSuccess: async (data, variables) => {
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
        onError: error => {
            visGlobalAlert({
                title: 'Kunne ikke utsette fristen',
                message: error.message,
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

    const onSubmitBrukeruttalelse: SubmitHandler<BrukeruttalelseFormData> = data => {
        lagreBrukeruttalelse.mutate({
            path: { behandlingId },
            body: tilUttalelsePayload(data.brukeruttalelse, 'sendt'),
        });
    };

    const onSubmit: SubmitHandler<IkkeVurdertFormData> = (data: IkkeVurdertFormData): void => {
        if (data.valg === 'send') {
            //TODO: trenger en bekreftelsesmodal her
            sendVarselbrev.mutate({
                path: { behandlingId },
                body: { tekstFraSaksbehandler: data.tekstFraSaksbehandler },
            });
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
        // TODO legg til "Lagre og gå videre" når setIkkePersistertKomponent er lagt til
        ...(valg === 'send' && { nesteTekst: 'Send forhåndsvarselet' }),
        nesteAriaLabel:
            valg === 'send' ? 'Send forhåndsvarselet' : 'Gå videre til foreldelsessteget',
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
        // TODO legg til "Lagre og gå videre til foreldelsessteget" når setIkkePersistertKomponent er lagt til
        nesteAriaLabel: 'Gå videre til foreldelsessteget',
    };

    const actionBarConfig = erRedigerbarForhåndsvarselFlyt
        ? skalSubmitteSkjema
            ? sendEllerLagreForhåndsvarselConfig
            : navigerTilNesteConfig
        : lagreBrukeruttalelseConfig;

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
                    <Heading size="medium">Forhåndsvarsel</Heading>
                    <div className="lg:col-start-2 lg:row-start-1 lg:row-end-3">
                        <Fristinfo
                            uttalelsesfrist={forhåndsvarselSteg.uttalelsesfrist}
                            onUtsettFrist={() => utsettFristModalRef.current?.showModal()}
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
        </VStack>
    );
};
