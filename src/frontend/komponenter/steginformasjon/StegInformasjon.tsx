import type { FC } from 'react';

import { BodyShort, InlineMessage, Label } from '@navikt/ds-react';

type Props = {
    behandletSteg: boolean;
    infotekst: string;
};

export const Steginformasjon: FC<Props> = ({ behandletSteg, infotekst }) => {
    return !behandletSteg ? (
        <InlineMessage status="info" size="small">
            {infotekst}
        </InlineMessage>
    ) : (
        <div className="flex flex-row gap-2">
            <Label size="small">Behandlet:</Label>
            <BodyShort size="small">{infotekst}</BodyShort>
        </div>
    );
};
