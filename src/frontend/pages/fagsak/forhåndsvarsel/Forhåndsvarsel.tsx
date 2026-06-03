import type { BrukeruttalelseFormData } from './brukeruttalelseSchema';
import type { IkkeVurdertFormData } from './schema';
import type { FC } from 'react';
import type { SubmitHandler } from 'react-hook-form';
import type { ForhaandsvarselUnntak, Uttalelse } from '~/generated-new';

import { zodResolver } from '@hookform/resolvers/zod';
import { Heading, HStack, VStack } from '@navikt/ds-react';
import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import { useBehandling } from '~/context/BehandlingContext';
import { useBehandlingState } from '~/context/BehandlingStateContext';
import {
    behandlingLagreBrukersuttalelse,
    behandlingLagreForhaandsvarselUnntak,
} from '~/generated-new';
import {
    behandlingForhandsvarselOptions,
    behandlingForhandsvarselQueryKey,
    behandlingLagreBrukersuttalelseMutation,
    behandlingLagreForhaandsvarselUnntakMutation,
    behandlingSendVarselbrevMutation,
} from '~/generated-new/@tanstack/react-query.gen';
import { useActionBar } from '~/hooks/useActionBar';
import { useVisGlobalAlert } from '~/stores/globalAlertStore';
import { useStegNavigering } from '~/utils/sider';

import { tilUttalelsePayload, tilUttalelseSkjema } from './brukeruttalelseSchema';
import { ForhåndsvisVarselbrev } from './ForhåndsvisVarselbrev';
import { FORHÅNDSVARSEL_FORM_ID, IkkeVurdert } from './IkkeVurdert';
import { ikkeVurdertSchema } from './schema';
import { BRUKERUTTALELSE_FORM_ID, SendtVarsel } from './SendtVarsel';
import { SkalSendeForhåndsvarsel } from './SkalSendeForhåndsvarsel';

export const Forhåndsvarsel: FC = () => {
    const { behandlingId } = useBehandling();
    const { actionBarStegtekst } = useBehandlingState();
    const navigerTilNeste = useStegNavigering('FORELDELSE');
    const navigerTilForrige = useStegNavigering('FAKTA');
    const queryClient = useQueryClient();
    const visGlobalAlert = useVisGlobalAlert();

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

    const etterVellykketLagring = async (): Promise<void> => {
        await queryClient.invalidateQueries({
            queryKey: behandlingForhandsvarselQueryKey({ path: { behandlingId } }),
        });
        navigerTilNeste();
    };

    const sendVarselbrev = useMutation({
        ...behandlingSendVarselbrevMutation(),
        onSuccess: etterVellykketLagring,
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
        onError: error => {
            visGlobalAlert({
                title: 'Kunne ikke lagre brukeruttalelse',
                message: error.message,
                status: 'error',
            });
        },
    });

    const onSubmitBrukeruttalelse: SubmitHandler<BrukeruttalelseFormData> = data => {
        lagreBrukeruttalelse.mutate({
            path: { behandlingId },
            body: tilUttalelsePayload(data.brukeruttalelse, 'sendt'),
        });
    };

    const onSubmit: SubmitHandler<IkkeVurdertFormData> = data => {
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
                <>
                    <Heading size="medium">Forhåndsvarsel</Heading>
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
                </>
            )}
        </VStack>
    );
};
