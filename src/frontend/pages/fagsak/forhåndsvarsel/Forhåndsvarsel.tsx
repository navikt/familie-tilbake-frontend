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
import { Unntak } from './Unntak';

export const Forhåndsvarsel: FC = () => {
    const { behandlingId } = useBehandling();
    const { actionBarStegtekst, behandlingILesemodus } = useBehandlingState();
    const navigerTilNeste = useStegNavigering('FORELDELSE');
    const navigerTilForrige = useStegNavigering('FAKTA');
    const queryClient = useQueryClient();
    const visGlobalAlert = useVisGlobalAlert();

    const { data: response } = useSuspenseQuery(
        behandlingForhandsvarselOptions({
            path: { behandlingId },
        })
    );

    const { forhaandsvarselSteg, brukeruttalelse } = response;
    const [valg, setValg] = useState<'send' | 'unntak'>();

    const methods = useForm<IkkeVurdertFormData>({
        resolver: zodResolver(ikkeVurdertSchema),
    });

    const sendVarselbrev = useMutation({
        ...behandlingSendVarselbrevMutation(),
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: behandlingForhandsvarselQueryKey({ path: { behandlingId } }),
            });
            navigerTilNeste();
        },
        onError: error => {
            visGlobalAlert({
                title: 'Kunne ikke sende forhåndsvarsel',
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
        }
    };

    const visForhåndsvisning = forhaandsvarselSteg.type === 'ikke_vurdert' && valg === 'send';

    useActionBar(
        forhaandsvarselSteg.type === 'ikke_vurdert'
            ? {
                  type: 'submit',
                  formId: FORHÅNDSVARSEL_FORM_ID,
                  stegtekst: actionBarStegtekst('FORHÅNDSVARSEL'),
                  nesteTekst: valg === 'send' ? 'Send forhåndsvarselet' : 'Neste',
                  nesteAriaLabel:
                      valg === 'send' ? 'Send forhåndsvarselet' : 'Gå videre til foreldelsessteget',
                  forrigeAriaLabel: 'Gå tilbake til faktasteget',
                  isLoading: sendVarselbrev.isPending,
                  skjulNeste: behandlingILesemodus,
                  onForrige: navigerTilForrige,
              }
            : {
                  stegtekst: actionBarStegtekst('FORHÅNDSVARSEL'),
                  nesteTekst: valg === 'send' ? 'Send forhåndsvarselet' : 'Neste',
                  nesteAriaLabel:
                      valg === 'send' ? 'Send forhåndsvarselet' : 'Gå videre til foreldelsessteget',
                  forrigeAriaLabel: 'Gå tilbake til faktasteget',
                  isLoading: sendVarselbrev.isPending,
                  skjulNeste: behandlingILesemodus,
                  onForrige: navigerTilForrige,
                  onNeste: navigerTilNeste,
              }
    );

    return (
        <VStack gap="space-24">
            {forhaandsvarselSteg.type === 'ikke_vurdert' ? (
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
                        value={forhaandsvarselSteg.type === 'sendt' ? 'send' : 'unntak'}
                        readOnly
                    />
                    {forhaandsvarselSteg.type === 'sendt' && (
                        <SendtVarsel {...forhaandsvarselSteg} brukeruttalelse={brukeruttalelse} />
                    )}
                    {forhaandsvarselSteg.type === 'unntak' && (
                        <Unntak {...forhaandsvarselSteg} brukeruttalelse={brukeruttalelse} />
                    )}
                </>
            )}
        </VStack>
    );
};
