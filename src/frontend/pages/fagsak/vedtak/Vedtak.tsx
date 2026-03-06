import type { FC } from 'react';

import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';

import { useBehandling } from '~/context/BehandlingContext';
import { useBehandlingState } from '~/context/BehandlingStateContext';
import { hentBehandlingQueryKey } from '~/generated/@tanstack/react-query.gen';
import {
    behandlingForeslaaVedtakMutation,
    behandlingHentVedtaksbrevOptions,
} from '~/generated-new/@tanstack/react-query.gen';
import { ActionBar } from '~/komponenter/action-bar/ActionBar';
import { useVisGlobalAlert } from '~/stores/globalAlertStore';
import { useStegNavigering } from '~/utils/sider';

import { Vedtaksbrev } from './Vedtaksbrev';

export const Vedtak: FC = () => {
    const { behandlingId } = useBehandling();
    const { actionBarStegtekst, behandlingILesemodus } = useBehandlingState();
    const navigerTilForrige = useStegNavigering('VILKÅRSVURDERING');
    const queryClient = useQueryClient();
    const visGlobalAlert = useVisGlobalAlert();

    const { data: vedtaksbrevData } = useSuspenseQuery(
        behandlingHentVedtaksbrevOptions({ path: { behandlingId } })
    );

    const foreslåVedtak = useMutation({
        ...behandlingForeslaaVedtakMutation(),
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: hentBehandlingQueryKey({ path: { behandlingId } }),
            });
            visGlobalAlert({
                title: 'Sendt til godkjenning',
                status: 'success',
            });
        },
        onError: error => {
            visGlobalAlert({
                title: 'Kunne ikke sende til godkjenning',
                message: error.response?.data?.message,
                status: 'error',
            });
        },
    });

    return (
        <>
            {/* <Heading size="medium">Vedtak</Heading> */}

            {/* <Vedtakstabell /> */}

            <Vedtaksbrev vedtaksbrevData={vedtaksbrevData} />

            <ActionBar
                stegtekst={actionBarStegtekst('FORESLÅ_VEDTAK')}
                nesteTekst="Send til godkjenning"
                forrigeAriaLabel="Gå tilbake til vilkårsvurderingssteget"
                nesteAriaLabel="Send til godkjenning hos beslutter"
                isLoading={foreslåVedtak.isPending}
                skjulNeste={behandlingILesemodus}
                onNeste={() => foreslåVedtak.mutate({ path: { behandlingId } })}
                onForrige={navigerTilForrige}
            />
        </>
    );
};
