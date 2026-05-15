import type { IkkeVurdertFormData } from './schema';
import type { FC } from 'react';
import type { SubmitHandler } from 'react-hook-form';

import { Heading, VStack } from '@navikt/ds-react';
import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { useState } from 'react';

import { useBehandling } from '~/context/BehandlingContext';
import { useBehandlingState } from '~/context/BehandlingStateContext';
import {
    behandlingForhandsvarselOptions,
    behandlingForhandsvarselQueryKey,
    behandlingSendVarselbrevMutation,
} from '~/generated-new/@tanstack/react-query.gen';
import { ActionBar } from '~/komponenter/action-bar/ActionBar';
import { useVisGlobalAlert } from '~/stores/globalAlertStore';
import { useStegNavigering } from '~/utils/sider';

import { FORHÅNDSVARSEL_FORM_ID, IkkeVurdert } from './IkkeVurdert';
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
                message: error.response?.data?.melding,
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

    return (
        <VStack gap="space-24">
            <Heading size="medium">Forhåndsvarsel</Heading>
            {forhaandsvarselSteg.type === 'ikke_vurdert' ? (
                <IkkeVurdert onSubmit={onSubmit} onValgEndring={setValg} />
            ) : (
                <>
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
            <ActionBar
                stegtekst={actionBarStegtekst('FORHÅNDSVARSEL')}
                nesteTekst={valg === 'send' ? 'Send forhåndsvarselet' : 'Neste'}
                nesteAriaLabel={
                    valg === 'send' ? 'Send forhåndsvarselet' : 'Gå videre til foreldelsessteget'
                }
                forrigeAriaLabel="Gå tilbake til faktasteget"
                isLoading={sendVarselbrev.isPending}
                skjulNeste={behandlingILesemodus}
                onForrige={navigerTilForrige}
                {...(forhaandsvarselSteg.type === 'ikke_vurdert'
                    ? { type: 'submit' as const, formId: FORHÅNDSVARSEL_FORM_ID }
                    : { onNeste: navigerTilNeste })}
            />
        </VStack>
    );
};
