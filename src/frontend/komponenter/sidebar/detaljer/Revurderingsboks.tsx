import type { FC } from 'react';
import type { BehandlingsårsakstypeEnum } from '@/generated/types.gen';

import { Heading } from '@navikt/ds-react';

import { behandlingsårsaker } from '@/typer/behandling';

type Props = {
    behandlingsårsakstype: BehandlingsårsakstypeEnum;
};

export const Revurderingsboks: FC<Props> = ({ behandlingsårsakstype }: Props) => {
    return (
        <section
            aria-label="Tilbakekrevingsinformasjon"
            className="flex flex-col gap-2 rounded-xl border border-ax-border-warning-subtle bg-ax-bg-warning-soft p-4"
        >
            <Heading level="2" size="xsmall">
                Revurdering av tilbakekrevingen
            </Heading>
            <dl className="flex flex-col gap-y-1">
                <dt className="text-ax-medium text-ax-text-neutral-subtle">
                    Årsaken til revurderingen
                </dt>
                <dd className="text-ax-medium">{behandlingsårsaker[behandlingsårsakstype]}</dd>
            </dl>
        </section>
    );
};
