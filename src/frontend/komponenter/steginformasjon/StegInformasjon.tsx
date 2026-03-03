import type { FC } from 'react';

import { BodyShort, Label, LocalAlert } from '@navikt/ds-react';

type Props = {
    behandletSteg: boolean;
    infotekst: string;
};

export const Steginformasjon: FC<Props> = ({ behandletSteg, infotekst }) => {
    return !behandletSteg ? (
        <LocalAlert status="announcement">
            <LocalAlert.Header>
                <LocalAlert.Title>{infotekst}</LocalAlert.Title>
            </LocalAlert.Header>
        </LocalAlert>
    ) : (
        <p className="flex flex-row gap-2">
            <Label size="small">Behandlet:</Label> <BodyShort size="small">{infotekst}</BodyShort>
        </p>
    );
};
