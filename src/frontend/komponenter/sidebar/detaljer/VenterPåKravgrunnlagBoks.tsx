import type { FC } from 'react';
import type { VenterDto } from '@/generated';

import { BodyLong, Heading } from '@navikt/ds-react';

import { hentVentebeskrivelse, VENTER_PÅ_KRAVGRUNNLAG_TITTEL } from '@/utils/venterPåKravgrunnlag';

type Props = {
    venter: VenterDto;
};

export const VenterPåKravgrunnlagBoks: FC<Props> = ({ venter }: Props) => {
    const beskrivelse = hentVentebeskrivelse(venter.grunn);

    return (
        <section
            aria-label={VENTER_PÅ_KRAVGRUNNLAG_TITTEL}
            className="flex flex-col gap-2 rounded-xl border border-ax-border-info-subtle bg-ax-bg-info-soft p-4"
        >
            <Heading level="2" size="xsmall">
                {VENTER_PÅ_KRAVGRUNNLAG_TITTEL}
            </Heading>
            {beskrivelse && <BodyLong size="small">{beskrivelse}</BodyLong>}
        </section>
    );
};
