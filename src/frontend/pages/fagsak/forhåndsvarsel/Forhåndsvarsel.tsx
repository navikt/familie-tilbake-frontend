import type { IkkeVurdertFormData } from './schema';
import type { FC } from 'react';
import type { SubmitHandler } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';
import { Heading, HStack, VStack } from '@navikt/ds-react';
import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import { useBehandling } from '~/context/BehandlingContext';
import { useBehandlingState } from '~/context/BehandlingStateContext';
import {
    behandlingForhandsvarselOptions,
    behandlingForhandsvarselQueryKey,
    behandlingLagreForhaandsvarselUnntakMutation,
    behandlingSendVarselbrevMutation,
} from '~/generated-new/@tanstack/react-query.gen';
import { useActionBar } from '~/hooks/useActionBar';
import { useVisGlobalAlert } from '~/stores/globalAlertStore';
import { useStegNavigering } from '~/utils/sider';

import { ForhåndsvisVarselbrev } from './ForhåndsvisVarselbrev';
import { FORHÅNDSVARSEL_FORM_ID, IkkeVurdert } from './IkkeVurdert';
import { ikkeVurdertSchema } from './schema';
import { SendtVarsel } from './SendtVarsel';
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

    /** TODO
     * Kan ikke være redigerbar hvis unntak er sendt inn og skjema ikke er endret.
     * Nå postes unntak på nytt hver gang man trykker på neste-knappen
     */
    const erRedigerbarForhåndsvarselFlyt =
        forhåndsvarselSteg.type === 'ikke_vurdert' || forhåndsvarselSteg.type === 'unntak';

    const methods = useForm<IkkeVurdertFormData>({
        resolver: zodResolver(ikkeVurdertSchema),
        defaultValues:
            forhåndsvarselSteg.type === 'unntak'
                ? {
                      valg: 'unntak',
                      begrunnelseForUnntak: forhåndsvarselSteg.begrunnelseForUnntak,
                      beskrivelse: forhåndsvarselSteg.beskrivelse,
                  }
                : undefined,
    });

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

    const onSubmit: SubmitHandler<IkkeVurdertFormData> = data => {
        if (data.valg === 'send') {
            sendVarselbrev.mutate({
                path: { behandlingId },
                body: { tekstFraSaksbehandler: data.tekstFraSaksbehandler },
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
        isLoading: sendVarselbrev.isPending,
    };

    useActionBar(
        erRedigerbarForhåndsvarselFlyt
            ? {
                  type: 'submit' as const,
                  formId: FORHÅNDSVARSEL_FORM_ID,
                  ...fellesActionBarConfig,
                  // TODO legg til "Lagre og gå videre" når setIkkePersistertKomponent er lagt til
                  ...(valg === 'send' && { nesteTekst: 'Send forhåndsvarselet' }),
                  nesteAriaLabel:
                      valg === 'send' ? 'Send forhåndsvarselet' : 'Gå videre til foreldelsessteget',
              }
            : {
                  ...fellesActionBarConfig,
                  onNeste: navigerTilNeste,
                  // TODO legg til "Lagre og gå videre til foreldelsessteget" når setIkkePersistertKomponent er lagt til
                  nesteAriaLabel: 'Gå videre til foreldelsessteget',
              }
    );

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
                        <SendtVarsel {...forhåndsvarselSteg} brukeruttalelse={brukeruttalelse} />
                    )}
                </>
            )}
        </VStack>
    );
};
