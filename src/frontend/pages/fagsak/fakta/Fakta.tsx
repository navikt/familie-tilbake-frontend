import { Heading, Tag, VStack } from '@navikt/ds-react';
import { useSuspenseQuery, useQueryClient } from '@tanstack/react-query';
import classNames from 'classnames';
import * as React from 'react';

import { useBehandling } from '~/context/BehandlingContext';
import {
    behandlingFaktaOptions,
    behandlingFaktaQueryKey,
    behandlingOppdaterFaktaMutation,
} from '~/generated-new/@tanstack/react-query.gen';
import { formatterDatostring } from '~/utils';

import { FaktaSkjema } from './FaktaSkjema';

export const Fakta: React.FC = (): React.JSX.Element => {
    const { behandlingId } = useBehandling();
    const queryClient = useQueryClient();
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
    });
    return (
        <>
            <VStack gap="space-24" aria-label="Fakta om feilutbetaling">
                <Heading size="medium">Fakta om feilutbetalingen</Heading>
                <section
                    className={classNames('flex md:flex-row flex-col flex-col-3 w-full gap-6', {
                        'flex-col-4': faktaOmFeilutbetaling.tidligereVarsletBeløp,
                    })}
                    aria-label="Feilutbetaling og revurdering"
                >
                    <div
                        className={classNames('grid grid-cols-4 md:grid-cols-2 gap-4 flex-1', {
                            'flex-2': faktaOmFeilutbetaling.tidligereVarsletBeløp,
                        })}
                    >
                        <div
                            className={classNames(
                                'flex-1 p-4 bg-ax-bg-brand-magenta-soft border rounded-xl border-ax-border-brand-magenta-strong align-middle col-span-1',
                                { 'col-span-2': !faktaOmFeilutbetaling.tidligereVarsletBeløp }
                            )}
                        >
                            <dt className="font-ax-bold text-ax-medium">Feilutbetalt beløp</dt>
                            <dd className="text-ax-text-danger font-ax-bold text-ax-heading-medium">
                                {faktaOmFeilutbetaling.feilutbetaling.beløp}
                            </dd>
                        </div>
                        {faktaOmFeilutbetaling.tidligereVarsletBeløp && (
                            <div className="col-span-1 p-4 border rounded-xl border-ax-border-neutral-subtle">
                                <dt className="font-ax-bold text-ax-medium">
                                    Tidligere varslet beløp
                                </dt>
                                <dd className="font-ax-bold text-ax-heading-medium">
                                    {faktaOmFeilutbetaling.tidligereVarsletBeløp}
                                </dd>
                            </div>
                        )}
                        <div className="col-span-2 p-4 min-h-22 border rounded-xl border-ax-border-neutral-subtle">
                            <dt className="font-ax-bold text-ax-medium">Periode</dt>
                            <dd className="font-ax-bold text-ax-heading-medium">
                                {formatterDatostring(faktaOmFeilutbetaling.perioder[0].fom)}–
                                {formatterDatostring(
                                    faktaOmFeilutbetaling.perioder[
                                        faktaOmFeilutbetaling.perioder.length - 1
                                    ].tom
                                )}
                            </dd>
                        </div>
                    </div>
                    <VStack className="flex-2 gap-4 p-4 border rounded-xl border-ax-border-neutral-subtle">
                        <Heading level="2" size="small">
                            Revurdering
                        </Heading>
                        <dl className="grid grid-cols-2 gap-4">
                            <div>
                                <dt className="font-ax-bold text-ax-medium">
                                    Årsak til revurdering
                                </dt>
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
                <FaktaSkjema faktaOmFeilutbetaling={faktaOmFeilutbetaling} />
            </VStack>
        </>
    );
};
