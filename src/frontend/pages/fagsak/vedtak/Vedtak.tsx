import type { VedtaksbrevFormData } from './schema';
import type { FC } from 'react';
import type { SubmitHandler } from 'react-hook-form';

import { Heading, InlineMessage, Tag, Tooltip, VStack } from '@navikt/ds-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useBehandling } from '~/context/BehandlingContext';
import { useBehandlingState } from '~/context/BehandlingStateContext';
import { hentBehandlingQueryKey } from '~/generated/@tanstack/react-query.gen';
import {
    behandlingForeslaaVedtakMutation,
    behandlingHentVedtaksbrevOptions,
    behandlingHentVedtaksresultatOptions,
} from '~/generated-new/@tanstack/react-query.gen';
import { vedtaksresultater } from '~/kodeverk';
import { ActionBar } from '~/komponenter/action-bar/ActionBar';
import { useVisGlobalAlert } from '~/stores/globalAlertStore';
import { useStegNavigering } from '~/utils/sider';

import { Vedtaksbrev, VEDTAKSBREV_FORM_ID } from './Vedtaksbrev';
import { VedtakSkeleton } from './VedtakSkeleton';
import { vedtaksresultatFarger } from './vedtaksresultatFarger';
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

            <ActionBar
                stegtekst={actionBarStegtekst('FORESLÅ_VEDTAK')}
                nesteTekst="Send til godkjenning"
                forrigeAriaLabel="Gå tilbake til vilkårsvurderingssteget"
                nesteAriaLabel="Send til godkjenning hos beslutter"
                isLoading={foreslåVedtak.isPending}
                skjulNeste={behandlingILesemodus}
                type="submit"
                formId={VEDTAKSBREV_FORM_ID}
                onForrige={navigerTilForrige}
            />
        </VStack>
    );
};
