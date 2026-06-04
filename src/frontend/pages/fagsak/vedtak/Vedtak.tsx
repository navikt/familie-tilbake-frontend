import type { FC } from 'react';
import type { SubmitHandler } from 'react-hook-form';
import type { VedtaksbrevFormData } from './schema';

import { Heading, InlineMessage, Tag, Tooltip, VStack } from '@navikt/ds-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useBehandling } from '@/context/BehandlingContext';
import { useBehandlingState } from '@/context/BehandlingStateContext';
import { hentBehandlingQueryKey } from '@/generated/@tanstack/react-query.gen';
import {
    behandlingForeslaaVedtakMutation,
    behandlingHentVedtaksbrevOptions,
    behandlingHentVedtaksresultatOptions,
} from '@/generated-new/@tanstack/react-query.gen';
import { useActionBar } from '@/hooks/useActionBar';
import { vedtaksresultater } from '@/kodeverk';
import { useVisGlobalAlert } from '@/stores/globalAlertStore';
import { useStegNavigering } from '@/utils/sider';

import { vedtaksresultatFarger } from './utils';
import { VedtakSkeleton } from './VedtakSkeleton';
import { VEDTAKSBREV_FORM_ID, Vedtaksbrev } from './Vedtaksbrev';
import { Vedtakstabell } from './Vedtakstabell';
import { VedtakstabellSkeleton } from './VedtakstabellSkeleton';

export const Vedtak: FC = () => {
    const { behandlingId } = useBehandling();
    const { actionBarStegtekst, behandlingILesemodus } = useBehandlingState();
    const navigerTilForrige = useStegNavigering('VILKÅRSVURDERING');
    const queryClient = useQueryClient();
    const visGlobalAlert = useVisGlobalAlert();

    const {
        data: vedtaksbrevData,
        isError: erVedtaksbrevFeil,
        isPending: lasterVedtaksbrev,
    } = useQuery({
        ...behandlingHentVedtaksbrevOptions({ path: { behandlingId } }),
        staleTime: 0,
        gcTime: 0,
    });

    const {
        data: beregningsresultat,
        isError: erVedtaksresultatFeil,
        isPending: lasterVedtaksresultat,
    } = useQuery(behandlingHentVedtaksresultatOptions({ path: { behandlingId } }));

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
        // biome-ignore lint/nursery/useExplicitType: Klarer ikke finne typen på error her, da den kommer fra useMutation og ikke er eksplisitt definert i api-kallet. Kan se nærmere på dette senere.
        onError: error => {
            visGlobalAlert({
                title: 'Kunne ikke sende til godkjenning',
                message: error.response?.data?.melding,
                status: 'error',
            });
        },
    });

    const onSubmit: SubmitHandler<VedtaksbrevFormData> = () => {
        foreslåVedtak.mutate({ path: { behandlingId } });
    };

    const fellesActionBarConfig = {
        type: 'submit' as const,
        formId: VEDTAKSBREV_FORM_ID,
        stegtekst: actionBarStegtekst('FORESLÅ_VEDTAK'),
        forrigeAriaLabel: 'Gå tilbake til vilkårsvurderingssteget',
        onForrige: navigerTilForrige,
        isLoading: foreslåVedtak.isPending,
    };

    useActionBar(
        behandlingILesemodus
            ? {
                  ...fellesActionBarConfig,
                  skjulNeste: true,
              }
            : {
                  ...fellesActionBarConfig,
                  nesteTekst: 'Send til godkjenning',
                  nesteAriaLabel: 'Send til godkjenning hos beslutter',
              }
    );

    return (
        <VStack gap="space-24">
            <section className="flex flex-row justify-between items-center">
                <Heading size="medium">Vedtak</Heading>
                {beregningsresultat && (
                    <Tooltip
                        content={`Resultat: ${vedtaksresultater[beregningsresultat.vedtaksresultat]}`}
                    >
                        <Tag
                            data-color={vedtaksresultatFarger[beregningsresultat.vedtaksresultat]}
                            size="medium"
                            variant="moderate"
                        >
                            {vedtaksresultater[beregningsresultat.vedtaksresultat]}
                        </Tag>
                    </Tooltip>
                )}
            </section>

            {erVedtaksresultatFeil ? (
                <InlineMessage size="small" status="error">
                    Kunne ikke hente vedtaksresultat. Prøv å laste siden på nytt.
                </InlineMessage>
            ) : lasterVedtaksresultat ? (
                <VedtakstabellSkeleton />
            ) : (
                beregningsresultat && <Vedtakstabell beregningsresultat={beregningsresultat} />
            )}

            {erVedtaksbrevFeil ? (
                <InlineMessage size="small" status="error">
                    Kunne ikke hente vedtaksbrevdata. Prøv å laste siden på nytt.
                </InlineMessage>
            ) : lasterVedtaksbrev ? (
                <VedtakSkeleton />
            ) : (
                vedtaksbrevData && (
                    <Vedtaksbrev vedtaksbrevData={vedtaksbrevData} onSubmit={onSubmit} />
                )
            )}
        </VStack>
    );
};
