import { Alert, BodyShort, Label } from '@navikt/ds-react';
import * as React from 'react';

type Props = {
    behandletSteg: boolean;
    infotekst: string;
};

export const Steginformasjon: React.FC<Props> = ({ behandletSteg, infotekst }) => {
    return !behandletSteg ? (
        <Alert variant="info" size="small">
            {infotekst}
        </Alert>
    ) : (
        <p className="flex flex-row gap-2">
            <Label size="small">Behandlet:</Label> <BodyShort size="small">{infotekst}</BodyShort>
        </p>
    );
};
