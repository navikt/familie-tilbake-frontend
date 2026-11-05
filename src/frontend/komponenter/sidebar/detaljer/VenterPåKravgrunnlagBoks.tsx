import type { FC } from 'react';

import { BodyLong, Heading } from '@navikt/ds-react';

import { hentVentebeskrivelse, VENTER_PÅ_KRAVGRUNNLAG_TITTEL } from '@/utils/venterPåKravgrunnlag';

export const VenterPåKravgrunnlagBoks: FC = () => {
    const beskrivelse = hentVentebeskrivelse();

    return (
        <section
            aria-label={VENTER_PÅ_KRAVGRUNNLAG_TITTEL}
            className="flex flex-col gap-2 rounded-xl border border-ax-border-info-subtle bg-ax-bg-info-soft p-4"
        >
            <Heading level="2" size="xsmall">
                {VENTER_PÅ_KRAVGRUNNLAG_TITTEL}
            </Heading>
            <BodyLong size="small">{beskrivelse}</BodyLong>
        </section>
    );
};
