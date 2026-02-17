import { Alert } from '@navikt/ds-react';
import * as React from 'react';

import { HenterData } from './HenterData';
import { ServerFeil } from '../../pages/feilsider/ErrorPage';
import { type Ressurs, RessursStatus } from '../../typer/ressurs';

type Props = {
    ressurser: (Ressurs<unknown> | undefined)[];
    henteBeskrivelse?: string;
    visFeilSide?: boolean;
    spinnerStørrelse?: '2xlarge' | 'large';
};

export const DataLastIkkeSuksess: React.FC<Props> = ({
    ressurser,
    spinnerStørrelse,
    henteBeskrivelse,
    visFeilSide,
}) => {
    const filtrerteRessurser = ressurser.filter(ressurs => ressurs !== undefined);
    const ingenTilgangRessurs = filtrerteRessurser.find(
        ressurs => ressurs.status === RessursStatus.IkkeTilgang
    );
    const serverFeil = filtrerteRessurser.find(
        ressurs => ressurs.status === RessursStatus.ServerFeil
    );

    if (ingenTilgangRessurs) {
        return <Alert variant="warning">Ingen tilgang</Alert>;
    }
    const feiletRessurs = filtrerteRessurser.find(
        ressurs =>
            ressurs.status === RessursStatus.Feilet ||
            ressurs.status === RessursStatus.FunksjonellFeil
    );
    if (serverFeil && visFeilSide) {
        return <ServerFeil />;
    }
    if (feiletRessurs) {
        return <Alert variant="error">{feiletRessurs.frontendFeilmelding}</Alert>;
    }

    if (serverFeil) {
        return <Alert variant="error">{serverFeil.frontendFeilmelding}</Alert>;
    }

    const henterRessurs = filtrerteRessurser.find(
        ressurs => ressurs.status === RessursStatus.Henter
    );
    if (henterRessurs) {
        return (
            <HenterData
                beskrivelse={henteBeskrivelse || 'Henter data om feilutbetalingen...'}
                størrelse={spinnerStørrelse}
            />
        );
    }
    return null;
};
