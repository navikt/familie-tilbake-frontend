import type { FC } from 'react';
import type {
    BehandlingsårsakstypeEnum,
    TilbakekrevingRevurderingDto,
} from '@/generated/types.gen';

import { Heading } from '@navikt/ds-react';

import { behandlingsårsaker } from '@/typer/behandling';
import { hentRevurderingsårsakTekst } from '@/typer/revurdering';

type Props = {
    revurdering: TilbakekrevingRevurderingDto | null | undefined;
    behandlingsårsakstype: BehandlingsårsakstypeEnum | undefined;
};

export const Revurderingsboks: FC<Props> = ({ revurdering, behandlingsårsakstype }: Props) => {
    const revurderingsårsak = revurdering?.revurderingsarsak;
    const behandlingsårsakerEllerNull = behandlingsårsakstype
        ? behandlingsårsaker[behandlingsårsakstype]
        : undefined;
    const årsak = revurderingsårsak
        ? hentRevurderingsårsakTekst(revurderingsårsak.revurderingsarsak)
        : behandlingsårsakerEllerNull;

    if (!årsak) {
        return null;
    }

    return (
        <section
            aria-label="Revurderingsinformasjon"
            className="flex flex-col gap-2 rounded-xl border border-ax-border-warning-subtle bg-ax-bg-warning-soft p-4"
        >
            <Heading level="2" size="xsmall">
                Revurdering av tilbakekrevingen
            </Heading>
            <dl className="flex flex-col gap-y-4 text-ax-medium">
                <div className="flex flex-col gap-y-1">
                    <dt className="text-ax-text-neutral-subtle">Årsaken til revurderingen</dt>
                    <dd>{årsak}</dd>
                </div>
                {revurderingsårsak && (
                    <>
                        {'instans' in revurderingsårsak && (
                            <div className="flex flex-col gap-y-1">
                                <dt className="text-ax-text-neutral-subtle">Instans</dt>
                                <dd>{revurderingsårsak.instans}</dd>
                            </div>
                        )}
                        <div className="flex flex-col gap-y-1">
                            <dt className="text-ax-text-neutral-subtle">
                                Begrunnelse for revurdering
                            </dt>
                            <dd className="whitespace-pre-wrap wrap-break-word">
                                {revurderingsårsak.begrunnelse}
                            </dd>
                        </div>
                    </>
                )}
            </dl>
        </section>
    );
};
