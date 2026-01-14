import type { Behandling } from '../../../generated';

import { Heading, Tag } from '@navikt/ds-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import classNames from 'classnames';
import * as React from 'react';

import { FaktaSkeleton } from './FaktaSkeleton';
import { FaktaSkjema } from './FaktaSkjema';
import { fakta } from '../../../generated-new';
import { oppdaterFaktaMutation } from '../../../generated-new/@tanstack/react-query.gen';
import { formatterDatostring } from '../../../utils';

type Props = {
    behandlingId: Behandling['behandlingId'];
    behandlingUrl: string;
};

export const Fakta: React.FC<Props> = ({
    behandlingId,
    behandlingUrl,
}: Props): React.JSX.Element => {
    const queryClient = useQueryClient();
    const { data: faktaOmFeilutbetaling, isPending } = useQuery(
        {
            queryKey: ['hentFaktaOmFeilutbetaling'],
            queryFn: () =>
                fakta({
                    path: {
                        behandlingId: behandlingId,
                    },
                }),
            select: data => data.data,
        },
        queryClient
    );

    queryClient.setMutationDefaults(['oppdaterFakta'], {
        ...oppdaterFaktaMutation(),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ['hentFaktaOmFeilutbetaling'] });
        },
    });

    if (isPending || !faktaOmFeilutbetaling) return <FaktaSkeleton />;
    return (
        <>
            <div className="flex flex-col gap-8" aria-label="Fakta om feilutbetaling">
                <Heading level="1" size="medium">
                    Fakta om feilutbetalingen
                </Heading>
                <section
                    className={classNames('flex md:flex-row flex-col flex-col-3 w-full gap-6', {
                        'flex-col-4': faktaOmFeilutbetaling.tidligereVarsletBeløp,
                    })}
                    aria-label="Feilutbetaling og revurdering"
                >
                    <div
                        className={classNames('grid grid-cols-2 gap-4 flex-1', {
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
                        <div className="col-span-2 p-4 h-22 border rounded-xl border-ax-border-neutral-subtle">
                            <dt className="font-ax-bold text-ax-medium">Periode</dt>
                            <dd className="font-ax-bold text-ax-heading-medium">
                                {formatterDatostring(faktaOmFeilutbetaling.feilutbetaling.fom)}–
                                {formatterDatostring(faktaOmFeilutbetaling.feilutbetaling.tom)}
                            </dd>
                        </div>
                    </div>
                    <div className="flex flex-col flex-2 gap-4 p-4 border rounded-xl border-ax-border-neutral-subtle">
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
                                        key={faktaOmFeilutbetaling.feilutbetaling.revurdering.årsak}
                                        variant="neutral-moderate"
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
                    </div>
                </section>
                <FaktaSkjema
                    faktaOmFeilutbetaling={faktaOmFeilutbetaling}
                    behandlingUrl={behandlingUrl}
                    behandlingId={behandlingId}
                />
            </div>
        </>
    );
};
