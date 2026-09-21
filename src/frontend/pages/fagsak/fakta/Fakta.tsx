import type { AxiosError } from 'axios';
import type { FC } from 'react';
import type { BehandlingOppdaterFaktaError } from '@/generated-new';

import { ExclamationmarkTriangleIcon } from '@navikt/aksel-icons';
import { Heading, HStack, InlineMessage, Tag, Tooltip, VStack } from '@navikt/ds-react';
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
    const erUnder4xRettsgebyr = true; //TODO må få fra backenden
    const sistePeriodeTom =
        faktaOmFeilutbetaling.perioder[faktaOmFeilutbetaling.perioder.length - 1].tom;
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
                    className={`grid grid-cols-4 md:grid-cols-2 gap-4 font-ax-bold ${faktaOmFeilutbetaling.tidligereVarsletBeløp ? 'flex-2' : 'flex-1'}`}
                >
                    <dl
                        className={`flex-1 p-4 bg-ax-bg-brand-magenta-soft border rounded-xl border-ax-border-brand-magenta align-middle ${faktaOmFeilutbetaling.tidligereVarsletBeløp ? 'col-span-1' : 'col-span-2'}`}
                    >
                        <dt className="text-ax-large text-ax-text-brand-magenta-subtle">
                            Feilutbetalt beløp
                        </dt>
                        <dd className="text-ax-xlarge text-ax-text-brand-magenta flex gap-2 items-center">
                            {formatCurrencyNoKr(faktaOmFeilutbetaling.feilutbetaling.beløp)}
                            {erUnder4xRettsgebyr && (
                                <Tooltip content="Totalbeløpet er under fire ganger rettsgebyret">
                                    <ExclamationmarkTriangleIcon
                                        aria-label="Advarsel: Totalbeløpet er under fire ganger rettsgebyret"
                                        className="text-ax-text-neutral-subtle"
                                    />
                                </Tooltip>
                            )}
                        </dd>
                    </dl>
                    {faktaOmFeilutbetaling.tidligereVarsletBeløp && (
                        <dl className="col-span-1 p-4 border rounded-xl border-ax-border-brand-blue-subtle">
                            <dt className="text-ax-large text-ax-text-neutral-subtle">
                                Tidligere varslet beløp
                            </dt>
                            <dd className="text-ax-xlarge">
                                {formatCurrencyNoKr(faktaOmFeilutbetaling.tidligereVarsletBeløp)}
                            </dd>
                        </dl>
                    )}
                    <dl className="col-span-2 p-4 min-h-22 border rounded-xl border-ax-border-brand-blue-subtle">
                        <dt className="text-ax-medium">Periode</dt>
                        <dd className="text-ax-heading-medium">
                            {formatterDatostring(faktaOmFeilutbetaling.perioder[0].fom)}–
                            {formatterDatostring(sistePeriodeTom)}
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
