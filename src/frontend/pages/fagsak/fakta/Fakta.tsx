import type { AxiosError } from 'axios';
import type { FC } from 'react';
import type { BehandlingOppdaterFaktaError } from '@/generated-new';

import { Heading, HStack, InlineMessage, Tag, VStack } from '@navikt/ds-react';
import { useQueryClient, useSuspenseQuery } from '@tanstack/react-query';

import { useBehandling } from '@/context/BehandlingContext';
import {
    behandlingFaktaOptions,
    behandlingFaktaQueryKey,
    behandlingOppdaterFaktaMutation,
} from '@/generated-new/@tanstack/react-query.gen';
import { useVisGlobalAlert } from '@/stores/globalAlertStore';
import { formatCurrencyNoKr, formatterDatostring } from '@/utils';

import { StatusTag } from '../StegStatus';
import { FaktaSkjema } from './FaktaSkjema';

export const Fakta: FC = () => {
    const { behandlingId } = useBehandling();
    const queryClient = useQueryClient();
    const visGlobalAlert = useVisGlobalAlert();
    const { data: faktaOmFeilutbetaling } = useSuspenseQuery(
        behandlingFaktaOptions({ path: { behandlingId } })
    );

    queryClient.setMutationDefaults(['oppdaterFakta'], {
        ...behandlingOppdaterFaktaMutation(),
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: behandlingFaktaQueryKey({ path: { behandlingId } }),
            });
        },
        onError: (error: AxiosError<BehandlingOppdaterFaktaError>) => {
            visGlobalAlert({
                title: error.response?.data?.tittel ?? 'Kunne ikke lagre fakta om feilutbetalingen',
                message: error.response?.data?.melding,
                status: 'error',
            });
        },
    });

    return (
        <VStack gap="space-24">
            <HStack justify="space-between" gap="space-8" align="center">
                <HStack gap="space-0 space-32" align="center">
                    <Heading size="medium">Fakta om feilutbetalingen</Heading>
                    <InlineMessage size="small" status="info">
                        Intern vurdering (ikke synlig i vedtaksbrev)
                    </InlineMessage>
                </HStack>
                <StatusTag
                    tilbakeført={faktaOmFeilutbetaling.tilbakeført}
                    ferdigvurdert={faktaOmFeilutbetaling.ferdigvurdert}
                />
            </HStack>
            <section
                className={`flex md:flex-row flex-col ${faktaOmFeilutbetaling.tidligereVarsletBeløp ? 'flex-col-4' : 'flex-col-3'} w-full gap-6`}
                aria-label="Feilutbetaling og revurdering"
            >
                <div
                    className={`grid grid-cols-4 md:grid-cols-2 gap-4 ${faktaOmFeilutbetaling.tidligereVarsletBeløp ? 'flex-2' : 'flex-1'}`}
                >
                    <dl
                        className={`flex-1 p-4 bg-ax-bg-brand-magenta-soft border rounded-xl border-ax-border-brand-magenta align-middle ${faktaOmFeilutbetaling.tidligereVarsletBeløp ? 'col-span-1' : 'col-span-2'}`}
                    >
                        <dt className="font-ax-bold text-ax-large text-ax-text-brand-magenta-subtle">
                            Feilutbetalt beløp
                        </dt>
                        <dd className="font-ax-bold text-ax-xlarge text-ax-text-brand-magenta">
                            {formatCurrencyNoKr(faktaOmFeilutbetaling.feilutbetaling.beløp)}
                        </dd>
                    </dl>
                    {faktaOmFeilutbetaling.tidligereVarsletBeløp && (
                        <dl className="col-span-1 p-4 border rounded-xl border-ax-border-brand-blue-subtle">
                            <dt className="font-ax-bold text-ax-large text-ax-text-neutral-subtle">
                                Tidligere varslet beløp
                            </dt>
                            <dd className="font-ax-bold text-ax-xlarge">
                                {formatCurrencyNoKr(faktaOmFeilutbetaling.tidligereVarsletBeløp)}
                            </dd>
                        </dl>
                    )}
                    <dl className="col-span-2 p-4 min-h-22 border rounded-xl border-ax-border-brand-blue-subtle">
                        <dt className="font-ax-bold text-ax-medium">Periode</dt>
                        <dd className="font-ax-bold text-ax-heading-medium">
                            {formatterDatostring(faktaOmFeilutbetaling.perioder[0].fom)}–
                            {formatterDatostring(
                                faktaOmFeilutbetaling.perioder[
                                    faktaOmFeilutbetaling.perioder.length - 1
                                ].tom
                            )}
                        </dd>
                    </dl>
                </div>
                <VStack className="flex-2 gap-4 p-4 border rounded-xl border-ax-border-brand-blue-subtle">
                    <Heading level="2" size="small">
                        Revurdering
                    </Heading>
                    <dl className="grid grid-cols-2 gap-4">
                        <div>
                            <dt className="font-ax-bold text-ax-medium">Årsak til revurdering</dt>
                            <dd>
                                <Tag
                                    data-color="neutral"
                                    key={faktaOmFeilutbetaling.feilutbetaling.revurdering.årsak}
                                    variant="moderate"
                                    size="small"
                                    className="text-ax-medium"
                                >
                                    {faktaOmFeilutbetaling.feilutbetaling.revurdering.årsak}
                                </Tag>
                            </dd>
                        </div>
                        <div>
                            <dt className="font-ax-bold text-ax-medium">
                                Dato for revurderingsvedtak
                            </dt>
                            <dd className="text-ax-medium">
                                {formatterDatostring(
                                    faktaOmFeilutbetaling.feilutbetaling.revurdering.vedtaksdato
                                )}
                            </dd>
                        </div>
                        <div>
                            <dt className="font-ax-bold text-ax-medium">Resultat</dt>
                            <dd className="text-ax-medium">
                                {faktaOmFeilutbetaling.feilutbetaling.revurdering.resultat}
                            </dd>
                        </div>
                    </dl>
                </VStack>
            </section>

            <FaktaSkjema
                key={String(faktaOmFeilutbetaling.ferdigvurdert)}
                faktaOmFeilutbetaling={faktaOmFeilutbetaling}
            />
        </VStack>
    );
};
