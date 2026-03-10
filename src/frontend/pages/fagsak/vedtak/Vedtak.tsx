import type { TagProps } from '@navikt/ds-react';
import type { FC } from 'react';
import type { Vedtaksresultat } from '~/generated-new/types.gen';

import { Heading, HStack, Tag, VStack } from '@navikt/ds-react';
import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';

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

import { Vedtaksbrev } from './Vedtaksbrev';
import { Vedtakstabell } from './Vedtakstabell';

export const vedtaksresultatFarger: Record<Vedtaksresultat, TagProps['data-color']> = {
    DELVIS_TILBAKEBETALING: 'meta-purple',
    INGEN_TILBAKEBETALING: 'brand-beige',
    FULL_TILBAKEBETALING: 'meta-lime',
};

export const Vedtak: FC = () => {
    const { behandlingId } = useBehandling();
    const { actionBarStegtekst, behandlingILesemodus } = useBehandlingState();
    const navigerTilForrige = useStegNavigering('VILKÅRSVURDERING');
    const queryClient = useQueryClient();
    const visGlobalAlert = useVisGlobalAlert();

    const { data: vedtaksbrevData } = useSuspenseQuery(
        behandlingHentVedtaksbrevOptions({ path: { behandlingId } })
    );

    const { data: beregningsresultat } = useSuspenseQuery(
        behandlingHentVedtaksresultatOptions({ path: { behandlingId } })
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
        <VStack gap="space-24">
            <HStack justify="space-between" align="center">
                <Heading size="medium">Vedtak</Heading>
                <Tag
                    data-color={vedtaksresultatFarger[beregningsresultat.vedtaksresultat]}
                    size="medium"
                    variant="moderate"
                >
                    {vedtaksresultater[beregningsresultat.vedtaksresultat]}
                </Tag>
            </HStack>

            <Vedtakstabell beregningsresultat={beregningsresultat} />

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
        </VStack>
    );
};
