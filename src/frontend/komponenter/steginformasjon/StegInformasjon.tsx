import { BodyShort, Label, LocalAlert } from '@navikt/ds-react';
import * as React from 'react';

type Props = {
    behandletSteg: boolean;
    infotekst: string;
};

export const Steginformasjon: React.FC<Props> = ({ behandletSteg, infotekst }) => {
    return !behandletSteg ? (
        <LocalAlert status="announcement">
            <LocalAlert.Content>{infotekst}</LocalAlert.Content>
        </LocalAlert>
    ) : (
        <p className="flex flex-row gap-2">
            <Label size="small">Behandlet:</Label> <BodyShort size="small">{infotekst}</BodyShort>
        </p>
    );
};
